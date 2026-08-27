// Ohio Veterans — Navigator
// Flow data for the Interview Help tab's embedded chat widget (see
// flow-chat.js). "Yes" asks for job details in free text, then routes to a
// canned set of tailored interview questions + tips based on a keyword match
// against questions.js's existing INDUSTRY_BUCKETS (reused, not duplicated,
// as the matching taxonomy) — a stand-in for a real AI-generated response,
// since this prototype has no backend/LLM. After the questions + tips, the
// veteran can opt into a practice round that walks through the same
// questions one at a time and offers canned coaching feedback after each
// answer (the feedback cycles through the same "make sure to mention"
// points already shown — there's no real answer evaluation, consistent with
// this project's "canned copy, explicitly flagged" approach elsewhere).
// "No" (no upcoming interview) goes straight to general interview best
// practices, with no practice round (there's no discrete question list to
// practice against).

import { INDUSTRY_BUCKETS } from './questions.js';

const TIPS_NODE_PREFIX = 'tips-';

// Picks the first industry bucket whose keywords appear in the free-text
// job-details answer, falling back to a generic tips node when nothing
// matches (or the answer is empty/unrecognizable).
function matchJobCategory(text) {
  const lower = (text || '').toLowerCase();
  const bucket = INDUSTRY_BUCKETS.find((candidate) => candidate.keywords.some((keyword) => lower.includes(keyword)));
  return `${TIPS_NODE_PREFIX}${bucket ? bucket.value : 'general'}`;
}

