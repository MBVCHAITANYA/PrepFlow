<![CDATA[# ⚡ PrepFlow — CS Job Preparation Planner

> A smart, AI-powered daily task planner built for Computer Science job preparation. Plan your study schedule, track progress across categories, set long-term goals, and let Google Gemini AI generate optimized study plans — all from your browser.

[![Built With](https://img.shields.io/badge/Built%20With-HTML%20%7C%20CSS%20%7C%20JavaScript-blue)](#tech-stack)
[![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini-orange)](#ai-assistant)
[![Storage](https://img.shields.io/badge/Storage-localStorage-green)](#data-persistence)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#license)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Application Modules](#application-modules)
- [Category System](#category-system)
- [AI Integration](#ai-integration)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Usage Guide](#usage-guide)
- [Screenshots](#screenshots)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## 🎯 Overview

**PrepFlow** is a full-featured, browser-based study planner designed specifically for students and professionals preparing for CS job interviews. It combines traditional task management with AI-powered planning to help users:

- **Organize** daily study sessions across 7 preparation categories
- **Visualize** schedules on a Google Calendar-style timeline
- **Track** progress with real-time analytics and completion charts
- **Plan smarter** with Google Gemini AI-generated study schedules
- **Set goals** with long-term targets and deadline tracking

No backend. No login. No setup. Just open `index.html` and start preparing.

---

## ✨ Key Features

### 📊 Dashboard
- Real-time stats: total tasks, completed, pending, completion percentage
- Planned vs completed study time tracking
- Daily progress bar with celebration animation at 100%
- Category-wise progress cards (filtered to today only)
- Motivational quotes that rotate daily

### 📝 Task Planner
- Full CRUD operations for tasks (Create, Read, Update, Delete)
- Fields: Title, Category, Date, Priority, Start/End Time, Duration, Status, Notes
- **Source/Resource Link** — attach learning URLs (e.g., LeetCode, YouTube) directly to tasks
- **Repeat for X Days** — create a task once and replicate it across multiple days
- Task overlap detection with warnings
- Subtask system with progress tracking
- AI-powered subtask suggestions

### 📅 Calendar Views
- **Daily View** — Google Calendar-style vertical timeline (6 AM – 11 PM)
  - Color-coded task blocks by category
  - Current time indicator (red line)
  - Active task highlighting with pulse animation
  - Free slot detection
  - Upcoming tasks panel
- **Weekly View** — 7-day overview with task summaries
- **Monthly View** — Bird's-eye view with completion counts per day

### 📈 Analytics
- Daily / Weekly / Monthly completion rate rings
- Category-wise progress with completion bars
- 7-day completion trend chart
- Tasks-by-category bar chart
- Monthly breakdown per category

### 🎯 Long-term Goals
- Set goals with **start date** and **deadline** (e.g., "Complete DP in 2 weeks")
- Category assignment for each goal
- Automatic progress bar based on time elapsed
- Status badges: **Active**, **Overdue**, **Completed**
- Notes field for additional context

### 🤖 AI Assistant (Google Gemini)
- **AI Day Planner** — describe your goals, get a full schedule generated
- Scope options: Today, This Week, This Month
- One-click "Add All Tasks to Planner" button
- Subtask Suggester (offline, keyword-based)
- Quick Schedule Generator (offline)
- Focus Priority Analyzer
- Motivational tips

### 🧘 Focus Mode
- Distraction-free view showing only today's pending tasks
- Sequential task highlighting
- Quick completion toggles

### ⚙️ Settings
- Professional section-based UI
- **Appearance** — Dark/Light theme toggle
- **AI Integration** — Gemini API key management
- **Categories** — Add/remove custom categories
- **Data Management** — Reset today or clear all data
- **About** — Version and build info

---

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| **HTML5** | Semantic page structure, modals, forms |
| **CSS3** | Custom design system with CSS variables, animations, responsive layout |
| **Vanilla JavaScript** | Application logic, DOM manipulation, localStorage API |
| **Google Gemini API** | AI-powered schedule generation |
| **Google Fonts (Inter)** | Modern typography |

### Design Highlights
- Dark mode by default with smooth light mode toggle
- CSS custom properties for theming (`--bg`, `--surface`, `--primary`, etc.)
- Glassmorphism-inspired cards with hover effects
- Micro-animations: pulse, fade-in, slide transitions
- Fully responsive — works on desktop, tablet, and mobile

---

## 📂 Application Modules

```
PrepFlow/
├── index.html      → Page structure, all views, modals
├── style.css       → Complete design system and responsive styles
├── app.js          → Core logic: tasks, targets, dashboard, settings
├── features.js     → Calendar, analytics, AI assistant, timeline
└── README.md       → This document
```

### Module Responsibilities

| File | Lines | Responsibilities |
|------|-------|-----------------|
| `app.js` | ~630 | State management, CRUD, dashboard, planner, targets, settings, data persistence |
| `features.js` | ~490 | Calendar (3 views), daily timeline, analytics, charts, AI integration, Gemini API |
| `style.css` | ~300 | Design tokens, component styles, animations, responsive breakpoints |
| `index.html` | ~660 | 8 view sections, 4 modals, sidebar + mobile nav, semantic HTML |

---

## 🏷️ Category System

PrepFlow uses 7 standardized preparation categories, each with a unique color:

| Category | Color | Hex | Example Tasks |
|----------|-------|-----|--------------|
| 🟢 Exercise | Green | `#22c55e` | Basketball, Cardio, Yoga |
| 🔵 DSA | Blue | `#3b82f6` | Dynamic Programming, Graphs, Trees |
| 🟣 Core Subjects | Purple | `#8b5cf6` | Operating Systems, DBMS, Networks |
| 🟠 Design | Orange | `#f97316` | System Design, UI/UX, OOP |
| 🩷 Communication | Pink | `#ec4899` | Mock Interviews, English Practice |
| 🩵 Projects | Cyan | `#06b6d4` | Portfolio, API Integration, Dashboard |
| 🟡 Aptitude | Yellow | `#eab308` | Quantitative, Logical Reasoning |

Colors are applied consistently across:
- Task badges in Planner
- Timeline blocks in Calendar
- Progress bars in Analytics
- Goal cards in Targets

---

## 🤖 AI Integration

### Google Gemini Setup
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Go to **Settings → AI Integration**
3. Paste your key and click **Save**

### How AI Planning Works

```
User Input: "Plan my DSA and OS study for today in 6 hours"
     ↓
Gemini API (gemini-2.0-flash model)
     ↓
Structured JSON response with tasks
     ↓
Rendered as preview cards
     ↓
User clicks "Add All Tasks to Planner"
     ↓
Tasks added to localStorage with proper times/categories
```

### AI Features Summary
| Feature | Source | Description |
|---------|--------|------------|
| Day Planner | Gemini API | Full schedule generation from natural language |
| Subtask Suggester | Offline dictionary | Topic-based subtask recommendations |
| Schedule Generator | Offline algorithm | Time-block allocation by category weights |
| Focus Analyzer | Task data | Priority ranking by lowest completion rate |

---

## 🏗️ Architecture

### Data Flow
```
User Action → DOM Event → Handler Function → State Update → localStorage.setItem()
                                                    ↓
                                              Re-render View ← localStorage.getItem()
```

### State Management
All application state is stored in the browser's `localStorage`:

| Key | Type | Description |
|-----|------|-------------|
| `pf_tasks` | Array | All tasks with subtasks, times, status |
| `pf_targets` | Array | Long-term goals with deadlines |
| `pf_categories` | Array | User-customizable category list |
| `pf_prefs` | Object | Theme preference |
| `pf_gemini_key` | String | Encrypted Gemini API key |
| `pf_seeded` | Boolean | Whether sample data was loaded |

### Key Design Decisions
1. **No framework** — Pure vanilla JS for zero build step and instant load
2. **localStorage only** — No server, no auth, full privacy
3. **Modular files** — `app.js` for core, `features.js` for advanced features
4. **CSS variables** — Single source of truth for theming
5. **Date-based isolation** — Each day's task progress is independent

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- No Node.js, npm, or build tools required

### Installation

```bash
# Clone the repository
git clone https://github.com/MBVCHAITANYA/PrepFlow.git

# Open in browser
cd PrepFlow
start index.html        # Windows
open index.html         # macOS
xdg-open index.html     # Linux
```

That's it! The app loads with sample tasks on first launch.

### Optional: AI Setup
1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Create a free Gemini API key
3. In PrepFlow → Settings → AI Integration → Paste key → Save

---

## 📖 Usage Guide

### Creating a Task
1. Go to **Planner** → Click **+ Add Task**
2. Fill in: Title, Category, Date, Time, Priority
3. Optionally add a **Source Link** (e.g., LeetCode URL)
4. Set **Repeat for X days** to schedule across multiple days
5. Click **Save Task**

### Setting a Long-term Goal
1. Go to **Targets** → Click **+ Add Goal**
2. Enter: Goal name, Category, Start Date, Deadline
3. Track progress automatically based on time elapsed

### Using AI Planner
1. Go to **AI Assistant** (or click the 🤖 floating button on Dashboard)
2. Type your study plan request (e.g., "Plan 8 hours of DSA and OS")
3. Select scope: Today / This Week / This Month
4. Click **Plan with AI**
5. Review generated tasks → Click **Add All Tasks to Planner**

### Viewing Analytics
- Go to **Analytics** for completion rates, category breakdowns, and trend charts
- Use **Calendar → Day view** to see your Google Calendar-style timeline

---

## 🖼️ Screenshots

### Dashboard
> Real-time stats, category progress cards, motivational quotes, and today's task list with a floating AI button.

### Calendar — Daily Timeline
> Google Calendar-style vertical timeline with color-coded task blocks, current time indicator, and free slot detection.

### AI Assistant
> Gemini-powered AI Day Planner with scope selection, plus offline tools for subtask suggestions and schedule generation.

### Settings
> Professional section-based settings with Appearance, AI Integration, Categories, and Data Management sections.

### Long-term Goals
> Goal cards with category badges, date ranges, progress bars, and status indicators (Active/Overdue/Completed).

---

## 🔮 Future Enhancements

- [ ] **Export/Import** — Download and restore data as JSON backup
- [ ] **Drag & Drop** — Rearrange tasks on the daily timeline
- [ ] **Pomodoro Timer** — Built-in focus timer with break intervals
- [ ] **Spaced Repetition** — Smart review scheduling for topics
- [ ] **Multi-device Sync** — Optional cloud sync via Firebase
- [ ] **PWA Support** — Install as a native app on mobile
- [ ] **Weekly Reports** — Auto-generated preparation summary emails
- [ ] **Collaborative Mode** — Share study plans with friends

---

## 👤 Author

**M B V Chaitanya**
- GitHub: [@MBVCHAITANYA](https://github.com/MBVCHAITANYA)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  <strong>⚡ PrepFlow</strong> — Plan Smart. Prepare Better. Land the Job.
</p>
]]>
