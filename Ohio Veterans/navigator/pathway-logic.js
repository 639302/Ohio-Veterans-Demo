// Ohio Veterans — Navigator
// Pure rules-table function mapping intake answers -> the 6 Pathway
// Result cards. Stands in for the RFP's real Matching/Recommendation
// engine (pillar 4) at demo fidelity — auditable, hardcoded branches,
// not real ranking/eligibility/proximity logic.

import { getCvsoInfo } from './county-data.js';
import { getSkillbridgeListings } from './skillbridge-data.js';
import { getEmployerListings, registerIndustryBuckets } from './employer-data.js';
import { getJobListings } from './job-listings-data.js';
import { INDUSTRY_BUCKETS } from './questions.js';

const JOB_SEARCH_URL = 'https://jobs.ohiomeansjobs.applygovt.com/Search.aspx?pg=1&sid=68&rad=20&rad_units=miles';

function buildJobSearchLink() {
  return { label: 'Search more jobs at OhioMeansJobs', href: JOB_SEARCH_URL };
}

registerIndustryBuckets(INDUSTRY_BUCKETS);

const MOS_TRANSLATION_BY_BRANCH = {
  army: 'Army training and Military Occupational Specialty experience translate directly into skills employers value — leadership under pressure, logistics, equipment maintenance, and systems operation. Many Army roles map closely to civilian careers in operations, logistics, and technical trades.',
  navy: 'Navy rating experience builds deep technical and systems expertise — from nuclear and mechanical systems to logistics and IT — that transfers well into civilian engineering, maintenance, and technical operations roles.',
  'air-force': 'Air Force Specialty Codes often align closely with civilian aviation, IT, logistics, and engineering roles. Technical training and certifications earned in service frequently carry over directly into civilian licensing requirements.',
  'marine-corps': 'Marine Corps Military Occupational Specialty training emphasizes discipline, small-unit leadership, and adaptability — qualities that translate into supervisory, security, logistics, and operations roles across nearly every civilian industry.',
  'coast-guard': 'Coast Guard experience in maritime operations, law enforcement, and technical systems maintenance translates well into civilian roles in logistics, public safety, and skilled trades.',
  'space-force': 'Space Force technical training in cyber, intelligence, and space systems operations aligns closely with fast-growing civilian technology and aerospace careers.',
  'national-guard': 'National Guard training, whether combat-arms or support-role, builds transferable skills in logistics, leadership, and technical trades that Ohio employers actively recruit for.',
  reserve: 'Reserve component training and civilian-world experience combine well — many Reserve members already have a head start translating military skills into a civilian career track.',
  'not-sure': "Whatever your background, your service built transferable skills in leadership, discipline, and problem-solving. Your County Veterans Service Office can help translate your specific experience into civilian career language.",
};

function buildMosTranslation(branch) {
  return MOS_TRANSLATION_BY_BRANCH[branch] || MOS_TRANSLATION_BY_BRANCH['not-sure'];
}

function buildCvsoCard(answers, { includeReferenceNumber = false } = {}) {
  const info = getCvsoInfo(answers.county);
  const card = {
    key: 'cvso',
    title: 'County Veterans Service Office Match',
    icon: 'map-pin',
    officeName: info.officeName,
    phone: info.phone,
    address: info.address,
    email: info.email,
    website: info.website,
  };
  if (includeReferenceNumber) {
    card.referenceNumber = buildReferenceNumber(answers);
  }
  return card;
}

// Employment is the only pathway content left on the Pathway Result screen,
// so it's no longer gated on whether "Employment and Training" was picked at
// Q5 — it always builds from branch/status/industry/county. Benefits, GI
// Bill, Mental Health, Housing, and Family moved to static-content.js and
// are shown unconditionally on the homepage instead.
function buildEmploymentCard(answers) {
  const mos = buildMosTranslationCard(answers);
  const skillbridgeCard = buildSkillbridgeCard(answers);
  const jobListingsCard = buildJobListingsCard(answers);
  const employersCard = buildEmployersCard(answers);

  return {
    key: 'employment',
    title: 'Employment',
    icon: 'briefcase',
    mosTranslation: mos.body,
    skillbridge: skillbridgeCard ? skillbridgeCard.listings : null,
    jobListings: jobListingsCard ? jobListingsCard.listings : null,
    jobSearchLink: buildJobSearchLink(),
    employers: employersCard ? employersCard.employers : null,
  };
}

