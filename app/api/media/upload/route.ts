import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const url = String(body.url || "").trim();

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error:
            "URL media wajib diisi.",
        },
        {
          status: 400,
        }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "URL media tidak valid.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        url,
        type:
          body.type || "IMAGE",
        name:
          body.name || null,
      },
    });
  } catch (error) {
    console.error(
      "Media upload error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Gagal memproses media.",
      },
      {
        status: 500,
      }
    );
  }
}
