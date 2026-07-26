import { useState, useEffect, useRef, createContext, useContext } from "react";

// ─── Theme System ─────────────────────────────────────────────────────────────
type AppTheme = "dark" | "light" | "system";

function makeColors(mode: "dark" | "light") {
  const isDark = mode === "dark";
  return {
    bg:        isDark ? "#0A0A0A" : "#F0EFE9",
    card:      isDark ? "#161616" : "#FFFFFF",
    card2:     isDark ? "#101010" : "#E8E7E2",
    gold:      "#F5C400",
    goldBright:"#FFD60A",
    amber:     "#FFB300",
    darkGold:  "#CA8A04",
    paleGold:  isDark ? "#FDE68A" : "#B8860B",
    green:     "#A3E635",
    orangeA:   "#F59E0B",
    red:       "#EF4444",
    text:      isDark ? "#FFFFFF" : "#111111",
    text2:     isDark ? "#B0AA9A" : "#666660",
    border:    isDark ? "rgba(255,214,10,.09)" : "rgba(0,0,0,.10)",
    goldMuted: isDark ? "rgba(245,196,0,.15)" : "rgba(245,196,0,.18)",
    goldBorder:isDark ? "rgba(255,214,10,.22)" : "rgba(245,196,0,.35)",
    greenMuted:isDark ? "rgba(163,230,53,.15)" : "rgba(100,180,0,.12)",
    redMuted:  isDark ? "rgba(239,68,68,.15)"  : "rgba(239,68,68,.10)",
    amberMuted:isDark ? "rgba(245,158,11,.15)" : "rgba(245,158,11,.12)",
    navBg:     isDark ? "rgba(10,10,10,.92)"   : "rgba(240,239,233,.94)",
    isDark,
  };
}

type Colors = ReturnType<typeof makeColors>;
const ThemeCtx = createContext<Colors>(makeColors("dark"));
const useC = () => useContext(ThemeCtx);

function resolveMode(t: AppTheme): "dark" | "light" {
  if (t === "system") return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return t;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Screen = "dashboard" | "workout" | "recovery" | "profile" | "recovery-player" | "notifications" | "edit-profile";
type Tab = "home" | "workout" | "recovery" | "profile";

// ─── Toast notification ───────────────────────────────────────────────────────
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: "#1a1a1a", color: "#fff", border: "1px solid rgba(245,196,0,.3)", borderRadius: 12, padding: "10px 20px", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,.5)", animation: "fadeUp .2s ease" }}>
      {msg}
    </div>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function AnimRing({ pct, r = 19, sw = 5, color, size = 46, label }: { pct: number; r?: number; sw?: number; color: string; size?: number; label?: string }) {
  const C = useC();
  const circ = 2 * Math.PI * r;
  const [v, setV] = useState(0);
  useEffect(() => { const t = setTimeout(() => setV(pct), 120); return () => clearTimeout(t); }, [pct]);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.card2} strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ*(1-v)} style={{ transition: "stroke-dashoffset 1s cubic-bezier(.3,.8,.3,1)" }} />
      </svg>
      {label && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size < 52 ? 11 : 22, fontWeight: 800, color: C.text }}>{label}</div>}
    </div>
  );
}

