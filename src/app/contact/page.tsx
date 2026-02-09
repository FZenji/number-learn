'use client';

import Link from 'next/link';
import { Mail, MessageSquare, Send, ArrowLeft, ExternalLink } from 'lucide-react';

export default function ContactPage() {
  const email = 'numberlearn.anthology852@passfwd.com';
  const subject = 'Number Learn Studio Feedback';
  
  const handleOpenEmail = () => {
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoUrl, '_blank');
  };
  
  return (
    <main className="container max-w-4xl mx-auto px-4 py-12">
      {/* Back link */}
      <Link 
        href="/" 
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text)] mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-[var(--primary)]/20">
          <MessageSquare className="w-8 h-8 text-[var(--primary)]" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Contact & Suggestions</h1>
        <p className="text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
          Have feedback, feature requests, or found a bug? We'd love to hear from you!
        </p>
      </div>

      {/* Contact form */}
      <div className="card max-w-xl mx-auto">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Your Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Your Email</label>
            <input
              type="email"
              placeholder="john@example.com"
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <select className="input">
              <option value="Feature Request">Feature Request</option>
              <option value="Bug Report">Bug Report</option>
              <option value="General Feedback">General Feedback</option>
              <option value="Question">Question</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              rows={6}
              placeholder="Tell us what's on your mind..."
              className="input resize-none"
            />
          </div>

          <button 
            type="button" 
            onClick={handleOpenEmail}
            className="btn btn-primary w-full gap-2"
          >
            <Send className="w-4 h-4" />
            Open Email Client
          </button>

          <p className="text-sm text-[var(--text-muted)] text-center">
            Clicking the button will open your email client in a new tab.
          </p>
        </div>
      </div>

      {/* Alternative contact */}
      <div className="mt-12 text-center">
        <p className="text-[var(--text-muted)] mb-4">Or email us directly:</p>
        <a 
          href={`mailto:${email}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[var(--primary)] hover:underline"
        >
          <Mail className="w-5 h-5" />
          {email}
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Quick links */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="card text-center">
          <h3 className="font-semibold mb-2">Feature Requests</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Have an idea for a new panel, practice mode, or improvement? We're all ears!
          </p>
        </div>
        <div className="card text-center">
          <h3 className="font-semibold mb-2">Bug Reports</h3>
          <p className="text-sm text-[var(--text-muted)]">
            Found something broken? Please share details so we can fix it quickly.
          </p>
        </div>
      </div>
    </main>
  );
}
