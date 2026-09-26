import { Product } from '../types';

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'planner-pro-2026',
    title: 'Ultimate Life & Business Planner 2026',
    category: 'Productivity & Planning',
    shortDescription: 'All-in-one interactive HTML planner featuring daily schedule, habit tracker, weekly priorities, and quarterly business goals.',
    description: 'Designed specifically for entrepreneurs, creators, and professionals. Features an interactive daily planner, Eisenhower matrix, smart habit tracker with streak counters, quarterly milestone manager, and clean print-ready export views.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80'
    ],
    version: 'v3.2.0',
    isPublished: true,
    features: [
      'Interactive Daily Schedule & Time Blocking (6 AM - 10 PM)',
      'Smart Habit Tracker with 30-day streak analytics',
      'Eisenhower Urgent/Important Decision Matrix',
      'Quarterly OKR & Key Results Tracker',
      'Built-in Notes & Idea Board with localStorage memory',
      'Clean Print Mode for physical desk copies'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablet', 'Laptop', 'Mobile Web'],
    purchaseUrl: 'https://www.etsy.com',
    viewsCount: 342,
    demoLaunchesCount: 128,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
    demoHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ultimate Life & Business Planner</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 p-4 sm:p-6 min-h-screen">
  <div class="max-w-6xl mx-auto space-y-6">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <div>
        <span class="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full uppercase tracking-wider mb-2">WebCraft Goods Edition</span>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-900">Ultimate Life & Business Planner</h1>
        <p class="text-slate-500 text-sm mt-1">Interactive demo • Auto-saving to your client sandboxed storage</p>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="window.print()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition flex items-center gap-2">
          <i class="fas fa-print"></i> Print View
        </button>
        <button onclick="clearDemoData()" class="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium rounded-xl transition flex items-center gap-2">
          <i class="fas fa-trash-alt"></i> Reset Demo
        </button>
      </div>
    </header>

    <!-- Top KPI cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs text-slate-400 font-medium">Daily Focus Score</p>
        <p id="focusScore" class="text-2xl font-bold text-indigo-600 mt-1">85%</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs text-slate-400 font-medium">Tasks Completed</p>
        <p id="completedTasksCount" class="text-2xl font-bold text-emerald-600 mt-1">4 / 6</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs text-slate-400 font-medium">Active Habits</p>
        <p id="habitsStreakCount" class="text-2xl font-bold text-amber-500 mt-1">5 Streak</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <p class="text-xs text-slate-400 font-medium">Quarter Target</p>
        <p class="text-2xl font-bold text-slate-700 mt-1">$45k ARR</p>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Column 1: Daily Schedule -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b pb-3 border-slate-100">
          <h2 class="font-bold text-slate-800 flex items-center gap-2">
            <i class="far fa-clock text-indigo-600"></i> Time Blocking
          </h2>
          <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">Today</span>
        </div>
        <div class="space-y-2 text-sm max-h-96 overflow-y-auto pr-1" id="scheduleList">
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-slate-100">
            <span class="text-xs font-semibold text-slate-400 w-16">08:00 AM</span>
            <input type="text" class="w-full bg-transparent focus:outline-none text-slate-700 font-medium" value="Deep Work: Core Product Architecture" onchange="saveData()">
          </div>
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-slate-100">
            <span class="text-xs font-semibold text-slate-400 w-16">10:30 AM</span>
            <input type="text" class="w-full bg-transparent focus:outline-none text-slate-700 font-medium" value="Stakeholder Review & Demo Sync" onchange="saveData()">
          </div>
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-slate-100">
            <span class="text-xs font-semibold text-slate-400 w-16">01:00 PM</span>
            <input type="text" class="w-full bg-transparent focus:outline-none text-slate-700 font-medium" value="Client Showcase Walkthrough" onchange="saveData()">
          </div>
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-slate-100">
            <span class="text-xs font-semibold text-slate-400 w-16">03:30 PM</span>
            <input type="text" class="w-full bg-transparent focus:outline-none text-slate-700 font-medium" value="Sprint Backlog & QA Release" onchange="saveData()">
          </div>
          <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-slate-100">
            <span class="text-xs font-semibold text-slate-400 w-16">05:00 PM</span>
            <input type="text" class="w-full bg-transparent focus:outline-none text-slate-700 font-medium" value="Daily Shutdown & Tomorrow Planning" onchange="saveData()">
          </div>
        </div>
        <button onclick="addScheduleSlot()" class="w-full py-2 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:text-indigo-600 text-slate-400 text-xs font-semibold rounded-xl transition">
          + Add Time Block
        </button>
      </div>

      <!-- Column 2: Priorities & Matrix -->
      <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between border-b pb-3 border-slate-100">
          <h2 class="font-bold text-slate-800 flex items-center gap-2">
            <i class="fas fa-tasks text-emerald-600"></i> Top Priorities
          </h2>
          <span class="text-xs text-emerald-600 font-medium">Must Win</span>
        </div>
        <div class="space-y-2" id="tasksList">
          <label class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
            <input type="checkbox" checked onchange="toggleTask(this)" class="mt-1 w-4 h-4 text-indigo-600 rounded">
            <span class="text-sm line-through text-slate-400">Finalize security rules & ABAC validation</span>
          </label>
          <label class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
            <input type="checkbox" checked onchange="toggleTask(this)" class="mt-1 w-4 h-4 text-indigo-600 rounded">
            <span class="text-sm line-through text-slate-400">Configure continuous demo session countdown</span>
          </label>
          <label class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
            <input type="checkbox" onchange="toggleTask(this)" class="mt-1 w-4 h-4 text-indigo-600 rounded">
            <span class="text-sm text-slate-700 font-medium">Prepare live client product preview showcase</span>
          </label>
          <label class="flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition">
            <input type="checkbox" onchange="toggleTask(this)" class="mt-1 w-4 h-4 text-indigo-600 rounded">
            <span class="text-sm text-slate-700 font-medium">Review customer Etsy feedback & request logs</span>
          </label>
        </div>
        <div class="flex gap-2">
          <input type="text" id="newTaskInput" placeholder="New priority..." class="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <button onclick="addNewTask()" class="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition">Add</button>
        </div>
      </div>

      <!-- Column 3: Habits & Quick Notes -->
      <div class="space-y-6">
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b pb-3 border-slate-100">
            <h2 class="font-bold text-slate-800 flex items-center gap-2">
              <i class="fas fa-fire text-amber-500"></i> Habit Tracker
            </h2>
            <span class="text-xs text-amber-600 font-medium">Daily Rituals</span>
          </div>
          <div class="space-y-2.5 text-sm" id="habitsList">
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
              <span class="text-slate-700 font-medium">💧 2.5L Hydration</span>
              <button onclick="toggleHabit(this)" class="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Done</button>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
              <span class="text-slate-700 font-medium">🏃 30 Min Cardio</span>
              <button onclick="toggleHabit(this)" class="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Done</button>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
              <span class="text-slate-700 font-medium">📖 20 Pages Reading</span>
              <button onclick="toggleHabit(this)" class="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">Pending</button>
            </div>
            <div class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50">
              <span class="text-slate-700 font-medium">🧘 10m Mindfulness</span>
              <button onclick="toggleHabit(this)" class="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg">Done</button>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h2 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i class="fas fa-sticky-note text-indigo-500"></i> Scratchpad
          </h2>
          <textarea id="scratchpad" oninput="saveData()" class="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Capture quick notes or links here..."></textarea>
        </div>
      </div>
    </div>
  </div>

  <script>
    const STORAGE_KEY = 'wc_demo_planner_data';

    function init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          if (data.scratchpad) document.getElementById('scratchpad').value = data.scratchpad;
        } catch (e) {}
      }
    }

    function saveData() {
      const data = {
        scratchpad: document.getElementById('scratchpad').value,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function toggleTask(checkbox) {
      const label = checkbox.nextElementSibling;
      if (checkbox.checked) {
        label.classList.add('line-through', 'text-slate-400');
        label.classList.remove('text-slate-700', 'font-medium');
      } else {
        label.classList.remove('line-through', 'text-slate-400');
        label.classList.add('text-slate-700', 'font-medium');
      }
      updateTaskCounter();
    }

    function updateTaskCounter() {
      const all = document.querySelectorAll('#tasksList input[type="checkbox"]');
      const checked = document.querySelectorAll('#tasksList input[type="checkbox"]:checked');
      document.getElementById('completedTasksCount').innerText = checked.length + ' / ' + all.length;
      const score = all.length ? Math.round((checked.length / all.length) * 100) : 0;
      document.getElementById('focusScore').innerText = score + '%';
    }

    function addNewTask() {
      const input = document.getElementById('newTaskInput');
      const val = input.value.trim();
      if (!val) return;
      const container = document.getElementById('tasksList');
      const label = document.createElement('label');
      label.className = 'flex items-start gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition';
      label.innerHTML = '<input type="checkbox" onchange="toggleTask(this)" class="mt-1 w-4 h-4 text-indigo-600 rounded"><span class="text-sm text-slate-700 font-medium">' + escapeHtml(val) + '</span>';
      container.appendChild(label);
      input.value = '';
      updateTaskCounter();
    }

    function toggleHabit(btn) {
      if (btn.innerText === 'Done') {
        btn.innerText = 'Pending';
        btn.className = 'px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg';
      } else {
        btn.innerText = 'Done';
        btn.className = 'px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg';
      }
    }

    function addScheduleSlot() {
      const container = document.getElementById('scheduleList');
      const div = document.createElement('div');
      div.className = 'flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 border border-slate-100';
      div.innerHTML = '<span class="text-xs font-semibold text-slate-400 w-16">07:00 PM</span><input type="text" class="w-full bg-transparent focus:outline-none text-slate-700 font-medium" placeholder="Add activity..." onchange="saveData()">';
      container.appendChild(div);
    }

    function clearDemoData() {
      if (confirm('Reset planner demo data to defaults?')) {
        localStorage.removeItem(STORAGE_KEY);
        document.getElementById('scratchpad').value = '';
        alert('Demo state reset successfully.');
      }
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    init();
  </script>
</body>
</html>`
  },
  {
    id: 'sprintflow-agile-suite',
    title: 'SprintFlow Agile Kanban & Project Hub',
    category: 'Project Management',
    shortDescription: 'Interactive Kanban board with drag-and-drop workflow, sprint velocity charts, priority tags, and burndown analytics.',
    description: 'A powerful and intuitive project management HTML application. Features customizable columns (Backlog, In Progress, Code Review, Quality Assurance, Done), story point estimates, team assignment tags, and exportable CSV sprint reports.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80'
    ],
    version: 'v2.8.4',
    isPublished: true,
    features: [
      'Full drag-and-drop Kanban workflow with multi-column boards',
      'Sprint velocity calculation & story points tracking',
      'Custom tags, priority badges (Critical, High, Medium, Low)',
      'Subtask checklist with progress percentages',
      'Burndown chart visualizer',
      'Zero external database required — operates via sandboxed client store'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablet', 'Laptop'],
    purchaseUrl: 'https://www.etsy.com',
    viewsCount: 289,
    demoLaunchesCount: 94,
    createdAt: '2026-02-01T09:00:00Z',
    updatedAt: '2026-03-18T11:20:00Z',
    demoHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SprintFlow Agile Kanban Suite</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen p-4 sm:p-6 font-sans">
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
          <h1 class="text-2xl font-bold text-white tracking-tight">SprintFlow v2.8</h1>
          <span class="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 font-semibold rounded border border-indigo-500/30">Active Sprint 14</span>
        </div>
        <p class="text-xs text-slate-400 mt-1">28 Story Points • 4 Days Remaining • Team Velocity: 34 pts/sprint</p>
      </div>
      <div class="flex items-center gap-3">
        <button onclick="createNewCard()" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow">
          <i class="fas fa-plus"></i> New Story
        </button>
        <button onclick="resetBoard()" class="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition">
          Reset Board
        </button>
      </div>
    </div>

    <!-- Kanban Columns Grid -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Backlog -->
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col min-h-[500px]">
        <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-700">
          <span class="font-semibold text-sm text-slate-300">Backlog</span>
          <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">2</span>
        </div>
        <div class="space-y-3 flex-1" id="col-backlog">
          <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 cursor-pointer shadow-sm transition space-y-2">
            <span class="text-xs px-2 py-0.5 rounded font-bold bg-amber-500/20 text-amber-400">Design</span>
            <p class="text-sm font-medium text-slate-200">Mobile gesture navigation prototypes</p>
            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/60">
              <span>5 pts</span>
              <span class="text-emerald-400">Low Risk</span>
            </div>
          </div>
          <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 cursor-pointer shadow-sm transition space-y-2">
            <span class="text-xs px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-400">Backend</span>
            <p class="text-sm font-medium text-slate-200">Webhook retry telemetry and error queue</p>
            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/60">
              <span>8 pts</span>
              <span class="text-rose-400">High Risk</span>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress -->
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col min-h-[500px]">
        <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-700">
          <span class="font-semibold text-sm text-slate-300">In Progress</span>
          <span class="text-xs bg-indigo-900/60 text-indigo-300 px-2 py-0.5 rounded-full font-mono">2</span>
        </div>
        <div class="space-y-3 flex-1" id="col-progress">
          <div class="bg-slate-800 p-3 rounded-lg border border-indigo-500/50 hover:border-indigo-400 cursor-pointer shadow-sm transition space-y-2">
            <span class="text-xs px-2 py-0.5 rounded font-bold bg-rose-500/20 text-rose-400">Security</span>
            <p class="text-sm font-medium text-slate-200">Enforce continuous timer sync via backend</p>
            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/60">
              <span>5 pts</span>
              <span class="text-amber-400">In Review</span>
            </div>
          </div>
          <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 cursor-pointer shadow-sm transition space-y-2">
            <span class="text-xs px-2 py-0.5 rounded font-bold bg-cyan-500/20 text-cyan-400">Frontend</span>
            <p class="text-sm font-medium text-slate-200">Full-width sandboxed HTML demo viewer</p>
            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/60">
              <span>3 pts</span>
              <span class="text-indigo-400">90%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Review / QA -->
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col min-h-[500px]">
        <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-700">
          <span class="font-semibold text-sm text-slate-300">QA & Review</span>
          <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full font-mono">1</span>
        </div>
        <div class="space-y-3 flex-1" id="col-qa">
          <div class="bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 cursor-pointer shadow-sm transition space-y-2">
            <span class="text-xs px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400">Testing</span>
            <p class="text-sm font-medium text-slate-200">Abuse protection & rate-limiting validation</p>
            <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/60">
              <span>3 pts</span>
              <span class="text-emerald-400">Passing</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Done -->
      <div class="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex flex-col min-h-[500px]">
        <div class="flex items-center justify-between pb-3 mb-2 border-b border-slate-700">
          <span class="font-semibold text-sm text-emerald-400">Done</span>
          <span class="text-xs bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded-full font-mono">2</span>
        </div>
        <div class="space-y-3 flex-1" id="col-done">
          <div class="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 opacity-80 space-y-2">
            <span class="text-xs px-2 py-0.5 rounded font-bold bg-slate-700 text-slate-400">Infra</span>
            <p class="text-sm font-medium text-slate-400 line-through">Cloud Firestore DB schema & rules</p>
            <span class="text-xs text-emerald-400">Shipped</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function createNewCard() {
      const title = prompt('Enter story title:');
      if (!title) return;
      const target = document.getElementById('col-backlog');
      const card = document.createElement('div');
      card.className = 'bg-slate-800 p-3 rounded-lg border border-slate-700 hover:border-indigo-500 cursor-pointer shadow-sm transition space-y-2';
      card.innerHTML = '<span class="text-xs px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-400">Feature</span><p class="text-sm font-medium text-slate-200">' + title + '</p><div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-700/60"><span>3 pts</span><span class="text-indigo-400">New</span></div>';
      target.prepend(card);
    }
    function resetBoard() {
      if (confirm('Reset Kanban board?')) location.reload();
    }
  </script>
</body>
</html>`
  },
  {
    id: 'smart-ledger-pro',
    title: 'SmartLedger Small Business Bookkeeper',
    category: 'Finance & Budgeting',
    shortDescription: 'Interactive bookkeeping ledger with automatic Profit & Loss statements, revenue graphs, expense category pies, and invoice exports.',
    description: 'Tailored for Etsy sellers, freelance studios, consultants, and micro-enterprises. Automatically tracks gross sales, operating expenditures, estimated quarterly tax reserves, and net profit margins with instant PDF/print invoice generation.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80'
    ],
    version: 'v4.1.0',
    isPublished: true,
    features: [
      'Real-time P&L (Profit & Loss) calculator with profit margin %',
      'Categorized expense breakdown (Software, Advertising, Materials, Fees)',
      'Quarterly tax reserve forecast (estimated 25% tax bracket)',
      'Client invoice creator with auto-calculated subtotals and discounts',
      'Monthly comparative performance bar graphs',
      'One-click CSV financial export'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablet', 'Laptop'],
    purchaseUrl: 'https://www.etsy.com',
    viewsCount: 412,
    demoLaunchesCount: 156,
    createdAt: '2026-01-20T12:00:00Z',
    updatedAt: '2026-03-22T16:00:00Z',
    demoHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SmartLedger Small Business Bookkeeper</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-slate-50 text-slate-900 p-4 sm:p-6 min-h-screen">
  <div class="max-w-6xl mx-auto space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm gap-4">
      <div>
        <span class="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">Financial Year 2026</span>
        <h1 class="text-2xl font-bold text-slate-900 mt-1">SmartLedger Business Bookkeeper</h1>
        <p class="text-slate-500 text-xs">Automated revenue tracking, tax reserve, and income statement</p>
      </div>
      <div class="flex gap-2">
        <button onclick="addTransactionPrompt()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5">
          <i class="fas fa-plus"></i> Add Entry
        </button>
      </div>
    </div>

    <!-- KPI Metrics -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-xl border border-slate-200">
        <span class="text-xs text-slate-400 font-medium">Total Revenue</span>
        <p class="text-2xl font-bold text-emerald-600 mt-1" id="totalRev">$18,450.00</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200">
        <span class="text-xs text-slate-400 font-medium">Total Expenses</span>
        <p class="text-2xl font-bold text-rose-500 mt-1" id="totalExp">$4,280.00</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200">
        <span class="text-xs text-slate-400 font-medium">Net Profit (76.8%)</span>
        <p class="text-2xl font-bold text-indigo-600 mt-1" id="netProfit">$14,170.00</p>
      </div>
      <div class="bg-white p-4 rounded-xl border border-slate-200">
        <span class="text-xs text-slate-400 font-medium">Tax Reserve (25%)</span>
        <p class="text-2xl font-bold text-amber-500 mt-1" id="taxReserve">$3,542.50</p>
      </div>
    </div>

    <!-- Ledger Table -->
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-4 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-sm text-slate-800">Recent Transactions Ledger</h2>
        <span class="text-xs text-slate-400">Live Client Sandboxed View</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm" id="txTable">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
            <tr>
              <th class="p-3.5">Date</th>
              <th class="p-3.5">Description</th>
              <th class="p-3.5">Category</th>
              <th class="p-3.5">Type</th>
              <th class="p-3.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            <tr>
              <td class="p-3.5 text-slate-500 text-xs">2026-03-24</td>
              <td class="p-3.5 text-slate-800">Etsy Digital Download Sales (Batch 41)</td>
              <td class="p-3.5 text-slate-500 text-xs">Direct Sales</td>
              <td class="p-3.5"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded font-bold">Income</span></td>
              <td class="p-3.5 text-right text-emerald-600 font-bold">+$1,420.00</td>
            </tr>
            <tr>
              <td class="p-3.5 text-slate-500 text-xs">2026-03-22</td>
              <td class="p-3.5 text-slate-800">Cloud Hosting & Firebase Functions</td>
              <td class="p-3.5 text-slate-500 text-xs">Infrastructure</td>
              <td class="p-3.5"><span class="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs rounded font-bold">Expense</span></td>
              <td class="p-3.5 text-right text-rose-600 font-bold">-$85.00</td>
            </tr>
            <tr>
              <td class="p-3.5 text-slate-500 text-xs">2026-03-20</td>
              <td class="p-3.5 text-slate-800">Custom Planner Template Commission</td>
              <td class="p-3.5 text-slate-500 text-xs">Client Work</td>
              <td class="p-3.5"><span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-xs rounded font-bold">Income</span></td>
              <td class="p-3.5 text-right text-emerald-600 font-bold">+$850.00</td>
            </tr>
            <tr>
              <td class="p-3.5 text-slate-500 text-xs">2026-03-18</td>
              <td class="p-3.5 text-slate-800">Meta & Google Search Ads</td>
              <td class="p-3.5 text-slate-500 text-xs">Marketing</td>
              <td class="p-3.5"><span class="px-2 py-0.5 bg-rose-100 text-rose-800 text-xs rounded font-bold">Expense</span></td>
              <td class="p-3.5 text-right text-rose-600 font-bold">-$340.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

  <script>
    function addTransactionPrompt() {
      const desc = prompt('Transaction description:');
      if (!desc) return;
      const amtStr = prompt('Amount in USD (e.g. 250):');
      const amt = parseFloat(amtStr);
      if (isNaN(amt)) return;
      const isIncome = confirm('Is this INCOME? Click OK for Income, Cancel for Expense.');
      
      const tbody = document.querySelector('#txTable tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = '<td class="p-3.5 text-slate-500 text-xs">Today</td><td class="p-3.5 text-slate-800">' + desc + '</td><td class="p-3.5 text-slate-500 text-xs">Custom</td><td class="p-3.5"><span class="px-2 py-0.5 ' + (isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800') + ' text-xs rounded font-bold">' + (isIncome ? 'Income' : 'Expense') + '</span></td><td class="p-3.5 text-right font-bold ' + (isIncome ? 'text-emerald-600' : 'text-rose-600') + '">' + (isIncome ? '+$' : '-$') + amt.toFixed(2) + '</td>';
      tbody.prepend(tr);
    }
  </script>
</body>
</html>`
  },
  {
    id: 'omni-inventory-pro',
    title: 'OmniInventory Pro & Stock Controller',
    category: 'Inventory Management',
    shortDescription: 'Multi-location product stock tracking with automated reorder levels, supplier catalogs, and simulated SKU barcode lookup.',
    description: 'A comprehensive inventory control application for e-commerce, artisan shops, and warehouse managers. Features real-time stock deductions, low-inventory notifications, unit cost margin tracking, and supplier contact directory.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80'
    ],
    version: 'v1.9.2',
    isPublished: true,
    features: [
      'SKU-based item registry with reorder safety alerts',
      'Batch quantity update with quick increment/decrement buttons',
      'Cost of Goods Sold (COGS) and retail markup calculation',
      'Supplier details and purchase order generator',
      'Filtered views by Warehouse, Shelf, or Product Category'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablet', 'Laptop', 'Mobile Web'],
    purchaseUrl: 'https://www.etsy.com',
    viewsCount: 198,
    demoLaunchesCount: 65,
    createdAt: '2026-02-10T15:00:00Z',
    updatedAt: '2026-03-12T10:00:00Z',
    demoHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>OmniInventory Pro</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-100 text-slate-800 p-4 sm:p-6 min-h-screen">
  <div class="max-w-6xl mx-auto space-y-4">
    <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">OmniInventory Pro</h1>
        <p class="text-xs text-slate-500">Warehouse stock, low-stock warnings, and reorder levels</p>
      </div>
      <button onclick="addItem()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition">
        + Add New SKU
      </button>
    </div>
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <table class="w-full text-left text-sm" id="invTable">
        <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
          <tr>
            <th class="p-3">SKU</th>
            <th class="p-3">Product Name</th>
            <th class="p-3">In Stock</th>
            <th class="p-3">Reorder Point</th>
            <th class="p-3">Unit Price</th>
            <th class="p-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr>
            <td class="p-3 font-mono text-xs text-indigo-600">WCG-PLN-01</td>
            <td class="p-3 font-semibold text-slate-800">Linen Hardcover Planner 2026</td>
            <td class="p-3 font-bold text-emerald-600" id="stock-1">142</td>
            <td class="p-3 text-slate-500">25</td>
            <td class="p-3 font-medium">$34.00</td>
            <td class="p-3 text-right space-x-1">
              <button onclick="changeStock('stock-1', -1)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold">-</button>
              <button onclick="changeStock('stock-1', 1)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold">+</button>
            </td>
          </tr>
          <tr>
            <td class="p-3 font-mono text-xs text-indigo-600">WCG-PEN-04</td>
            <td class="p-3 font-semibold text-slate-800">Precision Fineliner Set (12-pack)</td>
            <td class="p-3 font-bold text-rose-500" id="stock-2">8</td>
            <td class="p-3 text-slate-500">20 (Low Stock)</td>
            <td class="p-3 font-medium">$18.50</td>
            <td class="p-3 text-right space-x-1">
              <button onclick="changeStock('stock-2', -1)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold">-</button>
              <button onclick="changeStock('stock-2', 1)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold">+</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <script>
    function changeStock(id, delta) {
      const el = document.getElementById(id);
      let val = parseInt(el.innerText) + delta;
      if (val < 0) val = 0;
      el.innerText = val;
    }
    function addItem() {
      const name = prompt('Item name:');
      if (!name) return;
      const tbody = document.querySelector('#invTable tbody');
      const tr = document.createElement('tr');
      const id = 'stock-' + Date.now();
      tr.innerHTML = '<td class="p-3 font-mono text-xs text-indigo-600">WCG-CUST</td><td class="p-3 font-semibold text-slate-800">' + name + '</td><td class="p-3 font-bold text-emerald-600" id="' + id + '">50</td><td class="p-3 text-slate-500">10</td><td class="p-3 font-medium">$25.00</td><td class="p-3 text-right space-x-1"><button onclick="changeStock(\\'' + id + '\\', -1)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold">-</button><button onclick="changeStock(\\'' + id + '\\', 1)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs font-bold">+</button></td>';
      tbody.prepend(tr);
    }
  </script>
</body>
</html>`
  },
  {
    id: 'fitpulse-nutrition-suite',
    title: 'FitPulse Health, Macro & Workout Suite',
    category: 'Health & Wellness',
    shortDescription: 'Interactive fitness diary with calorie & macronutrient calculators, exercise routine tracker, water meter, and progress photos.',
    description: 'An all-encompassing wellness planner for personal trainers, athletes, and fitness enthusiasts. Features customizable daily targets for protein, carbohydrates, fats, workout split calendars, hydration logging, and weekly weight trends.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80'
    ],
    version: 'v2.1.0',
    isPublished: true,
    features: [
      'BMR and TDEE calorie macro target calculator',
      'Daily food diary with automatic protein/carb/fat sums',
      'Workout log with sets, reps, and personal record tracking',
      'Interactive visual water glass hydration tracker',
      'Body weight measurement and BMI trend graph'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablet', 'Mobile Web'],
    purchaseUrl: 'https://www.etsy.com',
    viewsCount: 264,
    demoLaunchesCount: 88,
    createdAt: '2026-02-15T08:30:00Z',
    updatedAt: '2026-03-21T09:15:00Z',
    demoHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FitPulse Nutrition Tracker</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-white p-4 sm:p-6 min-h-screen">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex justify-between items-center bg-slate-800/80 p-5 rounded-2xl border border-slate-700">
      <div>
        <h1 class="text-2xl font-bold">FitPulse Macro & Workout Suite</h1>
        <p class="text-xs text-slate-400">Daily nutrition summary • Target: 2,400 kcal</p>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30">On Track</span>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
        <span class="text-xs text-slate-400">Protein</span>
        <p class="text-xl font-bold text-cyan-400 mt-1">165g / 180g</p>
      </div>
      <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
        <span class="text-xs text-slate-400">Carbohydrates</span>
        <p class="text-xl font-bold text-amber-400 mt-1">210g / 240g</p>
      </div>
      <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
        <span class="text-xs text-slate-400">Healthy Fats</span>
        <p class="text-xl font-bold text-rose-400 mt-1">54g / 65g</p>
      </div>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'eventcraft-wedding-planner',
    title: 'EventCraft Luxury Wedding & Gala Master Planner',
    category: 'Event & Wedding Planning',
    shortDescription: 'Master event blueprint covering guest RSVP lists, interactive table seating maps, vendor payment schedules, and master timelines.',
    description: 'Used by professional wedding planners and engaged couples worldwide. Features guest dietary requirement trackers, budget allocation monitors with deposit due dates, and run-of-show day-of schedules with down-to-the-minute cues.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    screenshots: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80'
    ],
    version: 'v3.0.1',
    isPublished: true,
    features: [
      'Guest list RSVP tracking with meal choices and plus-ones',
      'Table seating assigner with drag-and-drop table layouts',
      'Vendor contracts & payment milestones scheduler',
      'Wedding day master timeline with printable bridal party itineraries',
      'Emergency day-of contacts list'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablet', 'Laptop'],
    purchaseUrl: 'https://www.etsy.com',
    viewsCount: 318,
    demoLaunchesCount: 112,
    createdAt: '2026-01-25T11:00:00Z',
    updatedAt: '2026-03-19T13:40:00Z',
    demoHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EventCraft Wedding Planner</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-rose-50/40 text-slate-800 p-4 sm:p-6 min-h-screen">
  <div class="max-w-5xl mx-auto space-y-6">
    <div class="bg-white p-6 rounded-2xl border border-rose-100 shadow-sm text-center space-y-2">
      <span class="text-xs uppercase tracking-widest font-bold text-rose-500">Luxury Event Blueprints</span>
      <h1 class="text-3xl font-serif text-slate-900">EventCraft Gala & Wedding Master</h1>
      <p class="text-slate-500 text-sm">Guest RSVP: 138 Confirmed • 12 Pending • 8 Declined</p>
    </div>
  </div>
</body>
</html>`
  }
];

export const PRODUCT_CATEGORIES = [
  'All Categories',
  'Productivity & Planning',
  'Project Management',
  'Finance & Budgeting',
  'Inventory Management',
  'Health & Wellness',
  'Event & Wedding Planning'
];