function BarFill({ pct, color, h = 7, delay = 0 }: { pct: number; color: string; h?: number; delay?: number }) {
  const C = useC();
  const [w, setW] = useState(0);
  useEffect(() => { const t = setTimeout(() => setW(pct), 180 + delay); return () => clearTimeout(t); }, [pct, delay]);
  return (
    <div style={{ height: h, borderRadius: 6, background: C.card2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${w}%`, background: color, borderRadius: 6, transition: `width 1s cubic-bezier(.3,.8,.3,1) ${delay}ms` }} />
    </div>
  );
}

function GCard({ children, style, onClick }: { children: React.ReactNode; style?: React.CSSProperties; onClick?: () => void }) {
  const C = useC();
  return (
    <div onClick={onClick} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: 16, cursor: onClick ? "pointer" : undefined, ...style }}>
      {children}
    </div>
  );
}

function SHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const C = useC();
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "18px 0 10px" }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{title}</span>
      {action && <span onClick={onAction} style={{ fontSize: 11.5, color: C.gold, fontWeight: 700, cursor: "pointer" }}>{action}</span>}
    </div>
  );
}

function Chev({ dir = "right", size = 13, color }: { dir?: "left"|"right"|"down"; size?: number; color?: string }) {
  const C = useC();
  const d = { right: "M9 6l6 6-6 6", left: "M15 6l-6 6 6 6", down: "M6 9l6 6 6-6" }[dir];
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? C.text2} strokeWidth="2.5" strokeLinecap="round"><path d={d}/></svg>;
}

function Toggle({ on, toggle }: { on: boolean; toggle: () => void }) {
  const C = useC();
  return (
    <div onClick={toggle} style={{ width: 40, height: 23, borderRadius: 20, position: "relative", cursor: "pointer", background: on ? `linear-gradient(135deg,${C.gold},${C.goldBright})` : C.card2, transition: "background .2s", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 2, left: on ? 19 : 2, width: 19, height: 19, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.3)" }} />
    </div>
  );
}

// ─── Edit Field Modal ─────────────────────────────────────────────────────────
function EditModal({ label, value, onSave, onClose }: { label: string; value: string; onSave: (v: string) => void; onClose: () => void }) {
  const C = useC();
  const [v, setV] = useState(value);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", backdropFilter: "blur(6px)", zIndex: 300 }} />
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 301, background: C.card, borderRadius: "24px 24px 0 0", padding: "20px 22px 96px", border: `1px solid ${C.border}`, boxShadow: "0 -20px 60px rgba(0,0,0,.6)" }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: C.card2, margin: "0 auto 20px" }} />
        <p style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 18 }}>Edit {label}</p>
        <input
          autoFocus
          value={v}
          onChange={e => setV(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { onSave(v); onClose(); } if (e.key === "Escape") onClose(); }}
          style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: C.card2, border: `1.5px solid ${C.border}`, color: C.text, fontSize: 15, fontWeight: 600, fontFamily: "Manrope, sans-serif", outline: "none", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 14, border: `1px solid ${C.border}`, background: C.card2, color: C.text2, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "Manrope, sans-serif" }}>Cancel</button>
          <button onClick={() => { onSave(v); onClose(); }} style={{ flex: 2, padding: 14, borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.gold},${C.goldBright})`, color: "#000", fontSize: 14, fontWeight: 800, cursor: "pointer", fontFamily: "Manrope, sans-serif" }}>Save</button>
        </div>
      </div>
    </>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
function Notifications({ navigate }: { navigate: (s: Screen) => void }) {
  const C = useC();
  const [items, setItems] = useState([
    { id: 1, unread: true,  ic: C.gold,    bgM: "rgba(245,196,0,.15)",   icon: "M12 3l1.9 4.9L19 9l-4.9 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 3z", title: "Recovery improved 6%",        sub: "Great sleep last night helped a lot", time: "2h" },
    { id: 2, unread: true,  ic: "#FFB300", bgM: "rgba(245,158,11,.15)",   icon: "M20 6L9 17l-5-5",                                                 title: "Arjun passed your weekly score", sub: "Push harder to reclaim #1",          time: "5h" },
    { id: 3, unread: false, ic: "#A3E635", bgM: "rgba(163,230,53,.15)",   icon: "M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z",               title: "Hydration goal: 3 days streak",  sub: "Keep the streak going today",        time: "1d" },
    { id: 4, unread: true,  ic: "#EF4444", bgM: "rgba(239,68,68,.15)",    icon: "M12 7v5l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z",                   title: "Rest reminder",                  sub: "You have a rest day scheduled today", time: "2d" },
    { id: 5, unread: false, ic: "#FDE68A", bgM: "rgba(253,230,138,.15)",  icon: "M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z",       title: "New PR: Bench 90kg!",            sub: "You crushed a personal record",      time: "3d" },
  ]);
  const unread = items.filter(i => i.unread).length;
  const mark = (id: number) => setItems(p => p.map(i => i.id === id ? { ...i, unread: false } : i));
  const clearAll = () => setItems(p => p.map(i => ({ ...i, unread: false })));

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "16px 20px 96px", scrollbarWidth: "none", background: C.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
        <button onClick={() => navigate("dashboard")} style={{ width: 38, height: 38, borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, color: C.text2, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <Chev dir="left" size={16} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Notifications</h1>
          {unread > 0 && <p style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{unread} unread</p>}
        </div>
        {unread > 0 && <span onClick={clearAll} style={{ fontSize: 12, fontWeight: 700, color: C.gold, cursor: "pointer" }}>Clear All</span>}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(item => (
          <div key={item.id} onClick={() => mark(item.id)} style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 12, padding: "13px 16px", background: item.unread ? (C.isDark ? "rgba(245,196,0,.04)" : "rgba(245,196,0,.06)") : C.card, border: `1px solid ${item.unread ? C.goldBorder : C.border}`, borderRadius: 16, cursor: "pointer" }}>
            {item.unread && <div style={{ position: "absolute", left: 6, top: 20, width: 6, height: 6, borderRadius: "50%", background: C.gold }} />}
            <div style={{ width: 38, height: 38, borderRadius: 11, background: item.bgM, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={item.ic} strokeWidth="2" strokeLinecap="round"><path d={item.icon}/></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: item.unread ? C.text : C.text2, marginBottom: 3 }}>{item.title}</p>
              <p style={{ fontSize: 11, color: C.text2, lineHeight: 1.45 }}>{item.sub}</p>
            </div>
            <span style={{ fontSize: 10, color: C.text2, flexShrink: 0, marginTop: 2 }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ navigate, unreadNotif, setUnreadNotif, toast, userName }: { navigate: (s: Screen) => void; unreadNotif: number; setUnreadNotif: (n: number) => void; toast: (m: string) => void; userName: string }) {
  const C = useC();
  const [glasses, setGlasses] = useState(4.5);
  const maxG = 7;
  const [selectedDay, setSelectedDay] = useState(2);
  const days = [
    { d: "Mon", n: 16, dot: true }, { d: "Tue", n: 17, dot: true }, { d: "Wed", n: 18, dot: true },
    { d: "Thu", n: 19, dot: true }, { d: "Fri", n: 20, dot: false }, { d: "Sat", n: 21, dot: false }, { d: "Sun", n: 22, dot: false },
  ];

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "4px 20px 100px", scrollbarWidth: "none", background: C.bg }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", margin: "8px 0 16px" }}>
        <div>
          <div style={{ fontSize: 13, color: C.text2 }}>Good morning,</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>{userName} 👋</div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div onClick={() => { setUnreadNotif(0); navigate("notifications"); }}
            style={{ position: "relative", width: 36, height: 36, borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.text2, cursor: "pointer" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/></svg>
            {unreadNotif > 0 && <span style={{ position: "absolute", top: -3, right: -3, background: C.red, color: "#fff", fontSize: 9, fontWeight: 800, width: 15, height: 15, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", border: `2px solid ${C.bg}` }}>{unreadNotif}</span>}
          </div>
          <div onClick={() => navigate("profile")} style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg,${C.amber},${C.gold})`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12.5, color: "#fff", cursor: "pointer" }}>A</div>
        </div>
      </div>

      {/* Today's AI Workout */}
      <div onClick={() => navigate("workout")} style={{ display: "flex", alignItems: "center", gap: 12, background: C.isDark ? "linear-gradient(120deg,#2a2210,#171310)" : "linear-gradient(120deg,#fff8e7,#ffefc0)", border: `1px solid ${C.goldBorder}`, borderRadius: 18, padding: 14, cursor: "pointer", marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: C.isDark ? "rgba(255,255,255,.15)" : "rgba(245,196,0,.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.isDark ? "#fff" : C.darkGold} strokeWidth="2" strokeLinecap="round"><path d="M6.5 6.5l11 11M2 8l3-3m14 14l3-3M7 17l-3 3M17 7l3-3"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: C.darkGold, letterSpacing: ".3px", fontWeight: 700 }}>TODAY'S AI WORKOUT</div>
          <div style={{ fontSize: 14.5, fontWeight: 800, color: C.text }}>Push Strength</div>
          <div style={{ fontSize: 10.5, color: C.text2, marginTop: 1 }}>45 min · 6 exercises</div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.isDark ? "rgba(255,255,255,.2)" : "rgba(245,196,0,.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Chev dir="right" size={15} color={C.isDark ? "#fff" : C.darkGold} />
        </div>
      </div>

      {/* Recovery + Streak */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <GCard style={{ padding: 14 }} onClick={() => navigate("recovery")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: C.text2, fontWeight: 600 }}>Recovery Score</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AnimRing pct={0.89} r={19} sw={5} color={C.green} size={46} label="89" />
            <div><div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>Excellent</div><div style={{ fontSize: 10, color: C.text2, marginTop: 2 }}>Ready to train</div></div>
          </div>
        </GCard>
        <GCard style={{ padding: 14 }}>
          <div style={{ fontSize: 11, color: C.text2, fontWeight: 600, marginBottom: 6 }}>Workout Streak</div>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.text }}>24 <small style={{ fontSize: 11, color: C.text2, fontWeight: 600 }}>days</small></div>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {[{ l: "M", d: true }, { l: "T", d: true }, { l: "W", d: true }, { l: "T", d: true }, { l: "F", d: false }].map((x, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", margin: "0 auto 3px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, background: x.d ? `linear-gradient(135deg,${C.orangeA},#C2410C)` : C.card2, color: x.d ? "#fff" : C.text2 }}>{x.d ? "✓" : x.l}</div>
                <div style={{ fontSize: 8, color: C.text2 }}>{x.l}</div>
              </div>
            ))}
          </div>
        </GCard>
      </div>

      {/* Goal Progress */}
      <SHead title="Goal Progress" action="Manage" onAction={() => navigate("profile")} />
      <GCard>
        {[{ l: "Lose 5kg", p: 64, c: C.gold }, { l: "Bench 90kg", p: 81, c: C.darkGold }, { l: "Run 10km", p: 42, c: C.orangeA }].map((g, i) => (
          <div key={i} style={{ marginBottom: i < 2 ? 12 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: C.text, marginBottom: 5 }}>
              <span>{g.l}</span><b style={{ fontWeight: 700 }}>{g.p}%</b>
            </div>
            <BarFill pct={g.p} color={g.c} h={7} delay={i * 80} />
          </div>
        ))}
      </GCard>

      {/* Calories */}
      <SHead title="Calories & Nutrition" action="Log Meal" onAction={() => toast("Nutrition log coming soon!")} />
      <GCard>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {[{ l: "Calories", v: "1.6k", p: 0.72, c: C.orangeA }, { l: "Protein", v: "92%", p: 0.92, c: C.green }, { l: "Carbs", v: "58%", p: 0.58, c: C.gold }].map((n, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <AnimRing pct={n.p} r={19} sw={5} color={n.c} size={46} label={n.v} />
              <div style={{ fontSize: 9.5, color: C.text2, marginTop: 4 }}>{n.l}</div>
            </div>
          ))}
        </div>
      </GCard>

      {/* Water */}
      <SHead title="Water Intake" action={`${(glasses * 0.4).toFixed(1)} / ${(maxG * 0.4).toFixed(1)}L`} />
      <GCard>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setGlasses(g => Math.max(0, g - 1))} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.card2, color: C.text, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>−</button>
          <div style={{ flex: 1 }}><BarFill pct={Math.round((glasses / maxG) * 100)} color={`linear-gradient(90deg,${C.darkGold},${C.gold})`} h={8} /></div>
          <button onClick={() => setGlasses(g => Math.min(maxG, g + 1))} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: C.card2, color: C.text, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>+</button>
        </div>
      </GCard>

      {/* AI Suggestions */}
      <SHead title="AI Suggestions" />
      <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
        {[
          { h: "Recovery Tip", b: "Your HRV dipped slightly. Consider a lighter warmup before today's push session." },
          { h: "Nutrition Tip", b: "You're 20g under your protein goal — a shake tonight would close the gap." },
          { h: "Streak Alert",  b: "One more session today keeps your 24-day streak alive. You've got this 🔥" },
        ].map((s, i) => (
          <div key={i} onClick={() => toast(s.h)} style={{ flexShrink: 0, width: 260, background: C.isDark ? "linear-gradient(135deg,rgba(245,196,0,.14),rgba(253,230,138,.08))" : "rgba(245,196,0,.1)", border: `1px solid ${C.goldBorder}`, borderRadius: 16, padding: 14, cursor: "pointer" }}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: C.darkGold, display: "flex", alignItems: "center", gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.9 4.9L19 9l-4.9 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 3z"/></svg>{s.h}
            </div>
            <p style={{ fontSize: 11.5, color: C.text2, lineHeight: 1.5 }}>{s.b}</p>
          </div>
        ))}
      </div>

      {/* Weekly Calendar */}
      <SHead title="Weekly Calendar" />
      <GCard>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {days.map((day, i) => (
            <div key={i} onClick={() => setSelectedDay(i)} style={{ flex: 1, textAlign: "center", padding: "8px 2px", borderRadius: 12, cursor: "pointer", background: i === selectedDay ? `linear-gradient(135deg,${C.gold},${C.goldBright})` : "transparent" }}>
              <div style={{ fontSize: 9.5, color: i === selectedDay ? "#fff" : C.text2, marginBottom: 5 }}>{day.d}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: i === selectedDay ? "#fff" : C.text }}>{day.n}</div>
              {day.dot && <div style={{ width: 5, height: 5, borderRadius: "50%", background: i === selectedDay ? "#fff" : C.gold, margin: "4px auto 0" }} />}
            </div>
          ))}
        </div>
      </GCard>

      {/* Recent Activity */}
      <SHead title="Recent Activity" action="View All" onAction={() => toast("Full history coming soon!")} />
      <GCard>
        {[
          { bg: C.goldMuted, ic: C.gold,    icon: "M6.5 6.5l11 11M2 8l3-3m14 14l3-3M7 17l-3 3M17 7l3-3", t: "Completed Pull Day",  s: "6 exercises · 380 kcal", time: "Yesterday" },
          { bg: C.greenMuted, ic: C.green,   icon: "M20 6L9 17l-5-5",                                       t: "Hit Protein Goal",    s: "142g logged",            time: "Yesterday" },
          { bg: C.amberMuted, ic: C.orangeA, icon: "M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z",    t: "New PR: Bench 90kg",  s: "+5kg from last month",   time: "2 days ago" },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={a.ic} strokeWidth="2" strokeLinecap="round"><path d={a.icon}/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 12, fontWeight: 700, display: "block", color: C.text }}>{a.t}</b>
              <span style={{ fontSize: 10, color: C.text2 }}>{a.s}</span>
            </div>
            <span style={{ fontSize: 10, color: C.text2 }}>{a.time}</span>
          </div>
        ))}
      </GCard>

      {/* Leaderboard */}
      <SHead title="Leaderboard" action="Challenge Friends" onAction={() => toast("Invite link copied! 🎉")} />
      <GCard>
        {[
          { rank: "1", av: "A", name: "Arjun",   sub: "32 workouts", score: "2,840", avBg: `linear-gradient(135deg,#FBBF24,#B45309)`, highlight: false },
          { rank: "2", av: "A", name: "You",     sub: "28 workouts", score: "2,610", avBg: `linear-gradient(135deg,${C.amber},${C.gold})`, highlight: true },
          { rank: "3", av: "S", name: "Sara",    sub: "25 workouts", score: "2,340", avBg: `linear-gradient(135deg,${C.darkGold},${C.paleGold})`, highlight: false },
        ].map((lb, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: lb.highlight ? "8px 8px" : "8px 0", borderRadius: lb.highlight ? 12 : 0, background: lb.highlight ? C.goldMuted : "transparent", margin: lb.highlight ? "4px -8px" : 0 }}>
            <div style={{ width: 20, fontSize: 12, fontWeight: 800, color: i === 0 ? C.orangeA : C.text2, textAlign: "center" }}>{lb.rank}</div>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: lb.avBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{lb.av}</div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 12, fontWeight: 700, display: "block", color: C.text }}>{lb.name}</b>
              <span style={{ fontSize: 9.5, color: C.text2 }}>{lb.sub}</span>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>{lb.score}</div>
          </div>
        ))}
      </GCard>

      {/* Quick Actions */}
      <SHead title="Quick Actions" />
      <GCard>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { l: "Log Workout", c: C.gold,    path: "M12 5v14M5 12h14", action: () => navigate("workout") },
            { l: "Log Meal",   c: C.orangeA,  path: "M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z", action: () => toast("Nutrition log coming soon!") },
            { l: "Add Water",  c: C.paleGold, path: "M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z", action: () => { setGlasses(g => Math.min(maxG, g + 1)); toast("+250ml water logged! 💧"); } },
            { l: "Recovery",   c: C.green,    path: "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z", action: () => navigate("recovery") },
          ].map((qa, i) => (
            <div key={i} onClick={qa.action} style={{ textAlign: "center", cursor: "pointer" }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: C.card2, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", color: qa.c }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={qa.path}/></svg>
              </div>
              <div style={{ fontSize: 9.5, color: C.text2, fontWeight: 600 }}>{qa.l}</div>
            </div>
          ))}
        </div>
      </GCard>

      {/* Live Statistics */}
      <SHead title="Live Statistics" action="● Live" />
      <GCard>
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          {[{ v: "6,240", l: "Steps" }, { v: "42 min", l: "Active" }, { v: "78 bpm", l: "Heart Rate" }].map((s, i) => (
            <div key={i}><div style={{ fontSize: 17, fontWeight: 800, color: C.text }}>{s.v}</div><div style={{ fontSize: 9.5, color: C.text2, marginTop: 2 }}>{s.l}</div></div>
          ))}
        </div>
      </GCard>

      {/* Active Challenges */}
      <SHead title="Active Challenges" action="Browse All" onAction={() => toast("Challenge browser coming soon!")} />
      <GCard>
        {[
          { name: "30 Workouts in 30 Days", p: 73, sub: "22/30 · 8 days left", grad: `linear-gradient(90deg,${C.amber},${C.gold})` },
          { name: "Hydration Streak",        p: 90, sub: "9/10 days · 1 day left", grad: `linear-gradient(90deg,${C.darkGold},${C.gold})` },
        ].map((ch, i) => (
          <div key={i} style={{ marginBottom: i === 0 ? 12 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.text, marginBottom: 5 }}>
              <b style={{ fontWeight: 700 }}>{ch.name}</b><span style={{ color: C.gold, fontWeight: 700 }}>{ch.p}%</span>
            </div>
            <BarFill pct={ch.p} color={ch.grad} h={6} delay={i * 100} />
            <div style={{ fontSize: 9.5, color: C.text2, marginTop: 3 }}>{ch.sub}</div>
          </div>
        ))}
      </GCard>

      {/* Notifications inline */}
      <SHead title="Notifications" action="See All" onAction={() => { setUnreadNotif(0); navigate("notifications"); }} />
      <GCard>
        {[
          { unread: true,  bg: C.goldMuted,  ic: C.gold,    icon: "M12 3l1.9 4.9L19 9l-4.9 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 3z", t: "Recovery improved 6%",       s: "Great sleep last night helped a lot", time: "2h" },
          { unread: true,  bg: C.amberMuted, ic: C.amber,   icon: "M20 6L9 17l-5-5",                                                t: "Arjun passed your weekly score", s: "Push harder to reclaim #1",           time: "5h" },
          { unread: false, bg: C.greenMuted, ic: C.green,   icon: "M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z",             t: "Hydration goal: 3 days",      s: "Keep the streak going",               time: "1d" },
        ].map((n, i) => (
          <div key={i} onClick={() => { setUnreadNotif(0); navigate("notifications"); }} style={{ position: "relative", display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}>
            {n.unread && <div style={{ position: "absolute", left: -10, top: 16, width: 6, height: 6, borderRadius: "50%", background: C.gold }} />}
            <div style={{ width: 32, height: 32, borderRadius: 10, background: n.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={n.ic} strokeWidth="2" strokeLinecap="round"><path d={n.icon}/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 11.5, fontWeight: 700, display: "block", color: C.text }}>{n.t}</b>
              <span style={{ fontSize: 10, color: C.text2 }}>{n.s}</span>
            </div>
            <span style={{ fontSize: 9.5, color: C.text2, flexShrink: 0 }}>{n.time}</span>
          </div>
        ))}
      </GCard>
    </div>
  );
}

