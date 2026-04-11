"use client";

import { useEffect, useMemo, useState } from "react";

const PY_BLUE = "#306998";
const PY_YELLOW = "#FFD43B";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const REGIONS = ["North", "South", "East", "West", "Central"] as const;
const CATEGORIES = ["Electronics", "Apparel", "Home Goods"] as const;

type Region = (typeof REGIONS)[number];
type Category = (typeof CATEGORIES)[number];

// Seeded pseudo-random — same numbers every render
function seed(i: number, j = 0) {
  const x = Math.sin(i * 9319.1 + j * 7331.7) * 10000;
  return x - Math.floor(x);
}

type Row = {
  month: string;
  monthIdx: number;
  region: Region;
  category: Category;
  revenue: number;
  units: number;
  customers: number;
};

const ROWS: Row[] = [];
for (let m = 0; m < 12; m++) {
  for (const r of REGIONS) {
    for (const c of CATEGORIES) {
      const base = {
        North: 1.0,
        South: 0.75,
        East: 0.9,
        West: 1.2,
        Central: 0.6,
      }[r];
      const catBase = { Electronics: 1.4, Apparel: 1.0, "Home Goods": 0.7 }[c];
      const trend = 1 + m * 0.05;
      const noise = 0.6 + seed(m * 10 + REGIONS.indexOf(r) * 3 + CATEGORIES.indexOf(c)) * 0.8;
      const revenue = Math.round(12000 * base * catBase * trend * noise);
      const units = Math.round(revenue / (45 + seed(m + 17) * 20));
      const customers = Math.round(units * (0.4 + seed(m + 29) * 0.3));
      ROWS.push({
        month: MONTHS[m],
        monthIdx: m,
        region: r,
        category: c,
        revenue,
        units,
        customers,
      });
    }
  }
}

