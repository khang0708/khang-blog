"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { isOptedOut, setOptOut } from "@/lib/track";
import { api, fmtNum } from "./api";

type Item = { name: string; count: number };
type Summary = {
  rows: { date: string; views: number; visitors: number }[];
  total: { views: number; visitors: number };
  today: { views: number; visitors: number };
  online: number;
  onlinePages: Item[];
  pages: Item[]; entries: Item[]; sources: Item[]; referrers: Item[]; devices: Item[]; browsers: Item[]; countries: Item[]; campaigns: Item[]; events: Item[];
};

const eventLabel: Record<string, string> = {
  chat_open: "Mở chatbot",
  contact_ai_open: "Bấm \"Nhờ trợ lý AI\" ở Liên hệ",
  email_click: "Bấm vào email",
  lead_sent: "Gửi biểu mẫu liên hệ",
  live_message: "Nhắn trực tiếp cho Khang",
};
const sourceLabel: Record<string, string> = { Direct: "Trực tiếp", Search: "Công cụ tìm kiếm", Social: "Mạng xã hội", Referral: "Trang giới thiệu" };
const deviceLabel: Record<string, string> = { Mobile: "Điện thoại", Desktop: "Máy tính", Tablet: "Máy tính bảng" };

const country = (code: string) => {
  try { return new Intl.DisplayNames(["vi"], { type: "region" }).of(code) ?? code; } catch { return code; }
};

function List({ title, items, label = (n) => n, empty = "Chưa có dữ liệu" }: { title: string; items: Item[]; label?: (n: string) => string; empty?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <section className="adm-card adm-list">
      <h2>{title}</h2>
      {items.length === 0 ? (
        <p className="adm-muted">{empty}</p>
      ) : (
        <ul>
          {items.map((i) => (
            <li key={i.name} style={{ ["--w" as string]: `${(i.count / max) * 100}%` }}>
              <span title={i.name}>{label(i.name)}</span>
              <b>{fmtNum(i.count)}</b>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function TrafficTab() {
  const [days, setDays] = useState(30);
  const [s, setS] = useState<Summary | null>(null);
  const [out, setOut] = useState(false);

  const load = useCallback(() => api<Summary>(`/api/admin/analytics?days=${days}`).then((r) => r.ok && setS(r.data)), [days]);
  useEffect(() => { load(); const id = setInterval(load, 15000); return () => clearInterval(id); }, [load]);
  useEffect(() => { setOut(isOptedOut()); }, []);

  if (!s) return <p className="adm-muted">Đang tải…</p>;
  const max = Math.max(1, ...s.rows.map((r) => r.views));
  const noData = s.total.views === 0;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Truy cập</h1>
          <p className="adm-muted">Lượt xem thật của website: đã loại bot, loại các lần bạn đăng nhập admin xem trang, không dùng cookie và không lưu địa chỉ IP.</p>
        </div>
        <div className="adm-actions" style={{ marginTop: 0 }}>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Khoảng thời gian">
            <option value={7}>7 ngày</option><option value={30}>30 ngày</option><option value={90}>90 ngày</option>
          </select>
          <button className="adm-btn" onClick={load}><RefreshCw size={16} aria-hidden="true" />Làm mới</button>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-card">
          <small>Đang online (5 phút)</small>
          <strong className="adm-live"><i aria-hidden="true" />{s.online}</strong>
          <small>{s.onlinePages.length ? s.onlinePages.map((p) => `${p.name} ×${p.count}`).join(" · ") : "Chưa có ai"}</small>
        </div>
        <div className="adm-card"><small>Hôm nay</small><strong>{fmtNum(s.today.views)}</strong><small>lượt xem · {fmtNum(s.today.visitors)} khách</small></div>
        <div className="adm-card"><small>{days} ngày qua</small><strong>{fmtNum(s.total.views)}</strong><small>lượt xem</small></div>
        <div className="adm-card"><small>Khách ({days} ngày)</small><strong>{fmtNum(s.total.visitors)}</strong><small>cộng dồn theo ngày</small></div>
      </div>

      {noData && <p className="adm-card adm-muted">Chưa ghi nhận lượt truy cập nào. Mở trang chủ ở một cửa sổ ẩn danh (không đăng nhập admin) rồi bấm "Làm mới".</p>}

      <section className="adm-card">
        <h2>Lượt xem theo ngày</h2>
        <div className="adm-bars" role="img" aria-label="Biểu đồ lượt xem theo ngày">
          {s.rows.map((r) => (
            <div key={r.date} className="adm-bar" title={`${r.date}: ${r.views} lượt xem · ${r.visitors} khách`}>
              <i style={{ height: `${(r.views / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="adm-axis"><span>{s.rows[0]?.date}</span><span>{s.rows[s.rows.length - 1]?.date}</span></div>
      </section>

      <div className="adm-grid2">
        <List title="Trang được xem nhiều" items={s.pages} />
        <List title="Trang khách vào đầu tiên" items={s.entries} />
        <List title="Nguồn truy cập" items={s.sources} label={(n) => sourceLabel[n] ?? n} />
        <List title="Trang giới thiệu" items={s.referrers} empty="Chưa có khách đến từ trang khác" />
        <List title="Thiết bị" items={s.devices} label={(n) => deviceLabel[n] ?? n} />
        <List title="Trình duyệt" items={s.browsers} />
        <List title="Quốc gia" items={s.countries} label={country} empty="Chưa có (cần chạy trên Vercel/Cloudflare để biết quốc gia)" />
        <List title="Chiến dịch (utm_source)" items={s.campaigns} empty="Gắn ?utm_source=ten vào đường dẫn để theo dõi" />
        <List title="Hành động của khách" items={s.events} label={(n) => eventLabel[n] ?? n} />
      </div>

      <section className="adm-card">
        <h2><ShieldCheck size={18} aria-hidden="true" />Quyền riêng tư và loại trừ</h2>
        <p className="adm-muted">Không cookie, không lưu IP: mỗi khách chỉ là một mã băm đổi mỗi ngày, qua hết ngày chỉ còn con số tổng. Trình duyệt bật "Do Not Track" không bị đếm.</p>
        <label className="adm-check">
          <input type="checkbox" checked={out} onChange={(e) => { setOptOut(e.target.checked); setOut(e.target.checked); }} />
          <span>Không đếm lượt xem từ trình duyệt này (dùng khi bạn xem trang ở cửa sổ chưa đăng nhập)</span>
        </label>
      </section>
    </>
  );
}