// ─── WORKOUT ─────────────────────────────────────────────────────────────────
function Workout({ navigate, toast }: { navigate: (s: Screen) => void; toast: (m: string) => void }) {
  const C = useC();
  const [active, setActive] = useState(false);
  const [showWhy, setShowWhy] = useState(false);
  const [sets, setSets] = useState<boolean[][]>([
    [false,false,false,false],[false,false,false],[false,false,false],[false,false,false],[false,false,false],[false,false,false],
  ]);
  const [finished, setFinished] = useState(false);

  const exercises = [
    { n:1, name:"Barbell Bench Press",    meta:"4 Sets · 8–10 Reps · 60s Rest", tag:"Chest",              kcal:120 },
    { n:2, name:"Incline Dumbbell Press", meta:"3 Sets · 10–12 Reps · 60s Rest", tag:"Chest · Shoulders", kcal:90 },
    { n:3, name:"Cable Fly",             meta:"3 Sets · 12–15 Reps · 45s Rest", tag:"Chest",              kcal:75 },
    { n:4, name:"Rope Tricep Pushdown",  meta:"3 Sets · 12–15 Reps · 45s Rest", tag:"Triceps",            kcal:60 },
    { n:5, name:"Lateral Raises",        meta:"3 Sets · 12–15 Reps · 45s Rest", tag:"Shoulders",          kcal:50 },
    { n:6, name:"Overhead Press",        meta:"3 Sets · 8–10 Reps · 60s Rest",  tag:"Shoulders",          kcal:80 },
  ];
  const totalDone = sets.flat().filter(Boolean).length;

  if (finished) return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 30, gap: 20, background: C.bg }}>
      <div style={{ width: 100, height: 100, borderRadius: "50%", background: C.goldMuted, border: `2px solid ${C.gold}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: C.text }}>Workout Done! 🎉</h2>
        <p style={{ fontSize: 14, color: C.text2, marginTop: 6 }}>{totalDone}/{sets.flat().length} sets completed</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%" }}>
        {[{ l:"Duration",v:"48 min"},{l:"Sets Done",v:`${totalDone}/19`},{l:"Calories",v:"420 kcal"},{l:"Streak",v:"25 Days 🔥"}].map((s,i) => (
          <GCard key={i} style={{ textAlign:"center", padding:16 }}>
            <div style={{ fontSize:20, fontWeight:800, color:C.gold }}>{s.v}</div>
            <div style={{ fontSize:11, color:C.text2, marginTop:4 }}>{s.l}</div>
          </GCard>
        ))}
      </div>
      <button onClick={() => { setFinished(false); navigate("dashboard"); }} style={{ width:"100%", padding:16, borderRadius:18, border:"none", background:`linear-gradient(135deg,${C.gold},${C.goldBright})`, color:"#000", fontSize:15, fontWeight:800, cursor:"pointer" }}>Back to Dashboard</button>
    </div>
  );

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"4px 20px 110px", scrollbarWidth:"none", background:C.bg }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", margin:"8px 0 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => navigate("dashboard")} style={{ width:38, height:38, borderRadius:12, background:C.card, border:`1px solid ${C.border}`, color:C.text2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Chev dir="left" size={16}/></button>
          <div><div style={{ fontSize:13, color:C.text2 }}>Today's Plan</div><div style={{ fontSize:20, fontWeight:800, color:C.text }}>Workout Plan</div></div>
        </div>
        <div style={{ width:38, height:38, borderRadius:"50%", background:`linear-gradient(135deg,${C.amber},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:13, color:"#fff", cursor:"pointer" }} onClick={() => navigate("profile")}>A</div>
      </div>

      {/* Hero */}
      <div style={{ borderRadius:28, overflow:"hidden", marginBottom:16, padding:20, background:C.isDark?"radial-gradient(circle at 75% 15%,rgba(245,196,0,.30) 0%,transparent 45%),linear-gradient(160deg,#1c1c1c,#0a0a0a)":"linear-gradient(160deg,#fffbea,#fff8d6)", border:`1px solid ${C.goldBorder}`, boxShadow:`0 20px 45px -18px rgba(245,196,0,.4)` }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, fontSize:10.5, fontWeight:700, padding:"5px 10px", borderRadius:20, background:"rgba(245,196,0,.2)", color:C.darkGold, marginBottom:10 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.9 4.9L19 9l-4.9 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 3z"/></svg>TODAY'S BEST WORKOUT
            </div>
            <div style={{ fontSize:26, fontWeight:800, lineHeight:1.15, marginBottom:4, color:C.text }}>Push Strength</div>
            <div style={{ fontSize:13, color:C.text2 }}>Focus: Chest • Shoulders • Triceps</div>
          </div>
          <div style={{ width:90, height:90, flexShrink:0, marginTop:-6 }}>
            <svg viewBox="0 0 150 150" fill="none" style={{ width:"100%", height:"100%", animation:"float 3.4s ease-in-out infinite" }}>
              <defs>
                <linearGradient id="bBd" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#FFF8E8"/><stop offset="100%" stopColor="#E8D9A0"/></linearGradient>
                <radialGradient id="bEy" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#FFE9A8"/><stop offset="100%" stopColor="#F5C400"/></radialGradient>
              </defs>
              <ellipse cx="75" cy="128" rx="30" ry="6" fill="#000" opacity=".2"/>
              <rect x="45" y="60" width="60" height="58" rx="22" fill="url(#bBd)"/>
              <circle cx="75" cy="34" r="26" fill="url(#bBd)"/>
              <rect x="66" y="6" width="18" height="10" rx="5" fill="#FFD60A"/>
              <circle cx="75" cy="4" r="4" fill="#FFD60A"/>
              <ellipse cx="65" cy="34" rx="6" ry="7" fill="url(#bEy)"/>
              <ellipse cx="85" cy="34" rx="6" ry="7" fill="url(#bEy)"/>
              <path d="M64 46q11 7 22 0" stroke="#B0A488" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
              <rect x="58" y="72" width="34" height="6" rx="3" fill="#F5C400" opacity=".55"/>
              <rect x="20" y="66" width="16" height="30" rx="8" fill="url(#bBd)"/>
              <rect x="114" y="66" width="16" height="30" rx="8" fill="url(#bBd)"/>
              <rect x="50" y="118" width="16" height="24" rx="7" fill="url(#bBd)"/>
              <rect x="84" y="118" width="16" height="24" rx="7" fill="url(#bBd)"/>
            </svg>
          </div>
        </div>
        <div style={{ display:"flex", gap:18, margin:"16px 0" }}>
          {[{val:"45 Mins",icon:"M12 7v5l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"},{val:"6 Exercises",icon:"M3 17l5-5 4 4 9-9"},{val:"420 Cal",icon:"M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z"}].map((s,i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.darkGold} strokeWidth="2" strokeLinecap="round"><path d={s.icon}/></svg>
              <span style={{ fontSize:13.5, fontWeight:700, color:C.text }}>{s.val}</span>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => { if (active && totalDone === sets.flat().length) { setFinished(true); } else { setActive(a => !a); toast(active ? "Paused" : "Workout started! 💪"); } }}
            style={{ flex:1, padding:14, borderRadius:16, fontWeight:700, fontSize:14, border:"none", cursor:"pointer", background:active?`linear-gradient(135deg,${C.green},#65a30d)`:`linear-gradient(135deg,${C.amber},${C.gold})`, color:"#000", boxShadow:"0 10px 22px -8px rgba(245,179,0,.45)", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d={active?"M6 19h4V5H6v14zm8-14v14h4V5h-4z":"M8 5v14l11-7z"}/></svg>
            {active ? "Pause Workout" : "Start Workout"}
          </button>
          <button onClick={() => toast("Workout customization coming soon!")} style={{ flex:1, padding:14, borderRadius:16, fontWeight:700, fontSize:14, border:`1px solid ${C.border}`, background:C.card2, color:C.text, cursor:"pointer" }}>Customize</button>
        </div>
      </div>

      {/* AI Rec */}
      <GCard style={{ borderRadius:22, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:15, fontWeight:700, color:C.text }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.gold} strokeWidth="2"><path d="M12 3l1.9 4.9L19 9l-4.9 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 3z"/></svg>AI Recommendation
          </div>
          <div onClick={() => setShowWhy(!showWhy)} style={{ display:"flex", alignItems:"center", gap:4, fontSize:11.5, color:C.text2, cursor:"pointer" }}>
            Why this? <Chev dir={showWhy?"down":"right"} size={12}/>
          </div>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:14 }}>
          {[{bg:C.greenMuted,c:C.green,v:"92%",l:"Recovery",icon:"M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"},{bg:C.goldMuted,c:C.gold,v:"7h 45m",l:"Sleep",icon:"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"},{bg:C.amberMuted,c:C.paleGold,v:"High",l:"Readiness",icon:"M6.5 6.5l11 11M2 8l3-3m14 14l3-3M7 17l-3 3M17 7l3-3"}].map((m,i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, flex:1 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:m.bg, display:"flex", alignItems:"center", justifyContent:"center", color:m.c }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={m.icon}/></svg>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{m.v}</div>
              <div style={{ fontSize:10, color:C.text2 }}>{m.l}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12.5, color:C.text2, lineHeight:1.6 }}>Chest fully recovered. Increase pushing volume by 8% for better results.</p>
        {showWhy && <p style={{ fontSize:12.5, color:C.text2, lineHeight:1.6, marginTop:8, paddingTop:8, borderTop:`1px solid ${C.border}` }}>Rest periods trimmed given strong HRV this morning. Optimal window: 45–60 min.</p>}
      </GCard>

      {/* Exercises */}
      <SHead title="Today's Exercises" action="View All" onAction={() => toast("Full exercise library coming soon!")} />
      {exercises.map((ex, i) => {
        const exSets = sets[i] ?? [];
        const done = exSets.filter(Boolean).length;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:12, background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:12, marginBottom:10 }}>
            <div style={{ width:20, height:20, borderRadius:6, background:C.card2, color:C.text2, fontSize:11, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{ex.n}</div>
            <div style={{ width:50, height:50, borderRadius:14, background:C.isDark?"linear-gradient(145deg,#3a2f10,#241a08)":"rgba(245,196,0,.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:C.gold }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6.5 6.5l11 11M2 8l3-3m14 14l3-3M7 17l-3 3M17 7l3-3"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/></svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <h4 style={{ fontSize:13.5, fontWeight:700, marginBottom:3, color:C.text }}>{ex.name}</h4>
              <div style={{ fontSize:10.5, color:C.text2, marginBottom:6 }}>{ex.meta}</div>
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                {exSets.map((s,si) => (
                  <button key={si} onClick={() => setSets(prev => { const u = prev.map(r => [...r]); u[i][si]=!u[i][si]; return u; })}
                    style={{ width:22, height:22, borderRadius:6, border:`1px solid ${s?C.green:C.border}`, background:s?C.greenMuted:C.card2, color:C.green, fontSize:10, fontWeight:800, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    {s?"✓":""}
                  </button>
                ))}
                <span style={{ fontSize:9.5, color:C.text2, marginLeft:4 }}>{done}/{exSets.length}</span>
              </div>
            </div>
            <div style={{ textAlign:"right", flexShrink:0 }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text }}>{ex.kcal}</div>
              <div style={{ fontSize:9.5, color:C.text2 }}>kcal</div>
            </div>
          </div>
        );
      })}
      <button onClick={() => setFinished(true)} style={{ width:"100%", padding:16, borderRadius:18, border:"none", fontSize:14.5, fontWeight:800, cursor:"pointer", background:`linear-gradient(135deg,${C.gold},${C.goldBright})`, color:"#000", boxShadow:`0 8px 24px -8px rgba(245,196,0,.6)`, marginTop:4 }}>
        Complete Session ✓
      </button>
    </div>
  );
}

// ─── RECOVERY ────────────────────────────────────────────────────────────────
function Recovery({ navigate, toast }: { navigate: (s: Screen) => void; toast: (m: string) => void }) {
  const C = useC();
  const [tab, setTab] = useState<"status"|"advice">("status");

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"4px 20px 96px", scrollbarWidth:"none", background:C.bg }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"10px 0 16px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => navigate("dashboard")} style={{ width:38, height:38, borderRadius:12, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Chev dir="left" size={16}/></button>
          <h1 style={{ fontSize:19, fontWeight:800, color:C.text }}>Recovery & Health</h1>
        </div>
      </div>

      {/* Hero Gauge */}
      <div style={{ borderRadius:22, overflow:"hidden", marginBottom:16, padding:20, background:C.isDark?"linear-gradient(120deg,#111,#191919)":C.card, border:`1px solid ${C.goldBorder}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ flexShrink:0 }}>
          <div style={{ fontSize:13.5, fontWeight:700, color:C.darkGold, marginBottom:10 }}>Recovery Score</div>
          <div style={{ position:"relative", width:112, height:112 }}>
            <svg width="112" height="112" viewBox="0 0 120 120" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="60" cy="60" r="50" fill="none" stroke={C.card2} strokeWidth="11"/>
              <circle cx="60" cy="60" r="50" fill="none" stroke="url(#rGrad)" strokeWidth="11" strokeLinecap="round" strokeDasharray="314" strokeDashoffset={314-314*0.89} style={{ transition:"stroke-dashoffset 1.1s cubic-bezier(.3,.8,.3,1)" }}/>
              <defs><linearGradient id="rGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FDE047"/><stop offset="55%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#D97706"/></linearGradient></defs>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:25, fontWeight:800, color:C.text }}>89%</div>
              <div style={{ fontSize:11, color:C.green, fontWeight:700, marginTop:2 }}>Excellent</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:C.text2, marginBottom:2 }}>Status</div>
          <div style={{ fontSize:15, fontWeight:800, marginBottom:6, color:C.text }}>Ready to Train</div>
          <div style={{ fontSize:10.5, color:C.text2, lineHeight:1.5 }}>Your body is recovered and primed for performance.</div>
        </div>
        <div style={{ flexShrink:0, width:52, height:66 }}>
          <svg viewBox="0 0 80 100" fill="none" style={{ width:"100%", height:"100%", animation:"breathe 3.4s ease-in-out infinite" }}>
            <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FDE047"/><stop offset="100%" stopColor="#B45309"/></linearGradient></defs>
            <circle cx="40" cy="16" r="10" fill="url(#mg)" opacity=".9"/>
            <path d="M40 26v18" stroke="url(#mg)" strokeWidth="7" strokeLinecap="round"/>
            <path d="M40 34c-10 0-20 6-24 16M40 34c10 0 20 6 24 16" stroke="url(#mg)" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M16 50c-4 6-4 14 6 16M64 50c4 6 4 14-6 16" stroke="url(#mg)" strokeWidth="6" strokeLinecap="round" fill="none"/>
            <path d="M22 66c8 8 28 8 36 0" stroke="url(#mg)" strokeWidth="7" strokeLinecap="round" fill="none"/>
          </svg>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        {[
          { icon:"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z", ic:C.gold,    label:"Sleep",     val:"7h 45m", sub:"Good",     sub2:C.green,   pct:0 },
          { icon:"M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z", ic:C.red, label:"Heart Rate", val:"62 bpm",  sub:"Resting",  sub2:C.text2,  pct:0 },
          { icon:"M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z", ic:C.darkGold, label:"Water",     val:"2.4 L",  sub:"80%",      sub2:C.darkGold, pct:80 },
          { icon:"M13 2L4 13h7v9l9-11h-7z", ic:C.orangeA, label:"Stress",    val:"Moderate", sub:"42/100",   sub2:C.orangeA,  pct:42 },
        ].map((s,i) => (
          <GCard key={i} style={{ padding:14 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8, fontSize:12, fontWeight:700, color:C.text2 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill={i===1?s.ic:"none"} stroke={i===1?"none":s.ic} strokeWidth="2" strokeLinecap="round"><path d={s.icon}/></svg>{s.label}
            </div>
            <div style={{ fontSize:17, fontWeight:800, color:C.text }}>{s.val}</div>
            <div style={{ fontSize:10.5, color:s.sub2, fontWeight:700, marginTop:2 }}>{s.sub}</div>
            {s.pct > 0 && <div style={{ marginTop:8 }}><BarFill pct={s.pct} color={s.ic} h={5}/></div>}
          </GCard>
        ))}
      </div>

      {/* Timeline */}
      <GCard style={{ marginBottom:12 }}>
        <div style={{ fontSize:14.5, fontWeight:700, marginBottom:16, color:C.text }}>Recovery Timeline</div>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", top:12, left:20, right:20, height:2, background:`linear-gradient(90deg,${C.green},${C.darkGold},${C.gold})` }}/>
          <div style={{ display:"flex", justifyContent:"space-between", position:"relative", zIndex:1 }}>
            {[{l:"Today",p:"89%",bg:C.green,done:true},{l:"Tomorrow",p:"85%",bg:C.darkGold,done:false},{l:"2 Days",p:"70%",bg:C.orangeA,done:false},{l:"Full",p:"100%",bg:C.gold,done:false}].map((step,i) => (
              <div key={i} style={{ flex:1, textAlign:"center" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", margin:"0 auto 8px", background:step.bg, border:`3px solid ${C.bg}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {step.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>}
                </div>
                <div style={{ fontSize:10.5, color:C.text2, marginBottom:2 }}>{step.l}</div>
                <div style={{ fontSize:12.5, fontWeight:800, color:step.bg }}>{step.p}</div>
              </div>
            ))}
          </div>
        </div>
      </GCard>

      {/* Tabs */}
      <div style={{ display:"flex", background:C.card2, borderRadius:12, padding:4, marginBottom:12 }}>
        {(["status","advice"] as const).map(t => (
          <span key={t} onClick={() => setTab(t)} style={{ flex:1, textAlign:"center", padding:"9px 4px", borderRadius:9, fontSize:11.5, fontWeight:700, color:tab===t?"#000":C.text2, background:tab===t?`linear-gradient(135deg,${C.gold},${C.goldBright})`:"transparent", cursor:"pointer", transition:"all .2s" }}>
            {t==="status"?"Body Status":"AI Recovery Advice"}
          </span>
        ))}
      </div>

      {tab==="status" && (
        <>
          <GCard style={{ textAlign:"center", padding:"20px 18px", marginBottom:12 }}>
            <p style={{ fontSize:12, color:C.text2, marginBottom:16, textAlign:"left" }}>Muscle fatigue heatmap</p>
            <svg width="160" height="200" viewBox="0 0 160 200" fill="none">
              <ellipse cx="80" cy="22" rx="18" ry="20" fill={C.card2}/>
              <rect x="73" y="40" width="14" height="12" rx="4" fill={C.card2}/>
              <rect x="52" y="52" width="56" height="40" rx="10" fill={C.greenMuted} stroke={C.green} strokeWidth="1.5"/>
              <rect x="56" y="90" width="48" height="28" rx="8" fill={C.amberMuted} stroke={C.orangeA} strokeWidth="1.5"/>
              <rect x="26" y="54" width="20" height="52" rx="9" fill={C.greenMuted} stroke={C.green} strokeWidth="1.5"/>
              <rect x="114" y="54" width="20" height="52" rx="9" fill={C.greenMuted} stroke={C.green} strokeWidth="1.5"/>
              <rect x="52" y="117" width="56" height="20" rx="8" fill={C.card2}/>
              <rect x="52" y="136" width="24" height="52" rx="10" fill={C.redMuted} stroke={C.red} strokeWidth="1.5"/>
              <rect x="84" y="136" width="24" height="52" rx="10" fill={C.redMuted} stroke={C.red} strokeWidth="1.5"/>
              <rect x="50" y="185" width="28" height="12" rx="5" fill={C.card2}/>
              <rect x="82" y="185" width="28" height="12" rx="5" fill={C.card2}/>
              <text x="80" y="76" textAnchor="middle" fontSize="9" fill={C.green} fontWeight="700" fontFamily="Manrope">ARMS</text>
              <text x="80" y="109" textAnchor="middle" fontSize="9" fill={C.orangeA} fontWeight="700" fontFamily="Manrope">CORE</text>
              <text x="80" y="172" textAnchor="middle" fontSize="9" fill={C.red} fontWeight="700" fontFamily="Manrope">LEGS</text>
            </svg>
            <div style={{ display:"flex", gap:16, marginTop:14, justifyContent:"center" }}>
              {[{c:C.red,l:"High Fatigue"},{c:C.orangeA,l:"Recovering"},{c:C.green,l:"Recovered"}].map((lg,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:C.text2 }}>
                  <div style={{ width:8, height:8, borderRadius:3, background:lg.c }}/>{lg.l}
                </div>
              ))}
            </div>
          </GCard>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            {[{n:"Legs",st:"High Fatigue",p:88,c:C.red,bg:C.redMuted},{n:"Core",st:"Recovering",p:55,c:C.orangeA,bg:C.amberMuted},{n:"Arms",st:"Recovered",p:14,c:C.green,bg:C.greenMuted},{n:"Back",st:"Recovering",p:42,c:C.orangeA,bg:C.amberMuted},{n:"Chest",st:"Recovered",p:18,c:C.green,bg:C.greenMuted},{n:"Shoulders",st:"Recovered",p:22,c:C.green,bg:C.greenMuted}].map((m,i) => (
              <GCard key={i} style={{ padding:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C.text }}>{m.n}</span>
                  <span style={{ fontSize:9.5, fontWeight:700, color:m.c, padding:"2px 8px", borderRadius:99, background:m.bg }}>{m.st}</span>
                </div>
                <BarFill pct={m.p} color={m.c} h={5} delay={i*60}/>
              </GCard>
            ))}
          </div>
        </>
      )}
      {tab==="advice" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
          {[
            {icon:"M9 12l2 2 4-4",title:"Foam Roll Legs",sub:"12 min · Quads & hamstrings",c:C.red},
            {icon:"M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z",title:"Increase Hydration",sub:"Aim for 3L today",c:C.darkGold},
            {icon:"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",title:"Sleep Early Tonight",sub:"Target 8+ hours",c:C.gold},
            {icon:"M12 3l1.9 4.9L19 9l-4.9 1.9L12 16l-1.9-5.1L5 9l5.1-1.9L12 3z",title:"Protein-Rich Meal",sub:"1.8g/kg · ~97g for you",c:C.green},
            {icon:"M13 2L4 13h7v9l9-11h-7z",title:"Light Pilates Flow",sub:"20 min low-impact",c:C.orangeA},
          ].map((a,i) => (
            <GCard key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:14, cursor:"pointer" }} onClick={() => toast(`${a.title} added to plan! ✓`)}>
              <div style={{ width:30, height:30, borderRadius:9, background:C.goldMuted, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:a.c }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={a.icon}/></svg>
              </div>
              <div style={{ flex:1 }}>
                <b style={{ fontSize:11.5, fontWeight:700, display:"block", color:C.text }}>{a.title}</b>
                <span style={{ fontSize:10, color:C.text2 }}>{a.sub}</span>
              </div>
              <Chev dir="right" size={13}/>
            </GCard>
          ))}
        </div>
      )}
      <button onClick={() => navigate("recovery-player")} style={{ width:"100%", padding:16, border:"none", borderRadius:16, fontSize:14.5, fontWeight:800, color:"#000", cursor:"pointer", background:`linear-gradient(135deg,${C.gold},${C.darkGold})`, boxShadow:`0 10px 28px -10px rgba(245,196,0,.6)`, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
        Start Recovery Routine <Chev dir="right" size={16} color="#000"/>
      </button>
    </div>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────
function Profile({ navigate, theme, setTheme, toast, userName, userEmail, setEditField }: { navigate: (s: Screen) => void; theme: AppTheme; setTheme: (t: AppTheme) => void; toast: (m: string) => void; userName: string; userEmail: string; setEditField: (f: null|{label:string;value:string;onSave:(v:string)=>void}) => void }) {
  const C = useC();
  const [goals, setGoals] = useState(["Lose Weight", "Improve Strength"]);
  const [equip, setEquip] = useState(["Dumbbells", "Barbell"]);
  const [sw, setSw] = useState({ adaptive:true, voice:false, aggressive:false, reminders:true, recovery:true, social:false, publicProfile:true, shareData:false, twoFA:true });
  const [devices, setDevices] = useState({ apple:true, whoop:false, google:false });
  const [logStep, setLogStep] = useState(0);
  const [fitnessVals, setFitnessVals] = useState({ Height:"165 cm", Weight:"54 kg", Age:"21", BMI:"19.8" });

  const Label = ({ t }: { t: string }) => (
    <div style={{ fontSize:11, fontWeight:700, color:C.text2, textTransform:"uppercase", letterSpacing:".6px", margin:"20px 4px 8px" }}>{t}</div>
  );

  function SwRow({ label, sub, k }: { label: string; sub?: string; k: keyof typeof sw }) {
    return (
      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderTop:`1px solid ${C.border}` }}>
        <div style={{ flex:1 }}>
          <b style={{ fontSize:12.5, fontWeight:700, display:"block", color:C.text }}>{label}</b>
          {sub && <span style={{ fontSize:10.5, color:C.text2 }}>{sub}</span>}
        </div>
        <Toggle on={sw[k]} toggle={() => { setSw(p => ({ ...p, [k]:!p[k] })); toast(`${label} ${sw[k]?"disabled":"enabled"}`); }}/>
      </div>
    );
  }

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"4px 20px 100px", scrollbarWidth:"none", background:C.bg }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", margin:"10px 0 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={() => navigate("dashboard")} style={{ width:36, height:36, borderRadius:12, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Chev dir="left" size={15}/></button>
          <h1 style={{ fontSize:19, fontWeight:800, color:C.text }}>Profile & Settings</h1>
        </div>
      </div>

      {/* Profile Hero */}
      <div style={{ display:"flex", alignItems:"center", gap:14, background:C.card, border:`1px solid ${C.border}`, borderRadius:20, padding:16, marginBottom:4 }}>
        <div style={{ position:"relative", width:64, height:64, flexShrink:0 }}>
          <div style={{ width:64, height:64, borderRadius:"50%", background:`linear-gradient(135deg,${C.amber},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:22, color:"#fff" }}>A</div>
          <div onClick={() => navigate("edit-profile")} style={{ position:"absolute", bottom:-2, right:-2, width:22, height:22, borderRadius:"50%", background:C.card2, border:`2px solid ${C.card}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.text2, cursor:"pointer" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>
          </div>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{userName}</div>
          <div style={{ fontSize:11.5, color:C.text2, marginTop:2 }}>{userEmail}</div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:4, fontSize:9.5, fontWeight:700, padding:"3px 8px", borderRadius:20, background:C.goldMuted, color:C.gold, marginTop:6 }}>✦ PRO MEMBER</div>
        </div>
        <div onClick={() => navigate("edit-profile")} style={{ width:32, height:32, borderRadius:10, background:C.card2, display:"flex", alignItems:"center", justifyContent:"center", color:C.text2, cursor:"pointer" }}>
          <Chev dir="right" size={13}/>
        </div>
      </div>

      {/* Fitness Profile */}
      <Label t="Fitness Profile"/>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
        {(["Height","Weight","Age","BMI"] as const).map((key,i) => (
          <div key={i} onClick={() => setEditField({ label:key, value:fitnessVals[key], onSave:(v:string) => setFitnessVals(p => ({ ...p, [key]:v })) })} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderTop:i>0?`1px solid ${C.border}`:"none", cursor:"pointer" }}>
            <div style={{ width:32, height:32, borderRadius:9, background:C.goldMuted, color:C.gold, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={i===0?"M12 20v-6M12 4v4M8 8h8":i===1?"M4 19V5M9 19V9m5 10v-6m5 6V7":i===2?"M3 4h18v16H3zM8 2v4M16 2v4M3 10h18":"M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z"}/></svg>
            </div>
            <div style={{ flex:1 }}>
              <b style={{ fontSize:12.5, fontWeight:700, display:"block", color:C.text }}>{key}</b>
              <span style={{ fontSize:10.5, color:C.text2 }}>Tap to edit</span>
            </div>
            <div style={{ fontSize:11.5, color:C.text2, display:"flex", alignItems:"center", gap:6, fontWeight:700 }}>{fitnessVals[key]} <Chev dir="right" size={13}/></div>
          </div>
        ))}
      </div>

      {/* Goals */}
      <Label t="Goals"/>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"14px 16px", display:"flex", flexWrap:"wrap", gap:8 }}>
        {["Lose Weight","Build Muscle","Improve Strength","Endurance","Flexibility"].map(g => (
          <span key={g} onClick={() => { setGoals(p => p.includes(g)?p.filter(x=>x!==g):[...p,g]); toast(goals.includes(g)?`${g} removed`:`${g} added! ✓`); }}
            style={{ fontSize:11.5, fontWeight:600, padding:"8px 14px", borderRadius:20, background:goals.includes(g)?`linear-gradient(135deg,${C.gold},${C.goldBright})`:C.card2, color:goals.includes(g)?"#000":C.text2, border:`1px solid ${goals.includes(g)?"transparent":C.border}`, cursor:"pointer", transition:"all .2s" }}>{g}</span>
        ))}
      </div>

      {/* Equipment */}
      <Label t="Equipment"/>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"14px 16px", display:"flex", flexWrap:"wrap", gap:8 }}>
        {["Dumbbells","Barbell","Resistance Bands","Pull-up Bar","Full Gym"].map(e => (
          <span key={e} onClick={() => { setEquip(p => p.includes(e)?p.filter(x=>x!==e):[...p,e]); toast(equip.includes(e)?`${e} removed`:`${e} added! ✓`); }}
            style={{ fontSize:11.5, fontWeight:600, padding:"8px 14px", borderRadius:20, background:equip.includes(e)?`linear-gradient(135deg,${C.gold},${C.goldBright})`:C.card2, color:equip.includes(e)?"#000":C.text2, border:`1px solid ${equip.includes(e)?"transparent":C.border}`, cursor:"pointer", transition:"all .2s" }}>{e}</span>
        ))}
      </div>

      {/* AI Prefs */}
      <Label t="AI Preferences"/>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
        <SwRow label="Adaptive Coaching" sub="Adjust plans based on recovery" k="adaptive"/>
        <SwRow label="Voice Feedback" sub="Spoken cues during workouts" k="voice"/>
        <SwRow label="Aggressive Progression" sub="Push volume faster when recovered" k="aggressive"/>
      </div>

      {/* Notifications */}
      <Label t="Notifications"/>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
        <SwRow label="Workout Reminders" sub="Daily nudge at 6:00 PM" k="reminders"/>
        <SwRow label="Recovery Alerts" sub="When readiness drops" k="recovery"/>
        <SwRow label="Social Updates" sub="Leaderboard & friend activity" k="social"/>
      </div>

      {/* Theme — FUNCTIONAL */}
      <Label t="App Theme"/>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"14px 16px", display:"flex", gap:10 }}>
        {([{k:"dark" as AppTheme,bg:"#0A0A0A",l:"Dark"},{k:"light" as AppTheme,bg:"#F0EFE9",l:"Light"},{k:"system" as AppTheme,bg:"linear-gradient(90deg,#0A0A0A 50%,#F0EFE9 50%)",l:"System"}]).map(opt => {
          const active = theme === opt.k;
          return (
            <div key={opt.k} onClick={() => { setTheme(opt.k); toast(`${opt.l} theme applied ✓`); }} style={{ flex:1, textAlign:"center", padding:"14px 8px", borderRadius:14, background:C.card2, border:`1.5px solid ${active?C.gold:"transparent"}`, cursor:"pointer", transition:"border-color .2s" }}>
              <div style={{ width:"100%", height:32, borderRadius:8, marginBottom:8, background:opt.bg, border:`1px solid rgba(127,127,127,.15)` }}/>
              <div style={{ fontSize:10.5, fontWeight:700, color:active?C.gold:C.text2 }}>{opt.l}</div>
              {active && <div style={{ width:6, height:6, borderRadius:"50%", background:C.gold, margin:"5px auto 0" }}/>}
            </div>
          );
        })}
      </div>

      {/* Privacy */}
      <Label t="Privacy"/>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
        <SwRow label="Public Profile" sub="Visible on leaderboards" k="publicProfile"/>
        <SwRow label="Share Workout Data" sub="With connected apps" k="shareData"/>
        <SwRow label="Two-Factor Auth" sub="Extra account security" k="twoFA"/>
      </div>

      {/* Devices */}
      <Label t="Connected Devices"/>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden" }}>
        {([{k:"apple" as const,name:"Apple Health",sub:"Wearable sync"},{k:"whoop" as const,name:"WHOOP 4.0",sub:"HRV tracking"},{k:"google" as const,name:"Google Fit",sub:"Activity data"}]).map((d,i) => {
          const conn = devices[d.k];
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderTop:i>0?`1px solid ${C.border}`:"none" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:conn?C.green:C.text2, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <b style={{ fontSize:12.5, fontWeight:700, display:"block", color:C.text }}>{d.name}</b>
                <span style={{ fontSize:10.5, color:C.text2 }}>{conn?"Synced 2 min ago":d.sub}</span>
              </div>
              <button onClick={() => { setDevices(p => ({...p,[d.k]:!p[d.k]})); toast(conn?`${d.name} disconnected`:`${d.name} connected! ✓`); }}
                style={{ fontSize:10.5, fontWeight:700, padding:"6px 12px", borderRadius:10, border:`1px solid ${conn?"rgba(163,230,53,.3)":C.border}`, background:conn?"rgba(163,230,53,.08)":C.card2, color:conn?C.green:C.text2, cursor:"pointer", fontFamily:"Manrope,sans-serif" }}>
                {conn?"Connected":"Connect"}
              </button>
            </div>
          );
        })}
      </div>

      {/* Subscription */}
      <Label t="Subscription"/>
      <div style={{ background:C.isDark?"linear-gradient(135deg,#4a3a10,#8a6a10)":"linear-gradient(135deg,#8B6914,#B8860B)", borderRadius:18, padding:16, marginBottom:8 }}>
        <div style={{ fontSize:15, fontWeight:800, marginBottom:2, color:"#fff" }}>FitAI Pro — Premium</div>
        <div style={{ fontSize:11, color:"rgba(255,255,255,.75)", marginBottom:12 }}>Renews Aug 18, 2024 · $12.99/mo</div>
        <button onClick={() => toast("Subscription portal opening...")} style={{ width:"100%", padding:11, borderRadius:12, border:"none", background:"#fff", color:"#5c4408", fontSize:12.5, fontWeight:800, cursor:"pointer" }}>Manage Subscription</button>
      </div>

      {/* Logout */}
      <button onClick={() => { if (logStep===0) { setLogStep(1); setTimeout(()=>setLogStep(0),2500); } else { setLogStep(0); navigate("dashboard"); toast("Logged out"); } }}
        style={{ width:"100%", padding:15, borderRadius:16, border:`1px solid rgba(239,68,68,.3)`, background:"rgba(239,68,68,.08)", color:C.red, fontSize:13.5, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:20 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        {logStep===0?"Log Out":"Tap again to confirm"}
      </button>

    </div>
  );
}

