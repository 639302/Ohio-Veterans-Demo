// Ohio Veterans — Navigator
// Guided-persona scenarios: quick shortcuts that seed a Q5 goal and drop the
// veteran straight into the chat intake, still fully editable at every
// question. Currently launched from the account menu (nav.js); a future
// landing-page card grid can reuse this same list.

export const SCENARIOS = [
  {
    value: 'job-seeker',
    goal: 'employment',
    label: 'Job Seeker',
    description: 'Get matched with military-friendly employers, SkillBridge programs, and job listings near you.',
    icon: 'briefcase',
    promptText: 'I need help finding a job',
  },
  {
    value: 'healthcare-seeker',
    goal: 'healthcare',
    label: 'Healthcare Seeker',
    description: 'Find out how to enroll in VA health care and locate care near you.',
    icon: 'stethoscope',
    promptText: 'I need help getting healthcare',
  },
  {
    value: 'disability-claim-reporter',
    goal: 'benefits',
    label: 'Disability Claim Reporter',
    description: 'Get help filing, tracking, or appealing a VA disability claim.',
    icon: 'file-text',
    promptText: 'I need help submitting a disability claim',
  },
];
