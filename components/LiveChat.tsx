"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { profile } from "@/lib/content";

export type LiveMsg = { from: "me" | "khang" | "sys"; text: string; at: number };

const KEY = { sid: "live_sid", after: "live_after", msgs: "live_msgs", name: "live_name" };

const newId = () => {
  const a = new Uint8Array(10);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => (b % 36).toString(36)).join("");
};

const read = (k: string) => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const write = (k: string, v: string) => {
  try { localStorage.setItem(k, v); } catch {}
};

// Owns the live conversation: session id, history, polling for Khang's Telegram replies.
export function useLive(viewing: boolean) {
  const { t } = useLang();
  const [msgs, setMsgs] = useState<LiveMsg[]>([]);
  const [unread, setUnread] = useState(0);
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const sid = useRef("");
  const after = useRef(0);

  useEffect(() => {
    sid.current = read(KEY.sid) ?? newId();
    write(KEY.sid, sid.current);
    after.current = Number(read(KEY.after) ?? 0) || 0;
    setName(read(KEY.name) ?? "");
    try { setMsgs(JSON.parse(read(KEY.msgs) ?? "[]")); } catch {}
  }, []);

  useEffect(() => {
    if (msgs.length) write(KEY.msgs, JSON.stringify(msgs.slice(-50)));
  }, [msgs]);

  useEffect(() => { if (viewing) setUnread(0); }, [viewing, msgs.length]);

  // Poll only once the visitor has actually written; slower while the panel is not in view.
  const started = msgs.some((m) => m.from === "me");
  useEffect(() => {
    if (!started) return;
    const tick = async () => {
      if (document.visibilityState !== "visible" || !sid.current) return;
      try {
        const r = await fetch(`/api/live/poll?sid=${sid.current}&after=${after.current}`, { cache: "no-store" });
        if (!r.ok) return;
        const { replies } = (await r.json()) as { replies?: { seq: number; text: string; at: number }[] };
        if (!replies?.length) return;
        after.current = replies[replies.length - 1].seq;
        write(KEY.after, String(after.current));
        setMsgs((m) => [...m, ...replies.map((x) => ({ from: "khang" as const, text: x.text, at: x.at }))]);
        if (!viewing) setUnread((u) => u + replies.length);
      } catch {}
    };
    tick();
    const id = setInterval(tick, viewing ? 3000 : 8000);
    return () => clearInterval(id);
  }, [started, viewing]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || sending) return;
    const sys = (s: string) => setMsgs((m) => [...m, { from: "sys", text: s, at: Date.now() }]);
    setMsgs((m) => [...m, { from: "me", text: q, at: Date.now() }]);
    setSending(true);
    try {
      const res = await fetch("/api/live/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid: sid.current, name, text: q, page: location.pathname }),
      });
      if (res.status === 503) {
        sys(t({ en: `Live chat is not available right now. Please email ${profile.email}.`, vi: `Chat trực tiếp hiện chưa khả dụng. Vui lòng email ${profile.email}.` }));
      } else if (res.status === 429) {
        sys(t({ en: "You're sending too fast, please wait a moment.", vi: "Bạn gửi hơi nhanh, vui lòng đợi một chút." }));
      } else if (!res.ok) {
        sys(t({ en: "Could not deliver your message, please try again.", vi: "Chưa gửi được tin nhắn, vui lòng thử lại." }));
      }
    } catch {
      sys(t({ en: "Connection lost, please try again.", vi: "Mất kết nối, vui lòng thử lại." }));
    } finally {
      setSending(false);
    }
  };

  const saveName = (n: string) => {
    setName(n);
    write(KEY.name, n);
  };

  return { msgs, unread, name, saveName, send, sending };
}

export default function LiveView({ live }: { live: ReturnType<typeof useLive> }) {
  const { t } = useLang();
  const { msgs, name, saveName, send, sending } = live;
  const [input, setInput] = useState("");
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  return (
    <>
      <div className="chat-log" ref={log} aria-live="polite">
        <p className="chat-live-intro chat-item">
          <ShieldCheck size={18} aria-hidden="true" />
          <span>
            {t({
              en: "Your message goes straight to Khang. His reply appears here, so keep this window handy. Leave your email if you want to be reached later.",
              vi: "Tin nhắn của bạn được gửi thẳng tới Khang và câu trả lời sẽ hiện ngay tại đây. Hãy để lại email nếu muốn Khang liên hệ lại sau.",
            })}
          </span>
        </p>
        {msgs.length === 0 && (
          <label className="chat-name chat-item">
            <span>{t({ en: "Your name (optional)", vi: "Tên của bạn (không bắt buộc)" })}</span>
            <input value={name} onChange={(e) => saveName(e.target.value)} maxLength={40} placeholder={t({ en: "Jane Doe", vi: "Nguyễn Văn A" })} />
          </label>
        )}
        {msgs.map((m, i) =>
          m.from === "sys" ? (
            <p key={i} className="chat-sys chat-item">{m.text}</p>
          ) : (
            <p key={i} className={`chat-msg ${m.from === "me" ? "user" : "assistant khang"} chat-item`}>
              {m.from === "khang" && <b>Khang</b>}
              {m.text}
            </p>
          ),
        )}
      </div>

      <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input); setInput(""); }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder={t({ en: "Write to Khang…", vi: "Nhắn cho Khang…" })}
          aria-label={t({ en: "Message to Khang", vi: "Tin nhắn gửi Khang" })}
        />
        <button type="submit" disabled={sending || !input.trim()} aria-label={t({ en: "Send", vi: "Gửi" })}>
          <Send size={18} />
        </button>
      </form>
      <p className="chat-privacy">
        {t({ en: "Messages are delivered to Khang's Telegram.", vi: "Tin nhắn được chuyển tới Telegram của Khang." })}
      </p>
    </>
  );
}
