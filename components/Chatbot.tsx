"use client";

import { useEffect, useRef, useState } from "react";
import { Briefcase, Layers, Mail, MessageCircle, RotateCcw, Send, Sparkles, UserRound, X } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { parseChat, type Part } from "@/lib/chatParse";
import { ContactCard, GotoButton, JobCard, LiveCard, ProjectCard, SkillsCard, StatsCard } from "./ChatCards";
import LiveView, { useLive } from "./LiveChat";
import LeadForm from "./LeadForm";
import { OPEN_CHAT, type OpenChat } from "@/lib/chatBridge";
import { track } from "@/lib/track";

type Msg = { role: "user" | "assistant"; content: string };

const starters = [
  { icon: Briefcase, en: "Show me Khang's best projects", vi: "Cho mình xem các dự án nổi bật của Khang" },
  { icon: Layers, en: "What's his tech stack?", vi: "Khang dùng những công nghệ gì?" },
  { icon: Sparkles, en: "What are his biggest achievements?", vi: "Thành tích nổi bật nhất của Khang là gì?" },
  { icon: Mail, en: "I'd like to hire or work with Khang", vi: "Mình muốn tuyển dụng hoặc hợp tác với Khang" },
];

function Card({ part, close, openLive }: { part: Extract<Part, { type: "card" }>; close: () => void; openLive: () => void }) {
  const p = { arg: part.arg, close };
  switch (part.kind) {
    case "project": return <ProjectCard {...p} />;
    case "job": return <JobCard {...p} />;
    case "skills": return <SkillsCard {...p} />;
    case "contact": return <ContactCard />;
    case "stats": return <StatsCard />;
    case "goto": return <GotoButton {...p} />;
    case "live": return <LiveCard openLive={openLive} />;
    case "lead": return <LeadForm />;
  }
}

function Assistant({ raw, last, busy, close, send, openLive }: { raw: string; last: boolean; busy: boolean; close: () => void; send: (q: string) => void; openLive: () => void }) {
  const parts = parseChat(raw);
  const replies = parts.filter((x): x is Extract<Part, { type: "reply" }> => x.type === "reply");
  const body = parts.filter((x) => x.type !== "reply");

  if (body.length === 0 && replies.length === 0) {
    return <p className="chat-msg assistant chat-item"><span className="chat-typing" aria-label="typing"><i /><i /><i /></span></p>;
  }
  return (
    <>
      {body.map((x, i) =>
        x.type === "text" ? (
          <p key={i} className="chat-msg assistant chat-item">{x.text}</p>
        ) : x.type === "card" ? (
          <div key={i} className="chat-item chat-card" style={{ ["--i" as string]: i }}>
            <Card part={x} close={close} openLive={openLive} />
          </div>
        ) : null,
      )}
      {last && !busy && replies.length > 0 && (
        <div className="chat-replies chat-item">
          {replies.map((r) => <button key={r.text} type="button" onClick={() => send(r.text)}>{r.text}</button>)}
        </div>
      )}
    </>
  );
}

