import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Home, List, CreditCard, TrendingUp, Bell, ChevronRight,
  Plus, AlertTriangle, CheckCircle, Info, ArrowUpRight,
  ArrowDownRight, DollarSign, Activity, Target, Settings,
  Search, Filter, Download, Shield, Layers
} from "lucide-react";

/* ─── Design Tokens ─────────────────────────────────────────── */
const C = {
  bg:        "#07091c",
  bgCard:    "rgba(255,255,255,0.04)",
  bgGlass:   "rgba(255,255,255,0.07)",
  border:    "rgba(255,255,255,0.08)",
  sidebar:   "#030610",
  gold:      "#c9973a",
  goldBt:    "#f0c060",
  teal:      "#00cba9",
  red:       "#ff6b6b",
  blue:      "#4d94ff",
  purple:    "#9b6dff",
  amber:     "#f59e0b",
  text:      "#eef2ff",
  textMid:   "rgba(238,242,255,0.65)",
  textDim:   "rgba(238,242,255,0.35)",
};

/* ─── Data ──────────────────────────────────────────────────── */
const monthlyData = [
  { m: "Aug", inc: 85000,  exp: 42000 },
  { m: "Sep", inc: 85000,  exp: 38000 },
  { m: "Oct", inc: 92000,  exp: 51000 },
  { m: "Nov", inc: 88000,  exp: 46000 },
  { m: "Dec", inc: 105000, exp: 62000 },
  { m: "Jan", inc: 85000,  exp: 41000 },
  { m: "Feb", inc: 85000,  exp: 39000 },
  { m: "Mar", inc: 87000,  exp: 44000 },
];

const catData = [
  { name: "Entertainment", val: 28, color: C.purple },
  { name: "Utilities",     val: 22, color: C.teal   },
  { name: "SaaS Tools",    val: 19, color: C.gold   },
  { name: "Food",          val: 16, color: C.red    },
  { name: "Transport",     val: 15, color: C.blue   },
];

const weekData = [
  { d: "Mon", amt: 8900 }, { d: "Tue", amt: 23400 },
  { d: "Wed", amt: 11200 }, { d: "Thu", amt: 34900 },
  { d: "Fri", amt: 21000 }, { d: "Sat", amt: 42000 },
  { d: "Sun", amt: 18000 },
];

const subs = [
  { name: "Netflix",   cat: "Streaming",    amt: 649,  color: "#e50914", renewal: "15 Mar", use: 85, icon: "N"  },
  { name: "Spotify",   cat: "Music",        amt: 119,  color: "#1db954", renewal: "22 Mar", use: 92, icon: "S"  },
  { name: "AWS",       cat: "Cloud",        amt: 2840, color: "#ff9900", renewal: "01 Apr", use: 67, icon: "A"  },
  { name: "Figma",     cat: "Design",       amt: 1200, color: "#a259ff", renewal: "10 Apr", use: 78, icon: "F"  },
  { name: "GitHub",    cat: "Dev Tools",    amt: 750,  color: C.blue,    renewal: "05 Apr", use: 95, icon: "G"  },
  { name: "Notion",    cat: "Productivity", amt: 320,  color: C.teal,    renewal: "02 Apr", use: 45, icon: "N", trial: true },
];

const txns = [
  { name: "Amazon Shopping",     cat: "Shopping",    amt: 2499,  date: "Today",     emoji: "🛒", credit: false },
  { name: "Salary Credit",       cat: "Income",      amt: 85000, date: "Yesterday",  emoji: "💰", credit: true  },
  { name: "Netflix Subscription",cat: "Entertainment",amt: 649,  date: "17 Mar",    emoji: "🎬", credit: false },
  { name: "Swiggy Order",        cat: "Food",        amt: 485,   date: "16 Mar",    emoji: "🍜", credit: false },
  { name: "Freelance Payment",   cat: "Income",      amt: 15000, date: "15 Mar",    emoji: "💼", credit: true  },
  { name: "Electricity Bill",    cat: "Utilities",   amt: 1240,  date: "14 Mar",    emoji: "⚡", credit: false },
  { name: "Paytm Recharge",      cat: "Mobile",      amt: 199,   date: "13 Mar",    emoji: "📱", credit: false },
  { name: "Gym Membership",      cat: "Health",      amt: 1500,  date: "12 Mar",    emoji: "🏋️", credit: false },
];

