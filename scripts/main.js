/**
 * FlowSync AI — Main Interactivity Script
 * Cinematic Intelligence Dashboard
 */

// ─── Sidebar Navigation ───
// Navigation is handled natively by HTML hrefs. Active classes are hardcoded per page.

// ─── Google Maps: Metropolitan Heatmap ───

// Dark styling to match the Cinematic Intelligence aesthetic
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e0e0f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a5a7a' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a4a' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#8b90a0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#242440' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1c1c35' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2c2c50' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1e1e3a' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#252545' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e1e38' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d0d1a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3a3a5c' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a1a30' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#6a6a8a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#151528' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#161625' }] },
];

// Node markers to overlay on the live map
const MAP_NODES = [
  {
    id: 'node-402b',
    position: { lat: 28.6139, lng: 77.2090 }, // Central Delhi
    type: 'alert',
    title: 'Node 402-B',
    detail: 'Congestion Critical (89%)',
    color: '#ffb4ab',
  },
  {
    id: 'node-117a',
    position: { lat: 28.6280, lng: 77.2195 },
    type: 'active',
    title: 'Node 117-A',
    detail: 'Flow: Optimal',
    color: '#4fdbc8',
  },
  {
    id: 'node-305c',
    position: { lat: 28.5950, lng: 77.1890 },
    type: 'active',
    title: 'Node 305-C',
    detail: 'Flow: Normal (62%)',
    color: '#4fdbc8',
  },
  {
    id: 'node-210d',
    position: { lat: 28.6350, lng: 77.2350 },
    type: 'alert',
    title: 'Node 210-D',
    detail: 'Congestion Rising (73%)',
    color: '#ffb4ab',
  },
  {
    id: 'node-518e',
    position: { lat: 28.6050, lng: 77.2280 },
    type: 'active',
    title: 'Node 518-E',
    detail: 'Flow: Optimal',
    color: '#4fdbc8',
  },
];

// Zoom presets for Global/District toggle
const ZOOM_PRESETS = {
  global: { zoom: 12, center: { lat: 28.6139, lng: 77.2090 } },
  district: { zoom: 15, center: { lat: 28.6139, lng: 77.2090 } },
};

let flowMap = null;
let trafficLayer = null;

