import React, { useMemo, useState, useEffect, useRef } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const RECIPES = [
  {
    id: "soft-boiled",
    name: "Soft-Boiled Eggs",
    category: "Boiled",
    time: 6,
    servings: "2 eggs",
    emoji: "🥚",
    description: "Jammy yolks, tender whites, and perfect for toast or ramen.",
    ingredients: ["2 large eggs", "Water", "Ice", "Pinch of salt"],
    steps: [
      { text: "Bring a pot of water to a gentle boil.", minutes: 0 },
      { text: "Lower eggs into the water carefully.", minutes: 0 },
      { text: "Boil for jammy yolks.", minutes: 6 },
      { text: "Move eggs to an ice bath.", minutes: 3 },
      { text: "Peel and serve immediately.", minutes: 0 },
    ],
  },
  {
    id: "hard-boiled",
    name: "Hard-Boiled Eggs",
    category: "Boiled",
    time: 12,
    servings: "6 eggs",
    emoji: "🥚",
    description: "Firm yolks for meal prep, salads, snacks, and deviled eggs.",
    ingredients: ["6 large eggs", "Water", "Ice", "Salt"],
    steps: [
      { text: "Place eggs in a saucepan and cover with cold water.", minutes: 0 },
      { text: "Bring to a boil, then reduce to a steady simmer.", minutes: 0 },
      { text: "Cook until yolks are fully set.", minutes: 12 },
      { text: "Transfer to an ice bath.", minutes: 5 },
      { text: "Peel or refrigerate for later.", minutes: 0 },
    ],
  },
  {
    id: "scrambled",
    name: "Creamy Scrambled Eggs",
    category: "Pan",
    time: 5,
    servings: "2 servings",
    emoji: "🍳",
    description: "Low-and-slow scrambled eggs with a soft, creamy texture.",
    ingredients: ["4 large eggs", "1 tbsp butter", "2 tbsp milk or cream", "Salt", "Black pepper", "Chives, optional"],
    steps: [
      { text: "Whisk eggs with milk, salt, and pepper.", minutes: 0 },
      { text: "Melt butter in a nonstick pan over low heat.", minutes: 1 },
      { text: "Cook gently, stirring often with a spatula.", minutes: 4 },
      { text: "Remove from heat while still slightly glossy.", minutes: 0 },
      { text: "Top with chives and serve.", minutes: 0 },
    ],
  },
  {
    id: "omelette",
    name: "Classic Omelette",
    category: "Pan",
    time: 8,
    servings: "1 omelette",
    emoji: "🍳",
    description: "A simple folded omelette with cheese and herbs.",
    ingredients: ["3 large eggs", "1 tbsp butter", "2 tbsp shredded cheese", "Salt", "Black pepper", "Parsley or chives"],
    steps: [
      { text: "Beat eggs with salt and pepper.", minutes: 0 },
      { text: "Heat butter in a nonstick pan over medium-low heat.", minutes: 1 },
      { text: "Pour eggs in and gently stir until edges set.", minutes: 3 },
      { text: "Add cheese and fold the omelette.", minutes: 2 },
      { text: "Rest briefly, garnish, and serve.", minutes: 2 },
    ],
  },
  {
    id: "poached",
    name: "Poached Eggs",
    category: "Boiled",
    time: 4,
    servings: "2 eggs",
    emoji: "💧",
    description: "Delicate whites with runny yolks for toast, salads, and Benedict.",
    ingredients: ["2 large eggs", "Water", "1 tbsp vinegar", "Salt"],
    steps: [
      { text: "Bring water to a bare simmer and add vinegar.", minutes: 0 },
      { text: "Crack each egg into a small cup.", minutes: 0 },
      { text: "Create a gentle swirl and slide in the egg.", minutes: 0 },
      { text: "Poach until whites are set and yolks are soft.", minutes: 4 },
      { text: "Lift with a slotted spoon and season.", minutes: 0 },
    ],
  },
  {
    id: "fried",
    name: "Sunny-Side-Up Eggs",
    category: "Pan",
    time: 4,
    servings: "2 eggs",
    emoji: "☀️",
    description: "Crisp edges, set whites, and bright runny yolks.",
    ingredients: ["2 large eggs", "1 tbsp butter or oil", "Salt", "Black pepper"],
    steps: [
      { text: "Heat butter or oil in a nonstick pan over medium-low heat.", minutes: 1 },
      { text: "Crack eggs into the pan without breaking yolks.", minutes: 0 },
      { text: "Cook until whites are set but yolks remain runny.", minutes: 3 },
      { text: "Season and serve immediately.", minutes: 0 },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function playAlarm() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    [0, 0.22, 0.44].forEach((d) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime + d);
      osc.connect(gain);
      osc.start(ctx.currentTime + d);
      osc.stop(ctx.currentTime + d + 0.16);
    });
  } catch (_) {}
}

