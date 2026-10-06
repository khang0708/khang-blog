"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Loader2, ShieldAlert } from "lucide-react";
import { api, send } from "./api";

type Secret = { set: boolean; source: "admin" | "env" | null; hint: string };
type Cfg = { anthropicKey: Secret; modelMode: "auto" | "fast" | "smart"; dailyTokenLimit: number; canEncrypt: boolean };

const modes = [
  { id: "auto", title: "Tự động", desc: "Haiku cho câu hỏi đơn giản, Sonnet cho câu khó. Cân bằng chi phí và chất lượng." },
  { id: "fast", title: "Luôn Haiku", desc: "Rẻ nhất. Phù hợp nếu chỉ cần trả lời nhanh các câu hỏi cơ bản." },
  { id: "smart", title: "Luôn Sonnet", desc: "Trả lời tốt hơn ở câu hỏi phức tạp, chi phí cao hơn khoảng 2 lần." },
] as const;

export function SecretBadge({ s }: { s: Secret }) {
  return s.set ? (
    <span className="adm-badge adm-ok"><CheckCircle2 size={13} aria-hidden="true" />Đã đặt {s.hint} · {s.source === "env" ? "từ biến môi trường" : "lưu trong admin"}</span>
  ) : (
    <span className="adm-badge adm-warn">Chưa đặt</span>
  );
}

export default function AiTab() {
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [key, setKey] = useState("");
  const [mode, setMode] = useState<Cfg["modelMode"]>("auto");
  const [limit, setLimit] = useState("0");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState("");

  const load = (c: Cfg) => {
    setCfg(c);
    setMode(c.modelMode);
    setLimit(String(c.dailyTokenLimit));
  };
  useEffect(() => { api<Cfg>("/api/admin/config").then((r) => r.ok && load(r.data)); }, []);

  const save = async (patch: object, label: string) => {
    setBusy(label);
    setMsg(null);
    const r = await api<Cfg & { error?: string }>("/api/admin/config", send("PUT", patch));
    if (r.ok) { load(r.data); setKey(""); setMsg({ ok: true, text: "Đã lưu." }); }
    else setMsg({ ok: false, text: r.data.error ?? "Không lưu được." });
    setBusy("");
  };

  const test = async () => {
    setBusy("test");
    setMsg(null);
    const r = await api<{ ok: boolean; message: string }>("/api/admin/ai", send("POST"));
    setMsg({ ok: r.data.ok, text: r.data.message });
    setBusy("");
  };

  if (!cfg) return <p className="adm-muted">Đang tải…</p>;

  return (
    <>
      <header className="adm-head"><div><h1>Cấu hình AI</h1><p className="adm-muted">Khoá API, model và giới hạn token cho chatbot.</p></div></header>

      {!cfg.canEncrypt && (
        <p className="adm-note adm-warn-box"><ShieldAlert size={18} aria-hidden="true" />ADMIN_SECRET chưa đủ 16 ký tự nên không thể lưu khoá trong admin. Hãy đặt biến này rồi khởi động lại server.</p>
      )}

      <section className="adm-card">
        <h2><KeyRound size={18} aria-hidden="true" />Anthropic API key</h2>
        <p><SecretBadge s={cfg.anthropicKey} /></p>
        <form className="adm-row" onSubmit={(e) => { e.preventDefault(); save({ anthropicKey: key.trim() }, "key"); }}>
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk-ant-…  (dán khoá mới để thay thế)" autoComplete="off" aria-label="Khoá API mới" />
          <button className="adm-btn adm-primary" disabled={!key.trim() || !!busy}>{busy === "key" ? <Loader2 size={16} className="spin" /> : null}Lưu khoá</button>
        </form>
        <div className="adm-actions">
          <button className="adm-btn" onClick={test} disabled={!cfg.anthropicKey.set || !!busy}>{busy === "test" ? <Loader2 size={16} className="spin" /> : null}Kiểm tra khoá</button>
          {cfg.anthropicKey.source === "admin" && (
            <button className="adm-btn adm-danger" disabled={!!busy} onClick={() => confirm("Xoá khoá đã lưu trong admin?") && save({ anthropicKey: null }, "clear")}>Xoá khoá</button>
          )}
        </div>
        <p className="adm-muted">Khoá được mã hoá trước khi lưu và không bao giờ hiển thị lại, chỉ thấy 4 ký tự cuối. Khoá lưu trong admin được ưu tiên hơn biến môi trường.</p>
      </section>

      <section className="adm-card">
        <h2>Model</h2>
        <div className="adm-choices" role="radiogroup" aria-label="Chế độ model">
          {modes.map((m) => (
            <label key={m.id} className="adm-choice" data-on={mode === m.id}>
              <input type="radio" name="mode" checked={mode === m.id} onChange={() => setMode(m.id)} />
              <strong>{m.title}</strong>
              <span>{m.desc}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="adm-card">
        <h2>Giới hạn token mỗi ngày</h2>
        <p className="adm-muted">Khi chạm giới hạn, chatbot tạm dừng đến hết ngày (theo giờ UTC) và hướng khách sang chat trực tiếp hoặc email. Nhập 0 để tắt giới hạn.</p>
        <div className="adm-row">
          <input type="number" min={0} step={10000} value={limit} onChange={(e) => setLimit(e.target.value)} aria-label="Giới hạn token mỗi ngày" />
          <span className="adm-muted">token / ngày</span>
        </div>
      </section>

      <div className="adm-actions">
        <button className="adm-btn adm-primary" disabled={!!busy} onClick={() => save({ modelMode: mode, dailyTokenLimit: Number(limit) || 0 }, "settings")}>
          {busy === "settings" ? <Loader2 size={16} className="spin" /> : null}Lưu model & giới hạn
        </button>
        {msg && <span className={msg.ok ? "adm-okmsg" : "adm-err"} role="status">{msg.text}</span>}
      </div>
    </>
  );
}