// ─── EDIT PROFILE ─────────────────────────────────────────────────────────────
function EditProfile({ navigate, toast, userName, setUserName, userEmail, setUserEmail, setEditField }: { navigate: (s: Screen) => void; toast: (m: string) => void; userName: string; setUserName: (v: string) => void; userEmail: string; setUserEmail: (v: string) => void; setEditField: (f: null|{label:string;value:string;onSave:(v:string)=>void}) => void }) {
  const C = useC();
  const [bio, setBio] = useState("Fitness enthusiast 💪");
  const [dob, setDob] = useState("Jan 15, 2003");
  const [gender, setGender] = useState("Female");

  const fields = [
    { label: "Full Name",     value: userName,  onSave: setUserName },
    { label: "Email",         value: userEmail, onSave: setUserEmail },
    { label: "Bio",           value: bio,       onSave: setBio },
    { label: "Date of Birth", value: dob,       onSave: setDob },
    { label: "Gender",        value: gender,    onSave: setGender },
  ];

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"4px 20px 120px", scrollbarWidth:"none", background:C.bg }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, margin:"10px 0 22px" }}>
        <button onClick={() => navigate("profile")} style={{ width:38, height:38, borderRadius:12, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <Chev dir="left" size={16}/>
        </button>
        <h1 style={{ fontSize:20, fontWeight:800, color:C.text }}>Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div style={{ display:"flex", justifyContent:"center", marginBottom:28 }}>
        <div style={{ position:"relative" }}>
          <div style={{ width:80, height:80, borderRadius:"50%", background:`linear-gradient(135deg,${C.amber},${C.gold})`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:28, color:"#fff" }}>A</div>
          <div onClick={() => toast("Photo upload coming soon!")} style={{ position:"absolute", bottom:0, right:0, width:26, height:26, borderRadius:"50%", background:C.card2, border:`2px solid ${C.bg}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.text2, cursor:"pointer" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          </div>
        </div>
      </div>

      {/* Fields */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, overflow:"hidden", marginBottom:24 }}>
        {fields.map((f, i) => (
          <div key={i} onClick={() => setEditField({ label: f.label, value: f.value, onSave: f.onSave })} style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", borderTop:i>0?`1px solid ${C.border}`:"none", cursor:"pointer" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:10.5, color:C.text2, fontWeight:600, marginBottom:3 }}>{f.label}</div>
              <div style={{ fontSize:13.5, fontWeight:700, color:C.text }}>{f.value}</div>
            </div>
            <Chev dir="right" size={13}/>
          </div>
        ))}
      </div>

      <button onClick={() => { toast("Profile saved! ✓"); navigate("profile"); }} style={{ width:"100%", padding:16, borderRadius:18, border:"none", background:`linear-gradient(135deg,${C.gold},${C.goldBright})`, color:"#000", fontSize:15, fontWeight:800, cursor:"pointer" }}>
        Save Changes
      </button>
    </div>
  );
}

// ─── RECOVERY PLAYER ─────────────────────────────────────────────────────────
function RecoveryPlayer({ navigate, toast }: { navigate: (s: Screen) => void; toast: (m: string) => void }) {
  const C = useC();
  const [playing, setPlaying] = useState(false);
  const [secs, setSecs] = useState(600);
  const [step, setStep] = useState(0);
  const [audioOn, setAudioOn] = useState(true);
  const ref = useRef<ReturnType<typeof setInterval>|null>(null);

  useEffect(() => {
    if (playing) { ref.current = setInterval(() => setSecs(s => { if (s<=1) { setPlaying(false); toast("Session complete! 🧘"); return 0; } return s-1; }), 1000); }
    else { if (ref.current) clearInterval(ref.current); }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [playing]);

  const mm = String(Math.floor(secs/60)).padStart(2,"0");
  const ss2 = String(secs%60).padStart(2,"0");
  const pct = (600-secs)/600;

  const steps = [
    {name:"Hamstring Stretch",   dur:"2:00",cue:"Sit on the floor, extend right leg, reach forward and hold.",    muscle:"Legs",c:C.red},
    {name:"Hip Flexor Lunge",    dur:"2:30",cue:"Step into a lunge, drop back knee to the mat, press hips forward.",muscle:"Hips / Legs",c:C.orangeA},
    {name:"Pigeon Pose",         dur:"2:00",cue:"From all-fours, slide right knee toward right wrist and sink.",   muscle:"Glutes",c:C.gold},
    {name:"Cat-Cow Flow",        dur:"1:30",cue:"Arch and round spine in sync with breath, 8 reps.",              muscle:"Core / Back",c:C.green},
    {name:"Child's Pose Hold",   dur:"2:00",cue:"Kneel and fold forward, arms stretched long, breathe deeply.",   muscle:"Back / Shoulders",c:C.paleGold},
  ];

  return (
    <div style={{ height:"100%", overflowY:"auto", padding:"20px 20px 96px", scrollbarWidth:"none", background:C.bg }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
        <button onClick={() => navigate("recovery")} style={{ width:38, height:38, borderRadius:12, background:C.card, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}><Chev dir="left" size={16}/></button>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:13, color:C.text2 }}>Guided Session</p>
          <h2 style={{ fontSize:20, fontWeight:800, color:C.text }}>Recovery Routine</h2>
        </div>
        <button onClick={() => { setAudioOn(v=>!v); toast(audioOn?"Audio off":"Audio on"); }} style={{ width:38, height:38, borderRadius:12, background:audioOn?C.goldMuted:C.card, border:`1px solid ${audioOn?C.goldBorder:C.border}`, color:audioOn?C.gold:C.text2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d={audioOn?"M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14":"M23 9l-6 6M17 9l6 6"}/></svg>
        </button>
      </div>

      <GCard style={{ textAlign:"center", padding:"28px 24px", border:`1px solid ${C.goldBorder}`, boxShadow:`0 0 30px rgba(245,196,0,.15)`, marginBottom:16 }}>
        <p style={{ fontSize:11.5, fontWeight:700, color:C.text2, letterSpacing:".5px", marginBottom:20 }}>SESSION TIMER</p>
        <div style={{ position:"relative", width:160, height:160, margin:"0 auto 20px" }}>
          <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform:"rotate(-90deg)", display:"block" }}>
            <circle cx="80" cy="80" r="70" fill="none" stroke={C.card2} strokeWidth="11"/>
            <circle cx="80" cy="80" r="70" fill="none" stroke="url(#tGrad)" strokeWidth="11" strokeLinecap="round" strokeDasharray={2*Math.PI*70} strokeDashoffset={2*Math.PI*70*(1-pct)} style={{ transition:"stroke-dashoffset 1s linear" }}/>
            <defs><linearGradient id="tGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={C.gold}/><stop offset="100%" stopColor={C.amber}/></linearGradient></defs>
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontSize:36, fontFamily:"'JetBrains Mono',monospace", fontWeight:600, color:C.gold, lineHeight:1 }}>{mm}:{ss2}</span>
            <span style={{ fontSize:12, color:C.text2, marginTop:4 }}>remaining</span>
          </div>
        </div>
        <div style={{ display:"flex", gap:14, justifyContent:"center", alignItems:"center" }}>
          <button onClick={() => setStep(s => Math.max(0,s-1))} style={{ width:48, height:48, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.card2, color:C.text2, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L8 12l11-8v16zM5 4v16" /></svg>
          </button>
          <button onClick={() => setPlaying(p=>!p)} style={{ width:70, height:70, borderRadius:"50%", border:"none", background:`linear-gradient(135deg,${C.gold},${C.goldBright})`, color:"#000", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 24px rgba(245,196,0,.5)` }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">{playing?<><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></>:<path d="M8 5v14l11-7z"/>}</svg>
          </button>
          <button onClick={() => setStep(s => Math.min(steps.length-1,s+1))} style={{ width:48, height:48, borderRadius:"50%", border:`1px solid ${C.border}`, background:C.card2, color:C.text2, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l11 8-11 8V4zM19 4v16"/></svg>
          </button>
        </div>
      </GCard>

      <GCard style={{ border:`1.5px solid ${steps[step].c}40`, background:`${steps[step].c}08`, marginBottom:14 }}>
        <div style={{ display:"flex", gap:14 }}>
          <div style={{ width:46, height:46, borderRadius:14, background:`${steps[step].c}18`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={steps[step].c} strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
              <p style={{ fontSize:15, fontWeight:800, color:C.text }}>Now: {steps[step].name}</p>
              <span style={{ fontSize:10, fontWeight:700, color:steps[step].c, padding:"3px 9px", borderRadius:99, background:`${steps[step].c}18` }}>{steps[step].dur}</span>
            </div>
            <p style={{ fontSize:12, color:C.text2, lineHeight:1.55 }}>{steps[step].cue}</p>
            <p style={{ fontSize:11, color:steps[step].c, fontWeight:600, marginTop:6 }}>Targets: {steps[step].muscle}</p>
          </div>
        </div>
      </GCard>

      <SHead title="All Steps"/>
      {steps.map((s,i) => (
        <GCard key={i} onClick={() => setStep(i)} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8, padding:14, border:i===step?`1.5px solid ${s.c}40`:`1px solid ${C.border}`, cursor:"pointer" }}>
          <div style={{ width:38, height:38, borderRadius:12, background:i<step?C.greenMuted:i===step?`${s.c}20`:C.card2, border:`1.5px solid ${i<step?C.green:i===step?s.c:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:i<step?C.green:i===step?s.c:C.text2, fontWeight:800, fontSize:13 }}>
            {i<step?"✓":i+1}
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:13, fontWeight:700, color:i===step?C.text:C.text2, marginBottom:2 }}>{s.name}</p>
            <p style={{ fontSize:11, color:C.text2 }}>{s.muscle}</p>
          </div>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:600, color:i===step?s.c:C.text2 }}>{s.dur}</span>
        </GCard>
      ))}
      <button onClick={() => { navigate("recovery"); toast("Recovery session complete! 🎉 +15 pts"); }} style={{ width:"100%", marginTop:8, padding:16, borderRadius:18, border:"none", background:`linear-gradient(135deg,${C.gold},${C.goldBright})`, color:"#000", fontSize:15, fontWeight:800, cursor:"pointer" }}>Finish Recovery Session ✓</button>
    </div>
  );
}

// ─── QUICK LOG MODAL ──────────────────────────────────────────────────────────
function QuickModal({ onClose, navigate, toast }: { onClose: () => void; navigate: (s: Screen) => void; toast: (m: string) => void }) {
  const C = useC();
  const opts = [
    { icon:"M6.5 6.5l11 11M2 8l3-3m14 14l3-3M7 17l-3 3M17 7l3-3", label:"Log Workout",  sub:"Start a training session",  c:C.gold,    bg:C.goldMuted,  action:() => { onClose(); navigate("workout"); } },
    { icon:"M12 2l3 7h7l-5.5 4.5L18.5 21 12 16.5 5.5 21l2-7.5L2 9h7z", label:"Log Nutrition", sub:"Track calories & macros", c:C.orangeA, bg:C.amberMuted, action:() => { onClose(); toast("Nutrition log coming soon!"); } },
    { icon:"M12 2s6 6.5 6 11a6 6 0 1 1-12 0c0-4.5 6-11 6-11z",     label:"Log Water",    sub:"Quick hydration log",      c:C.darkGold, bg:"rgba(202,138,4,.13)", action:() => { onClose(); toast("+250ml water logged! 💧"); } },
    { icon:"M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z",            label:"Record Sleep",  sub:"Log sleep quality",       c:C.paleGold, bg:"rgba(253,230,138,.13)", action:() => { onClose(); toast("Sleep log coming soon!"); } },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.65)", backdropFilter:"blur(5px)", zIndex:50 }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, zIndex:51, background:C.card, borderRadius:"24px 24px 0 0", padding:"20px 20px 44px", border:`1px solid ${C.border}`, boxShadow:"0 -24px 64px rgba(0,0,0,.5)" }}>
        <div style={{ width:40, height:4, borderRadius:2, background:C.card2, margin:"0 auto 22px" }}/>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
          <div>
            <h3 style={{ fontSize:20, fontWeight:800, color:C.text }}>Quick Log</h3>
            <p style={{ fontSize:12, color:C.text2, marginTop:3 }}>What would you like to track?</p>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:12, background:C.card2, border:`1px solid ${C.border}`, color:C.text2, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {opts.map((o,i) => (
            <div key={i} onClick={o.action} style={{ padding:"18px 16px", borderRadius:18, background:o.bg, border:`1px solid ${o.c}22`, cursor:"pointer" }}>
              <div style={{ width:40, height:40, borderRadius:12, background:`${o.c}22`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={o.c} strokeWidth="2" strokeLinecap="round"><path d={o.icon}/></svg>
              </div>
              <p style={{ fontSize:13, fontWeight:700, marginBottom:4, color:C.text }}>{o.label}</p>
              <p style={{ fontSize:11, color:C.text2, lineHeight:1.4 }}>{o.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ tab, onTab, onFab }: { tab: Tab; onTab: (t: Tab) => void; onFab: () => void }) {
  const C = useC();
  const left = [
    { id:"home" as Tab,     label:"Home",     icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg> },
    { id:"workout" as Tab,  label:"Workout",  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5l11 11M2 8l3-3m14 14l3-3M7 17l-3 3M17 7l3-3"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/></svg> },
  ];
  const right = [
    { id:"recovery" as Tab, label:"Recovery", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-9-4.5-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 4.5-9 9-9 9z"/></svg> },
    { id:"profile" as Tab,  label:"Profile",  icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg> },
  ];
  function NavBtn({ id, label, icon }: { id: Tab; label: string; icon: React.ReactNode }) {
    const isActive = tab === id;
    return (
      <button onClick={() => onTab(id)} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:3, color:isActive?C.gold:C.text2, fontSize:10, fontWeight:600, background:isActive?"rgba(245,196,0,.1)":"transparent", border:"none", cursor:"pointer", padding:"8px 14px", borderRadius:16 }}>
        {icon}{label}
      </button>
    );
  }
  return (
    <div style={{ position:"absolute", bottom:0, left:0, right:0, height:80, background:C.navBg, backdropFilter:"blur(20px)", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", zIndex:30, paddingBottom:6 }}>
      {left.map(t => <NavBtn key={t.id} {...t}/>)}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
        <button onClick={onFab} style={{ width:52, height:52, borderRadius:"50%", border:"none", background:`linear-gradient(135deg,${C.gold},${C.amber})`, color:"#000", fontSize:28, fontWeight:300, lineHeight:1, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", marginTop:-26, boxShadow:`0 0 0 4px ${C.bg},0 10px 24px rgba(245,196,0,.6)` }}>+</button>
        <span style={{ fontSize:10, fontWeight:600, color:C.text2, marginTop:2 }}>Log</span>
      </div>
      {right.map(t => <NavBtn key={t.id} {...t}/>)}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [tab, setTab] = useState<Tab>("home");
  const [modal, setModal] = useState(false);
  const [unreadNotif, setUnreadNotif] = useState(3);
  const [theme, setThemeState] = useState<AppTheme>("dark");
  const [colors, setColors] = useState<Colors>(() => makeColors("dark"));
  const [toastMsg, setToastMsg] = useState<string|null>(null);
  const [userName, setUserName] = useState("Anushka");
  const [userEmail, setUserEmail] = useState("anushka@email.com");
  const [editField, setEditField] = useState<null|{label:string;value:string;onSave:(v:string)=>void}>(null);

  function toast(msg: string) { setToastMsg(msg); }

  function setTheme(t: AppTheme) {
    setThemeState(t);
    const mode = t === "system"
      ? (window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : t;
    setColors(makeColors(mode));
  }

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setColors(makeColors(mq.matches ? "dark" : "light"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function navigate(s: Screen) {
    setScreen(s);
    if (s === "dashboard") setTab("home");
    else if (s === "workout") setTab("workout");
    else if (s === "recovery" || s === "recovery-player") setTab("recovery");
    else if (s === "profile") setTab("profile");
    else if (s === "edit-profile") setTab("profile");
  }

  function handleTab(t: Tab) {
    setTab(t);
    setScreen(t === "home" ? "dashboard" : t as Screen);
  }

  return (
    <ThemeCtx.Provider value={colors}>
      <div style={{ width:"100vw", height:"100svh", background:colors.bg, fontFamily:"'Manrope', sans-serif", color:colors.text, display:"flex", flexDirection:"column", overflow:"hidden", position:"relative", transition:"background .3s, color .3s" }}>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          body, html { margin: 0; padding: 0; }
          ::-webkit-scrollbar { display: none; }
          button { font-family: 'Manrope', sans-serif; }
          p, h1, h2, h3, h4 { margin: 0; padding: 0; }
          input { transition: border-color .2s; }
          input:focus { outline: none; border-color: #F5C400 !important; }
          @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes breathe { 0%,100%{filter:drop-shadow(0 0 4px rgba(250,204,21,.3))} 50%{filter:drop-shadow(0 0 14px rgba(250,204,21,.65))} }
          @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
          @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
          @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        `}</style>

        {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)}/>}

        <div style={{ flex:1, overflow:"hidden", position:"relative" }}>
          <div key={screen} style={{ position:"absolute", inset:0, animation:"fadeUp .22s ease both" }}>
            {screen === "dashboard"        && <Dashboard navigate={navigate} unreadNotif={unreadNotif} setUnreadNotif={setUnreadNotif} toast={toast} userName={userName}/>}
            {screen === "workout"          && <Workout navigate={navigate} toast={toast}/>}
            {screen === "recovery"         && <Recovery navigate={navigate} toast={toast}/>}
            {screen === "profile"          && <Profile navigate={navigate} theme={theme} setTheme={setTheme} toast={toast} userName={userName} userEmail={userEmail} setEditField={setEditField}/>}
            {screen === "recovery-player"  && <RecoveryPlayer navigate={navigate} toast={toast}/>}
            {screen === "notifications"    && <Notifications navigate={navigate}/>}
            {screen === "edit-profile"     && <EditProfile navigate={navigate} toast={toast} userName={userName} setUserName={setUserName} userEmail={userEmail} setUserEmail={setUserEmail} setEditField={setEditField}/>}
          </div>
        </div>

        {editField && (
          <EditModal
            label={editField.label}
            value={editField.value}
            onSave={editField.onSave}
            onClose={() => setEditField(null)}
          />
        )}

        <div style={{ position:"relative", flexShrink:0, zIndex:20 }}>
          <BottomNav tab={tab} onTab={handleTab} onFab={() => setModal(true)}/>
        </div>

        {modal && (
          <div style={{ position:"absolute", inset:0, zIndex:50, animation:"slideUp .25s ease both" }}>
            <QuickModal onClose={() => setModal(false)} navigate={(s) => { setModal(false); navigate(s); }} toast={toast}/>
          </div>
        )}
      </div>
    </ThemeCtx.Provider>
  );
}