const budgets = [
  { cat: "Entertainment", budgeted: 3000,  spent: 2700, color: C.purple },
  { cat: "Food & Dining", budgeted: 8000,  spent: 5200, color: C.red    },
  { cat: "Utilities",     budgeted: 5000,  spent: 4100, color: C.teal   },
  { cat: "SaaS & Tools",  budgeted: 6000,  spent: 5129, color: C.gold   },
  { cat: "Transport",     budgeted: 3000,  spent: 1800, color: C.blue   },
  { cat: "Shopping",      budgeted: 10000, spent: 7400, color: "#ff9900"},
];

const alertsData = [
  { type: "warning", title: "Budget Alert",       msg: "Entertainment budget 90% consumed this month",    time: "2h ago" },
  { type: "info",    title: "Renewal Reminder",   msg: "Netflix renews in 3 days — ₹649 will be charged", time: "5h ago" },
  { type: "success", title: "Goal Achieved",      msg: "You hit 75% of your monthly savings target!",     time: "1d ago" },
  { type: "warning", title: "Unusual Spending",   msg: "Shopping spend is 2× higher than your average",   time: "2d ago" },
  { type: "info",    title: "Trial Expiring",     msg: "Notion free trial expires in 14 days",             time: "3d ago" },
];

/* ─── Helpers ───────────────────────────────────────────────── */
const fmt    = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const pctBar = (spent, budgeted) => Math.min(Math.round((spent / budgeted) * 100), 100);

/* ─── Shared UI ─────────────────────────────────────────────── */
const Card = ({ children, style = {} }) => (
  <div style={{
    background: C.bgCard,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: "20px 24px",
    ...style,
  }}>
    {children}
  </div>
);