// Same underlying data as buildEmploymentCard above, split into one card per
// section — used by the job-seeker scenario's "Employment" tab (see
// buildJobFocusTabs), where each section gets its own card instead of being
// stacked inside one big Employment card.
function buildMosTranslationCard(answers) {
  return {
    key: 'mos-translation',
    title: 'Military Occupational Specialty to Civilian Translation',
    body: buildMosTranslation(answers.branch),
    learnMoreLink: {
      before: 'To learn more about military skills translation, you can visit ',
      linkLabel: 'this website',
      linkHref: 'https://jobseeker.ohiomeansjobs.applygovt.com/ExploreIt/mst.aspx?_gl=1*5s862s*_gcl_au*MTgzNjg0MTQ3MS4xNzg2NDU5NzYx',
      after: '.',
    },
  };
}

function buildSkillbridgeCard(answers) {
  if (answers.status !== 'currently-serving') return null;
  const listings = getSkillbridgeListings({ industries: answers.industries });
  if (!listings.length) return null;
  return {
    key: 'skillbridge',
    title: 'SkillBridge Opportunities',
    body: 'The DoW SkillBridge program is an opportunity for service members to gain valuable civilian work experience through specific industry training, apprenticeships, or internships during the last 180 days of service. DoW SkillBridge connects transitioning service members with industry providers in real-world job experiences.',
    listings,
  };
}

function buildJobListingsCard(answers) {
  const listings = getJobListings({ county: answers.county, industries: answers.industries, limit: 6 });
  if (!listings.length) return null;
  return {
    key: 'job-listings',
    title: 'Open Job Listings',
    listings,
    jobSearchLink: buildJobSearchLink(),
  };
}

function buildEmployersCard(answers) {
  const employers = getEmployerListings({ county: answers.county, industries: answers.industries, limit: 5 });
  if (!employers.length) return null;
  return { key: 'employers', title: 'Military-Friendly Employers Near You', employers };
}

// Job-seeker scenario only: one tab per job-focus option selected at the
// "job-focus" question, fixed in question-declaration order. "Finding a job"
// maps to the existing Employment content, now split into one card per
// section (see builders above). Resume Builder / Interview Help have no
// content yet — they render an empty-cards placeholder until that content is
// built out.
const JOB_FOCUS_TABS = [
  { value: 'find-jobs', key: 'employment', label: 'Employment' },
  { value: 'resume-builder', key: 'resume-builder', label: 'Resume Builder' },
  { value: 'interview-help', key: 'interview-help', label: 'Interview Help' },
];

function buildJobFocusTabs(answers) {
  const selected = answers['job-focus'] || [];
  return JOB_FOCUS_TABS.filter((tab) => selected.includes(tab.value)).map((tab) => {
    if (tab.value === 'find-jobs') {
      const cards = [
        buildMosTranslationCard(answers),
        buildSkillbridgeCard(answers),
        buildJobListingsCard(answers),
        buildEmployersCard(answers),
      ].filter(Boolean);
      return { key: tab.key, label: tab.label, cards };
    }
    return { key: tab.key, label: tab.label, cards: [] };
  });
}

const URGENCY_COPY = {
  'right-away': "We know this is urgent. We're prioritizing a quick connection for you.",
  'next-few-weeks': "We'll make sure you're connected within the next few weeks.",
  researching: "Take your time — everything here will be ready when you're ready.",
};

const CONTACT_COPY = {
  phone: (info) => `We'll have your County Veterans Service Office call you${info ? ` at ${info}` : ''}.`,
  text: (info) => `We'll send next steps by text${info ? ` to ${info}` : ''}.`,
  email: (info) => `We'll send next steps by email${info ? ` to ${info}` : ''}.`,
  'in-person': () => "We'll set up a time for you to visit your County Veterans Service Office in person.",
};

function buildNextStepsCard(answers) {
  const refNumber = buildReferenceNumber(answers);
  const contactCopy = CONTACT_COPY[answers.contact] || CONTACT_COPY.phone;
  return {
    key: 'next-steps',
    title: 'Next Steps',
    icon: 'arrow-right',
    urgencyNote: URGENCY_COPY[answers.urgency] || URGENCY_COPY.researching,
    contactNote: contactCopy(answers['contact-info']),
    referenceNumber: refNumber,
  };
}