export default function PythonDashboard() {
  const [dark, setDark] = useState(false);
  const [region, setRegion] = useState<Region | "All">("All");
  const [category, setCategory] = useState<Category | "All">("All");
  const [startMonth, setStartMonth] = useState(0);
  const [endMonth, setEndMonth] = useState(11);

  useEffect(() => {
    const saved = localStorage.getItem("solaris-theme");
    if (saved === "dark") {
      document.documentElement.classList.add("dark");
      setDark(true);
    }
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("solaris-theme", next ? "dark" : "light");
  };

  const filtered = useMemo(
    () =>
      ROWS.filter(
        (r) =>
          (region === "All" || r.region === region) &&
          (category === "All" || r.category === category) &&
          r.monthIdx >= startMonth &&
          r.monthIdx <= endMonth
      ),
    [region, category, startMonth, endMonth]
  );

  const kpis = useMemo(() => {
    const revenue = filtered.reduce((s, r) => s + r.revenue, 0);
    const units = filtered.reduce((s, r) => s + r.units, 0);
    const customers = filtered.reduce((s, r) => s + r.customers, 0);
    const avgOrder = revenue / Math.max(units, 1);
    return { revenue, units, customers, avgOrder };
  }, [filtered]);

  // Line chart — revenue by month
  const monthlyRevenue = useMemo(() => {
    const map = new Map<number, number>();
    filtered.forEach((r) => map.set(r.monthIdx, (map.get(r.monthIdx) ?? 0) + r.revenue));
    return Array.from(map.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([m, v]) => ({ month: MONTHS[m], value: v }));
  }, [filtered]);

  // Bar chart — revenue by region
  const regionRevenue = useMemo(() => {
    const map = new Map<Region, number>();
    filtered.forEach((r) => map.set(r.region, (map.get(r.region) ?? 0) + r.revenue));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [filtered]);

  // Scatter — units vs customers
  const scatter = useMemo(() => filtered.slice(0, 60).map((r) => ({ x: r.units, y: r.customers, cat: r.category })), [filtered]);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar filters */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <div className="mb-6 flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg"
            style={{ background: `linear-gradient(135deg, ${PY_BLUE}, ${PY_YELLOW})`, boxShadow: `0 8px 24px ${PY_BLUE}33` }}
          >
            🐍
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold">Solaris Insights</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Analytics dashboard
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <FilterGroup label="Date range">
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Start</span>
                  <span className="font-semibold">{MONTHS[startMonth]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={11}
                  value={startMonth}
                  onChange={(e) => setStartMonth(Math.min(Number(e.target.value), endMonth))}
                  className="w-full"
                  style={{ accentColor: PY_BLUE }}
                />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-500">End</span>
                  <span className="font-semibold">{MONTHS[endMonth]}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={11}
                  value={endMonth}
                  onChange={(e) => setEndMonth(Math.max(Number(e.target.value), startMonth))}
                  className="w-full"
                  style={{ accentColor: PY_BLUE }}
                />
              </div>
            </div>
          </FilterGroup>

          <FilterGroup label="Region">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as Region | "All")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#306998] dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="All">All regions</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category | "All")}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-[#306998] dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="All">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FilterGroup>

          <div
            className="rounded-xl p-4 text-xs"
            style={{ background: `${PY_YELLOW}22`, border: `1px solid ${PY_YELLOW}44` }}
          >
            <div className="font-semibold text-slate-900 dark:text-white">⚡ Live data</div>
            <div className="mt-1 text-slate-600 dark:text-slate-400">
              Dash app connects to FastAPI → BigQuery.<br />
              Refresh interval: 5 minutes.
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-base font-bold text-white"
              style={{ background: PY_BLUE }}
            >
              🐍
            </span>
            <div className="text-sm font-semibold">Solaris Insights</div>
          </div>
          <div className="hidden text-sm font-semibold lg:block">Sales Analytics · FY 2026</div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:inline-flex dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: PY_YELLOW }}
              />
              Python 3.12 · FastAPI · Dash
            </span>
            <button
              type="button"
              onClick={toggleDark}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              aria-label="Toggle dark mode"
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {/* KPI cards */}
          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Revenue" value={`$${(kpis.revenue / 1000).toFixed(1)}K`} delta="+18.4%" tint={PY_BLUE} />
            <KpiCard label="Units Sold" value={kpis.units.toLocaleString()} delta="+12.1%" tint={PY_YELLOW} />
            <KpiCard label="Customers" value={kpis.customers.toLocaleString()} delta="+8.6%" tint={PY_BLUE} />
            <KpiCard label="Avg Order" value={`$${kpis.avgOrder.toFixed(0)}`} delta="+4.2%" tint={PY_YELLOW} />
          </section>

          {/* Charts row */}
          <section className="mt-6 grid gap-4 lg:grid-cols-[1fr_360px]">
            {/* Line chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Revenue trend
                  </div>
                  <div className="mt-1 text-lg font-semibold">Monthly revenue</div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {monthlyRevenue.length} months
                </span>
              </div>
              <LineChart data={monthlyRevenue} color={PY_BLUE} />
            </div>

            {/* Bar chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  By region
                </div>
                <div className="mt-1 text-lg font-semibold">Revenue breakdown</div>
              </div>
              <BarChart data={regionRevenue} color={PY_BLUE} highlight={PY_YELLOW} />
            </div>
          </section>

          {/* Scatter + table row */}
          <section className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Correlation
                </div>
                <div className="mt-1 text-lg font-semibold">Units vs customers</div>
              </div>
              <ScatterChart data={scatter} />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  DataFrame preview
                </div>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  df.head(10)
                </span>
              </div>
              <div className="max-h-[280px] overflow-y-auto">
                <table className="w-full border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950">
                    <tr>
                      <Th>month</Th>
                      <Th>region</Th>
                      <Th>category</Th>
                      <Th right>revenue</Th>
                      <Th right>units</Th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {filtered.slice(0, 20).map((r, i) => (
                      <tr
                        key={i}
                        className="border-t border-slate-100 dark:border-slate-800"
                      >
                        <td className="px-4 py-1.5 text-slate-600 dark:text-slate-400">
                          {r.month}
                        </td>
                        <td className="px-4 py-1.5">{r.region}</td>
                        <td className="px-4 py-1.5">{r.category}</td>
                        <td className="px-4 py-1.5 text-right font-semibold">
                          ${r.revenue.toLocaleString()}
                        </td>
                        <td className="px-4 py-1.5 text-right text-slate-600 dark:text-slate-400">
                          {r.units}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="mt-8 text-center text-xs text-slate-400">
            Built with Python + FastAPI + Plotly Dash · © {new Date().getFullYear()} Solaris Insights
          </footer>
        </main>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  tint,
}: {
  label: string;
  value: string;
  delta: string;
  tint: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div
        className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15"
        style={{ background: tint }}
      />
      <div className="relative">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </div>
        <div className="mt-2 text-2xl font-bold">{value}</div>
        <div className="mt-1 text-xs font-semibold text-emerald-600">{delta} vs prior</div>
      </div>
    </div>
  );
}

function LineChart({ data, color }: { data: { month: string; value: number }[]; color: string }) {
  if (data.length === 0) return <div className="h-64" />;
  const w = 600;
  const h = 240;
  const max = Math.max(...data.map((d) => d.value));
  const points = data.map((d, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * (w - 40) + 30;
    const y = h - 20 - (d.value / max) * (h - 60);
    return { x, y, v: d.value, m: d.month };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = `${path} L${points[points.length - 1].x},${h - 20} L${points[0].x},${h - 20} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full">
      <defs>
        <linearGradient id="linefill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={30}
          x2={w - 10}
          y1={20 + ((h - 60) / 3) * i}
          y2={20 + ((h - 60) / 3) * i}
          stroke="#e2e8f0"
          strokeDasharray="3,4"
        />
      ))}
      <path d={area} fill="url(#linefill)" />
      <path d={path} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2" />
      ))}
      {points.map((p, i) =>
        i % 2 === 0 ? (
          <text
            key={i}
            x={p.x}
            y={h - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#94a3b8"
          >
            {p.m}
          </text>
        ) : null
      )}
    </svg>
  );
}

function BarChart({
  data,
  color,
  highlight,
}: {
  data: [string, number][];
  color: string;
  highlight: string;
}) {
  const max = Math.max(...data.map((d) => d[1]), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map(([name, val], i) => (
        <div key={name}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-medium">{name}</span>
            <span className="font-mono text-slate-500 dark:text-slate-400">
              ${val.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(val / max) * 100}%`,
                background: i === 0 ? highlight : color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ScatterChart({ data }: { data: { x: number; y: number; cat: string }[] }) {
  const w = 500;
  const h = 240;
  const maxX = Math.max(...data.map((d) => d.x), 1);
  const maxY = Math.max(...data.map((d) => d.y), 1);
  const colors: Record<string, string> = {
    Electronics: "#306998",
    Apparel: "#FFD43B",
    "Home Goods": "#4B8BBE",
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full">
      {[0, 1, 2, 3].map((i) => (
        <line
          key={i}
          x1={30}
          x2={w - 10}
          y1={20 + ((h - 60) / 3) * i}
          y2={20 + ((h - 60) / 3) * i}
          stroke="#e2e8f0"
          strokeDasharray="3,4"
        />
      ))}
      {data.map((d, i) => (
        <circle
          key={i}
          cx={30 + (d.x / maxX) * (w - 50)}
          cy={h - 30 - (d.y / maxY) * (h - 60)}
          r="5"
          fill={colors[d.cat] ?? "#306998"}
          opacity="0.7"
        />
      ))}
      <text x={w / 2} y={h - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
        Units sold →
      </text>
    </svg>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 ${
        right ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}
