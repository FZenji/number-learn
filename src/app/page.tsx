import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Sparkles, Brain, Trophy, Keyboard } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-[var(--surface)] border border-[var(--border)] text-sm text-[var(--text-secondary)]">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span>Master mathematical constants</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Learn Numbers with{" "}
            <span className="text-[var(--primary)]">Proven Techniques</span>
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto">
            Memorize Pi, Euler&apos;s number, the Golden Ratio, and more using the Major System, 
            Memory Palace, and other mnemonic strategies trusted by memory champions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="btn btn-primary text-lg px-8 py-3">
                  Get Started Free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/studio" className="btn btn-primary text-lg px-8 py-3">
                Open Studio
              </Link>
            </SignedIn>
            <a 
              href="#features" 
              className="btn btn-secondary text-lg px-8 py-3"
            >
              Learn More
            </a>
          </div>
        </div>
        
        {/* Floating digits decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
          <div className="absolute top-20 left-10 text-6xl font-mono">π</div>
          <div className="absolute top-40 right-20 text-5xl font-mono">e</div>
          <div className="absolute bottom-32 left-1/4 text-4xl font-mono">φ</div>
          <div className="absolute bottom-20 right-1/3 text-5xl font-mono">√2</div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Everything You Need to Remember Numbers
          </h2>
          <p className="text-center text-[var(--text-secondary)] mb-16 max-w-2xl mx-auto">
            Our studio provides multiple tools and techniques so you can learn the way that works best for you.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Brain className="w-8 h-8" />}
              title="Multiple Panel Types"
              description="Digit display, recall tests, typing practice, chunk training, and more. Open multiple panels at once."
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8" />}
              title="Major System Helper"
              description="Convert digits to consonants to words. The proven phonetic system used by memory champions."
            />
            <FeatureCard 
              icon={<Trophy className="w-8 h-8" />}
              title="Progress Tracking"
              description="Track your streaks, accuracy, and speed over time. See how far you've come."
            />
            <FeatureCard 
              icon={<Keyboard className="w-8 h-8" />}
              title="Keyboard Shortcuts"
              description="Navigate tabs, open panels, and control everything with keyboard shortcuts."
            />
            <FeatureCard 
              icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="14">π</text></svg>}
              title="Famous Constants"
              description="Pi, Euler's number, Golden Ratio, √2, Euler-Mascheroni, and custom numbers."
            />
            <FeatureCard 
              icon={<svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 15h6"/></svg>}
              title="Piem Generator"
              description="Create poems where word lengths match the digits. A fun mnemonic technique."
            />
          </div>
        </div>
      </section>

      {/* Numbers Preview */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Start With These Constants
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <NumberCard symbol="π" name="Pi" value="3.14159265..." />
            <NumberCard symbol="e" name="Euler's Number" value="2.71828182..." />
            <NumberCard symbol="φ" name="Golden Ratio" value="1.61803398..." />
            <NumberCard symbol="√2" name="Square Root of 2" value="1.41421356..." />
            <NumberCard symbol="γ" name="Euler-Mascheroni" value="0.57721566..." />
            <NumberCard symbol="+" name="Custom" value="Add your own..." isCustom />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-b from-[var(--surface)] to-[var(--background)]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Expand Your Memory?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Join thousands of learners mastering mathematical constants with Number Learn Studio.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="btn btn-primary text-lg px-10 py-4">
                Start Learning Now
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/studio" className="btn btn-primary text-lg px-10 py-4">
              Open Studio
            </Link>
          </SignedIn>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="card hover:border-[var(--border-hover)] transition-colors">
      <div className="w-14 h-14 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}

function NumberCard({ 
  symbol, 
  name, 
  value,
  isCustom = false
}: { 
  symbol: string; 
  name: string; 
  value: string;
  isCustom?: boolean;
}) {
  return (
    <div className={`card text-left hover:border-[var(--border-hover)] transition-colors ${isCustom ? 'border-dashed' : ''}`}>
      <div className="text-4xl font-mono text-[var(--primary)] mb-2">{symbol}</div>
      <h3 className="font-semibold mb-1">{name}</h3>
      <p className="font-mono text-sm text-[var(--text-muted)]">{value}</p>
    </div>
  );
}
