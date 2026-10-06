import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { dataDir } from "./db.ts";

// Images uploaded from the admin page live in <data dir>/uploads and are served by /media/<name>.
// ponytail: local disk, same limit as lib/db.ts. On serverless swap for object storage (S3, Vercel Blob).
export const MAX_BYTES = 5 * 1024 * 1024;
export type ImgType = "png" | "jpg" | "webp" | "gif";
export const MIME: Record<ImgType, string> = { png: "image/png", jpg: "image/jpeg", webp: "image/webp", gif: "image/gif" };

/** Identify an image by its first bytes, never by the file name or the type the browser claims. SVG is deliberately not allowed. */
export function sniffImage(b: Uint8Array): ImgType | null {
  const at = (i: number, ...v: number[]) => v.every((x, k) => b[i + k] === x);
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "png";
  if (at(0, 0xff, 0xd8, 0xff)) return "jpg";
  if (at(0, 0x47, 0x49, 0x46, 0x38)) return "gif";
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return "webp";
  return null;
}

const NAME = /^[a-f0-9]{16}\.(png|jpg|webp|gif)$/;
const uploads = () => path.join(dataDir(), "uploads");

export function saveImage(buf: Buffer): { name: string } | { error: string } {
  if (buf.length === 0) return { error: "File rỗng." };
  if (buf.length > MAX_BYTES) return { error: "Ảnh quá lớn (tối đa 5MB)." };
  const type = sniffImage(buf);
  if (!type) return { error: "Chỉ nhận ảnh PNG, JPG, WebP hoặc GIF." };
  const name = `${randomBytes(8).toString("hex")}.${type}`;
  fs.mkdirSync(uploads(), { recursive: true });
  fs.writeFileSync(path.join(uploads(), name), buf);
  return { name };
}

export function readImage(name: string): { buf: Buffer; type: ImgType } | null {
  if (!NAME.test(name)) return null; // also blocks path traversal
  try {
    return { buf: fs.readFileSync(path.join(uploads(), name)), type: name.split(".")[1] as ImgType };
  } catch {
    return null;
  }
}
