// Ohio Veterans — Navigator
// Static content for the 5 topics that aren't personalized by intake
// answers — Benefits & Claims, GI Bill Eligibility, Mental Health, Housing,
// and Family & Caregiver Support. Rendered directly on the homepage so
// they're accessible without completing the questionnaire. Employment is
// the only topic that stays gated by intake answers — see pathway-logic.js.

export function buildBenefitsCard() {
  return {
    key: 'benefits',
    title: 'Benefits & Claims',
    icon: 'file-text',
    body: 'Your County Veterans Service Office can help you file, track, and appeal VA disability and other benefit claims at no cost — no paperwork fees, no middleman.',
    links: [
      { label: 'Confirm eligibility', href: 'https://www.va.gov/disability/eligibility/' },
      { label: 'File for a disability claim online', href: 'https://www.va.gov/disability/file-disability-claim-form-21-526ez/introduction' },
      { label: 'Check your claim status', href: 'https://www.va.gov/claim-or-appeal-status/' },
      { label: 'Survivor benefits', href: 'https://www.va.gov/family-and-caregiver-benefits/survivor-compensation/dependency-indemnity-compensation/' },
    ],
  };
}

export function buildEmploymentTopicCard() {
  return {
    key: 'employment-topic',
    title: 'Employment',
    icon: 'briefcase',
    body: {
      before: 'There are a variety of ways that Ohio is ready to help Veterans ',
      linkLabel: 'translate their military experience',
      linkHref: 'https://jobseeker.ohiomeansjobs.applygovt.com/ExploreIt/mst.aspx',
      after: ' into civilian careers.',
    },
    links: [
      { label: 'OhioMeansJobs', href: 'https://ohiomeansjobs.ohio.gov/home' },
      { label: 'Find Your Ohio — Military & Veterans', href: 'https://www.findyourohio.com/military-veterans/' },
      { label: 'Build your career after military service', href: 'https://ohiomeansjobs.ohio.gov/job-seekers/build-your-career/military-service' },
    ],
  };
}

export function buildGiBillCard() {
  return {
    key: 'gi-bill',
    title: 'GI Bill Eligibility',
    icon: 'graduation-cap',
    body: [
      "The Ohio GI Promise seeks to make Ohio the most veteran-friendly state in the country for higher education. To encourage veterans from across the country to bring their families, leadership, motivation, and maturity to Ohio's colleges and universities, the State of Ohio's executive order creating the Ohio GI Promise outlines criteria that lets qualified veterans and their dependents, from anywhere in the country, skip the standard 12-month residency requirement and attend Ohio's public colleges and universities at in-state tuition rates.",
    ],
    cta: {
      before: 'Your County Veterans Service Office can help confirm whether you or your family qualify and walk you through applying. Learn more about the ',
      linkLabel: 'Ohio GI Promise',
      linkHref: 'https://highered.ohio.gov/initiatives/campus-initiatives/education-for-veterans/ohio-gi-promise',
      after: ' and some frequently asked questions.',
    },
  };
}

export function buildMentalHealthCard() {
  return {
    key: 'mental-health',
    title: 'Mental Health Support',
    icon: 'heart',
    variant: 'crisis',
    headline: 'You are not alone — help is available right now.',
    body: {
      before: 'The Veterans Crisis Line is free, confidential, and available 24/7. Call 988 then press 1, text 838255 or start a ',
      linkLabel: 'live chat',
      linkHref: 'https://www.veteranscrisisline.net/get-help-now/chat/',
      after: ' today.',
    },
    communityCare: {
      before: "If you'd like to see a counselor, but don't want to go to the VA, we can help you find a ",
      linkLabel: 'community based behavioral counselor',
      linkHref: 'https://starproviders.org/find-support/',
      after: ' with training in military culture.',
    },
    selfCheck: {
      before: 'The Department of Veterans Affairs and the National Suicide Prevention Lifeline have joined with the American Foundation for Suicide Prevention to create the ',
      linkLabel: 'Veterans Self-Check Quiz',
      linkHref: 'https://www.vetselfcheck.org/welcome.cfm',
      after: '. This is a safe, easy way to learn whether stress and depression might be affecting you.',
    },
    selfCheckNote: 'Using this service is completely voluntary and confidential.',
  };
}

