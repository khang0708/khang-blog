"use client";

import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, ExternalLink, FileUp, ImagePlus, Plus, Trash2, X } from "lucide-react";
import PostBody from "../PostBody";
import { api, fmtTime, send } from "./api";

type Post = { id: string; slug: string; title: string; excerpt: string; cover?: string; coverAlt?: string; body: string; status: "draft" | "published"; updatedAt: number; publishedAt?: number };
const empty = { id: "", slug: "", title: "", excerpt: "", cover: "", coverAlt: "", body: "", status: "draft" as Post["status"] };

// Sends one image to the admin upload API. Not api(): the browser must set the multipart header itself.
async function upload(file: File): Promise<{ url?: string; error?: string }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (res.status === 401) location.reload();
  return (await res.json().catch(() => ({ error: "Không tải được ảnh." }))) as { url?: string; error?: string };
}

export default function BlogTab() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [form, setForm] = useState<typeof empty | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [note, setNote] = useState("");
  const [up, setUp] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const load = () => api<{ posts: Post[] }>("/api/admin/posts").then((r) => r.ok && setPosts(r.data.posts));
  useEffect(() => { load(); }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setBusy(true);
    setErr("");
    const { id, ...body } = form;
    const r = await api<{ error?: string }>(id ? `/api/admin/posts/${id}` : "/api/admin/posts", send(id ? "PUT" : "POST", body));
    setBusy(false);
    if (!r.ok) return setErr(r.data.error ?? "Không lưu được bài viết.");
    setForm(null);
    setPreview(false);
    load();
  };

  const importSamples = async () => {
    if (!confirm("Nạp các bài mẫu vào danh sách dưới dạng bản nháp? Bài đã có cùng slug sẽ được bỏ qua.")) return;
    const r = await api<{ added: number; skipped: number }>("/api/admin/posts/import", send("POST"));
    setNote(r.ok ? `Đã thêm ${r.data.added} bài nháp${r.data.skipped ? `, bỏ qua ${r.data.skipped} bài đã có` : ""}.` : "Không nạp được bài mẫu.");
    load();
  };

  const remove = async (p: Post) => {
    if (!confirm(`Xoá bài "${p.title}"?`)) return;
    await api(`/api/admin/posts/${p.id}`, send("DELETE"));
    load();
  };

  if (!posts) return <p className="adm-muted">Đang tải…</p>;

  if (form) {
    const pickCover = async (f?: File) => {
      if (!f) return;
      setUp("cover"); setErr("");
      const r = await upload(f);
      setUp("");
      if (r.url) setForm((cur) => cur && { ...cur, cover: r.url!, coverAlt: cur.coverAlt || cur.title });
      else setErr(r.error ?? "Không tải được ảnh.");
    };
    // uploads an image and inserts ![alt](url) at the cursor of the content box
    const pickInline = async (f?: File) => {
      if (!f) return;
      const alt = (prompt("Mô tả ảnh (alt text, giúp SEO và người dùng đọc màn hình):", f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")) ?? "").replace(/[\]\[\n]/g, " ").trim();
      setUp("inline"); setErr("");
      const r = await upload(f);
      setUp("");
      if (!r.url) return setErr(r.error ?? "Không tải được ảnh.");
      const ta = bodyRef.current;
      const at = ta ? ta.selectionStart : form.body.length;
      const before = form.body.slice(0, at).replace(/\s*$/, "");
      const after = form.body.slice(at).replace(/^\s*/, "");
      const md = `![${alt}](${r.url})`;
      setForm({ ...form, body: `${before}${before ? "\n\n" : ""}${md}${after ? "\n\n" : ""}${after}` });
    };
    const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm({ ...form, [k]: e.target.value });
    return (
      <>
        <header className="adm-head"><div><h1>{form.id ? "Sửa bài viết" : "Bài viết mới"}</h1></div></header>
        <div className="adm-actions adm-tabs-inline" role="tablist">
          <button type="button" role="tab" aria-selected={!preview} className="adm-btn" onClick={() => setPreview(false)}><EyeOff size={16} aria-hidden="true" />Soạn thảo</button>
          <button type="button" role="tab" aria-selected={preview} className="adm-btn" onClick={() => setPreview(true)}><Eye size={16} aria-hidden="true" />Xem trước</button>
        </div>

        {preview && (
          <article className="adm-card adm-preview">
            <p className="adm-muted adm-preview-note">Xem trước đúng như trang công khai{form.status === "draft" ? ". Bài đang là bản nháp nên khách chưa nhìn thấy." : "."}</p>
            <p className="adm-serp" data-bad={form.excerpt.length === 0 || form.excerpt.length > 160}>
              <b>Mô tả trên Google (meta description)</b> · {form.excerpt.length}/160 ký tự
              <span>{form.excerpt || "(chưa có, Google sẽ tự lấy một đoạn trong bài)"}</span>
            </p>
            <h1 className="case-title blog-title">{form.title || "(chưa có tiêu đề)"}</h1>
            <p className="case-line">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
            {form.cover && <figure className="blog-cover"><img src={form.cover} alt={form.coverAlt || form.title} /></figure>}
            <div className="blog-body">{form.body.trim() ? <PostBody text={form.body} /> : <p className="adm-muted">(chưa có nội dung)</p>}</div>
            <div className="adm-actions">
              <button type="button" className="adm-btn" onClick={() => setPreview(false)}>Quay lại soạn thảo</button>
            </div>
          </article>
        )}

        <form className="adm-card adm-form" onSubmit={save} hidden={preview}>
          <label><span>Tiêu đề *</span><input value={form.title} onChange={set("title")} required maxLength={140} /></label>
          <label><span>Slug (đường dẫn)</span><input value={form.slug} onChange={set("slug")} placeholder="Tự tạo từ tiêu đề nếu để trống" maxLength={80} /></label>
          <label><span>Mô tả ngắn</span><textarea value={form.excerpt} onChange={set("excerpt")} rows={2} maxLength={300} /></label>
          <div className="adm-field adm-cover">
            <span>Ảnh bìa <small className="adm-muted">(hiện ở danh sách bài và đầu bài; nên tỉ lệ 1200×630)</small></span>
            {form.cover && <img className="adm-cover-img" src={form.cover} alt="" />}
            <div className="adm-row">
              <input value={form.cover} onChange={set("cover")} placeholder="Dán đường dẫn ảnh (bắt đầu bằng / hoặc https://) hoặc tải lên" aria-label="Đường dẫn ảnh bìa" />
              <label className="adm-btn adm-file">
                <ImagePlus size={16} aria-hidden="true" />{up === "cover" ? "Đang tải…" : "Tải ảnh lên"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => { pickCover(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {form.cover && <button type="button" className="adm-icon" onClick={() => setForm({ ...form, cover: "", coverAlt: "" })} aria-label="Bỏ ảnh bìa"><X size={16} /></button>}
            </div>
            {form.cover && <input value={form.coverAlt} onChange={set("coverAlt")} placeholder="Mô tả ảnh bìa (alt text)" maxLength={150} aria-label="Mô tả ảnh bìa" />}
          </div>
          <label>
            <span>Nội dung</span>
            <textarea ref={bodyRef} value={form.body} onChange={set("body")} rows={14} placeholder={"Đoạn văn cách nhau một dòng trống.\n\n## Tiêu đề phụ\n\n- Gạch đầu dòng\n- Gạch đầu dòng"} />
            <small className="adm-muted">Định dạng đơn giản: dòng bắt đầu bằng <code>## </code> là tiêu đề phụ, <code>### </code> là tiêu đề nhỏ hơn (hợp với câu hỏi trong phần Hỏi đáp), các dòng bắt đầu bằng <code>- </code> là danh sách. Một dòng riêng dạng <code>![mô tả](đường dẫn ảnh)</code> sẽ hiện thành ảnh. Trình soạn Markdown đầy đủ sẽ bổ sung sau.</small>
            <span className="adm-row">
              <label className="adm-btn adm-file">
                <ImagePlus size={16} aria-hidden="true" />{up === "inline" ? "Đang tải…" : "Chèn ảnh vào nội dung"}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => { pickInline(e.target.files?.[0]); e.target.value = ""; }} />
              </label>
            </span>
          </label>
          <label><span>Trạng thái</span>
            <select value={form.status} onChange={set("status")}><option value="draft">Bản nháp (ẩn)</option><option value="published">Đã xuất bản</option></select>
          </label>
          {err && <p className="adm-err" role="alert">{err}</p>}
          <div className="adm-actions">
            <button className="adm-btn adm-primary" disabled={busy}>{busy ? "Đang lưu…" : "Lưu bài viết"}</button>
            <button type="button" className="adm-btn" onClick={() => { setForm(null); setErr(""); setPreview(false); }}>Huỷ</button>
            <button type="button" className="adm-btn" onClick={() => setPreview(true)}><Eye size={16} aria-hidden="true" />Xem trước</button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <header className="adm-head">
        <div><h1>Blog</h1><p className="adm-muted">Viết và xuất bản bài. Bài đã xuất bản hiển thị tại <a className="adm-link" href="/blog" target="_blank">/blog</a>.</p></div>
        <div className="adm-actions">
          <button className="adm-btn" onClick={importSamples}><FileUp size={16} aria-hidden="true" />Nạp bài mẫu</button>
          <button className="adm-btn adm-primary" onClick={() => { setPreview(false); setForm({ ...empty }); }}><Plus size={16} aria-hidden="true" />Bài mới</button>
        </div>
      </header>

      {note && <p className="adm-okmsg" role="status">{note}</p>}
      {posts.length === 0 && <p className="adm-card adm-muted">Chưa có bài viết nào. Bấm "Nạp bài mẫu" để bắt đầu từ các bài viết dựa trên dự án của bạn.</p>}
      <ul className="adm-posts">
        {posts.map((p) => (
          <li key={p.id} className="adm-card">
            <div>
              <strong>{p.title}</strong>
              <span className={`adm-badge ${p.status === "published" ? "adm-ok" : ""}`}>{p.status === "published" ? "Đã xuất bản" : "Bản nháp"}</span>
              <p className="adm-muted">/{p.slug} · cập nhật {fmtTime(p.updatedAt)}</p>
            </div>
            <div className="adm-post-actions">
              {p.status === "published" && <a className="adm-icon" href={`/blog/${p.slug}`} target="_blank" aria-label="Xem bài"><ExternalLink size={16} /></a>}
              <button className="adm-btn" onClick={() => { setPreview(false); setForm({ id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, cover: p.cover ?? "", coverAlt: p.coverAlt ?? "", body: p.body, status: p.status }); }}>Sửa</button>
              <button className="adm-icon" onClick={() => remove(p)} aria-label={`Xoá ${p.title}`}><Trash2 size={16} /></button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
