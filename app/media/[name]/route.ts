import { MIME, readImage } from "@/lib/media";

export const runtime = "nodejs";

// Public image address (/media/<name>). It lives outside /api so search engines may index the pictures.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const img = readImage((await params).name);
  if (!img) return new Response(null, { status: 404 });
  return new Response(new Uint8Array(img.buf), {
    headers: {
      "Content-Type": MIME[img.type],
      "Cache-Control": "public, max-age=31536000, immutable", // names are random and never reused
      "X-Content-Type-Options": "nosniff",
    },
  });
}
