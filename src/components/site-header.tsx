'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

export function SiteHeader() {
  const pathname = usePathname();
  const isStudio = pathname.startsWith("/studio");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center bg-[var(--surface)] border-b border-[var(--border)]">
      <div className={`w-full flex items-center justify-between px-6 py-4${isStudio ? "" : " max-w-[1200px]"}`}>
        <a href="/" className="text-lg font-semibold tracking-tight">
          Number<span className="text-[var(--primary)]">Learn</span>
        </a>
        <nav className="flex items-center gap-4">
          <a
            href="https://ko-fi.com/henrytolenaar"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost flex items-center gap-1.5 text-pink-400 hover:text-pink-300"
            title="Support me on Ko-Fi"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            Donate
          </a>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="btn btn-ghost">Sign In</button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="btn btn-primary">Get Started</button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/studio" className="btn btn-primary">
              Studio
            </Link>
            <a href="/contact" target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Contact
            </a>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9"
                }
              }}
            />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
