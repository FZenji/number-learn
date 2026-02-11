# Number Learn Studio

A modern web application for learning and memorizing famous mathematical constants like Pi (π), Euler's number (e), the Golden Ratio (φ), and more. Built with proven mnemonic techniques used by memory champions.

**Developed by Henry Tolenaar**

## Features

### 🔢 Mathematical Constants
- **17+ Built-in Constants** — Including Pi, e, φ, √2, √3, √5, ln2, ln10, τ, Catalan, Apéry, and more.
- **Number Bank** — Browse and toggle which constants appear in your sidebar.
- **Custom Numbers** — Upload text/JSON files or paste your own (max 1001 digits).

### 📊 14 Learning Panels

| Panel | Description |
|-------|-------------|
| **Digit Display** | View digits with customizable chunk sizes and highlighting |
| **Sequence Practice** | Audio-visual sequence with numpad grid |
| **Chunk Trainer** | Flashcard-style learning with mastery tracking |
| **Practice Typing** | Type digits with goals (start index, count), auto-stop, and detailed stats |
| **Recall Test** | Quiz yourself on digit positions (digit previews hidden) |
| **Canvas** | Draw diagrams and visual mnemonics |
| **Notes** | Text notes and mnemonic strategies |
| **Number Timeline** | Full-length minimap with draggable viewport and per-digit navigation |
| **Progress Tracker** | Track streaks, goals, and daily activity |
| **Statistics** | View accuracy, speed (DPM), and session history graphs |
| **Major System** | Convert digits to words using the phonetic system |
| **Piem Generator** | Create poems where word lengths match digits |
| **Scratchpad** | Quick ephemeral note-taking space |
| **Achievements** | Earn badges for streaks, speed, and accuracy milestones |

### 🪟 VS Code-Style Split Panels

Split the workspace into up to 9 independent editor groups, each with its own tab bar.

- Press `\` to split right, `|` to split down
- **Drag a tab** to the edge of any group to create a new split
- **Drag a tab** to the center of a group to move it there
- Drag-to-resize between groups with resizable handles

### 📈 Progress Tracking

- **Number Bank**: Toggle constants in/out of sidebar via "Browse Number Bank" modal.
- **Per-number stats**: 🔥 streak and digits learned.
- **Practice Goals**: Set a start digit and goal count; timer stops on completion.
- **Cloud Sync**: Progress synced to database when signed in (Clerk), localStorage fallback otherwise.

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
