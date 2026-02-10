# Number Learn Studio

A modern web application for learning and memorizing famous mathematical constants like Pi (π), Euler's number (e), the Golden Ratio (φ), and more. Built with proven mnemonic techniques used by memory champions.

**Developed by Henry Tolenaar**

## Features

### 🔢 Mathematical Constants
- **Pi (π)** — 3.14159... (1000+ digits)
- **Euler's Number (e)** — 2.71828... (1000+ digits)
- **Golden Ratio (φ)** — 1.61803... (1000+ digits)
- **Square Root of 2 (√2)** — 1.41421... (1000+ digits)
- **Euler-Mascheroni (γ)** — 0.57721... (1000+ digits)
- **Custom Numbers** — Upload or paste your own (max 1001 digits)

### 📊 13 Learning Panels

| Panel | Description |
|-------|-------------|
| **Digit Display** | View digits with customizable chunk sizes and highlighting |
| **Sequence Practice** | Audio-visual sequence with numpad grid |
| **Chunk Trainer** | Flashcard-style learning with mastery tracking |
| **Practice Typing** | Type digits with real-time feedback and speed tracking |
| **Recall Test** | Quiz yourself on digit positions |
| **Canvas** | Draw diagrams and visual mnemonics |
| **Notes** | Text notes and mnemonic strategies |
| **Number Timeline** | Visual timeline with zoom and position tracking |
| **Progress Tracker** | Track streaks, goals, and achievements |
| **Statistics** | View accuracy, speed (DPM), and session history |
| **Major System** | Convert digits to words using the phonetic system |
| **Piem Generator** | Create poems where word lengths match digits |
| **Scratchpad** | Freeform notes with auto-save |

### 🪟 VS Code-Style Split Panels

Split the workspace into up to 9 independent editor groups, each with its own tab bar.

- Press `\` to split right, `|` to split down
- **Drag a tab** to the edge of any group to create a new split
- **Drag a tab** to the center of a group to move it there
- Drag-to-resize between groups with resizable handles

### 📈 Progress Tracking

- Per-number stats in the sidebar: 🔥 streak and digits learned
- Progress synced to database when signed in, localStorage fallback otherwise

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `T` | Open new panel in active group |
| `\` | Split right |
| `\|` | Split down |
| `?` | Show keyboard shortcuts |
| `Escape` | Close modals / clear focus |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk |
| State | Zustand (persisted) |
| Database | Vercel Postgres / Neon + Drizzle ORM |
| Split Panels | react-resizable-panels v4 |
| Icons | Lucide React |
| Deployment | Vercel |

## API

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/progress` | GET, POST | Fetch / upsert user progress per number |
| `/api/custom-numbers` | GET, POST, DELETE | Manage custom numbers |
| `/api/webhooks/clerk` | POST | Svix-verified Clerk webhook (user sync) |

## License

MIT

---

**Developed by Henry Tolenaar**
