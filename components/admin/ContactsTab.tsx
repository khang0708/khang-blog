"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Mail, Phone, Trash2 } from "lucide-react";
import { api, fmtTime, send } from "./api";

type Lead = {
  id: string; name: string; email: string; phone: string; company: string; role: string; note: string;
  alt: string[]; status: "new" | "contacted" | "archived"; count: number; first: number; last: number;
  history: { at: number; note: string }[];
};

const roleLabel: Record<string, string> = { hr: "Tuyển dụng / HR", client: "Khách hàng", other: "Khác" };
const statusLabel = { new: "Mới", contacted: "Đã liên hệ", archived: "Lưu trữ" } as const;

export default function ContactsTab() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Lead["status"]>("all");
  const [open, setOpen] = useState<string | null>(null);

  const load = () => api<{ leads: Lead[] }>("/api/admin/leads").then((r) => r.ok && setLeads(r.data.leads));
  useEffect(() => { load(); }, []);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (leads ?? []).filter(
      (l) =>
        (status === "all" || l.status === status) &&
        (!s || [l.name, l.email, l.phone, l.company, ...l.alt].some((v) => v.toLowerCase().includes(s))),
    );
  }, [leads, q, status]);

  const setStat = async (id: string, st: Lead["status"]) => {
    setLeads((ls) => ls!.map((l) => (l.id === id ? { ...l, status: st } : l)));
    await api(`/api/admin/leads/${id}`, send("PATCH", { status: st }));
  };
  const remove = async (l: Lead) => {
    if (!confirm(`Xoá liên hệ "${l.name}"?`)) return;
    await api(`/api/admin/leads/${l.id}`, send("DELETE"));
    setLeads((ls) => ls!.filter((x) => x.id !== l.id));
  };

  if (!leads) return <p className="adm-muted">Đang tải…</p>;

  const fresh = leads.filter((l) => l.status === "new").length;
  const merged = leads.reduce((n, l) => n + l.count - 1, 0);

  return (
    <>
      <header className="adm-head">
        <div><h1>Liên hệ</h1><p className="adm-muted">Thông tin khách để lại qua chatbot. Cùng email hoặc cùng số điện thoại sẽ được gộp thành một liên hệ.</p></div>
        <a className="adm-btn" href="/api/admin/leads?format=csv"><Download size={16} aria-hidden="true" />Xuất CSV</a>
      </header>

      <div className="adm-stats">
        <div className="adm-card"><small>Tổng liên hệ</small><strong>{leads.length}</strong></div>
        <div className="adm-card"><small>Chưa xử lý</small><strong>{fresh}</strong></div>
        <div className="adm-card"><small>Lần gửi trùng đã gộp</small><strong>{merged}</strong></div>
      </div>

      <div className="adm-filters">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tên, email, số điện thoại, công ty…" aria-label="Tìm liên hệ" />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Lọc trạng thái">
          <option value="all">Tất cả</option>
          {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {shown.length === 0 && <p className="adm-card adm-muted">{leads.length ? "Không có liên hệ nào khớp." : "Chưa có liên hệ nào. Khi khách điền biểu mẫu trong chatbot, họ sẽ xuất hiện ở đây."}</p>}

      <ul className="adm-leads">
        {shown.map((l) => (
          <li key={l.id} className="adm-card adm-lead" data-status={l.status}>
            <div className="adm-lead-top">
              <div>
                <strong>{l.name}</strong>
                <span className="adm-badge">{roleLabel[l.role] ?? l.role}</span>
                {l.count > 1 && <span className="adm-badge adm-warn" title="Cùng email hoặc số điện thoại đã gửi nhiều lần">Gửi {l.count} lần</span>}
              </div>
              <select value={l.status} onChange={(e) => setStat(l.id, e.target.value as Lead["status"])} aria-label={`Trạng thái của ${l.name}`}>
                {Object.entries(statusLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>

            <div className="adm-lead-info">
              <a href={`mailto:${l.email}`}><Mail size={14} aria-hidden="true" />{l.email}</a>
              {l.phone && <a href={`tel:${l.phone}`}><Phone size={14} aria-hidden="true" />{l.phone}</a>}
              {l.company && <span>{l.company}</span>}
            </div>
            {l.alt.length > 0 && <p className="adm-muted">Cũng dùng: {l.alt.join(", ")}</p>}
            {l.note && <p className="adm-note-text">“{l.note}”</p>}

            <div className="adm-lead-foot">
              <small className="adm-muted">Lần đầu {fmtTime(l.first)}{l.count > 1 ? ` · gần nhất ${fmtTime(l.last)}` : ""}</small>
              <div>
                {l.count > 1 && <button className="adm-link" onClick={() => setOpen(open === l.id ? null : l.id)}>{open === l.id ? "Ẩn lịch sử" : "Xem lịch sử"}</button>}
                <button className="adm-icon" onClick={() => remove(l)} aria-label={`Xoá ${l.name}`}><Trash2 size={16} /></button>
              </div>
            </div>

            {open === l.id && (
              <ol className="adm-history">
                {l.history.map((h, i) => <li key={i}><small>{fmtTime(h.at)}</small><span>{h.note || "(không ghi chú)"}</span></li>)}
              </ol>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
