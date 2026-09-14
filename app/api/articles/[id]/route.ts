import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ArticleStatus,
} from "@prisma/client";

import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { slugify, uniqueSlug } from "@/lib/slug";
import {
  requirePermission,
} from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,

  {
    params,
  }: {
    params:
      Promise<{
        id: string;
      }>;
  }
) {
  try {
    const { id } =
      await params;

    const article =
      await db.article.findUnique({
        where: {
          id,
        },

        include: {
          author: true,

          category: true,

          sources: {
            include: {
              source: true,
            },
          },

          corrections: true,
        },
      });

    if (!article) {
      return NextResponse.json(
        {
          error:
            "Article not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error(
      "GET article error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal mengambil artikel.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,

  {
    params,
  }: {
    params:
      Promise<{
        id: string;
      }>;
  }
) {
  const access =
    await requirePermission(
      "article:update"
    );

  if (!access.ok) {
    return access.response;
  }

  try {
    const { id } =
      await params;

    const body =
      await request.json();

    const existing =
      await db.article.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Article not found",
        },
        {
          status: 404,
        }
      );
    }

    const data: {
      title?: string;
      excerpt?: string | null;
      content?: string;
      categoryId?: string | null;
      status?: ArticleStatus;
      publishedAt?: Date | null;
      coverImage?: string | null;
      isPublished?: boolean;
    } = {};

    if (
      typeof body.title ===
      "string"
    ) {
      data.title =
        body.title.trim();
    }

    if (
      typeof body.excerpt ===
      "string"
    ) {
      data.excerpt =
        body.excerpt.trim() ||
        null;
    }

    if (
      typeof body.content ===
      "string"
    ) {
      data.content =
        body.content;
    }

    const categoryInput = typeof body.categoryId === "string" && body.categoryId.trim()
      ? body.categoryId.trim()
      : typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : null;

    if (body.categoryId === null || body.category === null) {
      data.categoryId = null;
    } else if (categoryInput) {
      const existingCategory = await db.category.findFirst({
        where: { OR: [{ id: categoryInput }, { slug: slugify(categoryInput) }, { name: categoryInput }] },
      });
      if (existingCategory) {
        data.categoryId = existingCategory.id;
      } else {
        const categorySlug = await uniqueSlug(categoryInput, async candidate => Boolean(await db.category.findUnique({ where: { slug: candidate } })));
        data.categoryId = (await db.category.create({ data: { name: categoryInput, slug: categorySlug } })).id;
      }
    }

    if (body.coverImage === null || typeof body.coverImage === "string") {
      data.coverImage = body.coverImage;
    }

    if (
      typeof body.status ===
        "string" &&
      Object.values(
        ArticleStatus
      ).includes(
        body.status as
          ArticleStatus
      )
    ) {
      const status =
        body.status as
          ArticleStatus;

      data.status =
        status;

      if (
        status ===
        ArticleStatus.PUBLISHED
      ) {
        data.publishedAt = existing.publishedAt ?? new Date();
        data.isPublished = true;
      }
    }

    const article =
      await db.article.update({
        where: {
          id,
        },

        data,
      });

    await audit({
      action:
        "ARTICLE_UPDATED",

      entity:
        "Article",

      entityId:
        id,

      actorId:
        access.user.id,

      metadata: {
        status:
          article.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error(
      "PATCH article error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal memperbarui artikel.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requirePermission("article:update");
  if (!access.ok) return access.response;
  try {
    const { id } = await params;
    await db.article.delete({ where: { id } });
    await audit({ action: "ARTICLE_DELETED", entity: "Article", entityId: id, actorId: access.user.id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE article error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus artikel." }, { status: 500 });
  }
}
