"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart3, Bot, FileText, LogOut, Send, Users } from "lucide-react";
import { api, send } from "./api";
import TrafficTab from "./TrafficTab";
import UsageTab from "./UsageTab";
import AiTab from "./AiTab";
import TelegramTab from "./TelegramTab";
import ContactsTab from "./ContactsTab";
import BlogTab from "./BlogTab";

const tabs = [
  { id: "traffic", label: "Truy cập", icon: Activity, view: TrafficTab },
  { id: "usage", label: "Token & chi phí", icon: BarChart3, view: UsageTab },
  { id: "ai", label: "Cấu hình AI", icon: Bot, view: AiTab },
  { id: "telegram", label: "Bot Telegram", icon: Send, view: TelegramTab },
  { id: "contacts", label: "Liên hệ", icon: Users, view: ContactsTab },
  { id: "blog", label: "Blog", icon: FileText, view: BlogTab },
] as const;

export default function AdminApp() {
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("traffic");

  // remember the tab in the URL hash so a refresh stays put
  useEffect(() => {
    const h = location.hash.slice(1);
    if (tabs.some((t) => t.id === h)) setTab(h as typeof tab);
  }, []);
  const pick = (id: typeof tab) => {
    setTab(id);
    history.replaceState(null, "", `#${id}`);
  };

  const logout = async () => {
    await api("/api/admin/logout", send("POST"));
    location.reload();
  };

  const View = tabs.find((t) => t.id === tab)!.view;

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          <span className="adm-logo"><Bot size={18} aria-hidden="true" /></span>
          <strong>Admin</strong>
        </div>
        <nav aria-label="Quản trị">
          {tabs.map((t) => (
            <button key={t.id} type="button" aria-current={tab === t.id ? "page" : undefined} onClick={() => pick(t.id)}>
              <t.icon size={18} aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
        <div className="adm-side-foot">
          <a href="/" className="adm-link">← Về trang chủ</a>
          <button type="button" className="adm-btn" onClick={logout}><LogOut size={16} aria-hidden="true" />Đăng xuất</button>
        </div>
      </aside>

      <main className="adm-main">
        <View />
      </main>
    </div>
  );
}