// One entry per industry bucket (plus 'general', the unmatched fallback),
// keyed to match INDUSTRY_BUCKETS' `value`s so matchJobCategory's result
// always resolves to a real node.
const BUCKET_CONTENT = {
  'skilled-trades': {
    intro: "Here's what to expect for a skilled trades or construction interview, and what to make sure you mention:",
    questions: [
      'Walk me through your hands-on experience with the relevant tools or systems.',
      'How do you approach safety on a job site?',
      'Tell me about a time you had to troubleshoot an equipment or process problem under pressure.',
      'How do you handle physically demanding work or long, variable hours?',
      'Are you comfortable working in a crew and taking direction from a foreman or supervisor?',
    ],
    mentions: [
      'Any licenses, certifications, or safety training you hold (OSHA 10/30, equipment certs).',
      'Military maintenance, logistics, or engineering experience — the hands-on skills usually transfer directly.',
      'Specific tools, machinery, or systems you’re proficient with.',
    ],
  },
  'manufacturing-logistics': {
    intro: "Here's what to expect for a manufacturing or logistics interview, and what to make sure you mention:",
    questions: [
      'Describe your experience with inventory, scheduling, or supply chain systems.',
      'How do you stay accurate and efficient on repetitive or high-volume tasks?',
      'Tell me about a time you identified a bottleneck or inefficiency and fixed it.',
      'How comfortable are you operating machinery or working in a warehouse environment?',
      'How do you handle shift work or tight deadlines?',
    ],
    mentions: [
      'Military logistics, supply, or transportation experience — it maps closely to civilian operations roles.',
      'Any forklift, CDL, or equipment certifications.',
      'Your attention to detail and reliability under a heavy workload.',
    ],
  },
  healthcare: {
    intro: "Here's what to expect for a healthcare interview, and what to make sure you mention:",
    questions: [
      'Walk me through your clinical or patient-care experience.',
      'How do you stay calm and effective in high-stress or emergency situations?',
      'Tell me about a time you had to communicate difficult information to a patient or team member.',
      'How do you approach safety protocols or documentation?',
      'How do you handle long shifts or a heavy patient load?',
    ],
    mentions: [
      'Medical certifications or training (EMT, combat medic/corpsman, CNA, etc.) and how they translate to civilian credentials.',
      'Experience working under pressure — military medical experience is often more intense than civilian equivalents.',
      'How you’ve worked as part of a care team with doctors, nurses, and other staff.',
    ],
  },
  'technology-it': {
    intro: "Here's what to expect for a technology or IT interview, and what to make sure you mention:",
    questions: [
      'Walk me through your experience with the systems, languages, or platforms in the job posting.',
      'Tell me about a technical problem you diagnosed and solved.',
      'How do you approach learning a new tool or system quickly?',
      'How do you document your work or explain technical issues to non-technical people?',
      'How do you handle competing priorities or tight deadlines on a project?',
    ],
    mentions: [
      'Any IT, cyber, or systems responsibilities from your service — even informal troubleshooting counts.',
      'Relevant certifications (Security+, Network+, CompTIA, vendor certs).',
      'A specific project or system you supported end-to-end.',
    ],
  },
  'government-security': {
    intro:
      "Here's what to expect for a government, security, or public safety interview, and what to make sure you mention:",
    questions: [
      'Walk me through your experience with security protocols, compliance, or clearance-related work.',
      'Tell me about a time you had to make a quick decision under pressure.',
      'How do you handle working within strict rules, chains of command, or regulations?',
      'Describe your experience with report writing or documentation.',
      'How do you approach de-escalating a tense situation?',
    ],
    mentions: [
      'Any active security clearance — it’s often a major asset for these roles.',
      'Direct security, law enforcement, or public safety experience from your service.',
      'Your discipline, reliability, and ability to follow — and enforce — procedures.',
    ],
  },
  'business-finance-legal': {
    intro: "Here's what to expect for a business, finance, or legal interview, and what to make sure you mention:",
    questions: [
      'Walk me through your experience with budgeting, reporting, or financial systems.',
      'Tell me about a time you managed a project or resources under a deadline.',
      'How do you approach analyzing data to make a recommendation?',
      'Describe your experience working with contracts, compliance, or regulations.',
      'How do you communicate complex information to non-experts?',
    ],
    mentions: [
      'Any budget, logistics, or administrative responsibility from your service — the scale is often bigger than people expect.',
      'Relevant certifications (PMP, Six Sigma, finance/accounting credentials).',
      'Concrete results you can quantify (dollars managed, people led, time saved).',
    ],
  },
  'education-nonprofit': {
    intro: "Here's what to expect for an education or nonprofit interview, and what to make sure you mention:",
    questions: [
      'Walk me through your experience training, mentoring, or teaching others.',
      'Tell me about a time you had to explain something complex in a simple way.',
      'How do you approach working with people from different backgrounds?',
      'Describe a program or initiative you helped run or improve.',
      'How do you measure whether your teaching or program is effective?',
    ],
    mentions: [
      'Any instructor, training, or mentorship roles from your service.',
      'Experience developing curriculum, SOPs, or training materials.',
      'Your patience, communication style, and ability to motivate others.',
    ],
  },
  'energy-engineering-aerospace': {
    intro: "Here's what to expect for an energy, engineering, or aerospace interview, and what to make sure you mention:",
    questions: [
      'Walk me through your technical background with the systems or equipment relevant to this role.',
      'Tell me about a time you diagnosed a complex mechanical or technical failure.',
      'How do you approach safety in high-risk environments?',
      'Describe your experience working with blueprints, schematics, or technical specs.',
      'How do you handle being on call or working in remote or field locations?',
    ],
    mentions: [
      'Aviation, engineering, nuclear, or mechanical experience from your service — it’s often a very close match.',
      'Technical certifications or clearances relevant to the role.',
      'The specific equipment or systems you’ve worked on.',
    ],
  },
  'retail-hospitality-food': {
    intro: "Here's what to expect for a retail, hospitality, or food service interview, and what to make sure you mention:",
    questions: [
      'Tell me about a time you handled a difficult customer.',
      'How do you stay organized during a busy shift?',
      'Describe your experience working as part of a team to hit a goal or deadline.',
      'How do you handle long shifts on your feet or working nights and weekends?',
      'What does great customer service mean to you?',
    ],
    mentions: [
      'Any experience leading or coordinating a team, even informally.',
      'Your adaptability and ability to stay calm under pressure — both transfer directly from service.',
      'Scheduling, inventory, or point-of-sale systems experience, if you have it.',
    ],
  },
  general: {
    intro: 'Here are some questions to prepare for, and things to make sure you mention:',
    questions: [
      'Walk me through your relevant experience for this role.',
      'Tell me about a challenge you faced at work or during your service and how you handled it.',
      'How do you prioritize when you have multiple tasks or deadlines?',
      'Why are you interested in this particular role or organization?',
      'How would your teammates or supervisors describe you?',
    ],
    mentions: [
      'How your military experience translates into the language of this role — focus on transferable skills like leadership, problem-solving, and reliability.',
      'Something specific you learned about the company or organization beforehand.',
      'One or two concrete examples, using the STAR method (Situation, Task, Action, Result).',
    ],
  },
};

