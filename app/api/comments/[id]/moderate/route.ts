import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  CommentStatus,
} from "@prisma/client";

import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

import {
  requirePermission,
} from "@/lib/authorization";

export const dynamic =
  "force-dynamic";

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
      "comment:moderate"
    );

  if (!access.ok) {
    return access.response;
  }

  try {
    const { id } =
      await params;

    const body =
      await request.json();

    if (
      typeof body.status !==
      "string"
    ) {
      return NextResponse.json(
        {
          error:
            "status is required",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Object.values(
        CommentStatus
      ).includes(
        body.status as
          CommentStatus
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid status",
        },
        {
          status: 400,
        }
      );
    }

    const comment =
      await db.comment.update({
        where: {
          id,
        },

        data: {
          status:
            body.status as
              CommentStatus,
        },
      });

    await audit({
      action:
        "COMMENT_MODERATED",

      entity:
        "Comment",

      entityId:
        id,

      actorId:
        access.user.id,

      metadata: {
        status:
          comment.status,
      },
    });

    return NextResponse.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error(
      "PATCH comment moderation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Gagal memoderasi komentar.",
      },
      {
        status: 500,
      }
    );
  }
}
