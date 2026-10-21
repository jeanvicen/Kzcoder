import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), {
      message: "File type should be JPEG or PNG",
    }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.issues
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = (formData.get("file") as File).name;
    const safeName =
      filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100) || "upload";
    const pathname = `${session.user.id}/${randomUUID()}-${safeName}`;
    const fileBuffer = await file.arrayBuffer();

    try {
      await put(pathname, fileBuffer, {
        access: "private",
        contentType: file.type,
      });

      const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(
        /\/+$/,
        ""
      );
      const encodedPath = pathname
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
      const url = new URL(
        `${basePath}/api/files/${encodedPath}`,
        request.url
      ).toString();

      return NextResponse.json({ contentType: file.type, name: safeName, url });
    } catch {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
