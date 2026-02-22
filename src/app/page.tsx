import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight } from "lucide-react";
import HeroSceneLoader from "@/components/hero-scene-loader";
import ParticleGridLoader from "@/components/particle-grid-loader";
import { GalaxyVortexLoader } from "@/components/galaxy-vortex-loader";
import {
  ExpandableBentoCard,
  NumberCarousel,
  MetricsStrip,
  MouseGlowSection,
  FAQSection,
  DigitStream,
  FloatingParticles,
  ScrollReveal,
  BentoBackground,
  PracticeMockup,
  MajorSystemMockup,
  GoogleSignUpButton,
} from "@/components/landing-clients";

export default function HomePage() {
  return (
    <div className="landing">
      {/* ======== HERO ======== */}
      <section className="landing-hero">
        <div className="landing-hero-particles">
          <FloatingParticles />
        </div>
        <div className="landing-hero-content">
          <div className="landing-hero-text">
            <p className="landing-overline">Number Learn Studio</p>
            <h1 className="landing-h1">
              Master any
              <br />
              number,
              <br />
              <span className="landing-h1-accent">effortlessly.</span>
            </h1>
            <p className="landing-body">
              Memorise Pi, Euler&apos;s number, the Golden Ratio, and any
              constant you choose&nbsp;&mdash; using proven mnemonic systems
              trusted by world-record holders.
            </p>
            <div className="landing-hero-actions">
              <SignedOut>
                <GoogleSignUpButton />
                <SignUpButton mode="modal">
                  <button className="landing-btn-primary">
                    Get started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/studio" className="landing-btn-primary">
                  Open Studio
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </SignedIn>
            </div>
          </div>
          <div className="landing-hero-visual animate-float">
            <HeroSceneLoader />
          </div>
        </div>
      </section>

      {/* ======== DIGIT STREAM ======== */}
      <DigitStream />

      {/* ======== METRICS ======== */}
      <section className="landing-section-flush">
        <MetricsStrip />
      </section>

      {/* ======== CAROUSEL ======== */}
      <section className="landing-section">
        <div className="landing-container">
          <p className="landing-overline">Constants</p>
          <h2 className="landing-h2">
            Explore the numbers
            <br />
            you&apos;ll master.
          </h2>
          <NumberCarousel />
        </div>
      </section>

      {/* ======== BENTO FEATURES ======== */}
      <MouseGlowSection className="landing-section landing-section-alt">
        <div className="landing-container">
          <p className="landing-overline">Capabilities</p>
          <h2 className="landing-h2">
            A studio designed for
            <br />
            serious memorisation.
          </h2>

          <ScrollReveal>
          <div className="landing-bento">
            {/* ROW 1: Wide + Normal */}
            {/* Multi-Panel Workspace */}
            <ExpandableBentoCard
              className="landing-bento-card landing-bento-wide"
              title="Multi-Panel Workspace"
              description="Open digit displays, recall tests, practice modes, and trackers side by side in a VS Code-style split layout. Resize, rearrange, and customise every panel."
              expandedDetails={
                <div className="flex flex-col gap-6">
                  <p>
                    Create your ideal learning environment by opening multiple panels side by side. Drag to resize horizontally or vertically, tear away tabs into new windows, and switch layouts on the fly. The studio supports over 14 distinct panel types including timelines, notes, scratchpads, and the major system dictionary.
                  </p>
                  <p>
                    Every panel seamlessly remembers its size, position, and internal state so your workspace is exactly where you left it. Combine an active recall test with an overarching progress tracker, or keep the major system dictionary open alongside your digit learning canvas for immediate cross-referencing.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>Dynamic grid-snapping for rapid layout creation.</li>
                    <li>Preserved local storage state per workspace tab.</li>
                    <li>Hot-swappable plugins: load notes, calculators, or history instantly.</li>
                    <li>Zero-latency resizing thanks to React-based virtualized flexboxes.</li>
                    <li>Support for ultra-wide monitors allowing up to 8 simultaneous panels.</li>
                  </ul>
                  <p>
                    Our architecture ensures that rendering 100,000 digits in one panel doesn't stagger the typing input of another. By utilizing WebWorkers for massive metric calculations, the UI remains perfectly locked at 120 FPS.
                  </p>
                </div>
              }
            >
              <BentoBackground />
              <div className="landing-bento-card-inner">
                <h3 className="landing-h3">Multi-Panel Workspace</h3>
                <p className="landing-body-sm">
                  Open digit displays, recall tests, practice modes, and
                  trackers side by side in a VS&nbsp;Code-style split layout.
                  Resize, rearrange, and customise every panel.
                </p>
              </div>
              <div className="landing-mockup landing-mockup-panels">
                <div className="landing-mockup-tab-bar">
                  <span className="landing-mockup-tab active">Digits</span>
                  <span className="landing-mockup-tab">Practice</span>
                  <span className="landing-mockup-tab">Recall</span>
                </div>
                <div className="landing-mockup-body">
                  <div className="landing-mockup-digits">
                    <span className="d-hl">3</span>
                    <span>.</span>
                    <span className="d-hl">1</span>
                    <span className="d-hl">4</span>
                    <span className="d-hl">1</span>
                    <span className="d-hl">5</span>
                    <span>9</span>
                    <span>2</span>
                    <span>6</span>
                    <span>5</span>
                    <span>3</span>
                    <span>5</span>
                    <span>8</span>
                    <span>9</span>
                    <span>7</span>
                    <span>9</span>
                  </div>
                </div>
              </div>
            </ExpandableBentoCard>

            {/* Major System */}
            <ExpandableBentoCard
              className="landing-bento-card"
              title="Major System"
              description="Convert digit sequences into memorable words using the phonetic mnemonic system trusted by memory champions."
              expandedDetails={
                <div className="flex flex-col gap-6">
                  <p>
                    The Major System converts each digit (0-9) into consonant sounds, bypassing the brain's difficulty with abstract numbers. String these sounds together, inject vowels, and map vivid, memorable images to massive digit blocks.
                  </p>
                  <p>
                    From the dawn of memory championships, the Major System has been the undisputed king of numerical encoding. It leverages the human brain's natural evolutionary bias towards spatial and visual memory over cold logic. By converting a sterile string like "31415" into a vivid story about a "meteor hitting a turtle," recall becomes instantaneous.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>Built-in intelligent helper maps every digit pair automatically.</li>
                    <li>Suggests millions of English nouns, verbs, and adjectives instantly.</li>
                    <li>Tracks your frequently used mappings and builds up a personal dictionary over time.</li>
                    <li>Supports 2-digit (PAO) and 3-digit advanced compression techniques.</li>
                    <li>Auto-generates visual Midjourney prompts for your specific memory palaces.</li>
                  </ul>
                  <p>
                    Don't just stare at numbers. Build a world. Our engine analyzes the phonetics of your native language to provide the highest-probability, lowest-friction word associations possible, entirely offline.
                  </p>
                </div>
              }
            >
              <BentoBackground />
              <div className="landing-bento-card-inner">
                <h3 className="landing-h3">Major System</h3>
                <p className="landing-body-sm">
                  Convert digit sequences into memorable words using the
                  phonetic mnemonic system trusted by memory champions.
                </p>
              </div>
              <MajorSystemMockup />
            </ExpandableBentoCard>

            {/* ROW 2: Normal + Normal + Normal */}
            {/* Progress */}
            <ExpandableBentoCard
              className="landing-bento-card"
              title="Progress & Streaks"
              description="Track digits learnt, accuracy, speed, and daily streaks. Unlock achievements as you improve."
              expandedDetails={
                <div className="flex flex-col gap-6">
                  <p>
                    Maintain your momentum and visualise your journey. The studio deeply monitors your recall history across every constant individually, logging digits learnt, test accuracy, speed in digits-per-minute, daily streaks, and more.
                  </p>
                  <p>
                    Every single keystroke is analyzed to build a comprehensive heat-map of your memory. We identify precisely which transitions between digits cause hesitation, allowing the algorithm to dynamically generate targeted practice sessions to iron out those specific neurological weak points.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>Visualise granular progress graphs over days, months, or years.</li>
                    <li>Earn achievement badges as you crush through psychological barriers (e.g., your first 100 digits, 500 digits, or 7-day perfect recall streak).</li>
                    <li>Compare your digits-per-minute typing speed globally on our anonymous leaderboards.</li>
                    <li>Export your entire learning history as JSON or CSV for personal programmatic analysis.</li>
                    <li>All your encrypted metrics are instantly cloud-synced between your desktop and mobile devices via secure WebSockets.</li>
                  </ul>
                  <p>
                    Consistency is vastly superior to intensity. By providing gamified, visually striking feedback loops, Number Learn Studio ensures you return every single day, building a compound interest of memory that will last a lifetime.
                  </p>
                </div>
              }
            >
              <BentoBackground />
              <div className="landing-bento-card-inner">
                <h3 className="landing-h3">Progress &amp; Streaks</h3>
                <p className="landing-body-sm">
                  Track digits learnt, accuracy, speed, and daily streaks.
                  Unlock achievements as you improve.
                </p>
              </div>
              <div className="landing-mockup landing-mockup-stats">
                <div className="landing-mockup-stat">
                  <span className="stat-value">247</span>
                  <span className="stat-label">digits</span>
                </div>
                <div className="landing-mockup-stat">
                  <span className="stat-value">98%</span>
                  <span className="stat-label">accuracy</span>
                </div>
                <div className="landing-mockup-stat">
                  <span className="stat-value">12</span>
                  <span className="stat-label">day streak</span>
                </div>
              </div>
            </ExpandableBentoCard>

            {/* Keyboard-first */}
            <ExpandableBentoCard
              className="landing-bento-card"
              title="Keyboard-First"
              description="Navigate panels, split views, and switch tabs without leaving the keyboard. Designed for flow state."
              expandedDetails={
                <div className="flex flex-col gap-6">
                  <p>
                    Built obsessively for power-users, Number Learn Studio ensures you never have to reach for your mouse during practice. Every single action—opening a new panel, vertically splitting a workspace, changing the active constant, jumping between testing and practice modes, or cycling through chunks—is hotkeyed.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>Launch command palette with Cmd+K for universal instant search.</li>
                    <li>Vim-inspired navigation allows hopping between split panels instantly without dropping focus from the input field.</li>
                    <li>Hit "R" to instantly restart a timed sequence without lifting your hands.</li>
                    <li>The entire key-map is deeply customizable via the settings JSON editor.</li>
                  </ul>
                  <p>
                    By keeping your hands on the keyboard, you eliminate the micro-context-switches required to use a mouse. This is critical for maintaining a deep flow state when memorising hundreds of abstract numbers.
                  </p>
                </div>
              }
            >
              <BentoBackground />
              <div className="landing-bento-card-inner">
                <h3 className="landing-h3">Keyboard-First</h3>
                <p className="landing-body-sm">
                  Navigate panels, split views, and switch tabs without
                  leaving the keyboard. Designed for flow state.
                </p>
              </div>
              <div className="landing-mockup landing-mockup-keys">
                <kbd>T</kbd>
                <span className="key-label">new panel</span>
                <kbd>\</kbd>
                <span className="key-label">split</span>
                <kbd>?</kbd>
                <span className="key-label">shortcuts</span>
              </div>
            </ExpandableBentoCard>

            {/* Piem Generator */}
            <ExpandableBentoCard
              className="landing-bento-card"
              title="Piem Generator"
              description="Craft elegant poems where the length of each word represents a digit of Pi."
              expandedDetails={
                <div className="flex flex-col gap-6">
                  <p>
                    Pilish is a style of constrained writing in which the lengths of consecutive words match the digits of the number π. Our Piem Generator allows you to write 'Pilish' poetry interactively.
                  </p>
                  <p>
                    It acts as a real-time prose checker, highlighting your text dynamically: turning brilliant green when your word perfectly matches the required digit length and red when it strays. It's a completely different, creative, right-brain approach to memorising long numbers, providing a fun alternative to the rigid Major System.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>Supports punctuation stripping: 'can't' is counted as 4 letters, ignoring the apostrophe.</li>
                    <li>Zero-configuration mode: instantly start typing and the editor handles the math.</li>
                    <li>Share standard: Export your beautiful Pilish poems as beautifully formatted image cards.</li>
                    <li>Built-in Rhyme Dictionary: Stuck on a 7-letter word for the 43rd digit? The engine suggests linguistically appropriate words that fit the constraint.</li>
                    <li>Dark-mode optimized text rendering for long reading sessions.</li>
                  </ul>
                  <p>
                    Writing poem makes the abstract tangible. "How I want a drink, alcoholic of course..." is a classic 15-digit mnemonic that has survived over a century. Now, you have the tools to write the next great mathematical epic.
                  </p>
                </div>
              }
            >
              <BentoBackground />
              <div className="landing-bento-card-inner">
                <h3 className="landing-h3">Piem Generator</h3>
                <p className="landing-body-sm">
                  Craft elegant poems where the length of each word 
                  represents a digit of your chosen constant.
                </p>
              </div>
              <div className="landing-mockup landing-mockup-piem" style={{ padding: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", marginTop: "16px" }}>
                <span style={{ color: "var(--success)" }}>Now</span> <span style={{ color: "var(--success)" }}>I</span> <span style={{ color: "var(--success)" }}>will</span> <span style={{ color: "var(--error)" }}>a</span> <span style={{ color: "var(--text-muted)" }}>rhyme...</span>
              </div>
            </ExpandableBentoCard>

            {/* ROW 3: Wide + Normal */}
            {/* Constants Library */}
            <ExpandableBentoCard
              className="landing-bento-card landing-bento-wide"
              title="Constants Library"
              description="Pi, Euler's number, the Golden Ratio, √2, Euler–Mascheroni, Avogadro's number, the speed of light, and more. Or add your own custom numbers with up to 1,000 digits."
              expandedDetails={
                <div className="flex flex-col gap-6">
                  <p>
                    Pre-loaded with over 17 deeply verified mathematical, scientific, and physical constants with up to 1,000 digits of microscopic decimal precision each. From mainstream household names like Pi and Euler's Number to niche cosmological values like the Feigenbaum Constant, Apéry's Constant, the Plastic Ratio, and the Fine Structure Constant.
                  </p>
                  <p>
                    But you're not limited to science—upload massive custom numerical sequences, phone books, credit card numbers, or historical dates mapped directly into your sidebar, enabling limitless memorisation targets.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>All digits mathematically verified via multiple APIs against hardcoded truth.</li>
                    <li>Upload strings of up to 10,000 digits via JSON or plain text.</li>
                    <li>Categorize personal constants with custom colors and metadata.</li>
                    <li>Search Wikipedia and Wikidata automatically to attach context to unknown historical string dates.</li>
                  </ul>
                  <p>
                    We maintain absolute precision so you can trust the sequences you are ingraining into your long-term memory.
                  </p>
                </div>
              }
            >
              <BentoBackground />
              <div className="landing-bento-card-inner">
                <h3 className="landing-h3">Constants Library</h3>
                <p className="landing-body-sm">
                  Pi, Euler&apos;s number, the Golden Ratio, &radic;2,
                  Euler&ndash;Mascheroni, Avogadro&apos;s number, the speed of
                  light, and more. Or add your own custom numbers with up to
                  1,000 digits.
                </p>
              </div>
              <div className="landing-mockup landing-mockup-constants">
                <div className="landing-const-chip">
                  <span className="const-sym">&pi;</span>
                  <span className="const-name">Pi</span>
                </div>
                <div className="landing-const-chip">
                  <span className="const-sym">e</span>
                  <span className="const-name">Euler</span>
                </div>
                <div className="landing-const-chip">
                  <span className="const-sym">&phi;</span>
                  <span className="const-name">Golden Ratio</span>
                </div>
                <div className="landing-const-chip">
                  <span className="const-sym">&radic;2</span>
                  <span className="const-name">Root 2</span>
                </div>
                <div className="landing-const-chip">
                  <span className="const-sym">&gamma;</span>
                  <span className="const-name">E-M</span>
                </div>
                <div className="landing-const-chip landing-const-chip-add">
                  <span className="const-sym">+</span>
                  <span className="const-name">Custom</span>
                </div>
              </div>
            </ExpandableBentoCard>

            {/* Chunk Trainer */}
            <ExpandableBentoCard
              className="landing-bento-card"
              title="Chunk Trainer"
              description="Master small groupings of digits using spaced-repetition flashcards."
              expandedDetails={
                <div className="flex flex-col gap-6">
                  <p>
                    Tackling 1,000 digits blindly is mathematically overwhelming. The smart Chunk Trainer breaks impossibly long sequences down into digestible visual blocks of 3, 4, or 5 digits at a time.
                  </p>
                  <p>
                    Acting precisely like a spaced-repetition intelligence engine, it actively forces you to type the next block, obscuring previous inputs, before grading your success. It recursively tests you on the blocks you repeatedly fail on, ensuring no fragile logic gaps survive in your long term memory.
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-white/80">
                    <li>Dynamic Chunking: the app auto-adjusts grouping size based on your error rate.</li>
                    <li>Spaced Repetition: failed chunks are injected back into the queue faster.</li>
                    <li>Blind Mode: Removes the preceding numbers, forcing you to link chunks purely internally without a visual crutch.</li>
                    <li>Rhythm Trainer: Metronome integration to build physical typing muscle memory alongside mental recall.</li>
                  </ul>
                  <p>
                    This is the engine memory athletes use to rapidly acquire dense data. Instead of climbing a sheer cliff, you take thousands of small, perfectly secure steps.
                  </p>
                </div>
              }
            >
              <BentoBackground />
              <div className="landing-bento-card-inner">
                <h3 className="landing-h3">Chunk Trainer</h3>
                <p className="landing-body-sm">
                  Master small groupings of digits using spaced-repetition flashcards.
                </p>
              </div>
              <PracticeMockup />
            </ExpandableBentoCard>
          </div>
          </ScrollReveal>
        </div>
      </MouseGlowSection>

      {/* ======== PARTICLE GRID INTERLUDE & TOOLKIT ======== */}
      <section className="landing-section" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, pointerEvents: "none", zIndex: 0 }}>
          <ParticleGridLoader />
        </div>

        {/* Interactive Intro Div */}
        <div className="landing-container" style={{ position: "relative", zIndex: 1, paddingBottom: "120px" }}>
          <div className="landing-grid-text" style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <p className="landing-overline">Interactive</p>
            <h2 className="landing-h2-centered">
              Every element responds to you.
            </h2>
            <p className="landing-body-centered">
              Move your cursor across the grid. Our tools react to your input
              the same way&nbsp;&mdash; instant feedback, zero latency, total control.
            </p>
          </div>
        </div>

        {/* Toolkit Grid */}
        <div className="landing-container" style={{ position: "relative", zIndex: 1 }}>
          <p className="landing-overline">Toolkit</p>
          <h2 className="landing-h2">
            Fourteen panel types.
            <br />
            One workspace.
          </h2>

          <div className="landing-toolkit-grid">
            <ToolkitCard
              title="Digit Display"
              desc="View digits with adjustable chunk sizes and highlighting."
              colour="#6366f1"
            />
            <ToolkitCard
              title="Recall Test"
              desc="Quiz yourself on digit positions with hidden previews."
              colour="#8b5cf6"
            />
            <ToolkitCard
              title="Typing Practice"
              desc="Type digits against a timer with real-time feedback."
              colour="#06b6d4"
            />
            <ToolkitCard
              title="Chunk Trainer"
              desc="Flashcard-style mastery for small groups of digits."
              colour="#ec4899"
            />
            <ToolkitCard
              title="Sequence"
              desc="Audio-visual playback with an interactive numpad."
              colour="#3b82f6"
            />
            <ToolkitCard
              title="Major System"
              desc="Phonetic digit-to-word conversion helper."
              colour="#f59e0b"
            />
            <ToolkitCard
              title="Piem Generator"
              desc="Create poems where word lengths encode digits."
              colour="#22c55e"
            />
            <ToolkitCard
              title="Canvas"
              desc="Draw diagrams and visual mnemonics freehand."
              colour="#ef4444"
            />
            <ToolkitCard
              title="Notes"
              desc="Persistent notes for strategies and observations."
              colour="#6366f1"
            />
            <ToolkitCard
              title="Timeline"
              desc="Minimap view of all digits with draggable viewport."
              colour="#8b5cf6"
            />
            <ToolkitCard
              title="Statistics"
              desc="Accuracy and speed graphs over time."
              colour="#06b6d4"
            />
            <ToolkitCard
              title="Achievements"
              desc="Badges for streaks, speed records, and milestones."
              colour="#ec4899"
            />
            <ToolkitCard
              title="Progress"
              desc="Streaks, goals, and daily activity overview."
              colour="#3b82f6"
            />
            <ToolkitCard
              title="Scratchpad"
              desc="Ephemeral notes that reset each session."
              colour="#f59e0b"
            />
          </div>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className="landing-section">
        <div className="landing-container">
          <p className="landing-overline">Method</p>
          <h2 className="landing-h2">
            Three steps to
            <br />
            long-term recall.
          </h2>

          <div className="landing-steps">
            <ScrollReveal className="landing-step">
              <div className="landing-step-number">01</div>
              <h3 className="landing-h3">Choose a constant</h3>
              <p className="landing-body-sm">
                Pick from built-in constants or paste any number you want to
                memorise. Set your learning goal.
              </p>
            </ScrollReveal>
            <ScrollReveal className="landing-step" delay={0.15}>
              <div className="landing-step-number">02</div>
              <h3 className="landing-h3">Learn with mnemonics</h3>
              <p className="landing-body-sm">
                Use the Major System, Piem generator, chunk training, or
                any combination of tools that clicks for you.
              </p>
            </ScrollReveal>
            <ScrollReveal className="landing-step" delay={0.3}>
              <div className="landing-step-number">03</div>
              <h3 className="landing-h3">Test &amp; solidify</h3>
              <p className="landing-body-sm">
                Run recall tests, timed practice, and track your accuracy.
                Streaks and achievements keep you consistent.
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ======== DEEP DIVE: MAJOR SYSTEM ======== */}
      <MouseGlowSection className="landing-section landing-section-alt" colour="139,92,246">
        <div className="landing-container">
          <div className="landing-split">
            <div className="landing-split-text">
              <p className="landing-overline">Mnemonic Engine</p>
              <h2 className="landing-h2">
                Turn digits into
                <br />
                unforgettable words.
              </h2>
              <p className="landing-body">
                The Major System maps each digit to a consonant sound. String
                consonants together, add vowels, and you get vivid, memorable
                words. Our built-in helper does the mapping for you so you can
                focus on building stories.
              </p>
              <div className="landing-split-detail">
                <div className="landing-detail-row">
                  <span className="detail-num">0</span>
                  <span className="detail-arrow">&rarr;</span>
                  <span className="detail-sound">S, Z</span>
                </div>
                <div className="landing-detail-row">
                  <span className="detail-num">1</span>
                  <span className="detail-arrow">&rarr;</span>
                  <span className="detail-sound">T, D</span>
                </div>
                <div className="landing-detail-row">
                  <span className="detail-num">2</span>
                  <span className="detail-arrow">&rarr;</span>
                  <span className="detail-sound">N</span>
                </div>
                <div className="landing-detail-row">
                  <span className="detail-num">3</span>
                  <span className="detail-arrow">&rarr;</span>
                  <span className="detail-sound">M</span>
                </div>
                <div className="landing-detail-row">
                  <span className="detail-num">4</span>
                  <span className="detail-arrow">&rarr;</span>
                  <span className="detail-sound">R</span>
                </div>
                <div className="landing-detail-row">
                  <span className="detail-num">5</span>
                  <span className="detail-arrow">&rarr;</span>
                  <span className="detail-sound">L</span>
                </div>
              </div>
            </div>
            <div className="landing-split-visual">
              <div className="landing-float-mockup">
                <div className="float-mockup-header">
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-title">Major System</span>
                </div>
                <div className="float-mockup-content">
                  <div className="float-mockup-input">
                    <span className="fmi-label">Digits</span>
                    <span className="fmi-value">3 &middot; 1 &middot; 4 &middot; 1 &middot; 5 &middot; 9</span>
                  </div>
                  <div className="float-mockup-output">
                    <span className="fmo-label">Sounds</span>
                    <span className="fmo-value">M &middot; T &middot; R &middot; T &middot; L &middot; P</span>
                  </div>
                  <div className="float-mockup-result">
                    <span className="fmr-label">Mnemonic</span>
                    <span className="fmr-value">&ldquo;meteor lip&rdquo;</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MouseGlowSection>

      {/* ======== DEEP DIVE: PRACTICE ======== */}
      <MouseGlowSection className="landing-section" colour="6,182,212">
        <div className="landing-container">
          <div className="landing-split landing-split-reverse">
            <div className="landing-split-text">
              <p className="landing-overline">Practice</p>
              <h2 className="landing-h2">
                Type, test,
                <br />
                and improve.
              </h2>
              <p className="landing-body">
                Set a goal&nbsp;&mdash; say 50 digits of Pi&nbsp;&mdash; and start
                typing. The practice panel highlights correct and incorrect
                entries in real time, tracks your speed in digits per minute,
                and saves every session so you can watch yourself improve.
              </p>
              <ul className="landing-feature-list">
                <li>Real-time accuracy highlighting</li>
                <li>Digits-per-minute speed tracking</li>
                <li>Configurable start position and goal</li>
                <li>Session history with detailed statistics</li>
              </ul>
            </div>
            <div className="landing-split-visual">
              <div className="landing-float-mockup">
                <div className="float-mockup-header">
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-title">Practice &mdash; Pi</span>
                </div>
                <div className="float-mockup-content">
                  <div className="float-practice-digits">
                    <span className="fp-correct">3</span>
                    <span className="fp-correct">.</span>
                    <span className="fp-correct">1</span>
                    <span className="fp-correct">4</span>
                    <span className="fp-correct">1</span>
                    <span className="fp-correct">5</span>
                    <span className="fp-correct">9</span>
                    <span className="fp-correct">2</span>
                    <span className="fp-correct">6</span>
                    <span className="fp-wrong">4</span>
                    <span className="fp-cursor" />
                  </div>
                  <div className="float-practice-stats">
                    <span>9/50 digits</span>
                    <span>42 DPM</span>
                    <span>90% accuracy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MouseGlowSection>

      {/* ======== DEEP DIVE: PROGRESS ======== */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-split">
            <div className="landing-split-text">
              <p className="landing-overline">Analytics</p>
              <h2 className="landing-h2">
                Watch your
                <br />
                memory grow.
              </h2>
              <p className="landing-body">
                Every practice session feeds into your personal dashboard.
                Streaks keep you accountable, achievements celebrate milestones,
                and detailed graphs show accuracy and speed trends over time.
              </p>
              <ul className="landing-feature-list">
                <li>Daily streak tracking with best-streak records</li>
                <li>Accuracy and speed trend graphs</li>
                <li>Achievement badges for milestones</li>
                <li>Cloud sync across devices</li>
              </ul>
            </div>
            <div className="landing-split-visual">
              <div className="landing-float-mockup">
                <div className="float-mockup-header">
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-dot" />
                  <span className="float-mockup-title">Progress</span>
                </div>
                <div className="float-mockup-content">
                  <div className="float-progress-grid">
                    <div className="float-progress-item">
                      <span className="fpi-val">247</span>
                      <span className="fpi-label">digits learnt</span>
                    </div>
                    <div className="float-progress-item">
                      <span className="fpi-val">98.2%</span>
                      <span className="fpi-label">best accuracy</span>
                    </div>
                    <div className="float-progress-item">
                      <span className="fpi-val">67</span>
                      <span className="fpi-label">DPM record</span>
                    </div>
                    <div className="float-progress-item">
                      <span className="fpi-val">12</span>
                      <span className="fpi-label">day streak</span>
                    </div>
                  </div>
                  <div className="float-progress-bar-group">
                    <div className="float-bar" style={{ width: "85%" }} />
                    <div className="float-bar" style={{ width: "60%" }} />
                    <div className="float-bar" style={{ width: "92%" }} />
                    <div className="float-bar" style={{ width: "45%" }} />
                    <div className="float-bar" style={{ width: "78%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FAQ ======== */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container landing-faq-container">
          <div className="landing-faq-header">
            <p className="landing-overline">FAQ</p>
            <h2 className="landing-h2">
              Common
              <br />
              questions.
            </h2>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* ======== FINAL CTA ======== */}
      <section className="landing-section landing-final-cta relative pb-[120px] overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-90 overflow-hidden">
          <GalaxyVortexLoader />
        </div>
        <div className="landing-container relative z-10">
          <h2 className="landing-h1">
            Begin your
            <br />
            <span className="landing-h1-accent">journey.</span>
          </h2>
          <p className="landing-body">
            Free to use. No credit card required.
            <br />
            Start memorising in under a minute.
          </p>
          <div className="landing-hero-actions">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="landing-btn-primary landing-btn-lg">
                  Get started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </SignUpButton>
              <GoogleSignUpButton />
            </SignedOut>
            <SignedIn>
              <Link href="/studio" className="landing-btn-primary landing-btn-lg">
                Open Studio
                <ArrowRight className="w-5 h-5" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="landing-footer">
        <p>
          Developed by <strong>Henry Tolenaar</strong>
        </p>
      </footer>
    </div>
  );
}

/* -------------------------------------------------- */
/*  Static sub-components                             */
/* -------------------------------------------------- */

function ToolkitCard({
  title,
  desc,
  colour,
}: {
  title: string;
  desc: string;
  colour: string;
}) {
  return (
    <div className="toolkit-card">
      <div className="toolkit-dot" style={{ background: colour }} />
      <h4 className="toolkit-title">{title}</h4>
      <p className="toolkit-desc">{desc}</p>
    </div>
  );
}
