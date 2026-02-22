"use client";

import React, { useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Maximize2,
  X,
  ArrowRight,
} from "lucide-react";
import { SignUpButton, SignedOut } from "@clerk/nextjs";

/* -------------------------------------------------- */
/*  FloatingParticles                                  */
/* -------------------------------------------------- */

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      hue: number;
    }>
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = parent.clientWidth + "px";
      canvas.style.height = parent.clientHeight + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const count = 150;
    particlesRef.current = Array.from({ length: count }, () => {
      const x = Math.random() * window.innerWidth * dpr;
      const y = Math.random() * 2000 * dpr; // Cover down to carousel
      return {
        x,
        y,
        baseX: x,
        baseY: y,
        vx: 0,
        vy: 0,
        size: (1 + Math.random() * 2.5) * dpr,
        opacity: 0.08 + Math.random() * 0.2,
        hue: Math.random() > 0.5 ? 239 : 190,
      };
    });

    // Track mouse from window so canvas can be pointer-events:none
    const handleMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.current.x = (e.clientX - r.left) * dpr;
      mouse.current.y = (e.clientY - r.top) * dpr;
    };
    const handleLeave = () => {
      mouse.current.x = -1000;
      mouse.current.y = -1000;
    };
    window.addEventListener("pointermove", handleMove);
    document.body.addEventListener("pointerleave", handleLeave);

    let raf: number;
    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach((p) => {
        const dx = p.x - mouse.current.x;
        const dy = p.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const avoidRadius = 150 * dpr;
        
        let interacting = false;
        if (mouse.current.x > -100 && dist < avoidRadius && dist > 0) {
          interacting = true;
          const force = (avoidRadius - dist) / avoidRadius;
          p.vx += (dx / dist) * force * 0.8;
          p.vy += (dy / dist) * force * 0.8;
        }

        if (!interacting) {
          // Spring back to base
          const bx = p.baseX - p.x;
          const by = p.baseY - p.y;
          p.vx += bx * 0.015;
          p.vy += by * 0.015;
        }

        p.vx *= 0.92;
        p.vy *= 0.92;
        
        // Ambient jiggle
        p.vx += (Math.random() - 0.5) * 0.08;
        p.vy += (Math.random() - 0.5) * 0.08;

        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 65%, ${p.opacity})`;
        ctx.fill();
      });

      raf = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handleMove);
      document.body.removeEventListener("pointerleave", handleLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="floating-particles-canvas" />;
}

/* -------------------------------------------------- */
/*  GoogleIcon + GoogleSignUpButton                    */
/* -------------------------------------------------- */

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function GoogleSignUpButton() {
  return (
    <SignUpButton mode="modal">
      <button className="landing-btn-google">
        <GoogleIcon />
        Sign up with Google
      </button>
    </SignUpButton>
  );
}

/* -------------------------------------------------- */
/*  TiltCard                                          */
/* -------------------------------------------------- */

export function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setStyle({
      transform: `perspective(800px) rotateX(${-(y - 0.5) * 4}deg) rotateY(${(x - 0.5) * 4}deg)`,
      transition: "transform 0.08s ease",
    });
    setGlow({ x: x * 100, y: y * 100, opacity: 1 });
  }, []);

  const onLeave = useCallback(() => {
    setStyle({ transform: "none", transition: "transform 0.4s ease" });
    setGlow((g) => ({ ...g, opacity: 0 }));
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={style}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        className="tilt-card-glow"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(99,102,241,0.12), transparent 60%)`,
          opacity: glow.opacity,
        }}
      />
      {children}
    </div>
  );
}

/* -------------------------------------------------- */
/*  ExpandableBentoCard                               */
/* -------------------------------------------------- */

