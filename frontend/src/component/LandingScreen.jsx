import { useState } from "react";
import {useNavigate} from "react-router-dom";

const BG = "#071a0e";
const BG_CARD = "#0c2116";
const BG_CARD_HOVER = "#102a1c";
const GREEN = "#4ade80";
const BORDER = "rgba(74,222,128,0.18)";
const MUTED = "rgba(255,255,255,0.55)";

const RecycleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5" />
    <path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12" />
    <path d="m14 16-3 3 3 3" />
    <path d="M8.293 13.596 7.196 9.5 3.1 10.598" />
    <path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843" />
    <path d="m13.378 9.633 4.096 1.098 1.097-4.096" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const stats = [
  { value: "24,310", label: "Active Users" },
  { value: "148,920", label: "Devices Collected" },
  { value: "2.4M kg", label: <>CO<sub>2</sub> Saved</> },
  { value: "99%", label: "Satisfaction Rate" },
];

const features = [
  {
    icon: "📅",
    title: "Schedule Pickup",
    description: "Book a free doorstep e-waste collection in minutes",
  },
  {
    icon: "🎁",
    title: "Earn EcoPoints",
    description: "Get rewarded for every device you responsibly recycle",
  },
  {
    icon: "🌍",
    title: "Track Impact",
    description: "See your CO₂ savings and environmental contribution",
  },
];

const howItWorks = [
  { step: "01", title: "Book a Pickup", desc: "Choose a time slot and we'll come to your door — fully free of charge." },
  { step: "02", title: "Hand Over Devices", desc: "Give us your old electronics. We handle certified, data-safe recycling." },
  { step: "03", title: "Earn & Redeem", desc: "EcoPoints land in your account instantly. Spend them on rewards you love." },
];

const testimonials = [
  { name: "Sarah K.", handle: "@sarahk_eco", text: "Scheduled a pickup in under 2 minutes. Got my EcoPoints the same day. This is how recycling should work!", avatar: "SK" },
  { name: "Marcus T.", handle: "@marcust", text: "Finally a service that makes you feel good about throwing old tech away. My CO₂ dashboard is genuinely motivating.", avatar: "MT" },
  { name: "Priya L.", handle: "@priyalives", text: "Redeemed my points for a gift card last week. Best part? I'm actually helping the planet while doing it.", avatar: "PL" },
];


