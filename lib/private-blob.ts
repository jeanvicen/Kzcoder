import { get } from "@vercel/blob";
import { Buffer } from "node:buffer";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const PRIVATE_IMAGE_FILENAME =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}-[A-Za-z0-9._-]{1,100}$/i;

export function isAllowedPrivateImageType(contentType: string): boolean {
  return ALLOWED_IMAGE_TYPES.has(contentType);
}

export function isOwnedPrivateBlobPathname(
  pathname: string,
  userId: string
): boolean {
  const segments = pathname.split("/");
  if (segments.length !== 2 || segments[0] !== userId) {
    return false;
  }

  const filename = segments[1];
  return Boolean(
    filename &&
      filename !== "." &&
      PRIVATE_IMAGE_FILENAME.test(filename)
  );
}

export function getOwnedPrivateBlobPathnameFromUrl(
  rawUrl: string,
  requestUrl: string,
  userId: string
): string | null {
  let url: URL;
  let origin: URL;
  try {
    origin = new URL(requestUrl);
    url = new URL(rawUrl, origin);
  } catch {
    return null;
  }

  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");
  const prefix = `${basePath}/api/files/`;
  if (
    url.origin !== origin.origin ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    !url.pathname.startsWith(prefix)
  ) {
    return null;
  }

  const encodedSegments = url.pathname.slice(prefix.length).split("/");
  let segments: string[];
  try {
    segments = encodedSegments.map((segment) => decodeURIComponent(segment));
  } catch {
    return null;
  }

  if (
    segments.some(
      (segment) =>
        !segment ||
        segment === "." ||
        segment === ".." ||
        segment.includes("/") ||
        segment.includes("\\") ||
        segment.includes("\0")
    )
  ) {
    return null;
  }

  const pathname = segments.join("/");
  return isOwnedPrivateBlobPathname(pathname, userId) ? pathname : null;
}

export async function getPrivateBlobDataUrl(pathname: string): Promise<string> {
  const blob = await get(pathname, { access: "private" });
  if (
    !blob ||
    blob.statusCode !== 200 ||
    !isAllowedPrivateImageType(blob.blob.contentType)
  ) {
    throw new Error("Private image is unavailable or has an unsupported type");
  }

  const bytes = await new Response(blob.stream).arrayBuffer();
  return `data:${blob.blob.contentType};base64,${Buffer.from(bytes).toString("base64")}`;
}