const StatCard = ({ label, value, sub, up, Icon, iconColor }) => (
  <Card style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <p style={{ color: C.textDim, fontSize: 11, letterSpacing: "0.09em", textTransform: "uppercase", fontWeight: 500 }}>
        {label}
      </p>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${iconColor}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={16} color={iconColor} />
      </div>
    </div>
    <p style={{ color: C.text, fontSize: 28, fontWeight: 600, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>
      {value}
    </p>
    {sub && (
      <p style={{ color: up ? C.teal : C.red, fontSize: 12, display: "flex", alignItems: "center", gap: 3 }}>
        {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {sub}
      </p>
    )}
  </Card>
);

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0e1535", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }}>
      <p style={{ color: C.textDim, fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 500 }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

/* ─── Dashboard ─────────────────────────────────────────────── */
const Dashboard = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      <StatCard label="Total Expenses"         value="₹44,041" sub="8.5% vs last month"  up={false} Icon={DollarSign}   iconColor={C.red}    />
      <StatCard label="Active Subscriptions"   value="6"        sub="₹5,878 / month"      up={false} Icon={CreditCard}   iconColor={C.gold}   />
      <StatCard label="Budget Remaining"       value="₹38,871" sub="56% of budget left"  up={true}  Icon={Target}        iconColor={C.blue}   />
      <StatCard label="Monthly Savings"        value="₹43,000" sub="12.3% increase"      up={true}  Icon={TrendingUp}    iconColor={C.teal}   />
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>Income vs Expenses</h3>
            <p style={{ color: C.textDim, fontSize: 12, marginTop: 3 }}>8-month financial overview</p>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
            {[{c:C.teal,l:"Income"},{c:C.red,l:"Expenses"}].map(({c,l})=>(
              <span key={l} style={{ color: c, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.teal} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.teal} stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.red}  stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.red}  stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="m"   tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis              tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="inc" name="Income"   stroke={C.teal} strokeWidth={2} fill="url(#gInc)" />
              <Area type="monotone" dataKey="exp" name="Expenses" stroke={C.red}  strokeWidth={2} fill="url(#gExp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>By Category</h3>
        <p style={{ color: C.textDim, fontSize: 12, marginBottom: 14 }}>March 2026 breakdown</p>
        <div style={{ height: 160, marginBottom: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={catData} dataKey="val" cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={4}>
                {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {catData.map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, color: C.textMid, fontSize: 12 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c.color, display: "inline-block" }} />
              {c.name}
            </span>
            <span style={{ color: C.text, fontSize: 12, fontWeight: 500 }}>{c.val}%</span>
          </div>
        ))}
      </Card>
    </div>

    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>Recent Transactions</h3>
        <button style={{ color: C.gold, fontSize: 12, background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          View all <ChevronRight size={13} />
        </button>
      </div>
      {txns.slice(0, 5).map((t, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 11, background: C.bgGlass, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19 }}>
              {t.emoji}
            </div>
            <div>
              <p style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{t.name}</p>
              <p style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{t.cat} · {t.date}</p>
            </div>
          </div>
          <p style={{ color: t.credit ? C.teal : C.red, fontSize: 14, fontWeight: 600 }}>
            {t.credit ? "+" : "−"}{fmt(t.amt)}
          </p>
        </div>
      ))}
    </Card>
  </div>
);

/* ─── Expenses ──────────────────────────────────────────────── */
const Expenses = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "flex", gap: 12 }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px" }}>
        <Search size={15} color={C.textDim} />
        <span style={{ color: C.textDim, fontSize: 14 }}>Search transactions…</span>
      </div>
      <button style={{ display: "flex", alignItems: "center", gap: 7, background: C.bgCard, border: `1px solid ${C.border}`, color: C.textMid, borderRadius: 10, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>
        <Filter size={14} /> Filter
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 7, background: `${C.gold}18`, border: `1px solid ${C.gold}45`, color: C.gold, borderRadius: 10, padding: "10px 16px", fontSize: 13, cursor: "pointer" }}>
        <Download size={14} /> Export
      </button>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
      {[
        { label: "Total Debits",  val: "₹12,072", c: C.red  },
        { label: "Total Credits", val: "₹1,00,000", c: C.teal},
        { label: "Net Balance",   val: "+₹87,928", c: C.text },
      ].map(({label,val,c},i) => (
        <Card key={i}>
          <p style={{ color: C.textDim, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 8 }}>{label}</p>
          <p style={{ color: c, fontSize: 24, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{val}</p>
        </Card>
      ))}
    </div>

    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>All Transactions — March 2026</h3>
        <span style={{ color: C.textDim, fontSize: 12 }}>{txns.length} records</span>
      </div>
      {txns.map((t, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < txns.length - 1 ? `1px solid ${C.border}` : "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.bgGlass, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {t.emoji}
            </div>
            <div>
              <p style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{t.name}</p>
              <p style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{t.cat} · {t.date}</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: t.credit ? C.teal : C.red, fontSize: 15, fontWeight: 600 }}>{t.credit ? "+" : "−"}{fmt(t.amt)}</p>
            <p style={{ color: t.credit ? `${C.teal}80` : `${C.red}80`, fontSize: 11, marginTop: 2 }}>{t.credit ? "Credit" : "Debit"}</p>
          </div>
        </div>
      ))}
    </Card>
  </div>
);

/* ─── Subscriptions ─────────────────────────────────────────── */
const Subscriptions = () => {
  const total = subs.reduce((a, s) => a + s.amt, 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[
          { label: "Monthly Total",    val: fmt(total),                             c: C.gold },
          { label: "Annual Projection",val: fmt(total * 12),                        c: C.text },
          { label: "Active Services",  val: subs.filter(s=>!s.trial).length,        c: C.teal },
          { label: "On Trial",         val: subs.filter(s=>s.trial).length,         c: C.amber},
        ].map(({label,val,c},i) => (
          <Card key={i}>
            <p style={{ color: C.textDim, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>{label}</p>
            <p style={{ color: c, fontSize: 26, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{val}</p>
          </Card>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {subs.map((s, i) => {
          const barC = s.use > 80 ? C.teal : s.use > 50 ? C.gold : C.red;
          return (
            <Card key={i} style={{ position: "relative", overflow: "hidden" }}>
              {s.trial && (
                <div style={{ position: "absolute", top: 12, right: 12, background: `${C.amber}22`, color: C.amber, fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 600, letterSpacing: "0.06em" }}>
                  TRIAL
                </div>
              )}
              {/* Subtle color wash */}
              <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `${s.color}08`, borderRadius: "0 16px 0 80px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: `${s.color}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: s.color, fontFamily: "'Playfair Display', serif" }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>{s.name}</p>
                  <p style={{ color: C.textDim, fontSize: 12, marginTop: 2 }}>{s.cat}</p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ color: C.textDim, fontSize: 12 }}>Monthly charge</span>
                <span style={{ color: C.text, fontSize: 18, fontWeight: 600 }}>₹{s.amt}</span>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ color: C.textDim, fontSize: 11 }}>Usage</span>
                  <span style={{ color: C.textMid, fontSize: 11 }}>{s.use}%</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${s.use}%`, background: barC, borderRadius: 3 }} />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: C.textDim, fontSize: 11 }}>Renews {s.renewal}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.trial ? C.amber : C.teal }} />
                  <span style={{ color: s.trial ? C.amber : C.teal, fontSize: 11 }}>{s.trial ? "Trial" : "Active"}</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Budget ────────────────────────────────────────────────── */
const Budget = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <div>
            <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>Budget Tracker — March 2026</h3>
            <p style={{ color: C.textDim, fontSize: 12, marginTop: 3 }}>12 days remaining this month</p>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.gold}16`, border: `1px solid ${C.gold}40`, color: C.gold, borderRadius: 9, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
            <Plus size={13} /> Add Category
          </button>
        </div>
        {budgets.map((b, i) => {
          const pct = pctBar(b.spent, b.budgeted);
          const over = pct > 90;
          const barC = over ? C.red : pct > 70 ? C.amber : b.color;
          return (
            <div key={i} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: b.color }} />
                  <span style={{ color: C.text, fontSize: 13 }}>{b.cat}</span>
                  {over && <span style={{ background: `${C.red}22`, color: C.red, fontSize: 10, padding: "1px 7px", borderRadius: 20 }}>Alert</span>}
                </div>
                <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
                  <span style={{ color: over ? C.red : C.textMid }}>{fmt(b.spent)}</span>
                  <span style={{ color: C.textDim }}>/ {fmt(b.budgeted)}</span>
                  <span style={{ color: barC, fontWeight: 600, minWidth: 34, textAlign: "right" }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: 7, background: "rgba(255,255,255,0.06)", borderRadius: 4 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: barC, borderRadius: 4, transition: "width 0.4s" }} />
              </div>
            </div>
          );
        })}
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {[
          { label: "Total Budgeted", val: "₹35,000", c: C.text, sub: "For March 2026" },
          { label: "Total Spent",    val: "₹26,300", c: C.red,  sub: "75.1% utilised" },
          { label: "Remaining",      val: "₹8,700",  c: C.teal, sub: "₹725/day avg" },
        ].map(({ label, val, c, sub }, i) => (
          <Card key={i}>
            <p style={{ color: C.textDim, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>{label}</p>
            <p style={{ color: c, fontSize: 26, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{val}</p>
            <p style={{ color: C.textDim, fontSize: 12, marginTop: 6 }}>{sub}</p>
          </Card>
        ))}
      </div>
    </div>

    <Card>
      <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Budget Health Score</h3>
      <p style={{ color: C.textDim, fontSize: 12, marginBottom: 18 }}>Based on your current spending pattern</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { label: "On Track",   count: 3, color: C.teal,  icon: "✓" },
          { label: "Caution",    count: 2, color: C.amber,  icon: "!" },
          { label: "Over Budget",count: 1, color: C.red,   icon: "✕" },
          { label: "Score",      count: "72/100", color: C.gold, icon: "★" },
        ].map(({ label, count, color, icon }, i) => (
          <div key={i} style={{ background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: 22, marginBottom: 6 }}>{icon}</p>
            <p style={{ color, fontSize: 20, fontWeight: 600, fontFamily: "'Playfair Display', serif", marginBottom: 4 }}>{count}</p>
            <p style={{ color: C.textDim, fontSize: 11 }}>{label}</p>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

/* ─── Analytics ─────────────────────────────────────────────── */
const Analytics = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      {[
        { label: "Avg Daily Spend",    val: "₹1,468", sub: "+5.2% vs last month", up: false },
        { label: "Savings Rate",        val: "49.3%",  sub: "+2.1% improvement",   up: true  },
        { label: "Largest Expense",     val: "₹8,500", sub: "Rent category",        up: null  },
        { label: "Subscriptions %",     val: "13.3%",  sub: "of total expenses",    up: null  },
      ].map(({ label, val, sub, up }, i) => (
        <Card key={i}>
          <p style={{ color: C.textDim, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>{label}</p>
          <p style={{ color: C.text, fontSize: 24, fontWeight: 600, fontFamily: "'Playfair Display', serif", marginBottom: 6 }}>{val}</p>
          <p style={{ color: up === true ? C.teal : up === false ? C.red : C.textDim, fontSize: 12, display: "flex", alignItems: "center", gap: 3 }}>
            {up === true && <ArrowUpRight size={12}/>}
            {up === false && <ArrowDownRight size={12}/>}
            {sub}
          </p>
        </Card>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <Card>
        <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Weekly Spending</h3>
        <p style={{ color: C.textDim, fontSize: 12, marginBottom: 18 }}>This week daily breakdown</p>
        <div style={{ height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData} barSize={26}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="d"   tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis              tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="amt" name="Spending" fill={C.gold} radius={[5, 5, 0, 0]} fillOpacity={0.85} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Category Split</h3>
        <p style={{ color: C.textDim, fontSize: 12, marginBottom: 18 }}>March 2026 distribution</p>
        <div style={{ height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={catData} dataKey="val" cx="50%" cy="50%" outerRadius={85} paddingAngle={4}
                label={({ name, val }) => `${val}%`} labelLine={{ stroke: C.textDim, strokeWidth: 0.5 }}>
                {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [`${v}%`, n]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>

    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>8-Month Financial Trend</h3>
          <p style={{ color: C.textDim, fontSize: 12, marginTop: 3 }}>Income vs expenses — August 2025 to March 2026</p>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 12 }}>
          {[{c:C.teal,l:"Income"},{c:C.red,l:"Expenses"}].map(({c,l})=>(
            <span key={l} style={{ color: c, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />{l}
            </span>
          ))}
        </div>
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.teal} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.teal} stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={C.red}  stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.red}  stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="m"   tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis              tick={{ fill: C.textDim, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
            <Tooltip content={<Tip />} />
            <Area type="monotone" dataKey="inc" name="Income"   stroke={C.teal} strokeWidth={2} fill="url(#ag1)" />
            <Area type="monotone" dataKey="exp" name="Expenses" stroke={C.red}  strokeWidth={2} fill="url(#ag2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  </div>
);

/* ─── Alerts ────────────────────────────────────────────────── */
const Alerts = () => {
  const iconMap  = { warning: AlertTriangle, success: CheckCircle, info: Info };
  const colorMap = { warning: C.amber, success: C.teal, info: C.blue };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[
          { label: "Total Alerts", val: alertsData.length,                                    c: C.text  },
          { label: "Warnings",     val: alertsData.filter(a=>a.type==="warning").length,      c: C.amber },
          { label: "Info Notices", val: alertsData.filter(a=>a.type==="info").length,         c: C.blue  },
          { label: "Successes",    val: alertsData.filter(a=>a.type==="success").length,      c: C.teal  },
        ].map(({ label, val, c }, i) => (
          <Card key={i}>
            <p style={{ color: C.textDim, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10 }}>{label}</p>
            <p style={{ color: c, fontSize: 28, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{val}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600 }}>Smart Alerts & Notifications</h3>
          <button style={{ display: "flex", alignItems: "center", gap: 6, background: `${C.gold}16`, border: `1px solid ${C.gold}40`, color: C.gold, borderRadius: 9, padding: "7px 14px", fontSize: 12, cursor: "pointer" }}>
            <Shield size={13} /> Configure
          </button>
        </div>
        {alertsData.map((a, i) => {
          const Icon  = iconMap[a.type];
          const color = colorMap[a.type];
          return (
            <div key={i} style={{ display: "flex", gap: 16, padding: "18px 0", borderBottom: i < alertsData.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <p style={{ color: C.text, fontSize: 14, fontWeight: 500 }}>{a.title}</p>
                  <p style={{ color: C.textDim, fontSize: 11 }}>{a.time}</p>
                </div>
                <p style={{ color: C.textMid, fontSize: 13, lineHeight: 1.5 }}>{a.msg}</p>
              </div>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, marginTop: 6, flexShrink: 0 }} />
            </div>
          );
        })}
      </Card>

      <Card>
        <h3 style={{ color: C.text, fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Alert Preferences</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Budget threshold alerts",   on: true  },
            { label: "Subscription renewals",     on: true  },
            { label: "Unusual spending patterns", on: true  },
            { label: "Weekly summary report",     on: false },
            { label: "Savings milestone alerts",  on: true  },
            { label: "Low balance warnings",      on: false },
          ].map(({ label, on }, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", background: C.bgGlass, borderRadius: 10, border: `1px solid ${C.border}` }}>
              <span style={{ color: C.textMid, fontSize: 13 }}>{label}</span>
              <div style={{ width: 36, height: 20, borderRadius: 10, background: on ? C.teal : "rgba(255,255,255,0.12)", position: "relative", cursor: "pointer" }}>
                <div style={{ position: "absolute", top: 3, left: on ? 18 : 3, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ─── Root App ──────────────────────────────────────────────── */
export default function FinTrack() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const nav = [
    { id: "dashboard",     label: "Dashboard",     Icon: Home       },
    { id: "expenses",      label: "Expenses",       Icon: List       },
    { id: "subscriptions", label: "Subscriptions",  Icon: CreditCard },
    { id: "budget",        label: "Budget",         Icon: Target     },
    { id: "analytics",     label: "Analytics",      Icon: TrendingUp },
    { id: "alerts",        label: "Alerts",         Icon: Bell       },
  ];

  const sections = {
    dashboard:     <Dashboard />,
    expenses:      <Expenses />,
    subscriptions: <Subscriptions />,
    budget:        <Budget />,
    analytics:     <Analytics />,
    alerts:        <Alerts />,
  };

  const meta = {
    dashboard:     { title: "Dashboard Overview",       sub: "Welcome back — your finances at a glance" },
    expenses:      { title: "Expense Tracker",           sub: "All your transactions in one place"       },
    subscriptions: { title: "Subscription Manager",      sub: "Track every recurring payment"            },
    budget:        { title: "Budget Planner",            sub: "Plan and control your monthly spend"      },
    analytics:     { title: "Analytics & Insights",      sub: "Deep dive into your financial patterns"   },
    alerts:        { title: "Smart Alerts",              sub: "Stay ahead of important financial events" },
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {/* ── Sidebar ── */}
      <aside style={{ width: 248, background: C.sidebar, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>

        {/* Logo */}
        <div style={{ padding: "28px 22px 22px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: `linear-gradient(135deg, ${C.gold}, ${C.goldBt})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Activity size={19} color="#fff" />
            </div>
            <div>
              <p style={{ color: C.text, fontSize: 17, fontWeight: 600, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>FinTrack</p>
              <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.07em" }}>PRO EDITION</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto" }}>
          <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px 10px", fontWeight: 500 }}>Main Menu</p>
          {nav.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => setActiveTab(id)} style={{
                display: "flex", alignItems: "center", gap: 11, width: "100%",
                padding: "11px 14px", borderRadius: 10, marginBottom: 3,
                background: active ? `${C.gold}16` : "transparent",
                border: `1px solid ${active ? `${C.gold}35` : "transparent"}`,
                color: active ? C.gold : C.textMid,
                fontSize: 14, fontWeight: active ? 500 : 400,
                cursor: "pointer", textAlign: "left", transition: "all 0.15s",
              }}>
                <Icon size={17} />
                {label}
                {active && <ChevronRight size={13} style={{ marginLeft: "auto" }} />}
              </button>
            );
          })}

          <p style={{ color: C.textDim, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", padding: "18px 12px 10px", fontWeight: 500 }}>System</p>
          {[{ label: "Security", Icon: Shield }, { label: "Settings", Icon: Settings }].map(({ label, Icon }) => (
            <button key={label} style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: "11px 14px", borderRadius: 10, marginBottom: 3, background: "transparent", border: "1px solid transparent", color: C.textMid, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "14px 10px", borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: C.bgCard, border: `1px solid ${C.border}` }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${C.gold}28`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: C.gold }}>AK</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: C.text, fontSize: 13, fontWeight: 500 }}>Arjun Kumar</p>
              <p style={{ color: C.textDim, fontSize: 11 }}>Pro Member</p>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.teal, flexShrink: 0 }} />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "22px 32px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "rgba(7,9,28,0.8)" }}>
          <div>
            <h1 style={{ color: C.text, fontSize: 20, fontWeight: 600, fontFamily: "'Playfair Display', serif" }}>{meta[activeTab].title}</h1>
            <p style={{ color: C.textDim, fontSize: 12, marginTop: 3 }}>{meta[activeTab].sub}</p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: C.textDim, background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 8, padding: "7px 12px" }}>
              March 2026
            </div>
            <button style={{ width: 38, height: 38, borderRadius: 10, background: C.bgCard, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Bell size={16} color={C.textMid} />
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 7, background: `${C.gold}18`, border: `1px solid ${C.gold}50`, color: C.gold, borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
              <Plus size={14} /> Add New
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          {sections[activeTab]}
        </div>
      </main>
    </div>
  );
}