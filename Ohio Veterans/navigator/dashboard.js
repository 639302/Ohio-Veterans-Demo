// Ohio Veterans — Navigator
// ODVS Stakeholder Dashboard behavior. A single read-only "Performance
// Dashboard" panel (KPI stats, county engagement, cohort/engagement charts,
// and a downloadable text report — all fabricated demo data, see
// stakeholder-data.js).

import { isStakeholder, logOut } from './auth.js';
import { KPI_STATS, COUNTY_ENGAGEMENT, COHORT_BREAKDOWN, ENGAGEMENT_TREND } from './stakeholder-data.js';
import { getCvsoInfo } from './county-data.js';

// logOut isn't called directly from this file — nav.js's account-menu
// "Sign out" row (stakeholder branch) already calls it and redirects — but
// it's imported here per this feature's spec for parity with auth.js's
// other consumers.
void logOut;

if (!isStakeholder()) {
  window.location.href = 'index.html';
} else {
  initDashboard();
}

function initDashboard() {
  renderPerformancePanel();
}

/* ====================================================================== */
/* Performance Dashboard panel                                            */
/* ====================================================================== */

function renderPerformancePanel() {
  const container = document.getElementById('performance-panel');
  if (!container) return;
  container.innerHTML = '';

  container.appendChild(buildKpiSection());
  container.appendChild(buildCountyTableSection());
  container.appendChild(buildCohortChartSection());
  container.appendChild(buildTrendChartSection());
  container.appendChild(buildExportSection());
}

function buildKpiSection() {
  const section = document.createElement('section');
  section.className = 'dashboard-section';

  const grid = document.createElement('div');
  grid.className = 'dashboard-kpi-grid';

  KPI_STATS.forEach((stat) => {
    const card = document.createElement('mms-card');
    card.setAttribute('variant', 'accent-left');
    card.setAttribute('color-scheme', 'primary');
    card.setAttribute('roundness', 'subtle');
    card.setAttribute('surface', 'tint');
    card.setAttribute('title-text', stat.label);
    if (stat.icon) card.setAttribute('icon', stat.icon);

    const body = document.createElement('div');
    body.setAttribute('slot', 'body-content');
    const value = document.createElement('p');
    value.className = 'dashboard-kpi-value';
    value.textContent = stat.value;
    body.appendChild(value);
    card.appendChild(body);

    grid.appendChild(card);
  });

  section.appendChild(grid);
  return section;
}

function buildCountyTableSection() {
  const section = document.createElement('section');
  section.className = 'dashboard-section';

  const heading = document.createElement('h2');
  heading.textContent = 'County Engagement';
  section.appendChild(heading);

  const table = document.createElement('table');
  table.className = 'dashboard-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  ['County', 'Sessions', ''].forEach((label) => {
    const th = document.createElement('th');
    th.setAttribute('scope', 'col');
    th.textContent = label;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');

  COUNTY_ENGAGEMENT.forEach((row) => {
    const tr = document.createElement('tr');

    const countyTd = document.createElement('td');
    countyTd.textContent = row.county;

    const sessionsTd = document.createElement('td');
    sessionsTd.textContent = row.sessions.toLocaleString();

    const actionTd = document.createElement('td');
    const viewButton = document.createElement('mms-button');
    viewButton.setAttribute('variant', 'secondary');
    viewButton.setAttribute('color-scheme', 'primary');
    viewButton.setAttribute('size', 'sm');
    viewButton.setAttribute('label', 'View CVSO');
    actionTd.appendChild(viewButton);

    tr.append(countyTd, sessionsTd, actionTd);
    tbody.appendChild(tr);

    const detailRow = document.createElement('tr');
    detailRow.className = 'dashboard-table__detail-row';
    detailRow.hidden = true;
    const detailTd = document.createElement('td');
    detailTd.colSpan = 3;
    detailRow.appendChild(detailTd);
    tbody.appendChild(detailRow);

    viewButton.addEventListener('click', () => {
      if (!detailRow.hidden) {
        detailRow.hidden = true;
        return;
      }
      renderCvsoDetail(detailTd, getCvsoInfo(row.county));
      detailRow.hidden = false;
    });
  });

  table.appendChild(tbody);
  section.appendChild(table);
  return section;
}