export function buildVeteranSupportCard() {
  return {
    key: 'veteran-support',
    title: 'Veteran Crisis Support',
    icon: 'hand-heart',
    headline: 'Preventing Veteran suicide starts with a conversation.',
    body: "If a Veteran you care about is struggling, you have an opportunity to help. Let them know the Veterans Crisis Line is available — trained responders are ready to listen, and you can even offer to stay on a confidential three-way call for as long as they'd like support.",
    warningSigns: {
      intro: 'These signs may indicate a Veteran needs help. Contact the Veterans Crisis Line now: Dial 988 then Press 1.',
      items: [
        "Appearing sad, hopeless, or like there's no reason to live",
        'Anxiety, agitation, sleeplessness, or mood swings',
        'Excessive guilt, shame, or sense of failure',
        'Rage, anger, or violent behavior (like punching a wall or getting into fights)',
        'Increasing alcohol or drug misuse, or engaging in risky activities without thinking',
        'Withdrawing from family and friends, losing interest in hobbies/work/school, or neglecting personal appearance',
        'Giving away prized possessions or getting affairs in order',
      ],
    },
    crisisSigns: {
      intro: 'These signs require immediate attention. Call 911 for medical emergencies. For a suicide crisis, contact the Veterans Crisis Line: Dial 988 then Press 1.',
      items: [
        'Talking about or threatening to hurt or kill themselves',
        'Looking for ways to end their life, such as searching online or seeking access to firearms or pills',
        'Talking about death, dying, or suicide — even if it seems vague, joking, or offhand',
        'Engaging in self-destructive behavior, like drug or alcohol abuse or misusing weapons',
      ],
    },
  };
}

export function buildHousingCard() {
  return {
    key: 'housing',
    title: 'Housing Support',
    icon: 'house',
    base: {
      body: 'If you are facing housing instability, help is available. The National Call Center for Homeless Veterans (877-424-3838) connects you with VA and community resources, including the Health Care for Homeless Veterans program.',
      eligibilityCta: {
        before: 'Determine your eligibility and apply for free to one of the ',
        linkLabel: 'Ohio Veterans Homes',
        linkHref: 'https://dvs.ohio.gov/veterans-homes/determining-eligibility',
        after: '.',
      },
      links: [
        { label: 'VA homeless resources', href: 'https://www.va.gov/homeless/' },
        { label: 'National Coalition for Homeless Veterans', href: 'https://nchv.org/' },
      ],
    },
    ovh: {
      body: 'If you or your veteran family member may need long-term nursing or assisted-living care, Ohio operates two state veterans homes that may be worth exploring.',
      facilities: [
        { name: 'Ohio Veterans Home – Sandusky', established: 1888, note: 'Long-term nursing, memory care, and domiciliary care.' },
        { name: 'Ohio Veterans Home – Georgetown', established: 2003, note: 'Skilled nursing care.' },
      ],
      contact: '(888) 387-6446 · ohiovet@dvs.ohio.gov',
      detailsHref: 'https://dvs.ohio.gov/',
    },
    homeLoanCard: {
      key: 'housing-home-loans',
      title: 'Home Loan Support',
      icon: 'bank',
      sections: [
        {
          subhead: 'Federal Home Loan Programs',
          paragraphs: [
            {
              before: 'Eligible vets receive ',
              linkLabel: 'guaranteed loans',
              linkHref: 'https://www.benefits.va.gov/homeloans/',
              after: ' to purchase, repair, or refinance a home.',
            },
            {
              before: 'Housing for Wounded, Injured, and Ill and Surviving Spouses is available. ',
              linkLabel: 'Learn more and apply today',
              linkHref: 'https://www.usace.army.mil/Missions/Real-Estate/HAP/How-to-Apply/',
              after: '',
            },
          ],
        },
        {
          subhead: 'Ohio Home Loan Programs',
          paragraphs: [
            "The Ohio Housing Finance Agency offers all benefits of their first time home buyer program to Ohio's heroes at an interest rate approximately 1/4% lower than the going interest rate.",
          ],
          links: [
            { label: 'Learn about eligibility', href: 'https://dam.assets.ohio.gov/image/upload/v1780516560/dvs.ohio.gov/benefits/ohio-heroes-fillable.pdf' },
            { label: 'Learn more about the program', href: 'https://dam.assets.ohio.gov/image/upload/v1780584772/dvs.ohio.gov/benefits/homebuyerguide.pdf' },
          ],
        },
      ],
    },
  };
}

export function buildFamilyCard() {
  return {
    key: 'family',
    title: 'Caregiver Support',
    icon: 'users',
    body: 'Family members and caregivers can also get help through your County Veterans Service Office, including caregiver support resources and benefits information for dependents.',
    links: [
      { label: 'VA Caregiver Support Program', href: 'https://www.caregiver.va.gov/' },
      { label: 'Central Ohio Caregiver Support', href: 'https://www.va.gov/central-ohio-health-care/health-services/caregiver-support/' },
      { label: 'Chillicothe Caregiver Support', href: 'https://www.va.gov/chillicothe-health-care/health-services/caregiver-support/' },
      { label: 'Cincinnati Caregiver Support', href: 'https://www.va.gov/cincinnati-health-care/health-services/caregiver-support/' },
      { label: 'Dayton Caregiver Support', href: 'https://www.va.gov/dayton-health-care/health-services/caregiver-support/' },
      { label: 'NorthEast Ohio Caregiver Support', href: 'https://www.va.gov/northeast-ohio-health-care/health-services/caregiver-support/' },
    ],
  };
}