// Canned coaching line shown after each practice answer — cycles through the
// bucket's "make sure to mention" points rather than evaluating what the
// veteran actually typed (no real backend/LLM to grade the answer against).
function feedbackFor(mentions, index) {
  const mention = mentions[index % mentions.length];
  return `Thanks for sharing! A strong answer here often highlights: ${mention} Keep that in mind as you refine your response.`;
}

// Builds the tips node (questions + mentions + "want to practice?") and its
// practice-round chain for one bucket. Node ids are namespaced by `key` so
// every bucket's chain coexists in the same flat `nodes` map.
function buildTipsAndPractice(key, { intro, questions, mentions }) {
  const nodes = {};

  nodes[`${TIPS_NODE_PREFIX}${key}`] = {
    prompt: [
      intro,
      '',
      'Questions you might be asked:',
      ...questions.map((q) => `• ${q}`),
      '',
      'Make sure to mention:',
      ...mentions.map((m) => `• ${m}`),
      '',
      'Would you like to practice an interview?',
    ].join('\n'),
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes', next: `practice-${key}-0` },
      { value: 'no', label: 'No' },
    ],
  };

  questions.forEach((question, index) => {
    const isFirst = index === 0;
    const isLast = index === questions.length - 1;
    const prompt = isFirst
      ? `Great — let's do a quick practice round. Here's your first question:\n\n${question}`
      : `${feedbackFor(mentions, index - 1)}\n\n${isLast ? 'Last question:' : 'Next question:'}\n${question}`;

    nodes[`practice-${key}-${index}`] = {
      prompt,
      type: 'text',
      next: isLast ? `practice-${key}-wrap` : `practice-${key}-${index + 1}`,
    };
  });

  nodes[`practice-${key}-wrap`] = {
    prompt: `${feedbackFor(mentions, questions.length - 1)}\n\nThat wraps up this practice round — nice work! Keep practicing out loud, and remember to breathe and take a moment before answering if you need to.`,
    type: 'single',
    options: [{ value: 'thanks', label: 'Thanks!' }],
  };

  return nodes;
}

const TIPS_AND_PRACTICE_NODES = Object.entries(BUCKET_CONTENT).reduce(
  (acc, [key, content]) => ({ ...acc, ...buildTipsAndPractice(key, content) }),
  {},
);

export const INTERVIEW_HELP_FLOW = {
  id: 'interview-help',
  start: 'has-interview',
  nodes: {
    'has-interview': {
      prompt: 'Do you have an upcoming interview you want help preparing for?',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'job-details' },
        { value: 'no', label: 'No', next: 'general-tips' },
      ],
    },
    'job-details': {
      prompt:
        "Tell me as much as you can about the job — the role, industry or field, key responsibilities, and anything else that stands out.",
      type: 'text',
      next: matchJobCategory,
    },

    ...TIPS_AND_PRACTICE_NODES,

    'general-tips': {
      prompt: [
        'Here are some general interview best practices to keep in mind:',
        '',
        '• Research the company or organization ahead of time — know what they do and why you want to work there.',
        '• Use the STAR method (Situation, Task, Action, Result) to answer behavioral questions with real examples.',
        '• Translate your military experience into civilian terms — focus on the skills and results, not just job titles or acronyms.',
        '• Prepare 2-3 questions to ask the interviewer — it shows genuine interest.',
        '• Dress appropriately for the role and arrive (or log in) a few minutes early.',
        '• Send a short thank-you note or email within a day of the interview.',
      ].join('\n'),
      type: 'single',
      options: [{ value: 'thanks', label: 'Thanks!' }],
    },
  },
  closingMessage: 'Good luck with your interview!',
};
