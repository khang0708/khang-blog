"use client";

import { useEffect, useState } from "react";
import { api, fmtNum } from "./api";

type Row = { date: string; in: number; out: number; n: number; cost: number };
type Totals = { in: number; out: number; n: number; cost: number };
type Usage = { rows: Row[]; byModel: Record<string, Totals>; total: Totals; today: number; limit: number };

const usd = (n: number) => `$${n.toFixed(n < 1 ? 4 : 2)}`;

export default function UsageTab() {
  const [days, setDays] = useState(30);
  const [u, setU] = useState<Usage | null>(null);

  useEffect(() => {
    api<Usage>(`/api/admin/usage?days=${days}`).then((r) => r.ok && setU(r.data));
  }, [days]);

  if (!u) return <p className="adm-muted">Đang tải…</p>;

  const max = Math.max(1, ...u.rows.map((r) => r.in + r.out));
  const pct = u.limit > 0 ? Math.min(100, (u.today / u.limit) * 100) : 0;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Token & chi phí</h1>
          <p className="adm-muted">Mức dùng của chatbot AI. Chi phí là ước tính theo giá công khai, không thay cho hoá đơn của Anthropic.</p>
        </div>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Khoảng thời gian">
          <option value={7}>7 ngày</option>
          <option value={30}>30 ngày</option>
          <option value={90}>90 ngày</option>
        </select>
      </header>

      <div className="adm-stats">
        <div className="adm-card"><small>Token hôm nay</small><strong>{fmtNum(u.today)}</strong>
          {u.limit > 0 && (
            <>
              <div className="adm-meter" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${pct}%` }} data-hot={pct >= 90} /></div>
              <small>{Math.round(pct)}% của giới hạn {fmtNum(u.limit)}</small>
            </>
          )}
          {u.limit === 0 && <small>Chưa đặt giới hạn ngày</small>}
        </div>
        <div className="adm-card"><small>Tổng token ({days} ngày)</small><strong>{fmtNum(u.total.in + u.total.out)}</strong><small>vào {fmtNum(u.total.in)} · ra {fmtNum(u.total.out)}</small></div>
        <div className="adm-card"><small>Lượt hỏi</small><strong>{fmtNum(u.total.n)}</strong><small>{u.total.n ? `~${fmtNum(Math.round((u.total.in + u.total.out) / u.total.n))} token/lượt` : "Chưa có dữ liệu"}</small></div>
        <div className="adm-card"><small>Chi phí ước tính</small><strong>{usd(u.total.cost)}</strong><small>{u.total.n ? `~${usd(u.total.cost / u.total.n)}/lượt` : ""}</small></div>
      </div>

      <section className="adm-card">
        <h2>Theo ngày</h2>
        <div className="adm-bars" role="img" aria-label="Biểu đồ token theo ngày">
          {u.rows.map((r) => (
            <div key={r.date} className="adm-bar" title={`${r.date}: ${fmtNum(r.in + r.out)} token · ${r.n} lượt · ${usd(r.cost)}`}>
              <i style={{ height: `${((r.in + r.out) / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="adm-axis"><span>{u.rows[0]?.date}</span><span>{u.rows[u.rows.length - 1]?.date}</span></div>
      </section>

      <section className="adm-card">
        <h2>Theo model</h2>
        {Object.keys(u.byModel).length === 0 ? (
          <p className="adm-muted">Chưa có lượt hỏi nào được ghi nhận.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Model</th><th>Lượt</th><th>Token vào</th><th>Token ra</th><th>Chi phí</th></tr></thead>
              <tbody>
                {Object.entries(u.byModel).map(([m, t]) => (
                  <tr key={m}><td>{m}</td><td>{fmtNum(t.n)}</td><td>{fmtNum(t.in)}</td><td>{fmtNum(t.out)}</td><td>{usd(t.cost)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
