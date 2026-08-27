"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Building2, ShieldCheck, Layers, Timer, BookOpenCheck, FileBarChart,
  Receipt, Globe2, TrendingUp, ShieldOff, FlaskConical, CheckCircle2,
  FileSignature, Phone, Mail, MapPin, BarChart3, Award, FileText,
  Languages, History, Cloud, Hexagon, Rocket, Target, Sparkles, Wrench,
  Globe, Cpu, Crown, Users, Network, HandCoins, Menu,
} from "lucide-react";
import "./landing.css";

const FEATURES = [
  { title: "Startup Registration & Profile", desc: "Multi-step application with secure document upload, verification, and real-time status tracking capturing sector, region, and innovation type.", caps: ["Multi-step form with validation", "Secure document upload", "Real-time status tracking", "Profile editing with sector fields"], tag: "Real-time", icon: FileText },
  { title: "Designation & Certificate Generation", desc: "Committee-driven scoring, approval, and provisional certificate generation with a unique QR code for official verification.", caps: ["Committee assignment and access", "Criterion-based scoring system", "Approval / rejection workflow", "QR-equipped certificate PDF"], tag: "RBAC · Audit Trail", icon: Award },
  { title: "National Analytics Dashboard", desc: "Real-time KPIs across startups, designations, and funding with sector- and region-wise analytics exportable to PDF and Excel.", caps: ["Real-time KPIs", "Sector and region analytics", "Interactive charts and tables", "One-click PDF/Excel export"], tag: "Real-time · Export", icon: BarChart3 },
  { title: "Regional STI Hub Management", desc: "Dedicated portals for regional administrators to manage hub branding, assign startups, and track local engagement.", caps: ["Regional admin accounts", "Hub branding customization", "Startup-to-hub assignment", "Regional engagement tracking"], tag: "RBAC · Regional", icon: MapPin },
  { title: "Incubation & Mentorship Tracking", desc: "Program scheduling, mentor assignment, attendance tracking, and automated evaluation reports across all regional hubs.", caps: ["Incubation program creation", "Mentor assignment and tracking", "Training session scheduling", "Progress and evaluation reports"], tag: "Programmatic", icon: Rocket },
  { title: "Role-Based Access Control", desc: "Six mandated roles from National Super Administrator to Startup User — each with dedicated, middleware-protected access.", caps: ["6 fully implemented roles", "Dedicated portals per role", "Middleware-protected routes", "Granular permissions"], tag: "RBAC · Security", icon: Users },
  { title: "Full Multilingual Support", desc: "Complete i18n framework with translation files for English, Amharic, and regional languages, localized across every module.", caps: ["Full i18n integration", "English & regional translations", "Locale routing selectors", "Fully localized dashboards"], tag: "i18n · Accessible", icon: Languages },
  { title: "Platform-Wide Audit Trail", desc: "Security and accountability are foundational. Every user action, data access event, and administrative change is logged immutably.", caps: ["Full audit logging", "SSL/TLS encryption", "Secrets management", "Middleware-protected routes"], tag: "Security · Audit", icon: History },
  { title: "Cloud-Ready Deployment", desc: "Production-grade deployment with automated backup systems, HTTPS enforcement, and scalable cloud infrastructure options.", caps: ["Cloud-ready infrastructure", "HTTPS and secure storage", "Automated backups", "Complete admin documentation"], tag: "DevOps", icon: Cloud },
];

const FAQS = [
  { q: "What is the MinT STI Platform?", a: "The national digital system for registering startups, coordinating regional innovation hubs, and administering designation under the Startup Proclamation No. 1396/2025." },
  { q: "What counts as innovation under the Proclamation?", a: "A business must show it creates value through one of four pillars: Introduction, Adoption, Transplantation, or Reverse Engineering." },
  { q: "How long does a Startup Designation last?", a: "A certificate is valid for 2 years and can be renewed, but a business cannot hold designated status for more than 8 total years from its original incorporation date." },
  { q: "What happens if our application is rejected?", a: "The Proclamation establishes a dedicated Grievance Committee. You have the legal right to appeal through a standardized dispute-resolution window." },
  { q: "What is a Regulatory Sandbox?", a: "A safe-to-fail environment for regulated sectors like Fintech and Healthtech, where startups can test new products under relaxed oversight." },
  { q: "How is my data protected?", a: "All connections are SSL/TLS-encrypted, data is encrypted at rest, and every action is logged in a platform-wide audit trail." },
];

