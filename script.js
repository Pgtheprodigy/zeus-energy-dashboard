/* ============================================================
   ASHIPA ELECTRIC — ENERGY DASHBOARD
   script.js
   ============================================================ */


/* ─── DATA ───────────────────────────────────────────────────
   These objects hold all the values shown on the dashboard.
   HOME is for the residential view, BUSINESS for commercial.
─────────────────────────────────────────────────────────────── */

const HOME = {
  generated:     99.9,
  genDelta:      '+12%',
  grid:          4.1,
  gridDelta:     '-34%',
  co2:           22.6,
  co2Delta:      '+8.2 kg',
  savings:       '₦18,400',
  saveDelta:     '+₦3,100',
  battery:       54,
  batteryStatus: 'CHARGING',
  batStored:     '777 kWh',
  batRuntime:    '14.2 hrs',
  batRate:       '+3.4 kW',
  batTemp:       '28 °C',
  flows: [
    { name: 'Solar Panels',    val: '6.8 kW', pct: 85, color: 'var(--accent)'  },
    { name: 'Battery Discharge', val: '1.2 kW', pct: 15, color: 'var(--accent2)' },
    { name: 'Grid Import',     val: '0.3 kW', pct: 4,  color: 'var(--accent3)' },
    { name: 'Home Consumption',val: '5.4 kW', pct: 68, color: 'var(--danger)'  },
  ],
};

const BUSINESS = {
  generated:     320.1,
  genDelta:      '+22%',
  grid:          18.4,
  gridDelta:     '-51%',
  co2:           148.7,
  co2Delta:      '+42.1 kg',
  savings:       '₦94,500',
  saveDelta:     '+₦12,800',
  battery:       61,
  batteryStatus: 'DISCHARGING',
  batStored:     '640 kWh',
  batRuntime:    '9.8 hrs',
  batRate:       '-5.1 kW',
  batTemp:       '31 °C',
  flows: [
    { name: 'Solar Array',       val: '42.0 kW', pct: 92, color: 'var(--accent)'  },
    { name: 'Battery Discharge', val: '3.8 kW',  pct: 22, color: 'var(--accent2)' },
    { name: 'Grid Import',       val: '2.1 kW',  pct: 5,  color: 'var(--accent3)' },
    { name: 'Total Consumption', val: '38.6 kW', pct: 88, color: 'var(--danger)'  },
  ],
};

/* Hourly chart data — 6am through current hour */
const HOURS = ['6am','7am','8am','9am','10am','11am','12pm','1pm','2pm','3pm','4pm','5pm','Now'];
const GEN_H = [1.2, 3.1, 5.8, 7.4, 8.9, 9.2, 9.0, 8.7, 7.6, 6.1, 4.3, 2.8, 2.1];
const CON_H = [2.1, 2.4, 3.0, 3.8, 4.2, 4.6, 5.1, 4.9, 4.4, 3.9, 3.5, 3.1, 2.8];
const EXP_H = GEN_H.map((g, i) => Math.max(0, +(g - CON_H[i]).toFixed(2)));

/* System log entries */
const LOGS = [
  { icon: '⚡', msg: 'Peak generation reached',  time: '13:04 today', badge: 'ok',   bg: 'rgba(74,222,128,0.12)',  color: 'var(--accent2)' },
  { icon: '🔋', msg: 'Battery above 70%',         time: '12:47 today', badge: 'ok',   bg: 'rgba(74,222,128,0.12)',  color: 'var(--accent2)' },
  { icon: '⚠️', msg: 'Grid voltage fluctuation',  time: '11:22 today', badge: 'warn', bg: 'rgba(245,166,35,0.12)', color: 'var(--accent)'  },
  { icon: 'ℹ️', msg: 'Inverter auto-calibrated',   time: '09:55 today', badge: 'info', bg: 'rgba(56,189,248,0.12)', color: 'var(--accent3)' },
  { icon: '⚡', msg: 'System startup complete',    time: '06:00 today', badge: 'ok',   bg: 'rgba(74,222,128,0.12)',  color: 'var(--accent2)' },
];