export default function Chatbot() {
  const { t, lang } = useLang();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"ai" | "live">("ai");
  const live = useLive(open && tab === "live");
  const log = useRef<HTMLDivElement>(null);
  const abort = useRef<AbortController | null>(null);
  const toTop = useRef(false); // set when the chat opens with the contact form, to keep the greeting in view

  useEffect(() => {
    if (toTop.current) {
      toTop.current = false;
      log.current?.scrollTo({ top: 0 });
      return;
    }
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [msgs, open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    addEventListener("keydown", esc);
    return () => removeEventListener("keydown", esc);
  }, [open]);

  // Other parts of the page can open the chat. In "lead" mode the assistant greets with the contact form straight away.
  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      setTab("ai");
      if ((e as CustomEvent<OpenChat>).detail?.mode !== "lead") return;
      const greeting = t({
        en: "Hi! Tell Khang who you are and what you need, and he will get back to you. It takes a minute, and you can ask me anything about his work afterwards.",
        vi: "Xin chào! Cho Khang biết bạn là ai và bạn cần gì, Khang sẽ liên hệ lại với bạn. Chỉ mất một phút, và sau đó bạn có thể hỏi mình bất cứ điều gì về công việc của Khang.",
      });
      const chips = t({
        en: "[[reply:What has Khang built?]][[reply:Which tech does he use?]]",
        vi: "[[reply:Khang đã làm những dự án nào?]][[reply:Khang dùng công nghệ gì?]]",
      });
      abort.current?.abort();
      setBusy(false);
      toTop.current = true;
      setMsgs([{ role: "assistant", content: `${greeting}\n[[lead]]\n[[live]]\n${chips}` }]);
    };
    addEventListener(OPEN_CHAT, onOpen);
    return () => removeEventListener(OPEN_CHAT, onOpen);
  }, [t]);

  const reset = () => {
    abort.current?.abort();
    setMsgs([]);
    setBusy(false);
  };

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    const fail = (msg: string) => setMsgs([...next, { role: "assistant", content: `${msg}\n[[contact]]` }]);

    try {
      abort.current = new AbortController();
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-10) }),
        signal: abort.current.signal,
      });
      if (!res.ok || !res.body) {
        fail(
          res.status === 429
            ? t({ en: "Too many messages, please wait a minute. Meanwhile, here is how to reach Khang:", vi: "Bạn gửi hơi nhanh, vui lòng đợi một phút. Trong lúc đó, đây là cách liên hệ Khang:" })
            : res.status === 503 && (await res.clone().json().catch(() => ({}))).error === "budget"
              ? t({ en: "The assistant has reached today's limit. Please use \"Chat with Khang\" or email instead.", vi: "Trợ lý đã hết lượt hôm nay. Bạn vui lòng dùng \"Nhắn cho Khang\" hoặc email nhé." })
              : res.status === 503
              ? t({ en: "The assistant is not set up yet. You can reach Khang directly:", vi: "Trợ lý chưa được cấu hình. Bạn có thể liên hệ trực tiếp Khang:" })
              : t({ en: "Something went wrong, please try again.", vi: "Có lỗi xảy ra, vui lòng thử lại." }),
        );
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        fail(t({ en: "Connection lost, please try again.", vi: "Mất kết nối, vui lòng thử lại." }));
      }
    } finally {
      setBusy(false);
    }
  };

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className={`chat-fab ${open ? "is-open" : ""}`}
        aria-label={open ? t({ en: "Close chat", vi: "Đóng chat" }) : t({ en: "Ask about Khang", vi: "Hỏi về Khang" })}
        aria-expanded={open}
        onClick={() => { if (!open) track("chat_open"); setOpen((v) => !v); }}
      >
        {open ? <X size={24} /> : <MessageCircle size={24} />}
        {!open && (live.unread > 0 ? <span className="chat-badge">{live.unread}</span> : <span className="chat-ping" aria-hidden="true" />)}
      </button>

      <section data-lenis-prevent className={`chat ${open ? "is-open" : ""}`} aria-label={t({ en: "Chat assistant", vi: "Trợ lý chat" })} aria-hidden={!open}>
        <header className="chat-head">
          <span className="chat-avatar"><Sparkles size={18} aria-hidden="true" /></span>
          <div>
            <strong>{t({ en: "Ask about Khang", vi: "Hỏi về Khang" })}</strong>
            <small><i aria-hidden="true" />{t({ en: "AI assistant · happy to help", vi: "Trợ lý AI · sẵn sàng giải đáp" })}</small>
          </div>
          {tab === "ai" && msgs.length > 0 && (
            <button type="button" className="chat-reset" onClick={reset} aria-label={t({ en: "New conversation", vi: "Cuộc trò chuyện mới" })} tabIndex={open ? 0 : -1}>
              <RotateCcw size={16} />
            </button>
          )}
        </header>

        <div className="chat-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "ai"} onClick={() => setTab("ai")} tabIndex={open ? 0 : -1}>
            <Sparkles size={15} aria-hidden="true" />{t({ en: "AI assistant", vi: "Trợ lý AI" })}
          </button>
          <button type="button" role="tab" aria-selected={tab === "live"} onClick={() => setTab("live")} tabIndex={open ? 0 : -1}>
            <UserRound size={15} aria-hidden="true" />{t({ en: "Chat with Khang", vi: "Nhắn cho Khang" })}
            {live.unread > 0 && <i className="chat-dot" aria-label={`${live.unread} new`} />}
          </button>
        </div>

        {tab === "live" ? (
          <LiveView live={live} />
        ) : (
          <>
        <div className="chat-log" ref={log} aria-live="polite">
          {msgs.length === 0 && (
            <div className="chat-welcome">
              <p className="chat-hello">
                {t({ en: "Hi! Ask me anything about Khang's work. I can show projects, stack, achievements and how to get in touch.", vi: "Xin chào! Hỏi mình bất cứ điều gì về công việc của Khang. Mình có thể cho xem dự án, công nghệ, thành tích và cách liên hệ." })}
              </p>
              <div className="chat-starters">
                {starters.map((s, i) => (
                  <button key={s.en} type="button" style={{ ["--i" as string]: i }} onClick={() => send(s[lang])}>
                    <s.icon size={18} aria-hidden="true" />
                    <span>{s[lang]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) =>
            m.role === "user" ? (
              <p key={i} className="chat-msg user chat-item">{m.content}</p>
            ) : (
              <Assistant key={i} raw={m.content} last={i === msgs.length - 1} busy={busy} close={close} send={send} openLive={() => setTab("live")} />
            ),
          )}
        </div>

        <form className="chat-form" onSubmit={(e) => { e.preventDefault(); send(input); }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={600}
            placeholder={t({ en: "Ask a question…", vi: "Nhập câu hỏi…" })}
            aria-label={t({ en: "Your question", vi: "Câu hỏi của bạn" })}
            tabIndex={open ? 0 : -1}
          />
          <button type="submit" disabled={busy || !input.trim()} aria-label={t({ en: "Send", vi: "Gửi" })} tabIndex={open ? 0 : -1}>
            <Send size={18} />
          </button>
        </form>
          </>
        )}
      </section>
    </>
  );
}
