"use client";

import { useEffect, useState } from "react";
import { Dices, Loader2 } from "lucide-react";
import { api, send } from "./api";
import { SecretBadge } from "./AiTab";

type Secret = { set: boolean; source: "admin" | "env" | null; hint: string };
type Cfg = { telegram: { botToken: Secret; chatId: string; webhookSecret: Secret }; canEncrypt: boolean };
type Info = { ok: boolean; username?: string; webhookUrl?: string; pending?: number; lastError?: string; message?: string };

const randomSecret = () => {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
};

export default function TelegramTab() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [token, setToken] = useState("");
  const [chat, setChat] = useState("");
  const [secret, setSecret] = useState("");
  const [hook, setHook] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [info, setInfo] = useState<Info | null>(null);
  const [busy, setBusy] = useState("");

  const load = (c: Cfg) => { setCfg(c); setChat(c.telegram.chatId); };
  useEffect(() => {
    api<Cfg>("/api/admin/config").then((r) => r.ok && load(r.data));
    setHook(`${location.origin}/api/telegram/webhook`);
  }, []);

  const save = async () => {
    const telegram: Record<string, string> = { chatId: chat.trim() };
    if (token.trim()) telegram.botToken = token.trim();
    if (secret.trim()) telegram.webhookSecret = secret.trim();
    setBusy("save");
    setMsg(null);
    const r = await api<Cfg & { error?: string }>("/api/admin/config", send("PUT", { telegram }));
    if (r.ok) { load(r.data); setToken(""); setSecret(""); setMsg({ ok: true, text: "Đã lưu." }); }
    else setMsg({ ok: false, text: r.data.error ?? "Không lưu được." });
    setBusy("");
  };

  const act = async (action: string, extra?: object) => {
    setBusy(action);
    setMsg(null);
    const r = await api<Info>("/api/admin/telegram", send("POST", { action, ...extra }));
    if (action === "info" && r.data.ok) setInfo(r.data);
    else setMsg({ ok: !!r.data.ok, text: r.data.message ?? (r.data.ok ? "Xong." : "Có lỗi xảy ra.") });
    setBusy("");
  };

  if (!cfg) return <p className="adm-muted">Đang tải…</p>;
  const t = cfg.telegram;

  return (
    <>
      <header className="adm-head"><div><h1>Bot Telegram</h1><p className="adm-muted">Nhận tin nhắn chat trực tiếp và thông tin khách từ chatbot, trả lời ngay trong Telegram.</p></div></header>

      <section className="adm-card">
        <h2>Kết nối</h2>
        <div className="adm-field">
          <span>Bot token</span>
          <SecretBadge s={t.botToken} />
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="123456789:ABC… (dán token mới từ @BotFather)" autoComplete="off" aria-label="Bot token" />
        </div>
        <div className="adm-field">
          <span>Chat ID của bạn</span>
          <input value={chat} onChange={(e) => setChat(e.target.value)} placeholder="Ví dụ 123456789" inputMode="numeric" aria-label="Chat ID" />
          <small className="adm-muted">Nhắn một tin cho bot, rồi mở <code>api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> để thấy <code>chat.id</code>. Chỉ chat này mới được trả lời khách.</small>
        </div>
        <div className="adm-field">
          <span>Webhook secret <small className="adm-muted">(chỉ cần khi triển khai web công khai)</small></span>
          <SecretBadge s={t.webhookSecret} />
          <div className="adm-row">
            <input type="password" value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="Để trống nếu không đổi" autoComplete="off" aria-label="Webhook secret" />
            <button type="button" className="adm-btn" onClick={() => setSecret(randomSecret())} title="Tạo chuỗi ngẫu nhiên"><Dices size={16} aria-hidden="true" />Tạo</button>
          </div>
        </div>
        <div className="adm-actions">
          <button className="adm-btn adm-primary" disabled={!!busy} onClick={save}>{busy === "save" ? <Loader2 size={16} className="spin" /> : null}Lưu</button>
          {t.botToken.source === "admin" && (
            <button className="adm-btn adm-danger" disabled={!!busy} onClick={async () => { if (confirm("Xoá bot token đã lưu trong admin?")) { const r = await api<Cfg>("/api/admin/config", send("PUT", { telegram: { botToken: null } })); r.ok && load(r.data); } }}>Xoá token</button>
          )}
          {msg && <span className={msg.ok ? "adm-okmsg" : "adm-err"} role="status">{msg.text}</span>}
        </div>
      </section>

      <section className="adm-card">
        <h2>Kiểm tra</h2>
        <div className="adm-actions">
          <button className="adm-btn" disabled={!t.botToken.set || !!busy} onClick={() => act("test")}>{busy === "test" ? <Loader2 size={16} className="spin" /> : null}Gửi tin thử cho tôi</button>
          <button className="adm-btn" disabled={!t.botToken.set || !!busy} onClick={() => act("info")}>{busy === "info" ? <Loader2 size={16} className="spin" /> : null}Xem trạng thái bot</button>
        </div>
        {info && (
          <dl className="adm-kv">
            <dt>Bot</dt><dd>@{info.username}</dd>
            <dt>Webhook</dt><dd>{info.webhookUrl || "Chưa đăng ký (đang dùng polling, phù hợp chạy local)"}</dd>
            <dt>Tin chờ</dt><dd>{info.pending ?? 0}</dd>
            {info.lastError && (<><dt>Lỗi gần nhất</dt><dd className="adm-err">{info.lastError}</dd></>)}
          </dl>
        )}
      </section>

      <section className="adm-card">
        <h2>Webhook (khi triển khai công khai)</h2>
        <p className="adm-muted">Chạy trên máy cá nhân không cần webhook: trang tự lấy tin trả lời từ Telegram. Khi triển khai lên web https, đặt Webhook secret ở trên, lưu, rồi đăng ký địa chỉ dưới đây.</p>
        <div className="adm-row">
          <input value={hook} onChange={(e) => setHook(e.target.value)} aria-label="Địa chỉ webhook" />
          <button className="adm-btn" disabled={!t.botToken.set || !!busy} onClick={() => act("setWebhook", { url: hook })}>Đăng ký</button>
          <button className="adm-btn adm-danger" disabled={!t.botToken.set || !!busy} onClick={() => confirm("Gỡ webhook?") && act("deleteWebhook")}>Gỡ</button>
        </div>
      </section>
    </>
  );
}