const PARTNERS = [
  "Ministry of Finance", "National Bank of Ethiopia",
  "Ethiopian Investment Commission", "Regional Bureaus of Innovation",
  "Ministry of Trade & Integration", "National Digital Economy Council",
];

const ICON_SIZE = 24;

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || animated) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated) {
          setAnimated(true);
          const duration = 1300;
          const start = performance.now();
          function step(ts: number) {
            const p = Math.min((ts - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(eased * target));
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, animated]);

  return <div ref={ref}>{value}{suffix}</div>;
}

function FaqItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`faq-item${isOpen ? " open" : ""}`}>
      <button className="faq-trigger" aria-expanded={isOpen} onClick={onToggle}>
        <span>{q}</span>
        <span className="faq-indicator">+</span>
      </button>
      <div className="faq-content">
        <div className="faq-content-inner">{a}</div>
      </div>
    </div>
  );
}

function MarqueeTrack({ items, ...props }: { items: string[] } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="marquee-track" {...props}>
      {items.map((item) => (
        <span key={item} className="marquee-item">{item}</span>
      ))}
      {items.map((item) => (
        <span key={`dup-${item}`} className="marquee-item">{item}</span>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <div className="header-spacer" />
      <header>
        <div className="header-inner">
          <a href="#top" className="brand">
            <div className="brand-icon">M</div>
            <span className="brand-name">MinT STI Platform</span>
          </a>
          <nav>
            <div className="nav-links">
              <a href="#top">Home</a>
              <a href="#about">About</a>
              <a href="#features">Capabilities</a>
              <a href="#faq">FAQ</a>
              <a href="#contact">Contact</a>
            </div>
            <div className="lang-toggle" aria-label="Language selector">
              <span className="active">EN</span><span>|</span><span>AM</span>
            </div>
            <div className="auth-buttons">
              <Link href="/auth/sign-in" className="btn btn-outline">Login</Link>
              <Link href="/auth/sign-in" className="btn btn-primary">Register</Link>
            </div>
          </nav>
          <button className="menu-btn" aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero" id="top">
        <div className="hero-bar" />
        <div className="wrap">
          <div>
            <span className="eyebrow">National STI Registry — Proclamation No. 1396/2025</span>
            <h1>Ethiopia&apos;s Science, Technology &amp; Innovation Platform</h1>
            <p className="lede">One national system for startup registration, designation, regional hub coordination, and government oversight — built on the legal framework of the Startup Proclamation.</p>
            <div className="hero-ctas">
              <Link href="/auth/sign-in" className="btn btn-gold">Register a Startup</Link>
              <a href="#features" className="btn btn-ghost">Explore the Platform</a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-ring" />
            <div className="hero-ring r2" />
            <div className="icon-wrap">
              <Hexagon size={72} />
            </div>
          </div>
        </div>
        <div className="hero-stats">
          <div className="wrap">
            <div className="stats-grid">
              <div className="stat-cell">
                <div className="num"><AnimatedCounter target={312} /></div>
                <div className="lbl">Startups registered</div>
              </div>
              <div className="stat-cell">
                <div className="num"><AnimatedCounter target={24} /></div>
                <div className="lbl">Regional hubs onboarded</div>
              </div>
              <div className="stat-cell">
                <div className="num"><AnimatedCounter target={8} /></div>
                <div className="lbl">Regulatory sandboxes</div>
              </div>
              <div className="stat-cell">
                <div className="num"><AnimatedCounter target={100} suffix="%" /></div>
                <div className="lbl">Platform coverage</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="trusted">
        <div className="trusted-label">Working in coordination with</div>
        <div className="marquee-container">
          <MarqueeTrack items={PARTNERS} />
        </div>
      </section>

      {/* Mission / Vision */}
      <section id="about">
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag"><span className="dot" />About the platform</div>
            <h2>Built on the Startup Proclamation</h2>
            <p>The platform exists to administer, transparently and consistently, the legal designation process defined in Ethiopia&apos;s Startup Proclamation No. 1396/2025.</p>
          </div>
          <div className="mv-grid">
            <div className="mv-card">
              <div className="icon-wrap"><Rocket size={28} /></div>
              <h3>Mission</h3>
              <p>Give founders, regional hub administrators, and evaluators a single, transparent system to register, monitor, and report on national STI activity — replacing scattered spreadsheets and disconnected regional processes.</p>
            </div>
            <div className="mv-card">
              <div className="icon-wrap"><Target size={28} /></div>
              <h3>Vision</h3>
              <p>A platform trusted by government, useful to founders, and open to scrutiny — where every designation, report, and audit trail can be reviewed by the people it affects.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="pillars-section" id="pillars">
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag"><span className="dot" />Legal framework</div>
            <h2>Four Pillars of Legal Innovation</h2>
            <p>To qualify for designation, a business must demonstrate it creates economic value through one of four legally defined pathways.</p>
          </div>
          <div className="pillar-grid">
            {[
              { num: "01", icon: Sparkles, title: "Introduction", desc: "Bringing a completely novel tech-enabled product or service to the local Ethiopian market for the first time." },
              { num: "02", icon: Wrench, title: "Adoption", desc: "Modifying and applying existing technologies to solve systemic Ethiopian challenges that conventional approaches have not addressed." },
              { num: "03", icon: Globe, title: "Transplantation", desc: "Adapting a proven global technology model into the unique socioeconomic context and market conditions of Ethiopia." },
              { num: "04", icon: Cpu, title: "Reverse Engineering", desc: "Breaking down and rebuilding technological structures to localize manufacturing processes or software systems within Ethiopia." },
            ].map((p) => (
              <div key={p.title} className="pillar-card">
                <span className="pillar-num">{p.num}</span>
                <div className="pillar-icon"><p.icon size={22} /></div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ background: "var(--paper-alt)" }}>
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag"><span className="dot" />Platform modules</div>
            <h2>Core Capabilities</h2>
            <p>Every functional area of the platform, built to administer the Proclamation end to end.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="feature-card">
                  <div className="card-top">
                    <div className="feat-icon"><Icon size={20} /></div>
                    <h3>{f.title}</h3>
                    <span className="status-badge">Active</span>
                  </div>
                  <p className="desc">{f.desc}</p>
                  <ul>{f.caps.map((c) => <li key={c}>{c}</li>)}</ul>
                  <div className="card-bottom"><span className="tech-tag">{f.tag}</span></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Governance */}
      <section id="governance">
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag"><span className="dot" />Institutional structure</div>
            <h2>Three-Tier Governance Hierarchy</h2>
            <p>The Proclamation establishes a concrete three-tier system to remove bureaucratic silos and manage startup operations nationally.</p>
          </div>
          <div className="gov-hierarchy">
            {[
              { tier: "Tier 1 — Policy", icon: Crown, title: "National Digital Economy Council", desc: "Formulates macro digital policy, aligns the innovation agenda across all ministries, and supervises national ecosystem health at the highest level of government.", cls: "tier-1" },
              { tier: "Tier 2 — Execution", icon: Building2, title: "Ministry of Innovation and Technology (MinT)", desc: "Lead executor and administrative organ. Manages the Digital Startup Portal — a centralized service window designed to bypass standard regional business bureaucracy.", cls: "tier-2" },
              { tier: "Tier 3 — Evaluation", icon: Users, title: "National Startup Designation Committee", desc: "A multi-sectoral vetting board chaired by MinT — academic researchers, line ministry representatives, civil society actors, and industry veterans.", cls: "tier-3" },
            ].map((g, i) => (
              <div key={g.title}>
                <div className="gov-tier">
                  <div className={`gov-node ${g.cls}`}>
                    <div className="gov-icon"><g.icon size={22} /></div>
                    <div>
                      <span className="gov-level-tag">{g.tier}</span>
                      <h3>{g.title}</h3>
                      <p>{g.desc}</p>
                    </div>
                  </div>
                </div>
                {i < 2 && <div className="gov-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="eligibility-bg" id="eligibility">
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag"><span className="dot" />Eligibility</div>
            <h2>Startup Designation Criteria</h2>
            <p>Access to the Proclamation&apos;s benefits is not automatic. Companies must be vetted and formally designated against specific legal requirements.</p>
          </div>
          <div className="eligibility-layout">
            <div className="criteria-list">
              {[
                { num: "1", title: "Innovation & Scalability Test", desc: "The business must create positive economic value by deploying a highly scalable, tech-enabled product or business model via one of the four innovation pillars." },
                { num: "2", title: "Founder Equity Safeguard", desc: <>Original founding entrepreneurs must collectively retain at least <strong>25% of total equity</strong> — legally preventing early-stage predatory dilution.</> },
                { num: "3", title: "Entity Restriction", desc: "The business cannot be a public share company or trade on any stock exchange. It must be a standalone private venture." },
                { num: "4", title: "Age & History Limit", desc: <>The entity must be operating under a business license established for <strong>less than 5 years</strong> from the application date.</> },
              ].map((c) => (
                <div key={c.num} className="criteria-item">
                  <div className="criteria-num">{c.num}</div>
                  <div>
                    <h4>{c.title}</h4>
                    <p>{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="eco-card">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(212,175,55,0.12)", color: "var(--gold-light)", display: "grid", placeItems: "center" }}>
                <Network size={22} />
              </div>
              <div className="section-tag"><span className="dot" />Ecosystem Builders</div>
              <h3>Accredited Ecosystem Builder Designation</h3>
              <p>Auxiliary support organizations are formally recognized under a separate track. To qualify, an organization must actively operate in one of these capacities:</p>
              <div className="eco-tags">
                {["Incubator", "Accelerator", "Co-working Space", "Venture Capital", "Innovation Research"].map((t) => (
                  <span key={t} className="eco-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Financial Infrastructure */}
      <section className="finance-section" id="finance">
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag" style={{ background: "rgba(212,175,55,0.1)", color: "var(--gold-light)", borderColor: "rgba(212,175,55,0.2)" }}><span className="dot" />Financial infrastructure</div>
            <h2>Enhanced Funding &amp; Capital Mechanisms</h2>
            <p>Beyond tax relief, the framework establishes secondary capital mechanisms to structurally protect early-stage operations.</p>
          </div>
          <div className="finance-grid">
            {[
              { icon: HandCoins, title: "Startup Grant Program", desc: "A state-backed fund using government budgets and donor contributions to fund seed phase, R&D, and commercialization of new innovations. Exclusively for locally-owned designated startups.", tags: ["Seed Funding", "R&D Support", "Local Only"] },
              { icon: ShieldCheck, title: "National Credit Guarantee Fund", desc: "Overseen alongside the National Bank of Ethiopia. Provides credit guarantees to commercial lenders, absorbing default risk so startups can borrow without traditional property collateral.", tags: ["Collateral-Free", "NBE Oversight"] },
              { icon: Layers, title: "Fund-of-Funds Architecture", desc: "A sovereign co-investment structure attracting institutional global capital, private venture funds, and angel syndicates into co-investing structures within the local startup ecosystem.", tags: ["Global VC", "Angel Syndicates", "Sovereign"] },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="finance-card">
                  <div className="finance-icon"><Icon size={24} /></div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className="finance-tags">
                    {f.tags.map((t) => <span key={t} className="finance-tag">{t}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Compliance */}
      <section id="compliance">
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag"><span className="dot" />Compliance obligations</div>
            <h2>Strict Compliance Requirements</h2>
            <p>Receiving a designation is not a hands-off free pass. MinT enforces rigorous tracking to prevent exploitation of benefits.</p>
          </div>
          <div className="compliance-grid">
            {[
              { icon: Timer, title: "Designation Expiry Limits", desc: "A certificate is valid for 2 years and renewable, but a business cannot hold designated status for more than 8 total years from incorporation." },
              { icon: Building2, title: "Ecosystem Builder Lifespan", desc: "Innovation hubs, accelerators, and startup spaces are designated for 5 years at a time, subject to renewal evaluation." },
              { icon: BookOpenCheck, title: "Structural Auditing", desc: "Startups must notify MinT within 10 days of any changes to corporate hierarchy, equity distribution, or legal structure." },
              { icon: FileBarChart, title: "Corporate Reporting", desc: "Periodic utilization reports must detail how tax exemptions and duty-free capital goods are driving genuine innovation activity." },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.title} className="compliance-item">
                  <div className="compliance-bullet"><Icon size={18} /></div>
                  <div>
                    <h4>{c.title}</h4>
                    <p>{c.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Incentives */}
      <section id="incentives" style={{ background: "var(--paper-alt)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag"><span className="dot" />Incentives &amp; privileges</div>
            <h2>Expanded Incentives Under the Proclamation</h2>
            <p>Designated startups gain access to fiscal, regulatory, and market access privileges unavailable to standard business registrations.</p>
          </div>
          <div className="incentives-grid">
            {[
              { icon: Receipt, title: "Tax & Fiscal Relief", items: ["Corporate Income Tax Exemption — Full relief for a legally specified duration", "Duty-Free Importation — Capital goods and tech equipment imported duty-free", "Loss Carry-Forward — Carry forward operating losses for up to 2–3 years", "Investor Loss Coverage — Angels & VCs can carry forward losses if startup fails"], highlight: "Applies to both startups and accredited ecosystem builders" },
              { icon: Globe2, title: "Foreign Startup Exemptions", items: ["$200,000 Capital Waiver — Minimum capital entry requirement waived for designated startups", "Global VC Access — Foreign VCs can invest without massive upfront capital thresholds", "Startup Visas — Expedited work permits and multi-year entry visas for international tech talent"], highlight: "Startup Grant Program is reserved for locally-owned startups only" },
              { icon: TrendingUp, title: "Market & Procurement Access", items: ["Regulatory Sandboxes — Controlled testing environments for Fintech, Healthtech, etc.", "Public Procurement Preferences — Structural preferences in public sector bidding", "B2G Revenue — Secure the government as an early anchor customer"], highlight: "Procurement preferences lower barriers to first government contracts" },
            ].map((ic) => {
              const Icon = ic.icon;
              return (
                <div key={ic.title} className="incentive-card">
                  <div className="incentive-icon"><Icon size={22} /></div>
                  <h3>{ic.title}</h3>
                  <ul className="incentive-list">
                    {ic.items.map((it) => <li key={it} dangerouslySetInnerHTML={{ __html: it }} />)}
                  </ul>
                  <div className="highlight-box">{ic.highlight}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sandbox */}
      <section id="sandbox">
        <div className="wrap">
          <div className="sandbox-panel">
            <div className="sandbox-left">
              <div className="section-tag"><span className="dot" />Regulatory sandbox</div>
              <h2>A Safe-to-Fail Testing Environment</h2>
              <p>For highly regulated fields, MinT is mandated to spin up Regulatory Sandboxes — allowing startups to legally test disruptive products in a live market under relaxed oversight before standard licensing applies.</p>
              <div className="sandbox-sectors">
                {["Fintech", "Insurtech", "Healthtech", "Agritech", "Edtech", "Legaltech"].map((s) => (
                  <span key={s} className="sandbox-sector">{s}</span>
                ))}
              </div>
            </div>
            <div className="sandbox-features">
              {[
                { icon: ShieldOff, title: "Relaxed Oversight", desc: "Operate under suspended regulatory constraints during the sandbox phase — removing the licensing barrier." },
                { icon: FlaskConical, title: "Live Market Testing", desc: "Test real products with actual users — generating credible, auditable market data for full regulatory approval." },
                { icon: CheckCircle2, title: "Structured Exit Path", desc: "Clear pathway to standard regulatory compliance, with MinT supporting the transition to full licensing." },
              ].map((sf) => {
                const SfIcon = sf.icon;
                return (
                  <div key={sf.title} className="sandbox-feature">
                    <div className="sf-icon"><SfIcon size={20} /></div>
                    <div>
                      <h4>{sf.title}</h4>
                      <p>{sf.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section id="actions" style={{ background: "var(--paper-alt)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="section-center">
            <div className="section-tag"><span className="dot" />Portal access</div>
            <h2>Quick Actions</h2>
            <p>Three paths depending on who you are and what you need from the platform today.</p>
          </div>
          <div className="action-grid">
            <div className="action-card">
              <div className="icon"><FileSignature size={32} /></div>
              <h3>Startup Registration</h3>
              <p>Submit your application, upload supporting documents, and begin the designation process immediately.</p>
            </div>
            <div className="action-card">
              <div className="icon"><Building2 size={32} /></div>
              <h3>Regional Hub Portal</h3>
              <p>Manage incubation programs, mentor assignments, training schedules, and submit reports to the national level.</p>
            </div>
            <div className="action-card">
              <div className="icon"><TrendingUp size={32} /></div>
              <h3>Status &amp; Reports</h3>
              <p>Access live national dashboards, export reports in PDF or Excel, and review regional performance data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq">
        <div className="wrap faq-layout">
          <div className="faq-left">
            <div className="section-tag"><span className="dot" />FAQ</div>
            <h2>Frequently Asked Questions</h2>
            <p>Short answers to what people ask most about registration, designation, and incentives.</p>
          </div>
          <div className="faq-list">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} isOpen={openFaqIndex === i} onToggle={() => toggleFaq(i)} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-banner">
        <div className="wrap cta-inner">
          <h2>Ready to register your startup with MinT?</h2>
          <Link href="/auth/sign-in" className="btn btn-primary">Start Registration</Link>
        </div>
      </section>

      {/* Contact */}
      <section id="contact">
        <div className="wrap">
          <div className="contact-box">
            <div className="section-tag"><span className="dot" />Get in touch</div>
            <h2>We&apos;d love to hear from you</h2>
            <p className="intro">Whether you have a question about designation, a regional hub, or the platform itself, reach MinT directly.</p>
            <div className="contact-grid">
              <div className="contact-card">
                <div className="contact-icon"><Phone size={18} /></div>
                <div className="label">Phone</div>
                <div className="value"><a href="tel:+251110000000">+251 11 000 0000</a></div>
              </div>
              <div className="contact-card">
                <div className="contact-icon"><Mail size={18} /></div>
                <div className="label">Email</div>
                <div className="value"><a href="mailto:info@mint.gov.et">info@mint.gov.et</a></div>
              </div>
              <div className="contact-card">
                <div className="contact-icon"><MapPin size={18} /></div>
                <div className="label">Location</div>
                <div className="value">MinT Headquarters, Addis Ababa</div>
              </div>
            </div>
            <Link href="/auth/sign-in" className="btn btn-gold">Get Started</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-about">
              <a href="#top" className="brand">
                <div className="brand-icon">M</div>
                <span className="brand-name">MinT STI Platform</span>
              </a>
              <p>The national system for registering, designating, and monitoring Ethiopia&apos;s science, technology, and innovation ecosystem under Proclamation No. 1396/2025.</p>
            </div>
            {[
              { title: "Platform", links: [
                { label: "About", href: "#about" },
                { label: "Legal Definition", href: "#pillars" },
                { label: "Capabilities", href: "#features" },
                { label: "Governance", href: "#governance" },
              ]},
              { title: "Services", links: [
                { label: "Startup Registration", href: "#actions" },
                { label: "Regional Hub Portal", href: "#actions" },
                { label: "Funding", href: "#finance" },
                { label: "Compliance", href: "#compliance" },
              ]},
              { title: "Contact", links: [
                { label: "+251 11 000 0000", href: "tel:+251110000000" },
                { label: "info@mint.gov.et", href: "mailto:info@mint.gov.et" },
                { label: "Office Location", href: "#contact" },
              ]},
            ].map((col) => (
              <div key={col.title} className="footer-col">
                <h5>{col.title}</h5>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}><a href={link.href}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 Ministry of Innovation &amp; Technology &middot; Platform v3.0</span>
            <span>Developed &amp; Supported by <a href="https://vpsolutions.et">VP Solutions</a></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