// Deterministic, demo-only fabricated reference number (not a real
// case/ticket ID) — purely so the Next Steps card has something to point to.
function buildReferenceNumber(answers) {
  const seed = [answers.branch, answers.status, answers.county, answers.urgency]
    .filter(Boolean)
    .join('-');
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 900000;
  }
  return `NAV-${String(hash + 100000).slice(0, 6)}`;
}

// Returns { persistent, employment, jobFocusTabs }:
//   persistent    - cards always shown above the Employment section
//                   (County Veterans Service Office Match, Next Steps). For
//                   the job-seeker scenario, Next Steps is dropped and its
//                   reference number is folded into the CVSO card instead.
//   employment    - the flat, single Employment card (MOS translation,
//                   SkillBridge, job listings, employers all stacked in one
//                   card), built for every scenario except job-seeker, which
//                   uses jobFocusTabs instead.
//   jobFocusTabs  - job-seeker scenario only: one tab per job-focus option
//                   selected, each with its own array of cards (see
//                   buildJobFocusTabs above). Empty array for every other
//                   scenario. Benefits, GI Bill, Mental Health, Housing, and
//                   Family moved to static-content.js and are shown
//                   unconditionally on the homepage instead.
const APPLICATION_STATUS_CONTENT = {
  'healthcare-seeker': {
    'not-started': {
      body: ["You haven't started a VA health care application yet. When you're ready, your County Veterans Service Office can help guide you through the process."],
    },
    'not-eligible': {
      body: ["Based on your answers, it doesn't look like you're currently eligible for VA health care benefits. Your County Veterans Service Office can help you explore other options or double-check your eligibility."],
    },
    submitted: {
      body: ["Your application has been submitted. It typically takes about a week to process, and you'll receive a decision letter by mail once a decision has been made."],
    },
    pending: {
      body: [
        'Your application status is Pending.',
        {
          before: 'You can check back here for any updates, or visit ',
          linkLabel: 'va.gov',
          linkHref: 'https://www.va.gov/health-care/apply-for-health-care-form-10-10ez/introduction',
          after: '.',
        },
      ],
    },
  },
  'disability-claim-reporter': {
    'not-started': {
      body: ["You haven't started a disability claim yet. When you're ready, your County Veterans Service Office can help guide you through the process."],
    },
    submitted: {
      body: [
        'Your disability claim has been submitted. VA disability claims typically take several months to process, and you\'ll receive a decision letter by mail once a decision has been made.',
        {
          before: 'You can check your claim status any time at ',
          linkLabel: 'va.gov',
          linkHref: 'https://www.va.gov/disability/how-to-file-claim/',
          after: '.',
        },
      ],
    },
  },
};

function buildApplicationStatusCard(answers) {
  const scenarioContent = APPLICATION_STATUS_CONTENT[answers.scenario] || APPLICATION_STATUS_CONTENT['healthcare-seeker'];
  const status = scenarioContent[answers.applicationStatus] || scenarioContent['not-started'];
  return {
    key: 'application-status',
    title: 'Application Status',
    icon: 'clipboard-text',
    body: status.body,
  };
}

export function buildPathway(answers) {
  const isJobSeeker = answers.scenario === 'job-seeker';
  const isHealthcareSeeker = answers.scenario === 'healthcare-seeker';
  const isDisabilityClaimReporter = answers.scenario === 'disability-claim-reporter';
  const usesApplicationStatus = isHealthcareSeeker || isDisabilityClaimReporter;
  const persistent = isJobSeeker
    ? [buildCvsoCard(answers, { includeReferenceNumber: true })].filter(Boolean)
    : usesApplicationStatus
      ? [buildCvsoCard(answers), buildApplicationStatusCard(answers)].filter(Boolean)
      : [buildCvsoCard(answers), buildNextStepsCard(answers)].filter(Boolean);
  const jobFocusTabs = isJobSeeker ? buildJobFocusTabs(answers) : [];
  const employment = (isJobSeeker || usesApplicationStatus) ? null : buildEmploymentCard(answers);
  return { persistent, employment, jobFocusTabs };
}
