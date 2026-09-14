import {
  NextRequest,
  NextResponse,
} from "next/server";

import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

import {
  requirePermission,
} from "@/lib/authorization";

export const dynamic =
  "force-dynamic";

export async function POST(
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
      "issue:update"
    );

  if (!access.ok) {
    return access.response;
  }

  try {
    const { id } =
      await params;

    const body =
      await request.json();

    const title =
      typeof body.title ===
      "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body.content ===
      "string"
        ? body.content.trim()
        : "";

    if (!title) {
      return NextResponse.json(
        {
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
          error:
            "content is required",
        },
        {
          status: 400,
        }
      );
    }

    const issue =
      await db.issue.findUnique({
        where: {
          id,
        },
      });

    if (!issue) {
      return NextResponse.json(
        {
          error:
            "Issue not found",
        },
        {
          status: 404,
        }
      );
    }

    const update =
      await db.issueUpdate.create({
        data: {
          issueId:
            id,

          title,

          content,
        },
      });

    await audit({
      action:
        "ISSUE_UPDATE_CREATED",

      entity:
        "IssueUpdate",

      entityId:
        update.id,

      actorId:
        access.user.id,

      metadata: {
        issueId:
          id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: update,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST issue update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal membuat pembaruan isu.",
      },
      {
        status: 500,
      }
    );
  }
}
