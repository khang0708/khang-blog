"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, SendHorizontal, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { profile } from "@/lib/content";

type Status = "idle" | "sending" | "done" | "error" | "off";

const roles = [
  { id: "hr", en: "Recruiter / HR", vi: "Tuyển dụng / HR" },
  { id: "client", en: "Client", vi: "Khách hàng" },
  { id: "other", en: "Other", vi: "Khác" },
];

// Inline contact form for recruiters, HR and clients. Details go to Khang through /api/lead (Telegram).
export default function LeadForm() {
  const { t, lang } = useLang();
  const [status, setStatus] = useState<Status>("idle");
  const [err, setErr] = useState("");
  const [role, setRole] = useState("hr");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setStatus("sending");
    setErr("");
    try {
      const res = await fetch(`/api/lead?page=${encodeURIComponent(location.pathname)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(f), role, consent: f.get("consent") === "on" }),
      });
      if (res.ok) return setStatus("done");
      if (res.status === 503) return setStatus("off");
      const j = (await res.json().catch(() => ({}))) as { error?: string; field?: string };
      setErr(
        res.status === 429
          ? t({ en: "Too many attempts, please try again later.", vi: "Bạn thử quá nhiều lần, vui lòng thử lại sau." })
          : j.field === "email"
            ? t({ en: "Please check your email address.", vi: "Vui lòng kiểm tra lại địa chỉ email." })
            : j.field === "phone"
              ? t({ en: "Please check your phone number.", vi: "Vui lòng kiểm tra lại số điện thoại." })
              : j.field === "name"
                ? t({ en: "Please enter your name.", vi: "Vui lòng nhập tên của bạn." })
                : t({ en: "Could not send, please try again.", vi: "Chưa gửi được, vui lòng thử lại." }),
      );
      setStatus("error");
    } catch {
      setErr(t({ en: "Connection lost, please try again.", vi: "Mất kết nối, vui lòng thử lại." }));
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="cc cc-lead cc-lead-done">
        <CheckCircle2 size={28} aria-hidden="true" />
        <strong>{t({ en: "Thank you! Khang has your details.", vi: "Cảm ơn bạn! Khang đã nhận được thông tin." })}</strong>
        <small>{t({ en: "He will get back to you by email or phone.", vi: "Khang sẽ liên hệ lại với bạn qua email hoặc điện thoại." })}</small>
      </div>
    );
  }

  if (status === "off") {
    return (
      <div className="cc cc-lead">
        <strong>{t({ en: "The form is not available right now.", vi: "Biểu mẫu hiện chưa khả dụng." })}</strong>
        <a className="cc-mail" href={`mailto:${profile.email}`}>{profile.email}</a>
      </div>
    );
  }

  return (
    <form className="cc cc-lead" onSubmit={submit}>
      <strong>{t({ en: "Leave your details", vi: "Để lại thông tin liên hệ" })}</strong>

      <div className="cc-seg" role="radiogroup" aria-label={t({ en: "I am", vi: "Bạn là" })}>
        {roles.map((r) => (
          <button key={r.id} type="button" role="radio" aria-checked={role === r.id} onClick={() => setRole(r.id)}>
            {r[lang as "en" | "vi"]}
          </button>
        ))}
      </div>

      <label>
        <span>{t({ en: "Full name", vi: "Họ và tên" })} *</span>
        <input name="name" required minLength={2} maxLength={80} autoComplete="name" />
      </label>
      <div className="cc-grid2">
        <label>
          <span>Email *</span>
          <input name="email" type="email" required maxLength={120} autoComplete="email" inputMode="email" />
        </label>
        <label>
          <span>{t({ en: "Phone", vi: "Số điện thoại" })}</span>
          <input name="phone" type="tel" maxLength={30} autoComplete="tel" inputMode="tel" />
        </label>
      </div>
      <label>
        <span>{t({ en: "Company", vi: "Công ty" })}</span>
        <input name="company" maxLength={80} autoComplete="organization" />
      </label>
      <label>
        <span>{t({ en: "What would you like to discuss?", vi: "Bạn muốn trao đổi điều gì?" })}</span>
        <textarea name="note" rows={2} maxLength={500} />
      </label>

      {/* honeypot: hidden from people, bots tend to fill it */}
      <input name="website" className="cc-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />

      <label className="cc-consent">
        <input name="consent" type="checkbox" required />
        <span>
          <ShieldCheck size={14} aria-hidden="true" />
          {t({
            en: "I agree that Khang may contact me with these details. They are used only for this and sent to him privately.",
            vi: "Mình đồng ý để Khang liên hệ lại qua các thông tin này. Thông tin chỉ dùng cho mục đích đó và được gửi riêng cho Khang.",
          })}
        </span>
      </label>

      {err && <p className="cc-err" role="alert">{err}</p>}
      <button type="submit" className="cc-submit" disabled={status === "sending"}>
        {status === "sending" ? <Loader2 size={16} className="spin" aria-hidden="true" /> : <SendHorizontal size={16} aria-hidden="true" />}
        {t({ en: "Send to Khang", vi: "Gửi cho Khang" })}
      </button>
    </form>
  );
}
