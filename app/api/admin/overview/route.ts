import {
  NextResponse,
} from "next/server";

import {
  ArticleStatus,
} from "@prisma/client";

import { db } from "@/lib/db";

export const dynamic =
  "force-dynamic";

export async function GET() {
  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      reviewArticles,
      totalIssues,
      totalComments,
      pendingComments,
      totalUsers,
    ] =
      await Promise.all([
        db.article.count(),

        db.article.count({
          where: {
            status:
              ArticleStatus.PUBLISHED,
          },
        }),

        db.article.count({
          where: {
            status:
              ArticleStatus.DRAFT,
          },
        }),

        db.article.count({
          where: {
            status:
              ArticleStatus.REVIEW,
          },
        }),

        db.issue.count(),

        db.comment.count(),

        db.comment.count({
          where: {
            status:
              "PENDING",
          },
        }),

        db.user.count(),
      ]);

    return NextResponse.json({
      success: true,

      stats: {
        articles: {
          total:
            totalArticles,

          published:
            publishedArticles,

          draft:
            draftArticles,

          inReview:
            reviewArticles,
        },

        issues: {
          total:
            totalIssues,
        },

        comments: {
          total:
            totalComments,

          pending:
            pendingComments,
        },

        users: {
          total:
            totalUsers,
        },
      },

      /**
       * Kompatibilitas
       * dashboard lama.
       */
      articles:
        totalArticles,

      activeIssues:
        totalIssues,

      waitingReview:
        reviewArticles,

      pendingComments:
        pendingComments,
    });
  } catch (error) {
    console.error(
      "Admin overview error:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Gagal memuat dashboard.",
      },
      {
        status: 500,
      }
    );
  }
}