/* ─── LIVE CLOCK ─────────────────────────────────────────────
   Updates the date/time in the topbar every second.
─────────────────────────────────────────────────────────────── */

function updateClock() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-NG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  document.getElementById('live-date').textContent = `${dateStr} · ${timeStr}`;
}

updateClock();
setInterval(updateClock, 1000);


/* ─── CHART ──────────────────────────────────────────────────
   Builds the line chart using Chart.js.
   Chart.js is loaded via a <script> tag in index.html.
─────────────────────────────────────────────────────────────── */

const ctx = document.getElementById('main-chart').getContext('2d');

const mainChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: HOURS,
    datasets: [
      {
        label: 'Generated',
        data: GEN_H,
        borderColor: 'rgba(245,166,35,0.9)',
        backgroundColor: 'rgba(245,166,35,0.08)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#f5a623',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Consumed',
        data: CON_H,
        borderColor: 'rgba(56,189,248,0.9)',
        backgroundColor: 'rgba(56,189,248,0.05)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#38bdf8',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Exported',
        data: EXP_H,
        borderColor: 'rgba(74,222,128,0.9)',
        backgroundColor: 'rgba(74,222,128,0.05)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#4ade80',
        fill: true,
        tension: 0.4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0e1419',
        borderColor: 'rgba(255,255,255,0.07)',
        borderWidth: 1,
        titleFont: { family: 'DM Mono', size: 11 },
        bodyFont:  { family: 'DM Mono', size: 11 },
        titleColor: '#5a6a78',
        bodyColor:  '#e8edf2',
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y} kW`,
        },
      },
    },
    scales: {
      x: {
        grid:   { color: 'rgba(255,255,255,0.04)' },
        ticks:  { color: '#5a6a78', font: { family: 'DM Mono', size: 10 } },
        border: { color: 'rgba(255,255,255,0.04)' },
      },
      y: {
        grid:   { color: 'rgba(255,255,255,0.04)' },
        ticks:  { color: '#5a6a78', font: { family: 'DM Mono', size: 10 }, callback: (v) => v + ' kW' },
        border: { color: 'rgba(255,255,255,0.04)' },
      },
    },
  },
});


/* ─── POPULATE KPI CARDS ─────────────────────────────────────
   Updates the four metric cards at the top.
   Called whenever the view switches between Home / Business.
─────────────────────────────────────────────────────────────── */

function populateKPIs(data) {
  document.getElementById('kpi-generated').innerHTML    = `${data.generated}<span> kWh</span>`;
  document.getElementById('kpi-gen-delta').textContent  = data.genDelta;
  document.getElementById('kpi-grid').innerHTML         = `${data.grid}<span> kWh</span>`;
  document.getElementById('kpi-grid-delta').textContent = data.gridDelta;
  document.getElementById('kpi-co2').innerHTML          = `${data.co2}<span> kg</span>`;
  document.getElementById('kpi-co2-delta').textContent  = data.co2Delta;
  document.getElementById('kpi-savings').textContent    = data.savings;
  document.getElementById('kpi-save-delta').textContent = data.saveDelta;
}


/* ─── POPULATE BATTERY ───────────────────────────────────────
   Updates the animated battery visual and stat blocks.
─────────────────────────────────────────────────────────────── */

function populateBattery(data) {
  const fill = document.getElementById('battery-fill');
  const pct  = document.getElementById('battery-pct');
  const stat = document.getElementById('battery-status');

  const isCharging = data.batteryStatus === 'CHARGING';

  /* Small delay lets the CSS transition play visibly */
  setTimeout(() => {
    fill.style.height = data.battery + '%';
  }, 100);

  pct.textContent  = data.battery + '%';
  stat.textContent = data.batteryStatus;

  fill.style.background = isCharging
    ? 'linear-gradient(180deg, rgba(74,222,128,0.5) 0%, #4ade80 100%)'
    : 'linear-gradient(180deg, rgba(245,166,35,0.5) 0%, #f5a623 100%)';

  pct.style.color = isCharging ? 'var(--accent2)' : 'var(--accent)';

  document.getElementById('bat-stored').textContent  = data.batStored;
  document.getElementById('bat-runtime').textContent = data.batRuntime;
  document.getElementById('bat-rate').textContent    = data.batRate;
  document.getElementById('bat-temp').textContent    = data.batTemp;
}


/* ─── POPULATE ENERGY FLOW ───────────────────────────────────
   Builds the flow bar rows dynamically from the data array.
─────────────────────────────────────────────────────────────── */

function populateFlow(flows) {
  const container = document.getElementById('flow-items');

  container.innerHTML = flows.map((f) => `
    <div class="flow-item">
      <div class="flow-meta">
        <div class="flow-name">
          <div class="flow-dot" style="background: ${f.color}"></div>
          ${f.name}
        </div>
        <div class="flow-val">${f.val}</div>
      </div>
      <div class="flow-bar-track">
        <div
          class="flow-bar-fill"
          style="width: 0%; background: ${f.color}"
          data-pct="${f.pct}"
        ></div>
      </div>
    </div>
  `).join('');

  /* Animate bars to their target width after render */
  setTimeout(() => {
    document.querySelectorAll('.flow-bar-fill').forEach((bar) => {
      bar.style.width = bar.dataset.pct + '%';
    });
  }, 200);
}


/* ─── POPULATE SYSTEM LOG ────────────────────────────────────
   Builds the event log list. This doesn't change per view.
─────────────────────────────────────────────────────────────── */

function populateLog() {
  document.getElementById('log-list').innerHTML = LOGS.map((entry) => `
    <div class="log-entry">
      <div class="log-icon" style="background: ${entry.bg}; color: ${entry.color}">
        ${entry.icon}
      </div>
      <div class="log-text">
        <div class="log-msg">${entry.msg}</div>
        <div class="log-time">${entry.time}</div>
      </div>
      <div class="log-badge ${entry.badge}">${entry.badge}</div>
    </div>
  `).join('');
}


/* ─── VIEW TOGGLE ────────────────────────────────────────────
   Switches between Home and Business datasets.
   Called by the onclick on each toggle button in index.html.
─────────────────────────────────────────────────────────────── */

let currentView = 'home';

function setView(view, clickedBtn) {
  currentView = view;

  /* Swap the CSS class on the shell so .home-only / .business-only hide correctly */
  const shell = document.getElementById('shell');
  shell.className = shell.className.replace(/view-\w+/, '') + ' view-' + view;

  /* Update active state on toggle buttons */
  document.querySelectorAll('.toggle-btn').forEach((btn) => btn.classList.remove('active'));
  clickedBtn.classList.add('active');

  /* Re-populate UI with the correct dataset */
  const data = view === 'home' ? HOME : BUSINESS;
  populateKPIs(data);
  populateBattery(data);
  populateFlow(data.flows);
}


/* ─── LIVE DATA SIMULATION ───────────────────────────────────
   Slightly drifts the "Generated Today" value every 8 seconds
   to mimic a real-time data feed.
─────────────────────────────────────────────────────────────── */

setInterval(() => {
  const data  = currentView === 'home' ? HOME : BUSINESS;
  const drift = (Math.random() * 0.4 - 0.2).toFixed(1);
  const newVal = Math.max(0, parseFloat(data.generated) + parseFloat(drift));
  document.getElementById('kpi-generated').innerHTML = `${newVal.toFixed(1)}<span> kWh</span>`;
}, 8000);


/* ─── INIT ───────────────────────────────────────────────────
   Run everything on page load.
─────────────────────────────────────────────────────────────── */

populateKPIs(HOME);
populateBattery(HOME);
populateFlow(HOME.flows);
populateLog();