export function ExpandableBentoCard({
  children,
  className = "",
  title,
  description,
  expandedDetails,
}: {
  children: ReactNode;
  className?: string;
  title: string;
  description: string;
  expandedDetails?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glow, setGlow] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setGlow({ x: x * 100, y: y * 100, opacity: 1 });
  }, []);

  const onLeave = useCallback(() => {
    setGlow((g) => ({ ...g, opacity: 0 }));
  }, []);

  useEffect(() => {
    if (expanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [expanded]);

  const clonedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === BentoBackground) {
      return React.cloneElement(child as React.ReactElement<any>, { isHovered });
    }
    return child;
  });

  return (
    <>
      <div
        ref={ref}
        className={`landing-bento-card relative overflow-hidden group ${className || ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setExpanded(true)}
        style={style}
      >
        <div
          className="tilt-card-glow"
          style={{
            background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(99,102,241,0.12), transparent 60%)`,
            opacity: glow.opacity,
          }}
        />
        <button
          className="bento-expand-btn"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(true);
          }}
          aria-label="Expand"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        {clonedChildren}
      </div>

      {mounted && expanded && document.body
        ? createPortal(
            <div
              className="bento-modal-overlay"
              onClick={() => setExpanded(false)}
            >
              <div
                className="bento-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bento-modal-header flex justify-between items-center p-6 border-b border-[var(--border)]">
                  <h3 className="landing-h3 m-0">{title}</h3>
                  <button
                    className="bento-modal-close text-[var(--text-muted)] hover:text-white transition-colors"
                    onClick={() => setExpanded(false)}
                    aria-label="Close"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="bento-modal-body p-8 lg:p-12">
                  <p className="landing-body text-lg text-[var(--text-secondary)] mb-8 max-w-2xl">{description}</p>
                  {expandedDetails && (
                    <div className="bento-modal-details text-[var(--text-secondary)]">
                      {expandedDetails}
                    </div>
                  )}
                </div>
                <div className="bento-modal-footer p-6 lg:padding-x-12 border-t border-[var(--border)] flex justify-center gap-4">
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="landing-btn-primary">
                        Get started
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignUpButton>
                    <SignUpButton mode="modal">
                      <button className="landing-btn-google">
                        <GoogleIcon />
                        Sign up with Google
                      </button>
                    </SignUpButton>
                  </SignedOut>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

/* -------------------------------------------------- */
/*  ScrollReveal                                       */
/* -------------------------------------------------- */

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-reveal ${visible ? "scroll-reveal-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------- */
/*  NumberCarousel                                    */
/* -------------------------------------------------- */

const CAROUSEL_ITEMS = [
  {
    symbol: "\u03C0",
    name: "Pi",
    digits: "3.14159265358979323846...",
    colour: "#6366f1",
    desc: "The ratio of a circle\u2019s circumference to its diameter.",
  },
  {
    symbol: "e",
    name: "Euler\u2019s Number",
    digits: "2.71828182845904523536...",
    colour: "#8b5cf6",
    desc: "The base of natural logarithms, representing continuous growth.",
  },
  {
    symbol: "\u03C6",
    name: "Golden Ratio",
    digits: "1.61803398874989484820...",
    colour: "#06b6d4",
    desc: "Found in art, architecture, and nature\u2019s spirals.",
  },
  {
    symbol: "\u221A2",
    name: "Root 2",
    digits: "1.41421356237309504880...",
    colour: "#ec4899",
    desc: "The first known irrational number, from the Pythagoreans.",
  },
  {
    symbol: "\u03B3",
    name: "Euler\u2013Mascheroni",
    digits: "0.57721566490153286060...",
    colour: "#3b82f6",
    desc: "The limit between the harmonic series and the natural logarithm.",
  },
  {
    symbol: "\u03B1",
    name: "Fine Structure",
    digits: "0.00729735256...",
    colour: "#f59e0b",
    desc: "The coupling constant for electromagnetic interaction.",
  },
  {
    symbol: "\u221A3",
    name: "Root 3",
    digits: "1.73205080757...",
    colour: "#22c55e",
    desc: "Key to equilateral triangles and hexagonal geometry.",
  },
  {
    symbol: "N\u2090",
    name: "Avogadro",
    digits: "6.02214076 \u00D7 10\u00B2\u00B3",
    colour: "#ef4444",
    desc: "The number of particles in one mole of a substance.",
  },
  {
    symbol: "\u03C4",
    name: "Tau",
    digits: "6.28318530717...",
    colour: "#a78bfa",
    desc: "Tau = 2\u03C0. The ratio of circumference to radius.",
  },
  {
    symbol: "\u221A5",
    name: "Root 5",
    digits: "2.23606797749...",
    colour: "#10b981",
    desc: "Connected to the golden ratio: \u03C6 = (1+\u221A5)/2.",
  },
  {
    symbol: "ln2",
    name: "Nat. Log 2",
    digits: "0.69314718055...",
    colour: "#f472b6",
    desc: "Fundamental in information theory. 1 bit = ln2 nats.",
  },
  {
    symbol: "G",
    name: "Catalan",
    digits: "0.91596559417...",
    colour: "#34d399",
    desc: "The alternating sum of reciprocals of odd squares.",
  },
  {
    symbol: "\u03B6(3)",
    name: "Ap\u00E9ry",
    digits: "1.20205690315...",
    colour: "#fb923c",
    desc: "Proven irrational by Ap\u00E9ry in 1978, stunning mathematicians.",
  },
  {
    symbol: "K",
    name: "Khinchin",
    digits: "2.68545200106...",
    colour: "#38bdf8",
    desc: "The geometric mean of continued fraction quotients.",
  },
  {
    symbol: "\u03B4",
    name: "Feigenbaum",
    digits: "4.66920160910...",
    colour: "#c084fc",
    desc: "Universal ratio in bifurcation routes to chaos.",
  },
  {
    symbol: "\u03C1",
    name: "Plastic Ratio",
    digits: "1.32471795724...",
    colour: "#4ade80",
    desc: "The real root of x\u00B3 = x + 1, a 3D cousin of \u03C6.",
  },
  {
    symbol: "C\u2081\u2080",
    name: "Champernowne",
    digits: "0.12345678910...",
    colour: "#f87171",
    desc: "Formed by concatenating all natural numbers.",
  },
];

export function NumberCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 8);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [checkScroll]);

  const scroll = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    // Temporarily disable snap to prevent snap-back fighting
    el.style.scrollSnapType = "none";
    el.scrollBy({ left: dir * 296, behavior: "smooth" });
    setTimeout(() => {
      el.style.scrollSnapType = "x mandatory";
      checkScroll();
    }, 400);
  };

  return (
    <div className="carousel-wrap">
      <div className="carousel-controls">
        <button
          className="carousel-arrow"
          disabled={!canLeft}
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          className="carousel-arrow"
          disabled={!canRight}
          onClick={() => scroll(1)}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="carousel-track">
        {CAROUSEL_ITEMS.map((item) => (
          <div key={item.symbol} className="carousel-card">
            <span
              className="carousel-symbol"
              style={{ color: item.colour }}
            >
              {item.symbol}
            </span>
            <h4 className="carousel-name">{item.name}</h4>
            <p className="carousel-digits">{item.digits}</p>
            <p className="carousel-desc">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  MetricsStrip                                      */
/* -------------------------------------------------- */

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const dur = 1800;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * ease));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}

export function MetricsStrip() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const onMove = useCallback((e: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setGlow({
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    });
  }, []);

  return (
    <div ref={wrapRef} className="metrics-strip" onMouseMove={onMove}>
      <div
        className="metrics-glow"
        style={{
          background: `radial-gradient(ellipse at ${glow.x}% ${glow.y}%, rgba(99,102,241,0.10) 0%, transparent 60%)`,
        }}
      />
      <div className="metrics-inner">
        <div className="metric">
          <span className="metric-value">
            <AnimatedNumber target={17} suffix="+" />
          </span>
          <span className="metric-label">mathematical constants</span>
        </div>
        <div className="metric">
          <span className="metric-value">
            <AnimatedNumber target={1000} suffix="+" />
          </span>
          <span className="metric-label">digits per constant</span>
        </div>
        <div className="metric">
          <span className="metric-value">
            <AnimatedNumber target={14} />
          </span>
          <span className="metric-label">interactive panel types</span>
        </div>
        <div className="metric">
          <span className="metric-value">
            100<span className="metric-pct">%</span>
          </span>
          <span className="metric-label">ad-free experience</span>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  MouseGlowSection                                  */
/* -------------------------------------------------- */

export function MouseGlowSection({
  children,
  className = "",
  colour = "99,102,241",
}: {
  children: ReactNode;
  className?: string;
  colour?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const onMove = useCallback(
    (e: React.MouseEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      setPos({
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      });
    },
    []
  );

  return (
    <div ref={ref} className={`mouse-glow-section ${className}`} onMouseMove={onMove}>
      <div
        className="mouse-glow-bg"
        style={{
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(${colour},0.07) 0%, transparent 50%)`,
        }}
      />
      {children}
    </div>
  );
}

/* -------------------------------------------------- */
/*  FAQSection                                        */
/* -------------------------------------------------- */

const FAQ_DATA = [
  {
    q: "What is Number Learn Studio?",
    a: "An interactive web application for memorising mathematical constants like Pi, Euler\u2019s number, and the Golden Ratio. It provides a VS\u00a0Code\u2011style workspace with multiple learning tools side by side.",
  },
  {
    q: "What is the Major System?",
    a: "A phonetic mnemonic technique that converts digits into consonant sounds, which you then form into memorable words. For example, 1-4-1-5 becomes \u201Cturtle\u201D. It\u2019s used by memory champions worldwide.",
  },
  {
    q: "Which constants are available?",
    a: "Over 17 built-in constants including Pi, Euler\u2019s number, the Golden Ratio, \u221A2, Euler\u2013Mascheroni, Avogadro\u2019s number, the speed of light, Planck\u2019s constant, and more. You can also add your own custom numbers with up to 1,000 digits.",
  },
  {
    q: "Can I add my own numbers?",
    a: "Absolutely. You can paste or type any number up to 1,000 digits long. Custom numbers appear in your sidebar alongside the built-in constants.",
  },
  {
    q: "How does progress tracking work?",
    a: "Your progress is saved locally and synced to the cloud when you sign in. We track digits learnt, accuracy, speed (digits per minute), streaks, and achievements.",
  },
  {
    q: "What panel types are there?",
    a: "Fourteen: digit display, recall test, typing practice, chunk trainer, sequence, canvas, notes, scratchpad, timeline, progress, statistics, Major System helper, Piem generator, and achievements.",
  },
  {
    q: "Does it work on mobile?",
    a: "The studio is optimised for desktop with keyboard shortcuts and split panels. The landing page and basic features work on mobile, but the full studio experience is best on a larger screen.",
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="faq-list">
      {FAQ_DATA.map((item, i) => (
        <button
          key={i}
          className={`faq-item ${open === i ? "faq-open" : ""}`}
          onClick={() => setOpen(open === i ? null : i)}
          aria-expanded={open === i}
        >
          <div className="faq-q">
            <span>{item.q}</span>
            <ChevronDown className="faq-chevron" />
          </div>
          <div className="faq-a-wrap">
            <p className="faq-a">{item.a}</p>
          </div>
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------- */
/*  Bento Interactions & Animations                   */
/* -------------------------------------------------- */

export function BentoBackground({ isHovered = false }: { isHovered?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const hoverRef = useRef(isHovered);

  useEffect(() => {
    hoverRef.current = isHovered;
  }, [isHovered]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf: number;

    const render = () => {
      const w = canvas.width = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      timeRef.current += hoverRef.current ? 0.005 : 0.001;
      const t = timeRef.current;
      
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(99, 102, 241, 0.05)";
      
      for (let i = 0; i < 40; i++) {
        const x = (Math.sin(t + i * 0.2) * 0.5 + 0.5) * w;
        const y = (Math.cos(t * 0.8 + i * 0.3) * 0.5 + 0.5) * h;
        const r = Math.sin(t * 2 + i) * 10 + 15;
        
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.1, r), 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0
      }} 
    />
  );
}

export function PracticeMockup() {
  const [text, setText] = useState("");
  const [errorIndex, setErrorIndex] = useState(-1);

  useEffect(() => {
    const sequence = [
      { t: "3", e: false, d: 200 },
      { t: "3.", e: false, d: 200 },
      { t: "3.1", e: false, d: 200 },
      { t: "3.14", e: false, d: 200 },
      { t: "3.141", e: false, d: 200 },
      { t: "3.1416", e: true, d: 600 }, // Error
      { t: "3.141", e: false, d: 300 }, // Backspace
      { t: "3.1415", e: false, d: 200 },
      { t: "3.14159", e: false, d: 200 },
      { t: "3.1415", e: false, d: 200 }, // Backspace 
      { t: "3.141", e: false, d: 200 },
      { t: "3.14", e: false, d: 200 },
      { t: "3.1", e: false, d: 200 },
      { t: "3.", e: false, d: 200 },
      { t: "3", e: false, d: 200 },
      { t: "", e: false, d: 500 },
    ];

    let step = 0;
    let timeout: NodeJS.Timeout;

    const next = () => {
      setText(sequence[step].t);
      setErrorIndex(sequence[step].e ? sequence[step].t.length - 1 : -1);
      
      timeout = setTimeout(() => {
        step = (step + 1) % sequence.length;
        next();
      }, sequence[step].d);
    };
    next();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="landing-mockup landing-mockup-major" style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: "2rem", fontFamily: "var(--font-mono)", letterSpacing: "4px" }}>
        {text.split("").map((c, i) => (
          <span key={i} style={{ color: i === errorIndex ? "var(--error)" : "var(--primary)" }}>
            {c}
          </span>
        ))}
        <span style={{ borderRight: "2px solid var(--primary)", animation: "pulse 1s infinite" }}>&nbsp;</span>
      </div>
    </div>
  );
}

export function MajorSystemMockup() {
  const pairs = [
    { digits: "14", word: "turtle", map: "1 → T, 4 → R" },
    { digits: "15", word: "tail", map: "1 → T, 5 → L" },
    { digits: "92", word: "bone", map: "9 → B, 2 → N" },
    { digits: "65", word: "jail", map: "6 → J, 5 → L" },
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % pairs.length), 2500);
    return () => clearInterval(t);
  }, [pairs.length]);

  return (
    <div className="landing-mockup landing-mockup-major">
      <div className="landing-mockup-mapping">
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{pairs[index].digits}</span>
        <span>{pairs[index].map}</span>
      </div>
      <div className="landing-mockup-word" style={{ animation: "fadeIn 0.5s" }} key={index}>
        &ldquo;{pairs[index].word}&rdquo;
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/*  DigitStream (decorative scrolling digits)         */
/* -------------------------------------------------- */

export function DigitStream() {
  const digits =
    "3.141592653589793238462643383279502884197169399375105820974944592307816406286208998628034825342117067982148086513282306647093844609550582231725359408128481";
  return (
    <div className="digit-stream" aria-hidden="true">
      <div className="digit-stream-inner">
        <div className="digit-stream-track">
          <span>{digits}</span>
          <span>{digits}</span>
        </div>
      </div>
    </div>
  );
}
