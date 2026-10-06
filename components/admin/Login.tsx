"use client";

import { useEffect, useRef, useState } from "react";
import { LockKeyhole } from "lucide-react";
import { api, send } from "./api";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  // Focus on desktop only: on a phone it would pop the keyboard up at once and cover the form.
  useEffect(() => {
    if (matchMedia("(hover: hover)").matches) input.current?.focus();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const r = await api("/api/admin/login", send("POST", { password: pw }));
    if (r.ok) return location.reload();
    setErr(r.status === 429 ? "Thử quá nhiều lần, vui lòng đợi một phút." : "Mật khẩu không đúng.");
    setBusy(false);
  };

  return (
    <main className="adm-center">
      <form className="adm-card adm-login" onSubmit={submit}>
        <span className="adm-logo"><LockKeyhole size={22} aria-hidden="true" /></span>
        <h1>Đăng nhập quản trị</h1>
        <label>
          <span>Mật khẩu</span>
          <input ref={input} type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" required />
        </label>
        {err && <p className="adm-err" role="alert">{err}</p>}
        <button className="adm-btn adm-primary" disabled={busy || !pw}>{busy ? "Đang kiểm tra…" : "Đăng nhập"}</button>
      </form>
    </main>
  );
}

export function Setup() {
  return (
    <main className="adm-center">
      <div className="adm-card adm-setup">
        <span className="adm-logo"><LockKeyhole size={22} aria-hidden="true" /></span>
        <h1>Chưa bật trang admin</h1>
        <p>Thêm hai biến sau vào file <code>.env.local</code> rồi khởi động lại server:</p>
        <pre>{`ADMIN_PASSWORD=mật-khẩu-của-bạn
ADMIN_SECRET=chuỗi-ngẫu-nhiên-dài-từ-16-ký-tự-trở-lên`}</pre>
        <p className="adm-muted">
          <code>ADMIN_PASSWORD</code> dùng để đăng nhập. <code>ADMIN_SECRET</code> ký phiên đăng nhập và mã hoá AI key / bot token lưu trong
          trang admin; đổi nó sẽ làm các khoá đã lưu không đọc được nữa.
        </p>
      </div>
    </main>
  );
}