// ─── Styles (CSS-in-JS objects) ───────────────────────────────────────────────

const css = {
  // Layout
  page: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #F0F9FF 0%, #EFF6FF 40%, #EEF4FF 100%)",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#1E293B",
  },
  maxW: { maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem" },

  // Nav
  nav: {
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid #BFDBFE",
    padding: "0 2rem",
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 800,
    fontSize: "1.1rem",
    color: "#1D4ED8",
    letterSpacing: "-0.3px",
  },
  navLogoIcon: {
    width: 34, height: 34,
    background: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
    borderRadius: 10,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 17,
  },
  navBadge: {
    background: "#DBEAFE",
    color: "#1D4ED8",
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: 100,
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav style={css.nav}>
      <div style={css.navLogo}>
        <div style={css.navLogoIcon}>🥚</div>
        Bi thích ăng trứng
      </div>
      <span style={css.navBadge}>{RECIPES.length} Recipes</span>
    </nav>
  );
}

function RecipeCard({ recipe, onSelect }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => onSelect(recipe.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#FFFFFF",
        border: `1.5px solid ${hovered ? "#93C5FD" : "#BFDBFE"}`,
        borderRadius: 20,
        padding: "1.4rem",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        minHeight: 280,
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered
          ? "0 8px 32px rgba(37,99,235,0.15)"
          : "0 1px 4px rgba(37,99,235,0.07)",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div style={{
          width: 46, height: 46,
          background: "#EFF6FF",
          border: "1.5px solid #BFDBFE",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          {recipe.emoji}
        </div>
        <span style={{
          background: "#EFF6FF",
          color: "#1D4ED8",
          border: "1px solid #BFDBFE",
          fontSize: 12, fontWeight: 600,
          padding: "4px 12px", borderRadius: 100,
        }}>
          {recipe.category}
        </span>
      </div>

      {/* Title & description */}
      <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "#0F172A", marginBottom: "0.4rem" }}>
        {recipe.name}
      </div>
      <div style={{
        fontSize: 14, color: "#475569", lineHeight: 1.65,
        flex: 1,
        display: "-webkit-box", WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {recipe.description}
      </div>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1.25rem" }}>
        <div style={{ display: "flex", gap: 12, fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>
          <span>⏱ {recipe.time} min</span>
          <span>{recipe.servings}</span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(recipe.id); }}
          style={{
            background: "#2563EB",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "9px 18px",
            fontSize: 14, fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(37,99,235,0.28)",
            transition: "background 0.15s",
          }}
        >
          Open →
        </button>
      </div>
    </div>
  );
}

function IngredientChecklist({ recipe }) {
  const [checked, setChecked] = useState({});

  useEffect(() => setChecked({}), [recipe.id]);

  const toggle = (ing) => setChecked((prev) => ({ ...prev, [ing]: !prev[ing] }));
  const done = recipe.ingredients.filter((i) => checked[i]).length;

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #BFDBFE",
      borderRadius: 20, padding: "1.4rem",
      boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #DBEAFE" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Ingredients</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{done} of {recipe.ingredients.length} ready</div>
        </div>
        <div style={{
          width: 36, height: 36, background: "#EFF6FF", border: "1px solid #BFDBFE",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>🛒</div>
      </div>

      {/* List */}
      {recipe.ingredients.map((ing) => (
        <button
          key={ing}
          onClick={() => toggle(ing)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px",
            background: checked[ing] ? "#EFF6FF" : "#F8FAFC",
            border: `1px solid ${checked[ing] ? "#BFDBFE" : "#F1F5F9"}`,
            borderRadius: 10, cursor: "pointer", marginBottom: 6,
            textAlign: "left", fontFamily: "inherit", fontSize: 14,
            color: checked[ing] ? "#94A3B8" : "#334155",
            textDecoration: checked[ing] ? "line-through" : "none",
            transition: "all 0.15s",
          }}
        >
          <div style={{
            width: 20, height: 20,
            border: checked[ing] ? "2px solid #2563EB" : "2px solid #CBD5E1",
            borderRadius: "50%",
            background: checked[ing] ? "#2563EB" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, transition: "all 0.15s",
          }}>
            {checked[ing] && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
          </div>
          {ing}
        </button>
      ))}
    </div>
  );
}

function RecipeTimer({ defaultMinutes, label }) {
  const initialSeconds = defaultMinutes * 60;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const alarmPlayed = useRef(false);

  useEffect(() => {
    setSeconds(initialSeconds);
    setRunning(false);
    alarmPlayed.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (!running) return;
    if (seconds <= 0) {
      setRunning(false);
      if (!alarmPlayed.current) { playAlarm(); alarmPlayed.current = true; }
      return;
    }
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running, seconds]);

  const adjust = (delta) => {
    setSeconds((s) => Math.max(0, s + delta));
    alarmPlayed.current = false;
  };
  const toggle = () => {
    if (seconds > 0) { alarmPlayed.current = false; setRunning((r) => !r); }
  };
  const reset = () => {
    setSeconds(initialSeconds);
    setRunning(false);
    alarmPlayed.current = false;
  };

  const done = seconds <= 0;

  const btnBase = {
    padding: "9px 8px", borderRadius: 10,
    border: "1.5px solid #BFDBFE", background: "#fff",
    fontFamily: "inherit", fontSize: 13, fontWeight: 600,
    cursor: "pointer", color: "#1D4ED8",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
    transition: "background 0.15s",
  };
  const btnPrimary = {
    ...btnBase,
    background: "#2563EB", borderColor: "#2563EB", color: "#fff",
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  };

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #BFDBFE",
      borderRadius: 20, padding: "1.4rem",
      boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid #DBEAFE" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>Timer</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{label}</div>
        </div>
        <div style={{
          width: 36, height: 36, background: "#EFF6FF", border: "1px solid #BFDBFE",
          borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
        }}>⏱</div>
      </div>

      {/* Display */}
      <div style={{
        textAlign: "center",
        fontSize: "3rem", fontWeight: 800, letterSpacing: 2,
        color: done ? "#93C5FD" : "#1D4ED8",
        background: "#EFF6FF", border: "1.5px solid #BFDBFE",
        borderRadius: 14, padding: "0.5rem 1rem", marginBottom: "0.75rem",
      }}>
        {formatTime(seconds)}
      </div>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.5fr 1fr", gap: 6 }}>
        <button style={btnBase} onClick={() => adjust(-60)}>−1 min</button>
        <button style={btnBase} onClick={() => adjust(60)}>+1 min</button>
        <button style={btnPrimary} onClick={toggle}>
          {running ? (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause</>
          ) : (
            <><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21"/></svg> Start</>
          )}
        </button>
        <button style={btnBase} onClick={reset}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Recipe Page ──────────────────────────────────────────────────────────────

function RecipePage({ recipe, onBack }) {
  const mainTimerMinutes = recipe.steps.find((s) => s.minutes > 0)?.minutes || recipe.time;

  return (
    <main style={{ background: "linear-gradient(145deg, #F0F9FF 0%, #EFF6FF 40%, #EEF4FF 100%)", minHeight: "100vh" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.5rem 3rem" }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#fff", border: "1.5px solid #BFDBFE", color: "#1D4ED8",
            borderRadius: 10, padding: "9px 18px",
            fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            cursor: "pointer", marginBottom: "1.5rem",
            boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
          Back to all recipes
        </button>

        {/* Hero header */}
        <div style={{
          background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
          borderRadius: 22, padding: "2rem 2.5rem",
          color: "#fff", marginBottom: "1.5rem",
          boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,0.2)",
            padding: "5px 14px", borderRadius: 100,
            fontSize: 13, fontWeight: 600, marginBottom: "1rem",
          }}>
            👨‍🍳 Recipe
          </div>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.6rem)", marginBottom: "0.6rem", lineHeight: 1.15 }}>
            {recipe.name}
          </h1>
          <p style={{ opacity: 0.85, fontSize: "1.05rem", lineHeight: 1.65, maxWidth: 520 }}>
            {recipe.description}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "1.25rem" }}>
            {[recipe.category, `${recipe.time} minutes`, recipe.servings].map((pill) => (
              <span key={pill} style={{
                background: "rgba(255,255,255,0.18)",
                padding: "5px 14px", borderRadius: 100,
                fontSize: 13, fontWeight: 500,
              }}>{pill}</span>
            ))}
          </div>
        </div>

        {/* Two panels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <IngredientChecklist recipe={recipe} />
          <RecipeTimer defaultMinutes={mainTimerMinutes} label={recipe.name} />
        </div>

        {/* Steps */}
        <div style={{
          background: "#fff", border: "1.5px solid #BFDBFE",
          borderRadius: 20, padding: "1.75rem",
          boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
        }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.2rem", color: "#0F172A", marginBottom: "1.25rem" }}>
            Cooking steps
          </h2>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recipe.steps.map((step, i) => (
              <li key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 14,
                padding: 14, border: "1px solid #F1F5F9",
                borderRadius: 14, marginBottom: 10,
                background: "#F8FAFC",
              }}>
                <span style={{
                  width: 32, height: 32, background: "#2563EB", color: "#fff",
                  borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.65, flex: 1, marginTop: 5 }}>
                  {step.text}
                </p>
                {step.minutes > 0 ? (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    background: "#DBEAFE", color: "#1E40AF",
                    fontSize: 12, fontWeight: 700,
                    padding: "4px 10px", borderRadius: 100,
                    flexShrink: 0, marginTop: 4,
                  }}>
                    ⏱ {step.minutes} min
                  </span>
                ) : (
                  <span style={{ fontSize: 12, color: "#94A3B8", flexShrink: 0, marginTop: 4 }}>—</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </main>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

function HomePage({ onSelect }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(RECIPES.map((r) => r.category)))],
    []
  );

  const filtered = useMemo(
    () =>
      RECIPES.filter((r) => {
        const q = query.toLowerCase();
        const matchQ = r.name.toLowerCase().includes(q) || r.ingredients.join(" ").toLowerCase().includes(q);
        const matchC = category === "All" || r.category === category;
        return matchQ && matchC;
      }),
    [query, category]
  );

  return (
    <main style={{ minHeight: "100vh", paddingBottom: "3rem" }}>
      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem 0", display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: "1.5rem", alignItems: "center" }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.15, color: "#0F172A", marginBottom: "0.75rem" }}>
            Cook every egg recipe{" "}
            <span style={{ color: "#2563EB" }}>with Hà Huy</span>
          </h1>
          <p style={{ fontSize: "1.05rem", color: "#475569", lineHeight: 1.7, maxWidth: 480 }}>
            Pick a recipe, check off your ingredients, follow the steps, and use the built-in timer — all in one place. Hà Huy iu Khánh Vân
          </p>
        </div>
        <div style={{
          background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
          borderRadius: 22, padding: "1.75rem", color: "#fff",
          boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
        }}>
          <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Recipes included</div> 
          <div style={{ fontWeight: 800, fontSize: "3.5rem", lineHeight: 1 }}>{RECIPES.length}sevennn</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 8, lineHeight: 1.5 }}>
            Boiled, fried, poached, scrambled, and omelette-style.
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div style={{ maxWidth: 1100, margin: "2rem auto", padding: "0 1.5rem", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search recipes or ingredients…"
            style={{
              width: "100%", padding: "12px 16px 12px 44px",
              border: "1.5px solid #BFDBFE", borderRadius: 14,
              fontFamily: "inherit", fontSize: 15,
              background: "#fff", color: "#1E293B", outline: "none",
              boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
            }}
          />
        </div>

        {/* Category pills */}
        <div style={{
          display: "flex", gap: 8, flexWrap: "wrap",
          background: "#fff", border: "1.5px solid #BFDBFE",
          borderRadius: 14, padding: 6,
          boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "6px 16px", borderRadius: 10, border: "none",
                fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                cursor: "pointer", transition: "all 0.18s",
                background: category === cat ? "#2563EB" : "transparent",
                color: category === cat ? "#fff" : "#475569",
                boxShadow: category === cat ? "0 2px 8px rgba(37,99,235,0.3)" : "none",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem",
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.25rem",
        }}>
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onSelect={onSelect} />
          ))}
        </div>
      ) : (
        <div style={{
          maxWidth: 1100, margin: "0 1.5rem",
          background: "#fff", border: "1.5px solid #BFDBFE",
          borderRadius: 20, padding: "3rem", textAlign: "center",
          boxShadow: "0 1px 4px rgba(37,99,235,0.07)",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
          <p style={{ fontWeight: 700, color: "#0F172A", fontSize: "1.05rem" }}>No recipes found</p>
          <p style={{ color: "#94A3B8", fontSize: 14, marginTop: 6 }}>Try searching for egg, butter, cheese, boiled, or pan.</p>
        </div>
      )}
    </main>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function EggKitchen() {
  const [selectedId, setSelectedId] = useState(null);

  const selectedRecipe = RECIPES.find((r) => r.id === selectedId);

  const handleSelect = (id) => {
    setSelectedId(id);
    window.scrollTo(0, 0);
  };
  const handleBack = () => {
    setSelectedId(null);
    window.scrollTo(0, 0);
  };

  return (
    <div style={css.page}>
      <Nav />
      {selectedRecipe ? (
        <RecipePage recipe={selectedRecipe} onBack={handleBack} />
      ) : (
        <HomePage onSelect={handleSelect} />
      )}
    </div>
  );
}