export default function EcoRecycleLanding() {
  const [hoveredCard, setHoveredCard] = useState(null);
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: BG,
        minHeight: "100vh",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        color: "white",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* Dot grid background */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(74,222,128,0.07) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Decorative glow circle — top right */}
      <div style={{ position: "absolute", top: "-220px", right: "-220px", width: "580px", height: "580px", borderRadius: "50%", border: "1px solid rgba(74,222,128,0.12)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", top: "-140px", right: "-140px", width: "400px", height: "400px", borderRadius: "50%", border: "1px solid rgba(74,222,128,0.08)", pointerEvents: "none", zIndex: 0 }} />

      {/* Decorative glow circle — bottom left */}
      <div style={{ position: "absolute", bottom: "10%", left: "-220px", width: "520px", height: "520px", borderRadius: "50%", border: "1px solid rgba(74,222,128,0.1)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── NAVBAR ── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 48px",
          position: "relative",
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <RecycleIcon />
          <span style={{ color: GREEN, fontWeight: 700, fontSize: "17px", letterSpacing: "-0.3px" }}>
            EcoRecycle
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
          onClick={() => navigate('/login')}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              padding: "9px 22px",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
            
          >
            Sign In
          </button>
          <button
          onClick={() => navigate('/login', { state: { tab: 'register' } })}
            style={{
              background: GREEN,
              border: "none",
              color: "#071a0e",
              padding: "9px 22px",
              borderRadius: "9999px",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        style={{
          textAlign: "center",
          padding: "80px 24px 56px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* Badge pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(74,222,128,0.1)",
            border: "1px solid rgba(74,222,128,0.3)",
            borderRadius: "9999px",
            padding: "7px 18px",
            fontSize: "13px",
            color: GREEN,
            marginBottom: "32px",
          }}
        >
          🏆 Join 24,000+ eco warriors
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(44px, 7vw, 76px)",
            fontWeight: 800,
            lineHeight: 1.08,
            margin: "0 0 28px",
            letterSpacing: "-1.5px",
          }}
        >
          <span style={{ display: "block", color: "white" }}>Recycle Smart.</span>
          <span style={{ display: "block", color: GREEN }}>Earn Rewards.</span>
          <span style={{ display: "block", color: "white" }}>Save the Planet.</span>
        </h1>

        {/* Subheading */}
        <p
          style={{
            color: MUTED,
            fontSize: "16px",
            lineHeight: 1.7,
            maxWidth: "420px",
            margin: "0 auto 42px",
          }}
        >
          Schedule free e-waste pickups from your door. Earn EcoPoints redeemable
          for real rewards. Track your environmental impact.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate('/login', { state: { tab: 'register' } })}
            style={{
              background: GREEN,
              border: "none",
              color: "#071a0e",
              padding: "14px 32px",
              borderRadius: "9999px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🚀 Get Started Free
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "white",
              padding: "14px 32px",
              borderRadius: "9999px",
              fontSize: "15px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* ── STATS ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          maxWidth: "780px",
          margin: "0 auto 90px",
          padding: "0 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {stats.map((s, i) => (
          <div
            key={i}
            style={{
              textAlign: "center",
              padding: "20px 12px",
              borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}
          >
            <div
              style={{
                fontSize: "clamp(22px, 3.5vw, 32px)",
                fontWeight: 700,
                color: GREEN,
                marginBottom: "5px",
                letterSpacing: "-0.5px",
              }}
            >
              {s.value}
            </div>
            <div style={{ fontSize: "12px", color: MUTED }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          maxWidth: "860px",
          margin: "0 auto 100px",
          padding: "0 24px",
          gap: "18px",
          position: "relative",
          zIndex: 10,
        }}
      >
        {features.map((f, i) => (
          <div
            key={i}
            onMouseEnter={() => setHoveredCard(i)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              background: hoveredCard === i ? BG_CARD_HOVER : BG_CARD,
              border: `1px solid ${hoveredCard === i ? "rgba(74,222,128,0.3)" : BORDER}`,
              borderRadius: "18px",
              padding: "36px 24px 32px",
              textAlign: "center",
              transition: "background 0.2s, border-color 0.2s",
              cursor: "default",
            }}
          >
            <div style={{ fontSize: "38px", marginBottom: "18px" }}>{f.icon}</div>
            <h3 style={{ fontWeight: 700, fontSize: "15px", margin: "0 0 10px", color: "white" }}>
              {f.title}
            </h3>
            <p style={{ color: MUTED, fontSize: "13px", lineHeight: 1.65, margin: 0 }}>
              {f.description}
            </p>
          </div>
        ))}
      </div>

      {/* ── HOW IT WORKS ── */}
      <section
        style={{
          maxWidth: "860px",
          margin: "0 auto 100px",
          padding: "0 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <p style={{ color: GREEN, fontSize: "13px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
            Simple Process
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: 0, letterSpacing: "-0.8px" }}>
            How EcoRecycle Works
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {howItWorks.map((item, i) => (
            <div
              key={i}
              style={{
                background: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: "18px",
                padding: "32px 24px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: GREEN,
                  letterSpacing: "0.5px",
                  marginBottom: "14px",
                  opacity: 0.8,
                }}
              >
                {item.step}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: "16px", margin: "0 0 10px", color: "white" }}>
                {item.title}
              </h3>
              <p style={{ color: MUTED, fontSize: "13px", lineHeight: 1.65, margin: 0 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section
        style={{
          maxWidth: "860px",
          margin: "0 auto 100px",
          padding: "0 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "52px" }}>
          <p style={{ color: GREEN, fontSize: "13px", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "12px" }}>
            Community Love
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, margin: 0, letterSpacing: "-0.8px" }}>
            What Our Eco Warriors Say
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "18px" }}>
          {testimonials.map((t, i) => (
            <div
              key={i}
              style={{
                background: BG_CARD,
                border: `1px solid ${BORDER}`,
                borderRadius: "18px",
                padding: "28px 24px",
              }}
            >
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.7, margin: "0 0 22px" }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "rgba(74,222,128,0.15)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: GREEN,
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "13px" }}>{t.name}</div>
                  <div style={{ color: MUTED, fontSize: "12px" }}>{t.handle}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        style={{
          maxWidth: "860px",
          margin: "0 auto 80px",
          padding: "0 24px",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          style={{
            background: "rgba(74,222,128,0.08)",
            border: `1px solid rgba(74,222,128,0.25)`,
            borderRadius: "24px",
            padding: "64px 48px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 800,
              margin: "0 0 16px",
              letterSpacing: "-0.8px",
            }}
          >
            Ready to Make a Difference?
          </h2>
          <p style={{ color: MUTED, fontSize: "16px", lineHeight: 1.6, margin: "0 auto 36px", maxWidth: "380px" }}>
            Join 24,000+ eco warriors already recycling smart and earning rewards.
          </p>
          <button
            onClick={() => navigate('/login', { state: { tab: 'register' } })}
            style={{
              background: GREEN,
              border: "none",
              color: "#071a0e",
              padding: "14px 36px",
              borderRadius: "9999px",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🌿 Start Recycling Today
          </button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "32px 48px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 10,
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <RecycleIcon />
          <span style={{ color: GREEN, fontWeight: 700, fontSize: "15px" }}>EcoRecycle</span>
        </div>
        <p style={{ color: MUTED, fontSize: "13px", margin: 0 }}>
          © 2026 EcoRecycle. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: "24px" }}>
          {["Privacy", "Terms", "Contact"].map((link) => (
            <a key={link} href="#" style={{ color: MUTED, fontSize: "13px", textDecoration: "none" }}>
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