function initMap() {
  const mapEl = document.getElementById('googleMap');
  const loader = document.getElementById('mapLoader');
  if (!mapEl) return;

  flowMap = new google.maps.Map(mapEl, {
    center: ZOOM_PRESETS.global.center,
    zoom: ZOOM_PRESETS.global.zoom,
    styles: DARK_MAP_STYLE,
    disableDefaultUI: true,
    zoomControl: true,
    zoomControlOptions: {
      position: google.maps.ControlPosition.RIGHT_BOTTOM,
    },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    gestureHandling: 'greedy',
    backgroundColor: '#131314',
  });

  // Enable real-time traffic layer
  trafficLayer = new google.maps.TrafficLayer();
  trafficLayer.setMap(flowMap);

  // Plant node markers
  MAP_NODES.forEach(node => {
    const marker = new google.maps.Marker({
      position: node.position,
      map: flowMap,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: node.type === 'alert' ? 10 : 7,
        fillColor: node.color,
        fillOpacity: 0.9,
        strokeColor: node.color,
        strokeWeight: 2,
        strokeOpacity: 0.4,
      },
      title: node.title,
    });

    // InfoWindow styled to match dashboard
    const infoContent = `
      <div style="
        background: rgba(32,31,32,0.95);
        border: 1px solid ${node.type === 'alert' ? 'rgba(255,180,171,0.5)' : 'rgba(79,219,200,0.5)'};
        border-radius: 8px;
        padding: 10px 14px;
        font-family: 'Inter', sans-serif;
        min-width: 140px;
      ">
        <p style="
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: ${node.color};
          margin: 0 0 4px;
        ">${node.title}</p>
        <p style="
          font-size: 11px;
          color: #e5e2e3;
          margin: 0;
        ">${node.detail}</p>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({ content: infoContent });
    marker.addListener('click', () => infoWindow.open(flowMap, marker));
  });

  // Hide loader once tiles have loaded
  google.maps.event.addListenerOnce(flowMap, 'tilesloaded', () => {
    if (loader) loader.style.display = 'none';
  });

  // Wire up Global/District tab toggle
  setupHeatmapTabs();
}

// Expose initMap globally for the Google Maps callback
window.initMap = initMap;

function setupHeatmapTabs() {
  const heatmapTabs = document.querySelectorAll('.heatmap__tab');
  heatmapTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      heatmapTabs.forEach(t => t.classList.remove('heatmap__tab--active'));
      tab.classList.add('heatmap__tab--active');

      const preset = ZOOM_PRESETS[tab.dataset.tab];
      if (flowMap && preset) {
        flowMap.panTo(preset.center);
        flowMap.setZoom(preset.zoom);
      }
    });
  });
}

// ─── Button Click Feedback ───
function addClickRipple(btn, message) {
  if (!btn) return;
  btn.addEventListener('click', () => {
    const original = btn.textContent;
    btn.style.pointerEvents = 'none';
    btn.textContent = message;
    btn.style.opacity = '0.7';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.opacity = '1';
      btn.style.pointerEvents = '';
    }, 1500);
  });
}

addClickRipple(document.getElementById('exportReportBtn'), '✓ Generating...');
addClickRipple(document.getElementById('authorizeBtn'), '✓ Authorized');

// Export PDF button — preserve inner HTML (icon + text)
const exportPdfBtn = document.getElementById('exportPdfBtn');
if (exportPdfBtn) {
  exportPdfBtn.addEventListener('click', () => {
    const originalHTML = exportPdfBtn.innerHTML;
    exportPdfBtn.style.pointerEvents = 'none';
    exportPdfBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size:0.875rem">check_circle</span> Exported!';
    exportPdfBtn.style.opacity = '0.7';
    setTimeout(() => {
      exportPdfBtn.innerHTML = originalHTML;
      exportPdfBtn.style.opacity = '1';
      exportPdfBtn.style.pointerEvents = '';
    }, 2000);
  });
}

// ─── Dropzone Interaction ───
const dropzone = document.getElementById('dropzone');
if (dropzone) {
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = 'rgba(173, 198, 255, 0.6)';
    dropzone.style.background = 'rgba(173, 198, 255, 0.05)';
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.style.borderColor = '';
    dropzone.style.background = '';
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.style.borderColor = '';
    dropzone.style.background = '';
  });
  dropzone.addEventListener('click', () => {
    dropzone.querySelector('.material-symbols-outlined').textContent = 'hourglass_top';
    dropzone.querySelector('p').textContent = 'Awaiting feed connection...';
    setTimeout(() => {
      dropzone.querySelector('.material-symbols-outlined').textContent = 'cloud_upload';
      dropzone.querySelector('p').textContent = 'Drop local feed or IP source';
    }, 2500);
  });
}

// ─── Subtle Live Counter Animation ───
function animateCounter(el, target, suffix = '') {
  const duration = 1200;
  const start = 0;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    const current = Math.round(start + (target - start) * eased);
    el.childNodes[0].textContent = current;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Animate stat values on page load
document.addEventListener('DOMContentLoaded', () => {
  // Intersection observer for bar chart animation replay
  const barChart = document.querySelector('.bar-chart');
  if (barChart) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bars = entry.target.querySelectorAll('.bar-chart__bar');
          bars.forEach((bar, i) => {
            bar.style.animation = 'none';
            bar.offsetHeight; // trigger reflow
            bar.style.animation = `barGrow 0.8s ease ${i * 0.05}s both`;
          });
        }
      });
    }, { threshold: 0.3 });
    observer.observe(barChart);
  }

  // Confidence bar fill animation
  const confidenceFill = document.querySelector('.detection-card__confidence-fill');
  if (confidenceFill) {
    confidenceFill.style.width = '0%';
    setTimeout(() => {
      confidenceFill.style.width = '78%';
    }, 300);
  }

  // Progress bar fill animation
  const progressFill = document.querySelector('.stat-card__progress-fill');
  if (progressFill) {
    progressFill.style.transition = 'width 1.2s ease';
    progressFill.style.width = '0%';
    setTimeout(() => {
      progressFill.style.width = '92%';
    }, 400);
  }
});

// ─── Notification Bell ───
const notifBtn = document.getElementById('notifBtn');
if (notifBtn) {
  notifBtn.addEventListener('click', () => {
    const dot = notifBtn.querySelector('.navbar__notif-dot');
    if (dot) dot.style.display = dot.style.display === 'none' ? '' : 'none';
  });
}

// ─── Mobile Sidebar Toggle ───
// We'll add a hamburger menu for mobile
if (window.innerWidth <= 768) {
  const hamburger = document.createElement('button');
  hamburger.innerHTML = '<span class="material-symbols-outlined">menu</span>';
  hamburger.style.cssText = 'background:none;color:var(--on-surface);position:fixed;top:1rem;left:1rem;z-index:70;border:none;cursor:pointer;';
  hamburger.id = 'hamburger';
  document.body.appendChild(hamburger);

  const sidebar = document.getElementById('sidebar');
  hamburger.addEventListener('click', () => {
    sidebar.classList.toggle('sidebar--open');
  });

  // Close sidebar on link click (mobile)
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      sidebar.classList.remove('sidebar--open');
    });
  });
}

// ============================================
// JUNCTION SIMULATION SPECIFIC INTERACTIONS
// ============================================

// ─── Phase Toggle ───
const phaseBtns = document.querySelectorAll('.jsim-phase');
const currentPhaseText = document.getElementById('currentPhaseText');

if (phaseBtns.length > 0) {
  const phaseNames = {
    '1': 'Northbound Str.',
    '2': 'Eastbound Turn',
    '3': 'Southbound Str.',
    '4': 'Westbound Turn'
  };

  phaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      phaseBtns.forEach(b => b.classList.remove('jsim-phase--active'));
      // Add active class to clicked
      btn.classList.add('jsim-phase--active');
      
      // Update text in AI Signal Control card
      if (currentPhaseText) {
        const phaseNum = btn.getAttribute('data-phase');
        currentPhaseText.textContent = phaseNames[phaseNum] || 'Processing...';
      }
      
      // Reset countdown timer
      resetCountdown();
    });
  });
}

// ─── Countdown Timer ───
let countdownInterval;
const countdownEl = document.getElementById('jsimCountdown');

function startCountdown() {
  if (!countdownEl) return;
  let timeLeft = parseInt(countdownEl.textContent, 10);
  
  clearInterval(countdownInterval);
  countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft < 0) {
      // Auto-switch to next phase
      const current = document.querySelector('.jsim-phase--active');
      if (current) {
        let nextNum = parseInt(current.getAttribute('data-phase')) + 1;
        if (nextNum > 4) nextNum = 1;
        const nextBtn = document.querySelector(`.jsim-phase[data-phase="${nextNum}"]`);
        if (nextBtn) nextBtn.click();
      }
      timeLeft = 24; // Reset to default
    }
    countdownEl.textContent = timeLeft.toString().padStart(2, '0');
  }, 1000);
}

function resetCountdown() {
  if (countdownEl) {
    countdownEl.textContent = '24';
    startCountdown();
  }
}

// Start timer on load if element exists
if (countdownEl) {
  startCountdown();
}

// ─── Scenario Toggles ───
const emergencyToggle = document.getElementById('emergencyToggle');
if (emergencyToggle) {
  emergencyToggle.addEventListener('click', () => {
    emergencyToggle.classList.toggle('jsim-toggle--active');
    
    // Optional: Visual feedback on the rest of the UI when emergency mode is active
    if (emergencyToggle.classList.contains('jsim-toggle--active')) {
      document.body.style.boxShadow = 'inset 0 0 150px rgba(159, 5, 25, 0.4)';
    } else {
      document.body.style.boxShadow = '';
    }
  });
}

// ─── Incident Injection Buttons ───
const incidentBtns = document.querySelectorAll('.jsim-incident-btn');
incidentBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const titleEl = btn.querySelector('.jsim-incident-btn__title');
    if (!titleEl) return;
    
    // Check if not already injected
    if (!btn.classList.contains('injected')) {
      const originalText = titleEl.textContent;
      const originalIcon = btn.querySelector('.material-symbols-outlined').textContent;
      
      titleEl.textContent = 'Injected';
      btn.querySelector('.material-symbols-outlined').textContent = 'check_circle';
      btn.classList.add('injected');
      btn.style.opacity = '0.7';
      
      setTimeout(() => {
        titleEl.textContent = originalText;
        btn.querySelector('.material-symbols-outlined').textContent = originalIcon;
        btn.classList.remove('injected');
        btn.style.opacity = '1';
      }, 2000);
    }
  });
});

// ─── Navigation Logic Override ───
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.sidebar__link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href !== '#') {
      if (currentPath.includes(href) || (href === '/index.html' && currentPath === '/')) {
        navLinks.forEach(l => l.classList.remove('sidebar__link--active'));
        link.classList.add('sidebar__link--active');
      }
    } else {
      link.addEventListener('click', (e) => {
          if(!e.currentTarget.classList.contains('sidebar__link--active')) {
              e.preventDefault();
          }
      });
    }
  });
});


// ============================================
// SAFETY MATRIX SPECIFIC INTERACTIONS
// ============================================

// ─── Execute Action Button ───
const smExecuteBtn = document.getElementById('smExecuteBtn');
if (smExecuteBtn) {
  smExecuteBtn.addEventListener('click', () => {
    const original = smExecuteBtn.textContent;
    smExecuteBtn.style.pointerEvents = 'none';
    smExecuteBtn.textContent = '✓ Executing...';
    smExecuteBtn.style.opacity = '0.7';
    setTimeout(() => {
      smExecuteBtn.textContent = '✓ Applied';
      smExecuteBtn.style.backgroundColor = 'var(--sm-secondary)';
      setTimeout(() => {
        smExecuteBtn.textContent = original;
        smExecuteBtn.style.opacity = '1';
        smExecuteBtn.style.pointerEvents = '';
        smExecuteBtn.style.backgroundColor = '';
      }, 1500);
    }, 1000);
  });
}

// ─── FAB Click Effect ───
const smFab = document.getElementById('smFab');
if (smFab) {
  smFab.addEventListener('click', () => {
    smFab.style.boxShadow = '0 0 40px rgba(255, 180, 171, 0.8)';
    smFab.style.transform = 'scale(1.15)';
    setTimeout(() => {
      smFab.style.boxShadow = '';
      smFab.style.transform = '';
    }, 500);
  });
}

// ============================================
// SIMULATED REAL-TIME DATA ENGINE
// Command Center KPIs: Congestion, Delay,
// Throughput, Efficiency, Violations,
// Emergency Status, Pedestrian Matrix
// ============================================

(function initLiveSimulation() {
  // Only run on the Command Center page
  if (!document.getElementById('liveCongestion')) return;

  // ─── Helpers ───
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  // Smooth number transition
  function animateValue(el, target, suffix, duration = 600) {
    const currentText = el.childNodes[0].textContent;
    const start = parseFloat(currentText) || 0;
    const startTime = performance.now();
    const isFloat = String(target).includes('.');

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = start + (target - start) * eased;
      el.childNodes[0].textContent = isFloat ? current.toFixed(1) : Math.round(current);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ─── State ───
  let prevCongestion = 24;
  let prevDelay = 18;
  let prevThroughput = 14.2;
  let prevEfficiency = 92;
  let prevViolations = 8;
  let emergencyCycle = 0;

  const emergencyStates = [
    { text: 'NOMINAL', sub: 'No active medical corridors', color: 'tertiary' },
    { text: 'NOMINAL', sub: 'All corridors clear', color: 'tertiary' },
    { text: 'ACTIVE', sub: '1 medical corridor active', color: 'error' },
    { text: 'NOMINAL', sub: 'Corridors stabilized', color: 'tertiary' },
    { text: 'MONITORING', sub: 'Preemptive scan in progress', color: 'primary' },
    { text: 'NOMINAL', sub: 'No active medical corridors', color: 'tertiary' },
  ];

  const zones = ['4A', '7B', '2C', '9D', '1E', '6F', '3G', '5H'];

  // ─── Tick Function ───
  function tick() {
    // 1. Congestion Index (15–45%)
    const congestion = Math.max(10, Math.min(50, prevCongestion + randInt(-5, 5)));
    const congestionDelta = congestion - prevCongestion;
    const congestionEl = document.getElementById('liveCongestion');
    const congestionBadge = document.getElementById('liveCongestionBadge');
    if (congestionEl) animateValue(congestionEl, congestion, '%');
    if (congestionBadge) {
      const sign = congestionDelta <= 0 ? '' : '+';
      congestionBadge.textContent = `${sign}${congestionDelta}% vs last hr`;
    }
    prevCongestion = congestion;

    // 2. Avg Signal Delay (8–35s)
    const delay = Math.max(5, Math.min(40, prevDelay + randInt(-3, 3)));
    const delayEl = document.getElementById('liveDelay');
    if (delayEl) animateValue(delayEl, delay, 's');
    prevDelay = delay;

    // 3. Vehicle Throughput (10.0–20.0k)
    const throughput = Math.max(8, Math.min(22, +(prevThroughput + rand(-0.8, 0.8)).toFixed(1)));
    const throughputDelta = +(throughput - 14.2).toFixed(1);
    const throughputEl = document.getElementById('liveThroughput');
    const throughputBadge = document.getElementById('liveThroughputBadge');
    if (throughputEl) animateValue(throughputEl, throughput, 'k');
    if (throughputBadge) {
      const sign = throughputDelta >= 0 ? '+' : '';
      throughputBadge.textContent = `${sign}${throughputDelta}%`;
    }
    prevThroughput = throughput;

    // 4. Efficiency Score (75–100)
    const efficiency = Math.max(70, Math.min(100, prevEfficiency + randInt(-3, 3)));
    const efficiencyEl = document.getElementById('liveEfficiency');
    const efficiencyBar = document.getElementById('liveEfficiencyBar');
    if (efficiencyEl) animateValue(efficiencyEl, efficiency, '/100');
    if (efficiencyBar) efficiencyBar.style.width = efficiency + '%';
    prevEfficiency = efficiency;

    // 5. Active Violations (0–15)
    const violations = Math.max(0, Math.min(20, prevViolations + randInt(-2, 2)));
    const violationsEl = document.getElementById('liveViolations');
    if (violationsEl) {
      animateValue(violationsEl, violations, '');
      // flash red on increase
      if (violations > prevViolations) {
        violationsEl.style.textShadow = '0 0 15px rgba(255,113,108,0.6)';
        setTimeout(() => { violationsEl.style.textShadow = ''; }, 800);
      }
    }
    prevViolations = violations;

    // 6. Emergency Status (cycle through states)
    const state = emergencyStates[emergencyCycle % emergencyStates.length];
    const emergencyText = document.getElementById('liveEmergencyText');
    const emergencySub = document.getElementById('liveEmergencySub');
    const emergencyDot = document.getElementById('liveEmergencyDot');
    if (emergencyText) emergencyText.textContent = state.text;
    if (emergencySub) emergencySub.textContent = state.sub;
    if (emergencyDot) {
      emergencyDot.style.backgroundColor =
        state.color === 'error' ? 'var(--error)' :
        state.color === 'primary' ? 'var(--tertiary)' :
        'var(--tertiary)';
      emergencyDot.style.boxShadow =
        state.color === 'error' ? '0 0 10px var(--error)' : '';
    }
    emergencyCycle++;

    // 7. Pedestrian Matrix (5–30)
    const pedestrians = randInt(5, 30);
    const pedEl = document.getElementById('livePedestrians');
    if (pedEl) animateValue(pedEl, pedestrians, '');

    // Schedule next tick (3–5s random interval for organic feel)
    setTimeout(tick, rand(3000, 5000));
  }

  // Start simulation after a small initial delay
  setTimeout(tick, 2000);
})();

// ============================================
// JUNCTION SIM — SIMULATED REAL-TIME DATA
// KPIs, Queue & Density, Vehicle Mix Profile
// ============================================

(function initJsimSimulation() {
  // Only run on the Junction Sim page
  if (!document.getElementById('jsimCongestion')) return;

  // ─── Helpers ───
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  function animVal(el, target, duration = 600) {
    if (!el) return;
    const currentText = el.childNodes[0].textContent;
    const start = parseFloat(currentText) || 0;
    const startTime = performance.now();
    const isFloat = String(target).includes('.');

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * eased;
      el.childNodes[0].textContent = isFloat ? current.toFixed(1) : Math.round(current);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ─── KPI State ───
  let prevCong = 24, prevDelay = 18, prevThroughput = 14.2, prevEff = 92, prevViol = 8;
  let emCycle = 0;

  const emStates = [
    { text: 'NOMINAL', sub: 'No active medical corridors', color: '#4fdbc8' },
    { text: 'NOMINAL', sub: 'All corridors clear', color: '#4fdbc8' },
    { text: 'ACTIVE', sub: '1 medical corridor active', color: '#ffb4ab' },
    { text: 'NOMINAL', sub: 'Node stable', color: '#4fdbc8' },
    { text: 'MONITORING', sub: 'Preemptive scan in progress', color: '#72dcff' },
    { text: 'NOMINAL', sub: 'No active medical corridors', color: '#4fdbc8' },
  ];

  // ─── Queue State (meters) ───
  let qNorth = 12, qSouth = 48, qEast = 142, qWest = 24;

  function getQueueLevel(meters) {
    if (meters <= 20) return { label: 'Optimal', cls: 'low' };
    if (meters <= 40) return { label: 'Low', cls: 'low' };
    if (meters <= 80) return { label: 'Moderate', cls: 'med' };
    return { label: 'High', cls: 'high' };
  }

  function updateQueue(id, statusId, fillId, meters) {
    const level = getQueueLevel(meters);
    const el = document.getElementById(id);
    const statusEl = document.getElementById(statusId);
    const fillEl = document.getElementById(fillId);

    if (statusEl) statusEl.textContent = `${level.label} (${meters}m)`;
    if (fillEl) {
      const pct = Math.min(100, Math.round((meters / 200) * 100));
      fillEl.style.width = pct + '%';
      fillEl.style.transition = 'width 0.6s ease';
    }
    if (el) {
      el.className = el.className.replace(/jsim-queue-item--(low|med|high)/g, '');
      el.classList.add(`jsim-queue-item--${level.cls}`);
    }
  }

  // ─── Vehicle Mix State ───
  let mixCar = 55, mixAuto = 22, mixBus = 12, mixBike = 6, mixPed = 5;

  function updateMix() {
    // Randomly nudge each by ±3, then normalize to 100
    let raw = [
      Math.max(35, Math.min(70, mixCar + randInt(-3, 3))),
      Math.max(10, Math.min(35, mixAuto + randInt(-2, 2))),
      Math.max(5, Math.min(20, mixBus + randInt(-2, 2))),
      Math.max(2, Math.min(12, mixBike + randInt(-1, 1))),
      Math.max(1, Math.min(10, mixPed + randInt(-1, 1))),
    ];
    const total = raw.reduce((a, b) => a + b, 0);
    const normalized = raw.map(v => Math.round((v / total) * 100));
    // Fix rounding to ensure sum = 100
    const diff = 100 - normalized.reduce((a, b) => a + b, 0);
    normalized[0] += diff;

    [mixCar, mixAuto, mixBus, mixBike, mixPed] = normalized;

    const items = [
      { fill: 'jsimMixCarFill', val: 'jsimMixCarVal', pct: mixCar },
      { fill: 'jsimMixAutoFill', val: 'jsimMixAutoVal', pct: mixAuto },
      { fill: 'jsimMixBusFill', val: 'jsimMixBusVal', pct: mixBus },
      { fill: 'jsimMixBikeFill', val: 'jsimMixBikeVal', pct: mixBike },
      { fill: 'jsimMixPedFill', val: 'jsimMixPedVal', pct: mixPed },
    ];

    items.forEach(({ fill, val, pct }) => {
      const fillEl = document.getElementById(fill);
      const valEl = document.getElementById(val);
      if (fillEl) {
        fillEl.style.width = pct + '%';
        fillEl.style.transition = 'width 0.6s ease';
      }
      if (valEl) valEl.textContent = pct + '%';
    });
  }

  // ─── Tick Function ───
  function tick() {
    // 1. Congestion
    const cong = Math.max(10, Math.min(50, prevCong + randInt(-5, 5)));
    const congDelta = cong - prevCong;
    animVal(document.getElementById('jsimCongestion'), cong);
    const cb = document.getElementById('jsimCongestionBadge');
    if (cb) cb.textContent = `${congDelta <= 0 ? '' : '+'}${congDelta}% vs last hr`;
    prevCong = cong;

    // 2. Delay
    const delay = Math.max(5, Math.min(40, prevDelay + randInt(-3, 3)));
    animVal(document.getElementById('jsimDelay'), delay);
    prevDelay = delay;

    // 3. Throughput
    const tp = Math.max(8, Math.min(22, +(prevThroughput + rand(-0.8, 0.8)).toFixed(1)));
    const tpDelta = +(tp - 14.2).toFixed(1);
    animVal(document.getElementById('jsimThroughput'), tp);
    const tb = document.getElementById('jsimThroughputBadge');
    if (tb) tb.textContent = `${tpDelta >= 0 ? '+' : ''}${tpDelta}%`;
    prevThroughput = tp;

    // 4. Efficiency
    const eff = Math.max(70, Math.min(100, prevEff + randInt(-3, 3)));
    animVal(document.getElementById('jsimEfficiency'), eff);
    const effBar = document.getElementById('jsimEfficiencyBar');
    if (effBar) effBar.style.width = eff + '%';
    prevEff = eff;

    // 5. Violations
    const viol = Math.max(0, Math.min(20, prevViol + randInt(-2, 2)));
    const violEl = document.getElementById('jsimViolations');
    if (violEl) {
      animVal(violEl, viol);
      if (viol > prevViol) {
        violEl.style.textShadow = '0 0 15px rgba(255,180,171,0.6)';
        setTimeout(() => { violEl.style.textShadow = ''; }, 800);
      }
    }
    prevViol = viol;

    // 6. Emergency Status
    const es = emStates[emCycle % emStates.length];
    const et = document.getElementById('jsimEmergencyText');
    const esub = document.getElementById('jsimEmergencySub');
    const edot = document.getElementById('jsimEmergencyDot');
    if (et) et.textContent = es.text;
    if (esub) esub.textContent = es.sub;
    if (edot) {
      edot.style.backgroundColor = es.color;
      edot.style.boxShadow = es.color === '#ffb4ab' ? `0 0 10px ${es.color}` : '';
    }
    emCycle++;

    // 7. Queue & Density
    qNorth = Math.max(5, Math.min(180, qNorth + randInt(-15, 15)));
    qSouth = Math.max(5, Math.min(180, qSouth + randInt(-15, 15)));
    qEast = Math.max(5, Math.min(200, qEast + randInt(-20, 20)));
    qWest = Math.max(5, Math.min(180, qWest + randInt(-15, 15)));

    updateQueue('jsimQueueNorth', 'jsimQueueNorthStatus', 'jsimQueueNorthFill', qNorth);
    updateQueue('jsimQueueSouth', 'jsimQueueSouthStatus', 'jsimQueueSouthFill', qSouth);
    updateQueue('jsimQueueEast', 'jsimQueueEastStatus', 'jsimQueueEastFill', qEast);
    updateQueue('jsimQueueWest', 'jsimQueueWestStatus', 'jsimQueueWestFill', qWest);

    // 8. Vehicle Mix
    updateMix();

    // Schedule next
    setTimeout(tick, rand(3000, 5000));
  }

  setTimeout(tick, 2000);
})();
