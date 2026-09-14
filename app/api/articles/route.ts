import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ArticleStatus,
  Prisma,
} from "@prisma/client";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { slugify, uniqueSlug } from "@/lib/slug";

export const dynamic = "force-dynamic";

function parseStatus(
  value: string | null
): ArticleStatus | undefined {
  if (!value) {
    return undefined;
  }

  if (
    Object.values(ArticleStatus).includes(
      value as ArticleStatus
    )
  ) {
    return value as ArticleStatus;
  }

  return undefined;
}

function parsePositiveNumber(
  value: string | null,
  fallback: number,
  maximum: number
) {
  const numberValue = Number(value);

  if (
    !Number.isFinite(numberValue) ||
    numberValue <= 0
  ) {
    return fallback;
  }

  return Math.min(
    Math.floor(numberValue),
    maximum
  );
}

export async function GET(
  request: NextRequest
) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const statusParam =
      searchParams.get("status");

    const categoryParam =
      searchParams.get("category");

    const searchParam =
      searchParams.get("search");

    const page = parsePositiveNumber(
      searchParams.get("page"),
      1,
      100000
    );

    const limit = parsePositiveNumber(
      searchParams.get("limit"),
      20,
      100
    );

    const skip =
      (page - 1) * limit;

    const status =
      parseStatus(statusParam);

    const where:
      Prisma.ArticleWhereInput = {};

    if (status) {
      where.status = status;
    }

    /**
     * category adalah relasi Prisma.
     *
     * Tidak boleh:
     *
     * category: categoryParam
     *
     * Gunakan relation filter.
     */
    if (
      categoryParam &&
      categoryParam.trim()
    ) {
      const categoryValue =
        categoryParam.trim();

      where.category = {
        is: {
          OR: [
            {
              id: categoryValue,
            },
            {
              slug: categoryValue,
            },
          ],
        },
      };
    }

    if (
      searchParam &&
      searchParam.trim()
    ) {
      const search =
        searchParam.trim();

      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          excerpt: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [
      articles,
      total,
    ] = await Promise.all([
      db.article.findMany({
        where,

        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },

        orderBy: {
          updatedAt: "desc",
        },

        skip,
        take: limit,
      }),

      db.article.count({
        where,
      }),
    ]);

    return NextResponse.json({
      success: true,

      data: articles,

      pagination: {
        page,
        limit,
        total,

        totalPages:
          Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(
      "GET /api/articles error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Gagal mengambil data artikel.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const user =
      await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Authentication required",
        },
        {
          status: 401,
        }
      );
    }

    const allowedRoles = [
      "CONTRIBUTOR",
      "EDITOR",
      "ADMIN",
    ];

    if (
      !allowedRoles.includes(
        user.role
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "Forbidden",
        },
        {
          status: 403,
        }
      );
    }

    const body =
      await request.json();

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content
        : "";

    if (!title) {
      return NextResponse.json(
        {
          success: false,

          error:
            "title is required",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,

          error:
            "content is required",
        },
        {
          status: 400,
        }
      );
    }

    const requestedStatus =
      typeof body.status === "string"
        ? body.status
        : "DRAFT";

    const status =
      Object.values(
        ArticleStatus
      ).includes(
        requestedStatus as ArticleStatus
      )
        ? (
            requestedStatus as ArticleStatus
          )
        : ArticleStatus.DRAFT;

    const slug =
      await uniqueSlug(
        typeof body.slug === "string" &&
          body.slug.trim()
          ? body.slug
          : title,

        async (candidate) => {
          const existing =
            await db.article.findUnique({
              where: {
                slug: candidate,
              },
            });

          return Boolean(existing);
        }
      );

    let categoryId: string | null = null;
    const categoryInput = typeof body.categoryId === "string" && body.categoryId.trim() ? body.categoryId.trim() : typeof body.category === "string" && body.category.trim() ? body.category.trim() : null;
    if (categoryInput) {
      const existingCategory = await db.category.findFirst({ where: { OR: [{ id: categoryInput }, { slug: slugify(categoryInput) }, { name: categoryInput }] } });
      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        const categorySlug = await uniqueSlug(categoryInput, async candidate => Boolean(await db.category.findUnique({ where: { slug: candidate } })));
        categoryId = (await db.category.create({ data: { name: categoryInput, slug: categorySlug } })).id;
      }
    }

    const article =
      await db.article.create({
        data: {
          title,

          slug,

          excerpt:
            typeof body.excerpt ===
            "string"
              ? body.excerpt.trim() ||
                null
              : null,

          content,

          status,

          authorId:
            user.id,

          categoryId,

          coverImage:
            typeof body.coverImage === "string" && body.coverImage.trim()
              ? body.coverImage.trim()
              : null,

          isPublished:
            status === ArticleStatus.PUBLISHED,

          publishedAt:
            status ===
            ArticleStatus.PUBLISHED
              ? new Date()
              : null,
        },

        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,

        data: article,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/articles error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Gagal membuat artikel.",
      },
      {
        status: 500,
      }
    );
  }
}
