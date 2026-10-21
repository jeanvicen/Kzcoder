import { get } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  isAllowedPrivateImageType,
  isOwnedPrivateBlobPathname,
} from "@/lib/private-blob";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ pathname: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pathname: pathSegments } = await params;
  const pathname = pathSegments.join("/");
  if (!isOwnedPrivateBlobPathname(pathname, session.user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const blob = await get(pathname, { access: "private" });
    if (
      !blob ||
      blob.statusCode !== 200 ||
      !isAllowedPrivateImageType(blob.blob.contentType)
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new Response(blob.stream, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Type": blob.blob.contentType,
        "Content-Disposition": "inline",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 500 });
  }
}
