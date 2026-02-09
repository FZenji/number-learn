# Number Learn Studio

A modern web application for learning and memorizing famous mathematical constants like Pi (π), Euler's number (e), the Golden Ratio (φ), and more. Built with proven mnemonic techniques used by memory champions.

**Developed by Henry Tolenaar**

## Features

### 🔢 Mathematical Constants
- **Pi (π)** - 3.14159... (1000+ digits)
- **Euler's Number (e)** - 2.71828... (1000+ digits)
- **Golden Ratio (φ)** - 1.61803... (1000+ digits)
- **Square Root of 2 (√2)** - 1.41421... (1000+ digits)
- **Euler-Mascheroni (γ)** - 0.57721... (1000+ digits)
- **Custom Numbers** - Add your own numbers to learn

### 📊 10 Learning Panel Types
| Panel | Description |
|-------|-------------|
| **Digit Display** | View digits with customizable chunk sizes and position highlighting |
| **Recall Test** | Quiz yourself on digit positions with multiple question types |
| **Practice Typing** | Type digits with real-time feedback and speed tracking |
| **Chunk Trainer** | Flashcard-style learning with mastery tracking |
| **Scratchpad** | Freeform notes with auto-save |
| **Timeline** | Visual timeline with zoom and position tracking |
| **Progress Tracker** | Track streaks, goals, and achievements |
| **Statistics** | View accuracy, speed (DPM), and session history |
| **Major System** | Convert digits to words using the phonetic system |
| **Piem Generator** | Create poems where word lengths match digits |

### ⌨️ Keyboard Shortcuts
| Shortcut | Action |
|----------|--------|
| `Ctrl+T` | Open new panel |
| `Ctrl+W` | Close current tab |
| `Ctrl+Tab` | Next tab |
| `Ctrl+Shift+Tab` | Previous tab |
| `Ctrl+1-9` | Jump to tab by number |
| `?` | Show keyboard shortcuts |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Authentication:** Clerk (keyless mode)
- **State Management:** Zustand
- **Icons:** Lucide React
- **Deployment:** Vercel

## Getting Started

### Prerequisites
- Node.js 18.17.0 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd number-learn

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Clerk Authentication

This app uses **Clerk keyless mode** - no account setup required to start developing! 

Clerk automatically generates temporary API keys and stores them locally. When you're ready to deploy:
1. Look for the "Clerk is in keyless mode" prompt in the bottom-right corner
2. Click "Claim application" to link it to your Clerk account
3. Add your production API keys to your deployment environment

### Environment Variables (Production)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

## Development

```bash
# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Deployment on Vercel

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add your Clerk environment variables
4. Deploy!

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with ClerkProvider
│   ├── page.tsx        # Landing page
│   └── studio/
│       └── page.tsx    # Main studio workspace
├── components/
│   ├── panels/         # 10 panel type components
│   ├── tab-bar.tsx
│   ├── number-selector.tsx
│   ├── panel-container.tsx
│   ├── panel-selector.tsx
│   └── keybindings-modal.tsx
├── data/
│   └── numbers.ts      # Mathematical constants data
├── hooks/
│   └── use-keybindings.ts
├── store/
│   └── workspace-store.ts  # Zustand state
└── proxy.ts            # Clerk middleware
```

## License

MIT

---

**Developed by Henry Tolenaar**