function renderCvsoDetail(container, info) {
  container.innerHTML = '';
  const name = document.createElement('p');
  name.innerHTML = `<strong>${info.officeName}</strong>`;
  container.appendChild(name);

  const phone = document.createElement('p');
  phone.textContent = `Phone: ${info.phone}`;
  container.appendChild(phone);

  if (info.address) {
    const address = document.createElement('p');
    address.textContent = `Address: ${info.address}`;
    container.appendChild(address);
  }
  if (info.email) {
    const email = document.createElement('p');
    email.textContent = `Email: ${info.email}`;
    container.appendChild(email);
  }
  if (info.website) {
    const website = document.createElement('p');
    website.textContent = `Website: ${info.website}`;
    container.appendChild(website);
  }
}

function buildCohortChartSection() {
  const section = document.createElement('section');
  section.className = 'dashboard-section';

  const heading = document.createElement('h2');
  heading.textContent = 'Cohort Breakdown';
  section.appendChild(heading);

  const chart = document.createElement('div');
  chart.className = 'dashboard-hbar-chart';

  COHORT_BREAKDOWN.forEach((item) => {
    const row = document.createElement('div');
    row.className = 'dashboard-hbar-chart__row';

    const label = document.createElement('span');
    label.className = 'dashboard-hbar-chart__label';
    label.textContent = item.label;

    const track = document.createElement('span');
    track.className = 'dashboard-hbar-chart__track';
    const fill = document.createElement('span');
    fill.className = 'dashboard-hbar-chart__fill';
    fill.style.width = `${item.percent}%`;
    track.appendChild(fill);

    const value = document.createElement('span');
    value.className = 'dashboard-hbar-chart__value';
    value.textContent = `${item.percent}%`;

    row.append(label, track, value);
    chart.appendChild(row);
  });

  section.appendChild(chart);
  return section;
}

function buildTrendChartSection() {
  const section = document.createElement('section');
  section.className = 'dashboard-section';

  const heading = document.createElement('h2');
  heading.textContent = 'Engagement Trend';
  section.appendChild(heading);

  const maxSessions = Math.max(...ENGAGEMENT_TREND.map((point) => point.sessions));

  const chart = document.createElement('div');
  chart.className = 'dashboard-vbar-chart';

  ENGAGEMENT_TREND.forEach((point) => {
    const col = document.createElement('div');
    col.className = 'dashboard-vbar-chart__col';

    const value = document.createElement('span');
    value.className = 'dashboard-vbar-chart__value';
    value.textContent = point.sessions.toLocaleString();

    const barWrap = document.createElement('div');
    barWrap.className = 'dashboard-vbar-chart__bar-wrap';
    const bar = document.createElement('div');
    bar.className = 'dashboard-vbar-chart__bar';
    bar.style.height = `${maxSessions ? (point.sessions / maxSessions) * 100 : 0}%`;
    barWrap.appendChild(bar);

    const label = document.createElement('span');
    label.className = 'dashboard-vbar-chart__label';
    label.textContent = point.month;

    col.append(value, barWrap, label);
    chart.appendChild(col);
  });

  section.appendChild(chart);
  return section;
}

function buildReportText() {
  const lines = [];
  lines.push('ODVS Stakeholder Dashboard Report');
  lines.push('Sample data for demonstration purposes only.');
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');

  lines.push('KPI Stats');
  KPI_STATS.forEach((stat) => lines.push(`  ${stat.label}: ${stat.value}`));
  lines.push('');

  lines.push('County Engagement (sessions)');
  COUNTY_ENGAGEMENT.forEach((row) => lines.push(`  ${row.county}: ${row.sessions}`));
  lines.push('');

  lines.push('Cohort Breakdown');
  COHORT_BREAKDOWN.forEach((item) => lines.push(`  ${item.label}: ${item.percent}%`));
  lines.push('');

  lines.push('Engagement Trend (monthly sessions)');
  ENGAGEMENT_TREND.forEach((point) => lines.push(`  ${point.month}: ${point.sessions}`));

  return lines.join('\n');
}

function downloadReport() {
  const text = buildReportText();
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'odvs-stakeholder-report.txt';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function buildExportSection() {
  const section = document.createElement('section');
  section.className = 'dashboard-section';

  const exportButton = document.createElement('mms-button');
  exportButton.setAttribute('variant', 'primary');
  exportButton.setAttribute('color-scheme', 'primary');
  exportButton.setAttribute('label', 'Export Report');
  exportButton.addEventListener('click', downloadReport);

  section.appendChild(exportButton);
  return section;
}
