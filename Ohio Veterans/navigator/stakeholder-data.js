// Ohio Veterans — Navigator
// Fabricated statewide/county analytics for the ODVS Stakeholder dashboard.
// All numbers here are illustrative demo data, not real ODVS metrics — see
// dashboard.js's visible "Sample data for demonstration purposes" caption.

export const KPI_STATS = [
  { label: 'Total Sessions', value: '4,812', icon: 'chart-line' },
  { label: 'Active Referrals', value: '1,203', icon: 'arrow-right' },
  { label: 'Avg. Resolution Time', value: '6.4 days', icon: 'clock' },
  { label: 'Statewide CVSO Utilization', value: '78%', icon: 'gauge' },
];

// County names cross-checked against county-data.js's OHIO_COUNTIES.
export const COUNTY_ENGAGEMENT = [
  { county: 'Franklin', sessions: 612 },
  { county: 'Cuyahoga', sessions: 588 },
  { county: 'Hamilton', sessions: 471 },
  { county: 'Montgomery', sessions: 349 },
  { county: 'Summit', sessions: 312 },
  { county: 'Lucas', sessions: 267 },
  { county: 'Stark', sessions: 214 },
  { county: 'Butler', sessions: 198 },
  { county: 'Lorain', sessions: 176 },
  { county: 'Mahoning', sessions: 154 },
];

export const COHORT_BREAKDOWN = [
  { label: 'Job Seeker', percent: 38 },
  { label: 'Healthcare Seeker', percent: 27 },
  { label: 'Disability Claim Reporter', percent: 24 },
  { label: 'Supporting a Veteran', percent: 11 },
];

export const ENGAGEMENT_TREND = [
  { month: 'Apr', sessions: 620 },
  { month: 'May', sessions: 705 },
  { month: 'Jun', sessions: 748 },
  { month: 'Jul', sessions: 812 },
  { month: 'Aug', sessions: 865 },
  { month: 'Sep', sessions: 902 },
];
