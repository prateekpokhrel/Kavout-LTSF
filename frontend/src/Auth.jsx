import { useEffect, useRef, useState } from "react";

/* tiny helpers */
function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function loadLocal(key, fallback = null) {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try { return JSON.parse(raw); } catch { return fallback; }
}

/* animated ticker tape */
const TICKERS = [
  { sym: "RELIANCE", val: "₹2,847.30", chg: "+1.24%" },
  { sym: "TCS",      val: "₹3,912.55", chg: "+0.87%" },
  { sym: "INFY",     val: "₹1,548.20", chg: "-0.43%" },
  { sym: "HDFC",     val: "₹1,632.80", chg: "+2.11%" },
  { sym: "WIPRO",    val: "₹452.60",   chg: "+0.65%" },
  { sym: "BAJAJ",    val: "₹7,124.00", chg: "-1.02%" },
  { sym: "ADANI",    val: "₹2,390.15", chg: "+3.40%" },
  { sym: "NIFTY50",  val: "₹22,519",   chg: "+0.55%" },
  { sym: "SENSEX",   val: "₹74,119",   chg: "+0.49%" },
  { sym: "ONGC",     val: "₹261.45",   chg: "+1.78%" },
];

function TickerTape() {
  const items = [...TICKERS, ...TICKERS];
  return (
    <div className="ap-ticker-wrap">
      <div className="ap-ticker-track">
        {items.map((t, i) => (
          <span key={i} className="ap-ticker-item">
            <span className="ap-ticker-sym">{t.sym}</span>
            <span className="ap-ticker-val">{t.val}</span>
            <span className={`ap-ticker-chg ${t.chg.startsWith("+") ? "up" : "down"}`}>{t.chg}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function OrbCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = (canvas.width = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 120 + Math.random() * 180,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      hue: [210, 180, 200, 165, 220, 190][i],
    }));

    let raf;
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const o of orbs) {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},80%,62%,0.18)`);
        g.addColorStop(1, `hsla(${o.hue},80%,62%,0)`);
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();

    const ro = new ResizeObserver(() => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    });
    ro.observe(canvas);

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return <canvas ref={canvasRef} className="ap-orb-canvas" />;
}

function GridPattern() {
  return (
    <svg className="ap-grid-pattern" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="1.5" fill="currentColor" opacity="0.18" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  );
}

const FEATURES = [
  {icon: "✔️", title: "Multi-Horizon Forecasts", desc: "1D, 15D, 30D predictions with minute/hour/day granularity" },
  {icon: "✔️", title: "Stacked AI Models",       desc: "DLinear, NLinear, Linear, CARD & PatchTsT ensemble with live MSE tracking" },
  {icon: "✔️", title: "Paper Trading",            desc: "Risk-free virtual trades guided by AI price forecasts" },
  {icon: "✔️", title: "Live Market Context",      desc: "Real-time weather, location & time for informed decisions" },
];

/* ── SUBSCRIPTION PLANS ── */
const PLANS = [
  {
    id: "6mo",
    label: "6 Months",
    badge: null,
    price: "₹1,499",
    perMonth: "₹250/mo",
    originalPrice: "₹2,994",
    savings: "Save 50%",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #1d4ed8, #0891b2)",
    features: ["All AI forecasting models", "Paper trading", "Portfolio analytics", "Email support"],
    highlight: false,
  },
  {
    id: "12mo",
    label: "12 Months",
    badge: "Most Popular",
    price: "₹2,399",
    perMonth: "₹200/mo",
    originalPrice: "₹5,988",
    savings: "Save 60%",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #059669, #0891b2)",
    features: ["Everything in 6 months", "Priority AI models", "Advanced alerts", "Priority support", "Market reports"],
    highlight: true,
  },
  {
    id: "24mo",
    label: "24 Months",
    badge: "Best Value",
    price: "₹3,599",
    perMonth: "₹150/mo",
    originalPrice: "₹11,976",
    savings: "Save 70%",
    color: "#a78bfa",
    gradient: "linear-gradient(135deg, #7c3aed, #2563eb)",
    features: ["Everything in 12 months", "Dedicated account manager", "API access", "Custom alerts", "Webinar access", "Early feature access"],
    highlight: false,
  },
];

// Rejoined into a single valid string 
const UPI_QR_IMAGE = "data:image/png;base64,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";
const UPI_ID = "pokhrelpratik060@oksbi";
const UPI_NAME = "Pratik Pokhrel";

/* ── Subscription Modal ── */
function SubscriptionModal({ onSelect, onClose }) {
  const [selected, setSelected] = useState("12mo");
  const [step, setStep] = useState("plan"); // "plan" | "payment" | "confirm"
  const [txnId, setTxnId] = useState("");
  const [txnError, setTxnError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState(false);

  const chosenPlan = PLANS.find(p => p.id === selected);

  function handleContinueToPayment() {
    setStep("payment");
  }

  function copyUpiId() {
    navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function openUpiApp() {
    const amount = chosenPlan.price.replace("₹", "").replace(",", "");
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent("Kavout " + chosenPlan.label + " Subscription")}`;
    window.location.href = upiUrl;
  }

  function handleSubmitPayment(e) {
    e.preventDefault();
    if (!txnId.trim()) { setTxnError("Please enter your UPI transaction ID."); return; }
    if (txnId.trim().length < 6) { setTxnError("Transaction ID seems too short. Please check."); return; }
    setTxnError("");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep("confirm");
    }, 1200);
  }

  function handleDone() {
    onSelect(selected);
  }

  return (
    <div className="sub-overlay">
      <div className={`sub-modal ${step === "payment" ? "sub-modal-payment" : ""} ${step === "confirm" ? "sub-modal-confirm" : ""}`}>

        {/* ── STEP 1: PLAN SELECTION ── */}
        {step === "plan" && (<>
          <div className="sub-modal-header">
            <div className="sub-header-icon"><div className="ap-logo-mark">K</div></div>
            <div className="sub-header-text">
              <h2 className="sub-modal-title">Choose Your Plan</h2>
              <p className="sub-modal-sub">Unlock full Kavout AI — cancel anytime</p>
            </div>
            <button className="sub-close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className="sub-plans-grid">
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`sub-plan-card ${selected === plan.id ? "selected" : ""} ${plan.highlight ? "highlighted" : ""}`}
                onClick={() => setSelected(plan.id)}
                style={{ "--plan-color": plan.color, "--plan-gradient": plan.gradient }}
              >
                {plan.badge && <div className="sub-plan-badge">{plan.badge}</div>}
                <div className="sub-plan-label">{plan.label}</div>
                <div className="sub-plan-price">{plan.price}</div>
                <div className="sub-plan-per">{plan.perMonth}</div>
                <div className="sub-plan-savings-row">
                  <span className="sub-plan-original">{plan.originalPrice}</span>
                  <span className="sub-plan-savings">{plan.savings}</span>
                </div>
                <div className="sub-plan-divider" />
                <ul className="sub-plan-features">
                  {plan.features.map((f, i) => (
                    <li key={i}><span className="sub-check">✓</span>{f}</li>
                  ))}
                </ul>
                <div className={`sub-plan-selector ${selected === plan.id ? "active" : ""}`}>
                  <span className="sub-selector-dot" />
                </div>
              </div>
            ))}
          </div>

          <div className="sub-modal-footer">
            <p className="sub-footer-note">🔒 Secure UPI payment · Instant activation · Cancel anytime</p>
            <button className="sub-confirm-btn" onClick={handleContinueToPayment}>
              Pay {chosenPlan?.price} via UPI →
            </button>
            <button className="sub-back-btn" onClick={onClose}>← Go back</button>
          </div>
        </>)}

        {/* ── STEP 2: UPI PAYMENT ── */}
        {step === "payment" && (<>
          <div className="sub-modal-header">
            <button className="sub-back-icon" onClick={() => setStep("plan")}>←</button>
            <div className="sub-header-text" style={{textAlign:"center", flex:1}}>
              <h2 className="sub-modal-title">Pay via UPI</h2>
              <p className="sub-modal-sub">{chosenPlan?.label} Plan · {chosenPlan?.price}</p>
            </div>
            <button className="sub-close" onClick={onClose} aria-label="Close">✕</button>
          </div>

          <div className="pay-body">
            {/* QR Block */}
            <div className="pay-qr-block">
              <div className="pay-qr-wrap">
                {!qrError ? (
                  <img
                    src={UPI_QR_IMAGE}
                    alt="UPI QR Code"
                    className="pay-qr-img"
                    onError={() => setQrError(true)}
                  />
                ) : (
                  <div className="pay-qr-fallback">
                    <div className="pay-qr-placeholder">
                      <div className="pay-qr-grid">
                        {Array.from({length:49}).map((_,i)=>(
                          <div key={i} className={`pay-qr-cell ${Math.random()>0.5?"filled":""}`}/>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div className="pay-qr-amount-tag">{chosenPlan?.price}</div>
              </div>

              <div className="pay-upi-id-row">
                <span className="pay-upi-label">UPI ID</span>
                <span className="pay-upi-value">{UPI_ID}</span>
                <button className="pay-copy-btn" onClick={copyUpiId}>
                  {copied ? "✓ Copied" : "Copy"}
                </button>
              </div>

              <button className="pay-open-app-btn" onClick={openUpiApp}>
                Open UPI App to Pay
              </button>

              <div className="pay-apps-row">
                <span className="pay-app-chip">📱 GPay</span>
                <span className="pay-app-chip">📲 PhonePe</span>
                <span className="pay-app-chip">💳 Paytm</span>
                <span className="pay-app-chip">🏦 BHIM</span>
              </div>
            </div>

            {/* Divider */}
            <div className="pay-divider-wrap">
              <div className="pay-divider-line"/>
              <span className="pay-divider-text">after payment</span>
              <div className="pay-divider-line"/>
            </div>

            {/* Transaction ID form */}
            <form className="pay-txn-form" onSubmit={handleSubmitPayment}>
              <p className="pay-txn-label">Enter your UPI Transaction / Reference ID</p>
              <p className="pay-txn-hint">Find it in your UPI app under payment history after successful payment</p>
              <div className="pay-txn-input-wrap">
                <input
                  className="pay-txn-input"
                  type="text"
                  value={txnId}
                  onChange={e => { setTxnId(e.target.value); setTxnError(""); }}
                  placeholder="e.g. 412345678901"
                  autoComplete="off"
                />
              </div>
              {txnError && <p className="pay-txn-error">⚠ {txnError}</p>}
              <button className="sub-confirm-btn" type="submit" disabled={submitting}>
                {submitting ? <span className="ap-spinner"/> : "Confirm Payment →"}
              </button>
            </form>
          </div>

          <div className="sub-modal-footer" style={{marginTop:0, paddingTop:16, borderTop:"1px solid rgba(74,158,255,0.1)"}}>
            <p className="sub-footer-note">🔒 Payments are manually verified within 1–2 hours · Need help? Contact support</p>
          </div>
        </>)}

        {/* ── STEP 3: CONFIRMATION ── */}
        {step === "confirm" && (<>
          <div className="pay-confirm-wrap">
            <div className="pay-confirm-icon">✓</div>
            <h2 className="pay-confirm-title">Payment Submitted!</h2>
            <p className="pay-confirm-body">
              Your transaction ID <strong>{txnId}</strong> has been recorded.<br/>
              Your <strong>{chosenPlan?.label} Plan</strong> will be activated within 1–2 hours after verification.
            </p>
            <div className="pay-confirm-plan-pill" style={{background: `color-mix(in srgb, ${chosenPlan?.color} 18%, transparent)`, border: `1px solid ${chosenPlan?.color}`}}>
              {chosenPlan?.label} · {chosenPlan?.price} · {chosenPlan?.perMonth}
            </div>
            <p className="pay-confirm-note">You can continue setting up your profile now. We'll notify you once your plan is activated.</p>
            <button className="sub-confirm-btn" onClick={handleDone} style={{maxWidth:"300px"}}>
              Continue to Profile →
            </button>
          </div>
        </>)}

      </div>
      <SubscriptionStyles />
    </div>
  );
}

/* main auth page */
export default function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode]     = useState("login");
  const [step, setStep]     = useState(1); // 1 = auth, 2 = subscription, 3 = profile
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [auth, setAuth] = useState({ name: "", email: "", password: "", demo: false });
  const [profile, setProfile] = useState({
    phone: "", city: "", experience: "Beginner", risk: "Moderate", capital: "100000",
  });

  function switchMode(m) {
    setMode(m);
    setError("");
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 480));

    if (mode === "login") {
      const result = await onLogin(auth.email, auth.password);
      if (result?.error) { setError(result.error); setLoading(false); return; }
    } else {
      if (!auth.name)     { setError("Please enter your full name."); setLoading(false); return; }
      if (!auth.email)    { setError("Email is required.");           setLoading(false); return; }
      if (auth.password.length < 6) { setError("Password must be at least 6 characters."); setLoading(false); return; }

      // If demo is NOT checked, show subscription plans
      if (!auth.demo) {
        setLoading(false);
        setStep(2); // go to subscription step
        return;
      }

      const result = await onSignup(auth.name, auth.email, auth.password, auth.demo, null);
      if (result?.error) { setError(result.error); setLoading(false); return; }
      if (result?.needsProfile) {
        setPendingUser(result.user);
        setStep(3);
        setLoading(false);
        return;
      }
    }
    setLoading(false);
  }

  async function handlePlanSelect(planId) {
    setSelectedPlan(planId);
    // After plan selection, proceed to profile step
    const result = await onSignup(auth.name, auth.email, auth.password, false, null, planId);
    if (result?.error) { setError(result.error); setStep(1); return; }
    if (result?.needsProfile) {
      setPendingUser(result.user);
      setStep(3);
      return;
    }
    setStep(3);
  }

  async function handleProfile(e) {
    e.preventDefault();
    setLoading(true);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 400));
    
    const result = await onSignup(auth.name, auth.email, auth.password, auth.demo, profile, selectedPlan);
    if (result?.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  /* step 2: subscription selection */
  if (step === 2) {
    return (
      <div className="ap-root">
        <OrbCanvas />
        <GridPattern />
        <TickerTape />
        <SubscriptionModal
          onSelect={handlePlanSelect}
          onClose={() => setStep(1)}
        />
        <AuthPageStyles />
      </div>
    );
  }

  /* step 3: profile */
  if (step === 3) {
    return (
      <div className="ap-root">
        <OrbCanvas />
        <GridPattern />
        <TickerTape />
        <div className="ap-center">
          <div className="ap-card ap-card-profile">
            <div className="ap-card-header">
              <div className="ap-logo-mark">K</div>
              <div>
                <h2 className="ap-card-title">Complete your profile</h2>
                <p className="ap-card-sub">
                  {selectedPlan
                    ? `${PLANS.find(p => p.id === selectedPlan)?.label} plan selected · One quick step before entering`
                    : "One quick step before entering the dashboard"
                  }
                </p>
              </div>
            </div>

            {selectedPlan && (
              <div className="ap-plan-badge-row">
                <span className="ap-plan-active-badge">
                  ✓ {PLANS.find(p => p.id === selectedPlan)?.label} Plan · {PLANS.find(p => p.id === selectedPlan)?.price}
                </span>
              </div>
            )}

            <form onSubmit={handleProfile} className="ap-form">
              {error && (
                <div className="ap-error" style={{ marginBottom: "8px" }}>
                  <span>Error</span> {error}
                </div>
              )}
              
              <div className="ap-grid-2">
                <div className="ap-field">
                  <label>Phone</label>
                  <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9XXXXXXXXX" />
                </div>
                <div className="ap-field">
                  <label>City</label>
                  <input value={profile.city} onChange={e => setProfile(p => ({ ...p, city: e.target.value }))} placeholder="Mumbai, Delhi…" />
                </div>
              </div>
              <div className="ap-grid-2">
                <div className="ap-field">
                  <label>Experience</label>
                  <select value={profile.experience} onChange={e => setProfile(p => ({ ...p, experience: e.target.value }))}>
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                  </select>
                </div>
                <div className="ap-field">
                  <label>Risk Profile</label>
                  <select value={profile.risk} onChange={e => setProfile(p => ({ ...p, risk: e.target.value }))}>
                    <option>Conservative</option><option>Moderate</option><option>Aggressive</option>
                  </select>
                </div>
              </div>
              <div className="ap-field">
                <label>Starting Capital (₹)</label>
                <input value={profile.capital} onChange={e => setProfile(p => ({ ...p, capital: e.target.value }))} placeholder="100000" />
              </div>
              <button className="ap-btn-primary" type="submit" disabled={loading}>
                {loading ? <span className="ap-spinner" /> : "Enter Dashboard →"}
              </button>
            </form>
          </div>
        </div>
        <AuthPageStyles />
      </div>
    );
  }

  /* step 1: login / signup */
  return (
    <div className="ap-root">
      <OrbCanvas />
      <GridPattern />
      <TickerTape />

      <div className="ap-split">
        {/* LEFT ─ brand panel */}
        <div className="ap-left">
          <div className="ap-left-inner">
            <div className="ap-brand-lockup">
              <div className="ap-logo-mark">K</div>
              <div>
                <h1 className="ap-brand-name">Kavout</h1>
                <p className="ap-brand-tagline">Enterprise-grade Indian equity forecasting</p>
              </div>
            </div>

            <div className="ap-headline">
              <h2>Predict markets.<br /><span className="ap-headline-accent">Trade smarter.</span></h2>
              <p className="ap-headline-body">
                Multi-model AI forecasts for NSE stocks with paper trading, live weather context, and portfolio analytics — all in one console.
              </p>
            </div>

            <div className="ap-features">
              {FEATURES.map((f, i) => (
                <div className="ap-feature-row" key={i} style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                  <div className="ap-feature-icon">{f.icon}</div>
                  <div>
                    <strong>{f.title}</strong>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="ap-trust-bar">
              <div><span>100K+</span><p>Forecasts</p></div>
              <div className="ap-trust-div" />
              <div><span>NSE</span><p>Listed stocks</p></div>
              <div className="ap-trust-div" />
              <div><span>5</span><p>AI models</p></div>
            </div>
          </div>
        </div>

        {/* RIGHT ─ form panel */}
        <div className="ap-right">
          <div className="ap-card">
            <div className="ap-card-header">
              <div className="ap-logo-mark ap-logo-sm">K</div>
              <div>
                <h2 className="ap-card-title">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h2>
                <p className="ap-card-sub">
                  {mode === "login" ? "Sign in to your console" : "Start trading with AI insights"}
                </p>
              </div>
            </div>

            <div className="ap-tab-row">
              <button type="button" className={`ap-tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>
                <span>Log In</span>
              </button>
              <button type="button" className={`ap-tab ${mode === "signup" ? "active" : ""}`} onClick={() => switchMode("signup")}>
                <span>Sign Up</span>
              </button>
            </div>

            <form onSubmit={handleAuth} className="ap-form">
              {mode === "signup" && (
                <div className="ap-field ap-field-animated">
                  <label>Full Name</label>
                  <div className="ap-input-wrap">
                    <input
                      value={auth.name}
                      onChange={e => setAuth(p => ({ ...p, name: e.target.value }))}
                      placeholder="Your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>
              )}

              <div className="ap-field">
                <label>Email address</label>
                <div className="ap-input-wrap">
                  <input
                    type="email"
                    value={auth.email}
                    onChange={e => setAuth(p => ({ ...p, email: e.target.value.toLowerCase() }))}
                    placeholder="name@company.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="ap-field">
                <label>
                  Password
                  {mode === "login" && <button type="button" className="ap-forgot">Forgot?</button>}
                </label>
                <div className="ap-input-wrap">
                  <input
                    type={showPass ? "text" : "password"}
                    value={auth.password}
                    onChange={e => setAuth(p => ({ ...p, password: e.target.value }))}
                    placeholder={mode === "login" ? "Your password" : "Min. 6 characters"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button type="button" className="ap-eye" onClick={() => setShowPass(s => !s)}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              {mode === "signup" && (
                <label className="ap-demo-toggle">
                  <div className="ap-toggle-wrap">
                    <input
                      type="checkbox"
                      checked={auth.demo}
                      onChange={e => setAuth(p => ({ ...p, demo: e.target.checked }))}
                    />
                    <span className="ap-toggle-slider" />
                  </div>
                  <div>
                    <strong>30-day free trial</strong>
                    <p>Access all features free for one month · No card required</p>
                  </div>
                </label>
              )}

              {mode === "signup" && !auth.demo && (
                <div className="ap-plan-hint">
                  <span className="ap-plan-hint-icon">💎</span>
                  <div>
                    <strong>Choose a subscription plan</strong>
                    <p>You'll pick your plan on the next step</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="ap-error">
                  <span>Error</span> {error}
                </div>
              )}

              <button className="ap-btn-primary" type="submit" disabled={loading}>
                {loading
                  ? <span className="ap-spinner" />
                  : mode === "login"
                    ? "Access Dashboard →"
                    : auth.demo
                      ? "Start Free Trial →"
                      : "Choose Plan →"
                }
              </button>

              {mode === "login" && (
                <p className="ap-switch-hint">
                  New to Kavout?{" "}
                  <button type="button" onClick={() => switchMode("signup")}>Create a free account</button>
                </p>
              )}
              {mode === "signup" && (
                <p className="ap-switch-hint">
                  Already have an account?{" "}
                  <button type="button" onClick={() => switchMode("login")}>Log in</button>
                </p>
              )}
            </form>

            <div className="ap-card-footer">
              <div className="ap-secure-badge">256-bit encrypted · Secure login</div>
            </div>
          </div>
        </div>
      </div>

      <AuthPageStyles />
    </div>
  );
}

/* ── Subscription Modal Styles ── */
function SubscriptionStyles() {
  return (
    <style>{`
      .sub-overlay {
        position: fixed;
        inset: 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(3, 8, 16, 0.82);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        animation: sub-fade-in 0.3s ease both;
      }

      @keyframes sub-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .sub-modal {
        width: 100%;
        max-width: 900px;
        max-height: 90vh;
        overflow-y: auto;
        background: rgba(8, 18, 32, 0.92);
        border: 1px solid rgba(74, 158, 255, 0.2);
        border-radius: 28px;
        padding: 36px;
        box-shadow:
          0 40px 100px rgba(0, 0, 0, 0.7),
          inset 0 1px 0 rgba(255, 255, 255, 0.07);
        animation: sub-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
      }

      @keyframes sub-slide-up {
        from { opacity: 0; transform: translateY(30px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .sub-modal-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 32px;
        position: relative;
      }

      .sub-header-icon { flex-shrink: 0; }

      .sub-header-text { flex: 1; }

      .sub-modal-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        font-family: 'Manrope', sans-serif;
        color: #f0f8ff;
      }

      .sub-modal-sub {
        margin: 4px 0 0;
        font-size: 0.84rem;
        color: rgba(150, 190, 230, 0.6);
      }

      .sub-close {
        position: absolute;
        right: 0;
        top: 0;
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(74, 158, 255, 0.15);
        color: rgba(180, 210, 240, 0.6);
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        cursor: pointer;
        font-size: 0.8rem;
        transition: all 0.2s;
      }

      .sub-close:hover {
        background: rgba(248, 113, 113, 0.15);
        border-color: rgba(248, 113, 113, 0.3);
        color: #fca5a5;
      }

      /* Plans grid */
      .sub-plans-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 28px;
      }

      .sub-plan-card {
        position: relative;
        padding: 24px 20px 20px;
        border-radius: 20px;
        border: 1.5px solid rgba(74, 158, 255, 0.15);
        background: rgba(255, 255, 255, 0.03);
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .sub-plan-card:hover {
        border-color: rgba(74, 158, 255, 0.35);
        background: rgba(74, 158, 255, 0.06);
        transform: translateY(-3px);
      }

      .sub-plan-card.highlighted {
        border-color: rgba(16, 185, 129, 0.4);
        background: rgba(16, 185, 129, 0.05);
      }

      .sub-plan-card.selected {
        border-color: var(--plan-color);
        background: color-mix(in srgb, var(--plan-color) 10%, transparent);
        box-shadow: 0 0 0 1px var(--plan-color),
                    0 12px 40px color-mix(in srgb, var(--plan-color) 25%, transparent);
        transform: translateY(-4px);
      }

      .sub-plan-badge {
        position: absolute;
        top: -12px;
        left: 50%;
        transform: translateX(-50%);
        padding: 4px 14px;
        border-radius: 999px;
        background: linear-gradient(135deg, #059669, #0891b2);
        font-size: 0.68rem;
        font-weight: 800;
        color: #fff;
        white-space: nowrap;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        box-shadow: 0 4px 14px rgba(5, 150, 105, 0.5);
      }

      .sub-plan-label {
        font-size: 0.8rem;
        font-weight: 700;
        color: rgba(150, 195, 240, 0.65);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }

      .sub-plan-price {
        font-size: 2rem;
        font-weight: 800;
        font-family: 'Manrope', sans-serif;
        letter-spacing: -0.04em;
        color: #f0f8ff;
        background: var(--plan-gradient);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .sub-plan-per {
        font-size: 0.76rem;
        color: rgba(150, 195, 230, 0.55);
        font-weight: 600;
        margin-bottom: 8px;
      }

      .sub-plan-savings-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .sub-plan-original {
        font-size: 0.73rem;
        color: rgba(130, 170, 210, 0.4);
        text-decoration: line-through;
        font-family: 'JetBrains Mono', monospace;
      }

      .sub-plan-savings {
        font-size: 0.7rem;
        font-weight: 800;
        color: #34d399;
        background: rgba(52, 211, 153, 0.12);
        padding: 2px 8px;
        border-radius: 6px;
        letter-spacing: 0.03em;
      }

      .sub-plan-divider {
        height: 1px;
        background: rgba(74, 158, 255, 0.1);
        margin: 12px 0;
      }

      .sub-plan-features {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 8px;
        flex: 1;
      }

      .sub-plan-features li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 0.78rem;
        color: rgba(180, 215, 245, 0.7);
        font-weight: 500;
        line-height: 1.4;
      }

      .sub-check {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(52, 211, 153, 0.18);
        display: grid;
        place-items: center;
        font-size: 0.6rem;
        color: #34d399;
        flex-shrink: 0;
        margin-top: 1px;
        font-weight: 800;
      }

      .sub-plan-selector {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid rgba(74, 158, 255, 0.3);
        display: grid;
        place-items: center;
        margin-top: 14px;
        align-self: flex-end;
        transition: all 0.2s;
      }

      .sub-plan-selector.active {
        border-color: var(--plan-color);
        background: var(--plan-color);
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--plan-color) 25%, transparent);
      }

      .sub-selector-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #fff;
        opacity: 0;
        transform: scale(0);
        transition: all 0.2s;
      }

      .sub-plan-selector.active .sub-selector-dot {
        opacity: 1;
        transform: scale(1);
      }

      /* Footer */
      .sub-modal-footer {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }

      .sub-footer-note {
        margin: 0;
        font-size: 0.76rem;
        color: rgba(120, 170, 220, 0.45);
        font-weight: 600;
        letter-spacing: 0.02em;
        text-align: center;
      }

      .sub-confirm-btn {
        width: 100%;
        max-width: 380px;
        padding: 15px 20px;
        border-radius: 14px;
        border: none;
        background: linear-gradient(135deg, #2563eb 0%, #0891b2 60%, #059669 100%);
        color: #fff;
        font-size: 0.96rem;
        font-weight: 800;
        font-family: 'Manrope', sans-serif;
        cursor: pointer;
        transition: all 0.22s;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 28px rgba(37, 99, 235, 0.45);
        letter-spacing: -0.01em;
      }

      .sub-confirm-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 14px 40px rgba(37, 99, 235, 0.55);
        background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 60%, #10b981 100%);
      }

      .sub-confirm-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .sub-back-btn {
        background: none;
        border: none;
        color: rgba(130, 175, 220, 0.5);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        transition: color 0.2s;
        font-family: 'Manrope', sans-serif;
        padding: 4px 8px;
      }

      .sub-back-btn:hover { color: rgba(180, 215, 250, 0.8); }

      /* Payment step modal sizing */
      .sub-modal-payment {
        max-width: 560px;
      }

      .sub-back-icon {
        background: rgba(255,255,255,0.06);
        border: 1px solid rgba(74,158,255,0.15);
        color: rgba(180,210,240,0.7);
        width: 34px;
        height: 34px;
        border-radius: 10px;
        display: grid;
        place-items: center;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.2s;
        flex-shrink: 0;
      }

      .sub-back-icon:hover {
        background: rgba(74,158,255,0.12);
        color: #e8f2ff;
      }

      /* ── Payment body ── */
      .pay-body {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding: 4px 0 20px;
      }

      /* QR block */
      .pay-qr-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }

      .pay-qr-wrap {
        position: relative;
        display: inline-block;
      }

      .pay-qr-img {
        width: 200px;
        height: 200px;
        border-radius: 18px;
        border: 2px solid rgba(74,158,255,0.25);
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        display: block;
        object-fit: cover;
        background: #fff;
        padding: 6px;
      }

      .pay-qr-amount-tag {
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #2563eb, #059669);
        color: #fff;
        font-size: 0.82rem;
        font-weight: 800;
        padding: 4px 14px;
        border-radius: 999px;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(37,99,235,0.5);
        font-family: 'JetBrains Mono', monospace;
      }

      /* UPI ID row */
      .pay-upi-id-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(74,158,255,0.15);
        border-radius: 12px;
        width: 100%;
        max-width: 400px;
        margin-top: 8px;
      }

      .pay-upi-label {
        font-size: 0.7rem;
        font-weight: 700;
        color: rgba(140,185,230,0.55);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        flex-shrink: 0;
      }

      .pay-upi-value {
        flex: 1;
        font-size: 0.88rem;
        font-weight: 700;
        color: #c8e6ff;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.02em;
      }

      .pay-copy-btn {
        background: rgba(78,161,255,0.12);
        border: 1px solid rgba(78,161,255,0.25);
        color: #4ea1ff;
        font-size: 0.72rem;
        font-weight: 700;
        padding: 5px 12px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Manrope', sans-serif;
        white-space: nowrap;
      }

      .pay-copy-btn:hover {
        background: rgba(78,161,255,0.2);
        border-color: rgba(78,161,255,0.4);
      }

      .pay-open-app-btn {
        width: 100%;
        max-width: 400px;
        padding: 12px 18px;
        border-radius: 12px;
        border: 1.5px solid rgba(78,161,255,0.3);
        background: rgba(78,161,255,0.08);
        color: #8ec8ff;
        font-size: 0.88rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.22s;
        font-family: 'Manrope', sans-serif;
      }

      .pay-open-app-btn:hover {
        background: rgba(78,161,255,0.16);
        border-color: rgba(78,161,255,0.5);
        color: #c8e6ff;
        transform: translateY(-1px);
      }

      /* App chips */
      .pay-apps-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .pay-app-chip {
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(74,158,255,0.12);
        font-size: 0.72rem;
        color: rgba(160,200,240,0.55);
        font-weight: 600;
      }

      /* Divider */
      .pay-divider-wrap {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pay-divider-line {
        flex: 1;
        height: 1px;
        background: rgba(74,158,255,0.12);
      }

      .pay-divider-text {
        font-size: 0.72rem;
        color: rgba(130,175,220,0.45);
        font-weight: 600;
        white-space: nowrap;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      /* TXN form */
      .pay-txn-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .pay-txn-label {
        margin: 0;
        font-size: 0.86rem;
        font-weight: 700;
        color: #c8e0ff;
      }

      .pay-txn-hint {
        margin: 0;
        font-size: 0.74rem;
        color: rgba(140,185,230,0.5);
        line-height: 1.5;
      }

      .pay-txn-input-wrap { position: relative; }

      .pay-txn-input {
        width: 100%;
        padding: 12px 16px;
        background: rgba(255,255,255,0.05);
        border: 1.5px solid rgba(74,158,255,0.2);
        border-radius: 12px;
        color: #e8f2ff;
        font-size: 0.92rem;
        font-family: 'JetBrains Mono', monospace;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-sizing: border-box;
        letter-spacing: 0.04em;
      }

      .pay-txn-input:focus {
        border-color: #4ea1ff;
        box-shadow: 0 0 0 4px rgba(78,161,255,0.14);
        background: rgba(78,161,255,0.07);
      }

      .pay-txn-input::placeholder {
        color: rgba(130,170,210,0.35);
        font-family: 'JetBrains Mono', monospace;
      }

      .pay-txn-error {
        margin: 0;
        font-size: 0.78rem;
        color: #fca5a5;
        font-weight: 600;
        padding: 8px 12px;
        background: rgba(248,113,113,0.08);
        border-radius: 8px;
        border: 1px solid rgba(248,113,113,0.2);
      }

      /* ── Confirmation step ── */
      .sub-modal-confirm {
        max-width: 460px;
      }

      .pay-confirm-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 18px;
        padding: 16px 0 8px;
        text-align: center;
      }

      .pay-confirm-icon {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: linear-gradient(135deg, #059669, #10b981);
        display: grid;
        place-items: center;
        font-size: 2rem;
        color: #fff;
        box-shadow: 0 8px 28px rgba(5,150,105,0.5);
        animation: sub-slide-up 0.5s cubic-bezier(0.16,1,0.3,1) both;
      }

      .pay-confirm-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        font-family: 'Manrope', sans-serif;
        color: #f0f8ff;
      }

      .pay-confirm-body {
        margin: 0;
        font-size: 0.88rem;
        color: rgba(170,210,245,0.75);
        line-height: 1.6;
        max-width: 340px;
      }

      .pay-confirm-body strong {
        color: #c8e6ff;
      }

      .pay-confirm-plan-pill {
        padding: 8px 20px;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #d4efff;
        letter-spacing: 0.02em;
      }

      .pay-confirm-note {
        margin: 0;
        font-size: 0.76rem;
        color: rgba(130,175,220,0.5);
        line-height: 1.5;
        max-width: 320px;
      }

      @media (max-width: 700px) {
        .sub-modal { padding: 24px 18px; }
        .sub-plans-grid { grid-template-columns: 1fr; gap: 12px; }
        .sub-plan-card { flex-direction: row; flex-wrap: wrap; }
        .sub-plan-price { font-size: 1.5rem; }
        .pay-qr-img { width: 170px; height: 170px; }
        .pay-upi-id-row { max-width: 100%; }
        .pay-open-app-btn { max-width: 100%; }
      }
    `}</style>
  );
}

/* scoped styles injected as a component */
function AuthPageStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@500;600;700&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500&display=swap');

      .ap-root {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        background: #050d18;
        font-family: 'Manrope', sans-serif;
        color: #e8f2ff;
      }

      .ap-orb-canvas {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
      }

      .ap-grid-pattern {
        position: fixed;
        inset: 0;
        width: 100%;
        height: 100%;
        color: #4a9eff;
        pointer-events: none;
        z-index: 0;
      }

      .ap-ticker-wrap {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 36px;
        background: rgba(5, 13, 24, 0.85);
        border-bottom: 1px solid rgba(74, 158, 255, 0.12);
        overflow: hidden;
        z-index: 10;
        backdrop-filter: blur(8px);
      }

      .ap-ticker-track {
        display: flex;
        align-items: center;
        height: 100%;
        gap: 0;
        animation: ticker-scroll 32s linear infinite;
        white-space: nowrap;
        width: max-content;
      }

      @keyframes ticker-scroll {
        from { transform: translateX(0); }
        to   { transform: translateX(-50%); }
      }

      .ap-ticker-item {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 0 24px;
        border-right: 1px solid rgba(74, 158, 255, 0.1);
        font-size: 0.72rem;
        font-family: 'JetBrains Mono', monospace;
      }

      .ap-ticker-sym { color: rgba(200, 225, 255, 0.7); font-weight: 600; }
      .ap-ticker-val { color: #e8f2ff; font-weight: 600; }
      .ap-ticker-chg.up   { color: #34d399; }
      .ap-ticker-chg.down { color: #f87171; }

      .ap-split {
        position: relative;
        z-index: 5;
        min-height: 100vh;
        padding-top: 36px;
        display: grid;
        grid-template-columns: 1fr 520px;
        gap: 0;
      }

      .ap-left {
        display: flex;
        align-items: center;
        padding: 60px 56px 60px 72px;
        position: relative;
      }

      .ap-left::after {
        content: '';
        position: absolute;
        right: 0;
        top: 10%;
        bottom: 10%;
        width: 1px;
        background: linear-gradient(to bottom, transparent, rgba(74, 158, 255, 0.25) 30%, rgba(74, 158, 255, 0.25) 70%, transparent);
      }

      .ap-left-inner {
        display: flex;
        flex-direction: column;
        gap: 40px;
        max-width: 540px;
        animation: ap-fade-up 0.7s ease both;
      }

      .ap-brand-lockup {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .ap-logo-mark {
        width: 52px;
        height: 52px;
        border-radius: 16px;
        background: linear-gradient(135deg, #3b82f6, #10b981);
        display: grid;
        place-items: center;
        font-weight: 800;
        font-size: 1.05rem;
        color: #fff;
        box-shadow: 0 8px 24px rgba(59, 130, 246, 0.45);
        flex-shrink: 0;
        letter-spacing: -0.02em;
        font-family: 'Manrope', sans-serif;
      }

      .ap-logo-sm { width: 40px; height: 40px; font-size: 0.88rem; border-radius: 12px; }

      .ap-brand-name {
        margin: 0;
        font-size: 1.3rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        font-family: 'Manrope', sans-serif;
      }

      .ap-brand-tagline {
        margin: 3px 0 0;
        font-size: 0.78rem;
        color: rgba(180, 210, 240, 0.55);
        font-weight: 500;
      }

      .ap-headline h2 {
        margin: 0 0 14px;
        font-size: clamp(2.2rem, 4vw, 3.2rem);
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: -0.04em;
        font-family: 'Manrope', sans-serif;
        color: #f0f8ff;
      }

      .ap-headline-accent {
        background: linear-gradient(135deg, #4ea1ff, #34d399);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .ap-headline-body {
        margin: 0;
        font-size: 1rem;
        color: rgba(180, 210, 240, 0.65);
        line-height: 1.65;
        max-width: 440px;
      }

      .ap-features {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .ap-feature-row {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 16px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(74, 158, 255, 0.1);
        transition: background 0.2s, border-color 0.2s;
        animation: ap-fade-up 0.6s ease both;
      }

      .ap-feature-row:hover {
        background: rgba(74, 158, 255, 0.08);
        border-color: rgba(74, 158, 255, 0.22);
      }

      .ap-feature-icon {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: rgba(59, 130, 246, 0.15);
        display: grid;
        place-items: center;
        font-size: 1rem;
        flex-shrink: 0;
      }

      .ap-feature-row strong {
        display: block;
        font-size: 0.88rem;
        color: #e0f0ff;
        margin-bottom: 3px;
        font-weight: 700;
      }

      .ap-feature-row p {
        margin: 0;
        font-size: 0.76rem;
        color: rgba(160, 195, 230, 0.6);
        line-height: 1.5;
      }

      .ap-trust-bar {
        display: flex;
        align-items: center;
        gap: 28px;
      }

      .ap-trust-bar > div:not(.ap-trust-div) span {
        display: block;
        font-size: 1.35rem;
        font-weight: 800;
        font-family: 'Manrope', sans-serif;
        background: linear-gradient(135deg, #4ea1ff, #34d399);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.03em;
      }

      .ap-trust-bar p {
        margin: 2px 0 0;
        font-size: 0.72rem;
        color: rgba(160, 195, 230, 0.5);
        font-weight: 600;
      }

      .ap-trust-div {
        width: 1px;
        height: 36px;
        background: rgba(74, 158, 255, 0.2);
      }

      .ap-right {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 40px 48px 40px 40px;
      }

      .ap-card {
        width: 100%;
        max-width: 420px;
        background: rgba(10, 20, 36, 0.75);
        border: 1px solid rgba(74, 158, 255, 0.18);
        border-radius: 24px;
        padding: 32px;
        backdrop-filter: blur(28px);
        -webkit-backdrop-filter: blur(28px);
        box-shadow:
          0 32px 80px rgba(0, 0, 0, 0.55),
          inset 0 1px 0 rgba(255, 255, 255, 0.06);
        animation: ap-fade-up 0.55s ease both 0.1s;
      }

      .ap-card-profile {
        max-width: 520px;
      }

      .ap-card-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin-bottom: 24px;
      }

      .ap-card-title {
        margin: 0;
        font-size: 1.28rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        font-family: 'Manrope', sans-serif;
        color: #f0f8ff;
      }

      .ap-card-sub {
        margin: 3px 0 0;
        font-size: 0.8rem;
        color: rgba(150, 190, 230, 0.6);
      }

      .ap-tab-row {
        display: flex;
        gap: 4px;
        margin-bottom: 24px;
        background: rgba(255, 255, 255, 0.04);
        border-radius: 14px;
        padding: 4px;
        border: 1px solid rgba(74, 158, 255, 0.1);
      }

      .ap-tab {
        flex: 1;
        padding: 9px 12px;
        border-radius: 10px;
        border: none;
        background: transparent;
        color: rgba(150, 190, 230, 0.55);
        font-size: 0.86rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.22s;
        font-family: 'Manrope', sans-serif;
      }

      .ap-tab.active {
        background: linear-gradient(135deg, #1d4ed8, #0d9488);
        color: #fff;
        box-shadow: 0 4px 14px rgba(29, 78, 216, 0.4);
      }

      .ap-tab:not(.active):hover {
        color: rgba(200, 225, 255, 0.8);
        background: rgba(255,255,255,0.05);
      }

      .ap-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .ap-field {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .ap-field-animated {
        animation: ap-slide-down 0.3s ease both;
      }

      @keyframes ap-slide-down {
        from { opacity: 0; transform: translateY(-8px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      .ap-field label {
        font-size: 0.74rem;
        font-weight: 700;
        color: rgba(150, 190, 230, 0.7);
        text-transform: uppercase;
        letter-spacing: 0.07em;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .ap-forgot {
        background: none;
        border: none;
        color: #4ea1ff;
        font-size: 0.72rem;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        text-transform: none;
        letter-spacing: 0;
        transition: color 0.2s;
      }

      .ap-forgot:hover { color: #7ec3ff; }

      .ap-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .ap-input-wrap input,
      .ap-input-wrap select {
        width: 100%;
        padding: 12px 14px;
        background: rgba(255, 255, 255, 0.05);
        border: 1.5px solid rgba(74, 158, 255, 0.18);
        border-radius: 12px;
        color: #e8f2ff;
        font-size: 0.92rem;
        font-family: 'Manrope', sans-serif;
        transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        outline: none;
      }

      .ap-input-wrap input::placeholder {
        color: rgba(130, 170, 210, 0.38);
      }

      .ap-input-wrap input:focus {
        border-color: #4ea1ff;
        background: rgba(78, 161, 255, 0.07);
        box-shadow: 0 0 0 4px rgba(78, 161, 255, 0.14);
      }

      .ap-eye {
        position: absolute;
        right: 12px;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 0.9rem;
        opacity: 0.5;
        transition: opacity 0.2s;
        padding: 0;
        line-height: 1;
      }

      .ap-eye:hover { opacity: 0.9; }

      .ap-field input,
      .ap-field select {
        padding: 11px 14px;
        background: rgba(255, 255, 255, 0.05);
        border: 1.5px solid rgba(74, 158, 255, 0.18);
        border-radius: 12px;
        color: #e8f2ff;
        font-size: 0.9rem;
        font-family: 'Manrope', sans-serif;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
        width: 100%;
      }

      .ap-field input:focus,
      .ap-field select:focus {
        border-color: #4ea1ff;
        box-shadow: 0 0 0 4px rgba(78, 161, 255, 0.14);
      }

      .ap-field select option {
        background: #0d1e32;
        color: #e8f2ff;
      }

      .ap-demo-toggle {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 12px 14px;
        background: rgba(78, 161, 255, 0.06);
        border: 1px solid rgba(78, 161, 255, 0.15);
        border-radius: 12px;
        cursor: pointer;
      }

      .ap-toggle-wrap {
        position: relative;
        flex-shrink: 0;
        width: 40px;
        height: 22px;
        margin-top: 2px;
      }

      .ap-toggle-wrap input {
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
      }

      .ap-toggle-slider {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.12);
        border: 1px solid rgba(255,255,255,0.15);
        transition: background 0.25s;
        cursor: pointer;
      }

      .ap-toggle-slider::after {
        content: '';
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: rgba(200, 225, 255, 0.6);
        transition: transform 0.25s, background 0.25s;
      }

      .ap-toggle-wrap input:checked + .ap-toggle-slider {
        background: linear-gradient(135deg, #3b82f6, #10b981);
        border-color: transparent;
      }

      .ap-toggle-wrap input:checked + .ap-toggle-slider::after {
        transform: translateX(18px);
        background: #fff;
      }

      .ap-demo-toggle strong {
        display: block;
        font-size: 0.84rem;
        color: #c8e0ff;
        margin-bottom: 3px;
      }

      .ap-demo-toggle p {
        margin: 0;
        font-size: 0.74rem;
        color: rgba(150, 190, 230, 0.55);
      }

      /* Plan hint row */
      .ap-plan-hint {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 11px 14px;
        background: rgba(167, 139, 250, 0.07);
        border: 1px solid rgba(167, 139, 250, 0.2);
        border-radius: 12px;
        animation: ap-slide-down 0.3s ease both;
      }

      .ap-plan-hint-icon {
        font-size: 1rem;
        margin-top: 1px;
      }

      .ap-plan-hint strong {
        display: block;
        font-size: 0.82rem;
        color: #d4bbff;
        margin-bottom: 2px;
        font-weight: 700;
      }

      .ap-plan-hint p {
        margin: 0;
        font-size: 0.73rem;
        color: rgba(180, 155, 240, 0.6);
      }

      /* Active plan badge in profile */
      .ap-plan-badge-row {
        margin: -10px 0 18px;
      }

      .ap-plan-active-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 14px;
        border-radius: 999px;
        background: rgba(52, 211, 153, 0.12);
        border: 1px solid rgba(52, 211, 153, 0.25);
        color: #34d399;
        font-size: 0.76rem;
        font-weight: 700;
      }

      .ap-error {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        background: rgba(248, 113, 113, 0.1);
        border: 1px solid rgba(248, 113, 113, 0.3);
        border-radius: 10px;
        font-size: 0.83rem;
        color: #fca5a5;
        font-weight: 600;
        animation: ap-shake 0.35s ease;
      }

      @keyframes ap-shake {
        0%,100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }

      .ap-btn-primary {
        padding: 14px 18px;
        border-radius: 13px;
        border: none;
        background: linear-gradient(135deg, #2563eb 0%, #0891b2 60%, #059669 100%);
        color: #fff;
        font-size: 0.95rem;
        font-weight: 800;
        font-family: 'Manrope', sans-serif;
        cursor: pointer;
        transition: all 0.22s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        box-shadow: 0 8px 24px rgba(37, 99, 235, 0.4);
        letter-spacing: -0.01em;
      }

      .ap-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 14px 36px rgba(37, 99, 235, 0.52);
        background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 60%, #10b981 100%);
      }

      .ap-btn-primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .ap-spinner {
        display: inline-block;
        width: 18px;
        height: 18px;
        border: 2.5px solid rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: ap-spin 0.7s linear infinite;
      }

      @keyframes ap-spin { to { transform: rotate(360deg); } }

      .ap-switch-hint {
        margin: 0;
        text-align: center;
        font-size: 0.8rem;
        color: rgba(150, 190, 230, 0.5);
      }

      .ap-switch-hint button {
        background: none;
        border: none;
        color: #4ea1ff;
        font-weight: 700;
        cursor: pointer;
        font-size: inherit;
        padding: 0;
        transition: color 0.2s;
        font-family: 'Manrope', sans-serif;
      }

      .ap-switch-hint button:hover { color: #7ec3ff; }

      .ap-card-footer {
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid rgba(74, 158, 255, 0.1);
        display: flex;
        justify-content: center;
      }

      .ap-secure-badge {
        font-size: 0.72rem;
        color: rgba(120, 170, 220, 0.45);
        font-weight: 600;
        letter-spacing: 0.03em;
      }

      .ap-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }

      .ap-center {
        position: relative;
        z-index: 5;
        min-height: 100vh;
        padding-top: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 80px 24px 48px;
      }

      @keyframes ap-fade-up {
        from { opacity: 0; transform: translateY(20px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 1000px) {
        .ap-split { grid-template-columns: 1fr; }
        .ap-left { display: none; }
        .ap-right { min-height: calc(100vh - 36px); padding: 40px 24px; }
      }

      @media (max-width: 480px) {
        .ap-card { padding: 24px 20px; border-radius: 20px; }
        .ap-grid-2 { grid-template-columns: 1fr; }
        .ap-headline h2 { font-size: 2rem; }
      }
    `}</style>
  );
}