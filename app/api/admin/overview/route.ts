import { NextResponse } from "next/server";
import { ArticleStatus, IssueStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/authorization";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = await requirePermission("read");
  if (!access.ok) return access.response;

  try {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      reviewArticles,
      totalIssues,
      openIssues,
      resolvedIssues,
      totalComments,
      pendingComments,
      totalUsers,
      latestArticles,
      latestIssues,
    ] = await Promise.all([
      db.article.count(),
      db.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      db.article.count({ where: { status: ArticleStatus.DRAFT } }),
      db.article.count({ where: { status: ArticleStatus.REVIEW } }),
      db.issue.count(),
      db.issue.count({
        where: {
          status: {
            in: [
              IssueStatus.OPEN,
              IssueStatus.MONITORING,
              IssueStatus.INVESTIGATING,
              IssueStatus.VERIFIED,
            ],
          },
        },
      }),
      db.issue.count({ where: { status: IssueStatus.RESOLVED } }),
      db.comment.count(),
      db.comment.count({ where: { status: "PENDING" } }),
      db.user.count(),
      db.article.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, updatedAt: true },
      }),
      db.issue.findMany({
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { id: true, title: true, status: true, updatedAt: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      statistics: {
        totalArticles,
        publishedArticles,
        draftArticles,
        totalIssues,
        openIssues,
        resolvedIssues,
      },
      latestArticles,
      latestIssues,
      stats: {
        articles: {
          total: totalArticles,
          published: publishedArticles,
          draft: draftArticles,
          inReview: reviewArticles,
        },
        issues: { total: totalIssues, active: openIssues, resolved: resolvedIssues },
        comments: { total: totalComments, pending: pendingComments },
        users: { total: totalUsers },
      },
      articles: totalArticles,
      activeIssues: openIssues,
      waitingReview: reviewArticles,
      pendingComments,
    });
  } catch (error) {
    console.error("Admin overview error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat dashboard." },
      { status: 500 }
    );
  }
}
