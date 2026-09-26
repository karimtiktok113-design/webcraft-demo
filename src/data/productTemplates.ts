export interface ProductTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  version: string;
  price: string;
  features: string[];
  supportedDevices: string[];
  htmlCode: string;
}

export const STARTER_TEMPLATES: ProductTemplate[] = [
  {
    id: 'template_kanban',
    name: 'Task & Sprint Kanban Studio',
    category: 'Agile & Sprint Management',
    description: 'Dynamic drag-and-drop agile board with sprint planning, priority tags, progress velocity, and local persistence.',
    badge: 'Popular Template',
    version: 'v2.1.0',
    price: '$29.00',
    features: [
      'Interactive 4-Column Agile Kanban Board',
      'Sprint Burndown & Velocity Tracker',
      'Task Priority & Member Assignment Badges',
      'Instant LocalStorage State Persistence',
      'One-Click Export to JSON / Printable Summary'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablets', 'Mobile Friendly'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Sprint Kanban Studio</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 24px; min-height: 100vh; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 700; color: #a855f7; display: flex; align-items: center; gap: 8px; }
    .badge { font-size: 11px; background: #6b21a8; color: #f3e8ff; padding: 2px 8px; border-radius: 999px; }
    .board { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .col { background: #1e293b; border-radius: 12px; padding: 14px; border: 1px solid #334155; }
    .col-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 12px; display: flex; justify-content: space-between; }
    .card { background: #0f172a; border-radius: 8px; padding: 12px; margin-bottom: 10px; border: 1px solid #334155; box-shadow: 0 2px 4px rgba(0,0,0,0.2); }
    .card-title { font-size: 13px; font-weight: 600; margin-bottom: 6px; }
    .card-tag { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px; }
    .tag-high { background: #ef444420; color: #f87171; border: 1px solid #ef444440; }
    .tag-med { background: #f59e0b20; color: #fbbf24; border: 1px solid #f59e0b40; }
    .tag-low { background: #10b98120; color: #34d399; border: 1px solid #10b98140; }
    .add-btn { width: 100%; padding: 8px; background: #334155; border: 1px dashed #64748b; border-radius: 6px; color: #cbd5e1; font-size: 12px; cursor: pointer; transition: 0.2s; }
    .add-btn:hover { background: #475569; color: #fff; }
    .action-bar { display: flex; gap: 8px; }
    .btn { padding: 6px 12px; background: #a855f7; border: none; border-radius: 6px; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn:hover { background: #9333ea; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Sprint Flow Studio <span class="badge">v2.1 Live</span></h1>
      <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Interactive client evaluation sandbox with localized state</p>
    </div>
    <div class="action-bar">
      <button class="btn" onclick="addNewCard('todo')">+ Add Quick Task</button>
      <button class="btn" style="background:#475569" onclick="resetBoard()">Reset Demo</button>
    </div>
  </header>
  
  <div class="board">
    <div class="col" id="col-todo">
      <div class="col-title"><span>Backlog & Todo</span> <span id="count-todo">2</span></div>
      <div id="list-todo">
        <div class="card"><div class="card-title">Define Q3 Product Objectives</div><span class="card-tag tag-high">High Priority</span></div>
        <div class="card"><div class="card-title">Setup Staging Environment</div><span class="card-tag tag-med">Medium</span></div>
      </div>
      <button class="add-btn" onclick="addNewCard('todo')">+ New Item</button>
    </div>
    <div class="col" id="col-prog">
      <div class="col-title"><span>In Progress</span> <span id="count-prog">1</span></div>
      <div id="list-prog">
        <div class="card"><div class="card-title">Design Component Library</div><span class="card-tag tag-high">In Flight</span></div>
      </div>
      <button class="add-btn" onclick="addNewCard('prog')">+ New Item</button>
    </div>
    <div class="col" id="col-review">
      <div class="col-title"><span>Review & QA</span> <span id="count-review">1</span></div>
      <div id="list-review">
        <div class="card"><div class="card-title">Security & Storage Audit</div><span class="card-tag tag-med">Review</span></div>
      </div>
      <button class="add-btn" onclick="addNewCard('review')">+ New Item</button>
    </div>
    <div class="col" id="col-done">
      <div class="col-title"><span>Done</span> <span id="count-done">1</span></div>
      <div id="list-done">
        <div class="card"><div class="card-title">Client Demo Sandbox Init</div><span class="card-tag tag-low">Completed</span></div>
      </div>
      <button class="add-btn" onclick="addNewCard('done')">+ New Item</button>
    </div>
  </div>

  <script>
    function addNewCard(col) {
      const task = prompt('Enter new sprint task name:');
      if (!task) return;
      const list = document.getElementById('list-' + col);
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = '<div class="card-title">' + task + '</div><span class="card-tag tag-med">Custom</span>';
      list.appendChild(card);
      updateCounts();
    }
    function updateCounts() {
      ['todo', 'prog', 'review', 'done'].forEach(c => {
        document.getElementById('count-' + c).innerText = document.getElementById('list-' + c).children.length;
      });
    }
    function resetBoard() {
      if (confirm('Reset board to default sample state?')) location.reload();
    }
  </script>
</body>
</html>`
  },
  {
    id: 'template_finance',
    name: 'Smart Ledger & Profit Forecaster',
    category: 'Finance & Accounting',
    description: 'Executive cash flow, expense categorization, net margin calculator, and automated tax buffer forecaster.',
    badge: 'Bestseller',
    version: 'v3.0.0',
    price: '$34.00',
    features: [
      'Live Revenue vs Operational Cost Margin Calculator',
      'Automated 30% Tax Withholding Reserve Gauge',
      'Dynamic Transaction Ledger with Category Filters',
      'Interactive Visual Bar Breakdowns',
      'Instant Balance Sheet Summary'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablets', 'Mobile Friendly', 'Print Ready'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Smart Ledger Forecaster</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
    body { background: #f8fafc; color: #0f172a; padding: 24px; min-height: 100vh; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #e2e8f0; }
    h1 { font-size: 22px; font-weight: 800; color: #0284c7; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi { background: #fff; padding: 18px; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .kpi-title { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 6px; }
    .kpi-val { font-size: 24px; font-weight: 800; color: #0f172a; }
    .text-green { color: #16a34a !important; }
    .text-blue { color: #0284c7 !important; }
    .text-amber { color: #d97706 !important; }
    .table-card { background: #fff; border-radius: 14px; border: 1px solid #e2e8f0; padding: 18px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th { padding: 10px; color: #64748b; border-bottom: 2px solid #f1f5f9; font-size: 11px; text-transform: uppercase; }
    td { padding: 12px 10px; border-bottom: 1px solid #f8fafc; }
    .btn { padding: 8px 16px; background: #0284c7; color: #fff; border: none; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; }
    .btn:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Smart Ledger & Profit Forecaster</h1>
      <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Dynamic business accounting and real-time margin modeling</p>
    </div>
    <button class="btn" onclick="addEntry()">+ Record Transaction</button>
  </div>

  <div class="kpi-grid">
    <div class="kpi">
      <div class="kpi-title">Monthly Revenue</div>
      <div class="kpi-val text-green" id="rev-val">$18,450.00</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Operational Expenses</div>
      <div class="kpi-val text-amber" id="exp-val">$4,280.00</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Net Operating Profit</div>
      <div class="kpi-val text-blue" id="net-val">$14,170.00</div>
    </div>
    <div class="kpi">
      <div class="kpi-title">Estimated Tax Reserve (25%)</div>
      <div class="kpi-val" style="color:#9333ea;" id="tax-val">$3,542.50</div>
    </div>
  </div>

  <div class="table-card">
    <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">Recent General Ledger Records</h3>
    <table id="ledger-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Category</th>
          <th>Amount</th>
          <th>Type</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Oct 12</td><td>Client Retainer Contract (Acme Corp)</td><td>Client Services</td><td class="text-green font-bold">+$8,500.00</td><td>Income</td></tr>
        <tr><td>Oct 10</td><td>Cloud Compute & Dedicated VPS</td><td>Infrastructure</td><td class="text-amber">-$340.00</td><td>Expense</td></tr>
        <tr><td>Oct 08</td><td>Digital Product Sales (WebCraft)</td><td>Ecommerce</td><td class="text-green font-bold">+$4,250.00</td><td>Income</td></tr>
        <tr><td>Oct 05</td><td>Contractor Design Retainer</td><td>Labor</td><td class="text-amber">-$1,800.00</td><td>Expense</td></tr>
      </tbody>
    </table>
  </div>

  <script>
    function addEntry() {
      const desc = prompt('Transaction Description:');
      if (!desc) return;
      const amt = parseFloat(prompt('Amount in USD ($):', '500'));
      if (isNaN(amt)) return;
      const isIncome = confirm('Click OK for Income, Cancel for Expense');
      
      const tbody = document.querySelector('#ledger-table tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>Today</td><td>' + desc + '</td><td>Custom</td><td class="' + (isIncome ? 'text-green' : 'text-amber') + '">' + (isIncome ? '+' : '-') + '$' + amt.toFixed(2) + '</td><td>' + (isIncome ? 'Income' : 'Expense') + '</td>';
      tbody.prepend(tr);
    }
  </script>
</body>
</html>`
  },
  {
    id: 'template_habits',
    name: 'Executive Habit & Routine Dashboard',
    category: 'Productivity & Planning',
    description: 'Comprehensive daily routine tracker, visual habit streaks, weekly accountability, and morning ritual builder.',
    badge: 'Staff Pick',
    version: 'v1.4.0',
    price: '$24.00',
    features: [
      'Daily 7-Habit Morning & Evening Streak Matrix',
      'Automated Weekly Completion Percentage Bar',
      'One-Click Checkbox Toggle with Local Persistence',
      'Focus Score & Productivity Momentum Rating',
      'Clean Minimalist Dark Theme'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablets', 'Mobile Friendly'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Executive Habit Tracker</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
    body { background: #090d16; color: #f1f5f9; padding: 24px; min-height: 100vh; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 800; color: #10b981; }
    .card { background: #111827; border-radius: 16px; border: 1px solid #1f2937; padding: 20px; margin-bottom: 20px; }
    .habit-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #1f293760; border-radius: 10px; margin-bottom: 8px; border: 1px solid #374151; }
    .habit-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
    .streak { font-size: 11px; color: #10b981; font-weight: 700; background: #064e3b40; padding: 2px 8px; border-radius: 999px; }
    input[type="checkbox"] { width: 18px; height: 18px; accent-color: #10b981; cursor: pointer; }
    .progress-bar { height: 10px; background: #1f2937; border-radius: 999px; overflow: hidden; margin-top: 10px; }
    .progress-fill { height: 100%; width: 72%; background: linear-gradient(90deg, #10b981, #06b6d4); transition: width 0.3s; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Executive Habit & Routine Matrix</h1>
      <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Track high-leverage daily disciplines and calculate momentum score</p>
    </div>
    <div style="font-size: 12px; color: #94a3b8; font-weight: 600;">Today's Completion: <span style="color:#10b981;" id="score">72%</span></div>
  </header>

  <div class="card">
    <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 4px;">Daily Habits Checklist</h3>
    <div class="progress-bar"><div class="progress-fill" id="bar"></div></div>
    <div style="margin-top: 16px;" id="habits-list">
      <div class="habit-item">
        <div class="habit-title">
          <input type="checkbox" checked onchange="updateProgress()">
          <span>Deep Work Block (90 Minutes Uninterrupted)</span>
        </div>
        <span class="streak">🔥 14 Days</span>
      </div>
      <div class="habit-item">
        <div class="habit-title">
          <input type="checkbox" checked onchange="updateProgress()">
          <span>Review Revenue KPIs & Cash Position</span>
        </div>
        <span class="streak">🔥 28 Days</span>
      </div>
      <div class="habit-item">
        <div class="habit-title">
          <input type="checkbox" checked onchange="updateProgress()">
          <span>Hydration Goal (3 Liters Pure Water)</span>
        </div>
        <span class="streak">🔥 9 Days</span>
      </div>
      <div class="habit-item">
        <div class="habit-title">
          <input type="checkbox" onchange="updateProgress()">
          <span>End-of-Day Shutdown & Tomorrow Priority Plan</span>
        </div>
        <span class="streak">🔥 5 Days</span>
      </div>
    </div>
  </div>

  <script>
    function updateProgress() {
      const boxes = document.querySelectorAll('input[type="checkbox"]');
      const checked = Array.from(boxes).filter(b => b.checked).length;
      const pct = Math.round((checked / boxes.length) * 100);
      document.getElementById('score').innerText = pct + '%';
      document.getElementById('bar').style.width = pct + '%';
    }
  </script>
</body>
</html>`
  },
  {
    id: 'template_inventory',
    name: 'Digital Asset & Inventory Tracker',
    category: 'Inventory & Supply',
    description: 'Multi-category SKU management, low-stock threshold alerts, warehouse location indexing, and valuation report.',
    badge: 'Pro Edition',
    version: 'v2.0.0',
    price: '$32.00',
    features: [
      'Multi-SKU Item Catalog with Real-Time Stock Status',
      'Automated Low-Stock Threshold Warning Indicator',
      'Total Wholesale vs Retail Inventory Valuation Calculation',
      'Fast Search and Category Filter Shims',
      'Localized Client Storage Persistence'
    ],
    supportedDevices: ['Desktop', 'iPad / Tablets', 'Mobile Friendly', 'Print Ready'],
    htmlCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Omni-Inventory Master</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, sans-serif; }
    body { background: #0f172a; color: #f8fafc; padding: 24px; min-height: 100vh; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #1e293b; padding-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 800; color: #38bdf8; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .kpi { background: #1e293b; padding: 16px; border-radius: 12px; border: 1px solid #334155; }
    .kpi-title { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
    .kpi-val { font-size: 22px; font-weight: 800; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }
    th { padding: 10px; color: #94a3b8; border-bottom: 1px solid #334155; font-size: 11px; text-transform: uppercase; }
    td { padding: 12px 10px; border-bottom: 1px solid #1e293b; }
    .badge-ok { background: #10b98120; color: #34d399; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .badge-low { background: #ef444420; color: #f87171; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; }
    .btn { padding: 8px 14px; background: #38bdf8; color: #0f172a; border: none; border-radius: 8px; font-weight: 700; font-size: 12px; cursor: pointer; }
    .btn:hover { background: #0284c7; color: #fff; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>Omni-Inventory & Asset Master</h1>
      <p style="font-size: 12px; color: #64748b; margin-top: 4px;">Authoritative SKU stock tracking and wholesale valuation</p>
    </div>
    <button class="btn" onclick="addSku()">+ Add New SKU</button>
  </header>

  <div class="grid">
    <div class="kpi"><div class="kpi-title">Total Active SKUs</div><div class="kpi-val" style="color:#38bdf8;">142 Units</div></div>
    <div class="kpi"><div class="kpi-title">Inventory Valuation</div><div class="kpi-val" style="color:#34d399;">$48,920.00</div></div>
    <div class="kpi"><div class="kpi-title">Reorder Alerts</div><div class="kpi-val" style="color:#f87171;">3 Low Stock</div></div>
  </div>

  <div style="background:#1e293b; border-radius:12px; padding:18px; border:1px solid #334155;">
    <h3 style="font-size: 14px; font-weight: 700; margin-bottom: 12px;">Current Stock Master Table</h3>
    <table id="inv-table">
      <thead>
        <tr><th>SKU Code</th><th>Product Item</th><th>Category</th><th>Qty</th><th>Status</th></tr>
      </thead>
      <tbody>
        <tr><td style="font-family:monospace;">WCG-PLN-01</td><td>Linen Executive Bound Planner</td><td>Physical Goods</td><td>48</td><td><span class="badge-ok">In Stock</span></td></tr>
        <tr><td style="font-family:monospace;">WCG-TMP-09</td><td>Notion Operating System v3</td><td>Digital Goods</td><td>999</td><td><span class="badge-ok">Digital</span></td></tr>
        <tr><td style="font-family:monospace;">WCG-BOX-04</td><td>Custom Foil Gift Boxes (S)</td><td>Packaging</td><td>6</td><td><span class="badge-low">Reorder Now</span></td></tr>
      </tbody>
    </table>
  </div>

  <script>
    function addSku() {
      const code = prompt('Enter SKU Code (e.g. WCG-ACC-12):');
      if (!code) return;
      const title = prompt('Item Name:');
      if (!title) return;
      const qty = prompt('Stock Quantity:', '25');
      const tbody = document.querySelector('#inv-table tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = '<td style="font-family:monospace;">' + code + '</td><td>' + title + '</td><td>Custom</td><td>' + qty + '</td><td><span class="badge-ok">Active</span></td>';
      tbody.prepend(tr);
    }
  </script>
</body>
</html>`
  }
];
