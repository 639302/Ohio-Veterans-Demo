import './session-reset.js?v=1';
import '@mms/design-system/components/mms-button';
import '@mms/design-system/components/mms-header';
import '@mms/design-system/components/mms-icon';
import '../../node_modules/@mms/design-system/dist/components/card/mms-card.component.js';
import '../../node_modules/@mms/design-system/dist/components/link/mms-link.component.js';
import '../../node_modules/@mms/design-system/dist/components/inline-alert/mms-inline-alert.component.js';
import '@mms/design-system/components/mms-modal';
import '@mms/design-system/components/mms-text-field';
import '../../node_modules/@mms/design-system/dist/components/checkbox/mms-checkbox.component.js';
import '../../node_modules/@mms/design-system/dist/components/checkbox-group/mms-checkbox-group.component.js';
import '../../node_modules/@mms/design-system/dist/components/radio/mms-radio.component.js';
import '../../node_modules/@mms/design-system/dist/components/radio-group/mms-radio-group.component.js';
import '../../node_modules/@mms/design-system/dist/components/select/mms-select.component.js';

const pages = {
  'resources.html': {
    title: 'Resources for Veterans',
    description: 'Find Ohio and federal programs that can help with benefits, employment, education, health, housing, and other needs.',
    sections: [
      {
        title: 'Jobs & Education',
        body: 'Explore employment services, career tools, education benefits, and training programs for veterans and service members.',
        links: [['Explore jobs and education', 'jobs-education.html']],
      },
      {
        title: 'Benefits Resource Guide',
        body: 'Learn about common state and federal benefits and where to get help understanding your options.',
        links: [['View the benefits resource guide', 'benefits-resource-guide.html']],
      },
      {
        title: 'Find a CVSO',
        body: 'Connect with a trained County Veterans Service Officer for free, local help with benefits and claims.',
        links: [['Find your County Veterans Service Office', 'find-a-cvso.html']],
      },
      {
        title: 'Veterans Homes',
        body: 'Learn about Ohio Veterans Homes, services offered, and general eligibility information.',
        links: [['Learn about Ohio Veterans Homes', 'veterans-homes.html']],
      },
      {
        title: 'Mental Health',
        body: 'Find confidential support and crisis resources for veterans, service members, families, and caregivers.',
        links: [['Find mental health support', 'mental-health.html']],
      },
    ],
  },
  'jobs-education.html': {
    title: 'Jobs & Education',
    description: 'Get help translating military experience, finding employment, building new skills, and using education benefits.',
    sections: [
      {
        title: 'Personalized employment results',
        body: 'The Navigator will ask a few questions about your service, work interests, and preferences to find jobs tailored to your interests, skills, and location.',
        links: [['Start with The Navigator', 'employment-assistance.html']],
      },
      {
        title: 'Employment support',
        body: 'OhioMeansJobs centers offer career counseling, job-search support, training referrals, and services for veterans.',
        links: [
          ['Visit OhioMeansJobs', 'https://ohiomeansjobs.ohio.gov/'],
          ['Ask The Navigator about employment', 'index.html#main-content'],
        ],
      },
      {
        title: 'Resume Builder',
        body: 'Build a new resume or get AI-assisted suggestions for improving an existing resume and tailoring it to a job.',
        links: [['Build my resume', 'resume-builder.html']],
      },
      {
        title: 'Interview Help',
        body: 'Practice common interview questions and get AI-assisted preparation tips based on the role that interests you.',
        links: [['Prepare for an interview', 'interview-help.html']],
      },
      {
        title: 'Education and training',
        body: 'Compare education and training options and learn how VA education benefits may help cover eligible programs.',
        links: [
          ['Explore VA education benefits', 'https://www.va.gov/education/'],
          ['Search the GI Bill Comparison Tool', 'https://www.va.gov/education/gi-bill-comparison-tool/'],
        ],
      },
      {
        title: 'Military skills and credentials',
        body: 'Use your military experience to identify civilian occupations, credentials, apprenticeships, and career pathways.',
        links: [
          ['Visit CareerOneStop for veterans', 'https://www.careeronestop.org/Veterans/'],
          ['Explore apprenticeships', 'https://www.apprenticeship.gov/career-seekers'],
        ],
      },
    ],
  },
  'resume-builder.html': {
    title: 'Resume Builder',
    description: 'Use the AI-assisted Navigator to create a resume or get suggestions for tailoring an existing resume.',
    parent: 'Jobs & Education',
    parentHref: 'jobs-education.html',
    flow: 'resume-builder',
  },
  'interview-help.html': {
    title: 'Interview Help',
    description: 'Use the AI-assisted Navigator to prepare for an interview and practice answering common questions.',
    parent: 'Jobs & Education',
    parentHref: 'jobs-education.html',
    flow: 'interview-help',
  },
  'employment-assistance.html': {
    title: 'Personalized Employment Assistance',
    description: 'Answer a few questions about your service, work interests, and location to find tailored employment opportunities.',
    parent: 'Jobs & Education',
    parentHref: 'jobs-education.html',
    jobSeeker: true,
  },
  'benefits-resource-guide.html': {
    title: 'Benefits Resource Guide',
    description: 'Start with trusted information about benefits for Ohio veterans, service members, and their families.',
    sections: [
      {
        title: 'Disability compensation',
        body: 'VA disability compensation may provide a tax-free monthly payment for an illness or injury connected to military service.',
        links: [
          ['Learn about VA disability compensation', 'https://www.va.gov/disability/'],
          ['Ask The Navigator about a disability claim', 'index.html#main-content'],
        ],
      },
      {
        title: 'Health care',
        body: 'Learn how to apply for VA health care, what documents you may need, and how eligibility is determined.',
        links: [
          ['Learn about VA health care', 'https://www.va.gov/health-care/'],
          ['Ask The Navigator about health care benefits', 'index.html#main-content'],
        ],
      },
      {
        title: 'Education benefits',
        body: 'VA education benefits can help eligible veterans, service members, and family members pay for school or training.',
        links: [['Explore VA education benefits', 'https://www.va.gov/education/']],
      },
      {
        title: 'Burials and memorials',
        body: 'Find information about burial benefits, memorial items, and Ohio veterans cemeteries.',
        links: [['Explore VA burial benefits', 'https://www.va.gov/burials-memorials/']],
      },
    ],
  },
  'find-a-cvso.html': {
    title: 'Find a CVSO',
    description: 'County Veterans Service Officers provide free, local help to veterans and their families in each of Ohio’s 88 counties.',
    sections: [
      {
        title: 'How a CVSO can help',
        body: 'A CVSO can explain benefits, help gather records, prepare and submit claims, and connect you with county, state, and federal services.',
        links: [['Ask The Navigator to find your CVSO', 'index.html#main-content']],
      },
      {
        title: 'What to bring',
        body: 'When available, bring your discharge papers, identification, relevant medical records, dependency documents, and any VA letters. Do not enter these documents or sensitive details into the prototype.',
        links: [],
      },
      {
        title: 'Find your county',
        body: 'Use Ohio’s county directory to identify the Veterans Service Office serving your area.',
        links: [['View Ohio counties', 'https://ohio.gov/government/resources/ohio-counties']],
      },
      {
        title: 'Claims assistance',
        body: 'Accredited representatives can help with VA claims and appeals. Their assistance should be provided at no charge.',
        links: [['Find an accredited VA representative', 'https://www.va.gov/get-help-from-accredited-representative/']],
      },
    ],
  },
  'veterans-homes.html': {
    title: 'Ohio Veterans Homes',
    description: 'Ohio Veterans Homes provide skilled nursing and domiciliary care for eligible veterans at locations in Sandusky and Georgetown.',
    sections: [
      {
        title: 'Sandusky Veterans Home',
        body: 'The Sandusky campus provides long-term care services in a community designed around veterans’ needs.',
        links: [['View the Sandusky location', 'https://maps.google.com/?q=Ohio+Veterans+Home+Sandusky']],
      },
      {
        title: 'Georgetown Veterans Home',
        body: 'The Georgetown campus provides skilled nursing care for eligible veterans in southwest Ohio.',
        links: [['View the Georgetown location', 'https://maps.google.com/?q=Ohio+Veterans+Home+Georgetown']],
      },
      {
        title: 'General eligibility',
        body: 'Admission depends on military service, Ohio residency, care needs, available space, and other requirements. Confirm current eligibility directly with Ohio Veterans Homes.',
        links: [['Review eligibility information', 'https://dvs.ohio.gov/veterans-homes/determining-eligibility']],
      },
      {
        title: 'Planning for care',
        body: 'A County Veterans Service Officer can help veterans and families understand available benefits and prepare for a conversation about long-term care.',
        links: [['Find a CVSO', 'find-a-cvso.html']],
      },
    ],
  },
  'mental-health.html': {
    title: 'Mental Health',
    description: 'Confidential support is available for veterans, service members, families, and caregivers. You do not have to face a crisis alone.',
    sections: [
      {
        title: 'Veterans Crisis Line',
        body: 'For immediate, confidential crisis support, call 988 and press 1, text 838255, or chat online. If there is immediate danger, call 911.',
        links: [
          ['Call 988, then press 1', 'tel:988'],
          ['Visit the Veterans Crisis Line', 'https://www.veteranscrisisline.net/'],
        ],
      },
      {
        title: 'VA mental health care',
        body: 'VA offers mental health services for concerns including PTSD, depression, anxiety, substance use, and the effects of military sexual trauma.',
        links: [['Explore VA mental health services', 'https://www.va.gov/health-care/health-needs-conditions/mental-health/']],
      },
      {
        title: 'Ohio support',
        body: 'Ohio’s 988 Suicide & Crisis Lifeline connects callers with trained specialists for mental health and addiction support.',
        links: [['Visit 988 Ohio', 'https://988.ohio.gov/']],
      },
      {
        title: 'Local assistance',
        body: 'Your County Veterans Service Office can connect you with local veteran services and help you understand available benefits.',
        links: [['Find a CVSO', 'find-a-cvso.html']],
      },
    ],
  },
};

const currentFile = window.location.pathname.split('/').pop() || 'resources.html';
const page = pages[currentFile] || pages['resources.html'];
const localHref = (href) => !href.startsWith('http') && !href.startsWith('tel:');
const renderActions = (links) => links.map(([label, href]) => `
  <mms-link slot="actions" href="${href}" label="${label}" right-icon="${localHref(href) ? 'arrow-right' : 'arrow-square-out'}"${localHref(href) ? '' : ' target="_blank"'}></mms-link>
`).join('');

document.title = `${page.title} | Ohio Department of Veterans Services`;
document.getElementById('resource-page-root').innerHTML = `
  <div class="gov-banner">
    <button type="button" class="gov-banner__toggle" id="gov-banner-toggle" aria-expanded="false" aria-controls="gov-banner-panel">
      <span>An official State of Ohio site.</span>
      <span class="gov-banner__toggle-label">Here's how you know <mms-icon name="caret-down" size="sm"></mms-icon></span>
    </button>
    <div class="gov-banner__panel" id="gov-banner-panel" hidden>
      <div class="gov-banner__item"><mms-icon name="flag" size="lg"></mms-icon><div><strong>Official websites use Ohio.gov</strong><p>An Ohio.gov website belongs to an official government organization in the State of Ohio.</p></div></div>
      <div class="gov-banner__item"><mms-icon name="lock" size="lg"></mms-icon><div><strong>Secure .gov websites use HTTPS</strong><p>A lock or https:// means you've safely connected to the .gov website. Share sensitive information only on official, secure websites.</p></div></div>
      <div class="gov-banner__item"><mms-icon name="shield-check" size="lg"></mms-icon><div><strong>Trusted applications are secured by OHID</strong><p>When you log in with OHID, your privacy, data, and personal information are protected by federal and state digital security standards.</p></div></div>
    </div>
  </div>
  <mms-header class="site-header" container="full" logo-size="xl" accent-line="brand" accent-line-color="primary" shrink-on-scroll scroll-threshold="24" home-href="/Ohio%20Veterans/navigator/" home-label="Ohio Department of Veterans Services">
    <img slot="logo" src="assets/odvs-logo-horiz.png" alt="Ohio Department of Veterans Services" class="nav-header__logo">
    <img slot="logo-compact" src="assets/odvs-logo-horiz.png" alt="Ohio Department of Veterans Services" class="nav-header__logo nav-header__logo--compact">
    <div slot="nav" class="nav-header__dropdown">
      <button type="button" class="nav-header__nav-trigger" aria-expanded="false" aria-controls="resources-menu">
        <span>Resources for Veterans</span>
        <mms-icon name="caret-down" size="sm" aria-hidden="true"></mms-icon>
      </button>
      <div class="nav-header__submenu" id="resources-menu" hidden>
        <a href="resources.html">All Resources</a>
        <a href="jobs-education.html">Jobs &amp; Education</a>
        <a href="benefits-resource-guide.html">Benefits Resource Guide</a>
        <a href="find-a-cvso.html">Find a CVSO</a>
        <a href="veterans-homes.html">Veterans Homes</a>
        <a href="mental-health.html">Mental Health</a>
      </div>
    </div>
    <button slot="nav" type="button" class="nav-header__nav-trigger nav-header__nav-trigger--static">About ODVS</button>
    <button slot="nav" type="button" class="nav-header__nav-trigger nav-header__nav-trigger--static">News &amp; Events</button>
    <mms-button slot="actions" id="nav-help-button" variant="ghost" color-scheme="onyx" left-icon="question" label="Help" aria-expanded="false" aria-controls="help-menu"></mms-button>
    <mms-button slot="actions" id="nav-search-button" variant="ghost" color-scheme="onyx" left-icon="magnifying-glass" label="Search" aria-expanded="false" aria-controls="search-menu"></mms-button>
    <mms-button slot="account" id="nav-account-button" variant="ghost" color-scheme="onyx" left-icon="user-circle" label="Account" aria-expanded="false" aria-haspopup="true" aria-controls="account-menu"></mms-button>
  </mms-header>
  <div class="nav-header__utility-panel" id="help-menu" hidden>
    <a href="index.html#main-content">Ask The Navigator</a>
    <a href="find-a-cvso.html">Find a CVSO</a>
    <a href="https://dvs.ohio.gov/contact-us">Contact ODVS</a>
    <a href="tel:988">Veterans Crisis Line: 988, press 1</a>
  </div>
  <div class="nav-header__utility-panel nav-header__utility-panel--search" id="search-menu" hidden>
    <label class="visually-hidden" for="site-search-input">Search Ohio Department of Veterans Services</label>
    <mms-text-field id="site-search-input" placeholder="Search ODVS" size="lg"></mms-text-field>
    <mms-button id="site-search-submit" label="Search ODVS" variant="primary" color-scheme="primary" size="md"></mms-button>
    <a href="index.html#main-content">Ask The Navigator instead</a>
  </div>
  <div class="account-menu" id="account-menu" hidden></div>

  <mms-modal id="login-modal" size="sm" title-text="Login" primary-label="Login" secondary-label="Cancel" color-scheme="primary">
    <p class="auth-modal-copy"><strong>Prototype only:</strong> this demo does not connect to VA, ID.me, or Login.gov systems. Do not enter real account credentials or sensitive personal information.</p>
    <form class="auth-modal-form" id="login-form">
      <mms-text-field id="login-email" label="Email" input-type="email" required></mms-text-field>
      <mms-text-field id="login-password" label="Password" input-type="password" required></mms-text-field>
    </form>
  </mms-modal>
  <mms-modal id="create-account-modal" size="sm" title-text="Create an Account" primary-label="Create Account" secondary-label="Cancel" color-scheme="primary">
    <p class="auth-modal-copy"><strong>Prototype only:</strong> this demo does not create a real account or connect to VA, ID.me, or Login.gov systems. Do not enter real account credentials or sensitive personal information.</p>
    <form class="auth-modal-form" id="create-account-form">
      <mms-text-field id="create-account-name" label="Full Name" required></mms-text-field>
      <mms-text-field id="create-account-email" label="Email" input-type="email" required></mms-text-field>
      <mms-text-field id="create-account-password" label="Password" input-type="password" required></mms-text-field>
    </form>
  </mms-modal>
  <mms-modal id="ai-feedback-modal" size="sm" title-text="Report a problem with this AI response" primary-label="Send feedback" secondary-label="Cancel" color-scheme="primary">
    <p class="auth-modal-copy">Thank you for helping us improve. In this prototype, feedback is not sent or stored. Do not include personal, medical, or claim information.</p>
    <mms-text-field id="ai-feedback-text" label="What was inaccurate, unclear, or unsafe?" input-type="text"></mms-text-field>
  </mms-modal>

  <main class="layout-container resource-page${page.jobSeeker ? ' resource-page--job-seeker' : ''}" id="main-content">
    <nav class="resource-page__breadcrumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a><span aria-hidden="true">/</span>
      ${currentFile === 'resources.html' ? '' : '<a href="resources.html">Resources for Veterans</a><span aria-hidden="true">/</span>'}
      ${page.parent ? `<a href="${page.parentHref}">${page.parent}</a><span aria-hidden="true">/</span>` : ''}
      <span aria-current="page">${page.title}</span>
    </nav>
    <header class="resource-page__hero">
      <h1>${page.title}</h1>
      <p>${page.description}</p>
    </header>
    ${page.jobSeeker ? `
      <section class="chat-drawer chat-drawer--page is-open" id="chat-drawer" aria-label="Job Seeker chat">
        <div class="chat-drawer__header">
          <div class="chat-drawer__header-left">
            <div class="chat-drawer__avatar" aria-hidden="true">
              <mms-icon name="magic-wand" size="md"></mms-icon>
            </div>
            <div class="chat-drawer__header-text">
              <h2 class="chat-drawer__title">The Navigator</h2>
              <span class="chat-drawer__badge">AI-assisted veteran navigator</span>
            </div>
          </div>
        </div>
        <div class="chat-drawer__body">
          <div class="chat-transcript" id="chat-transcript" role="log" aria-live="polite"></div>
          <div class="chat-quick-replies" id="chat-quick-replies" hidden></div>
          <div class="chat-drawer__need-help" id="chat-drawer-need-help">
            <mms-button id="chat-drawer-need-help-btn" label="Need help?" variant="ghost" color-scheme="primary" size="sm" left-icon="question"></mms-button>
          </div>
          <div class="chat-input-row">
            <label class="visually-hidden" for="chat-text-input">Type your answer</label>
            <mms-text-field id="chat-text-input" placeholder="Type your answer, or tap an option above" size="lg"></mms-text-field>
            <mms-button id="chat-send-button" label="Send" icon-only left-icon="paper-plane-right" variant="primary" color-scheme="primary" size="lg"></mms-button>
          </div>
          <div class="chat-safety-panel" aria-label="AI chat safety information">
            <mms-inline-alert alert-type="caution" summary="AI-powered tool—not a person." message="It cannot make decisions, determine eligibility, or provide legal or medical advice."></mms-inline-alert>
            <mms-inline-alert alert-type="caution" summary="In crisis, call 988, then press 1." message="Do not share sensitive personal information." action action-text="Talk to a Veterans Service Officer" action-href="find-a-cvso.html"></mms-inline-alert>
          </div>
        </div>
      </section>
    ` : page.flow ? `
      <div class="resource-page__ai-notice" role="note">
        <mms-icon name="info" size="md" aria-hidden="true"></mms-icon>
        <p><strong>AI-powered tool—not a person.</strong> Suggestions may be incomplete or incorrect. Do not share sensitive personal information, and review the final content before using it.</p>
      </div>
      <section class="resource-page__chat" aria-label="${page.title} chat">
        <div id="career-tool-chat"></div>
      </section>
    ` : `
      <div class="resource-page__grid">
        ${page.sections.map((section) => `
          <mms-card class="resource-page__card" variant="outlined" roundness="subtle" title-text="${section.title}" description-text="${section.body}"${section.links.length ? ' show-actions' : ''} action-style="${section.links.length > 1 ? 'vt-actions' : 'link'}">
            ${renderActions(section.links)}
          </mms-card>
        `).join('')}
      </div>
      <mms-card class="resource-page__callout" variant="accent-left" color-scheme="primary" roundness="boxed" surface="tint" title-text="Not sure where to start?">
        <div slot="body-content">
          <p>Ask The Navigator for AI-assisted guidance, or contact your County Veterans Service Office for free help from a person. Do not share sensitive personal information in the prototype.</p>
          <p><a href="#resource-chat" id="resource-ask-navigator">Ask The Navigator</a> or <a href="find-a-cvso.html">find a CVSO</a>.</p>
        </div>
      </mms-card>
    `}
  </main>

  ${!page.jobSeeker && !page.flow ? `
    <div class="chat-drawer-backdrop" id="chat-drawer-backdrop"></div>
    <section class="chat-drawer" id="chat-drawer" aria-label="The Navigator Chat">
      <div class="chat-drawer__header">
        <div class="chat-drawer__header-left">
          <div class="chat-drawer__avatar" aria-hidden="true">
            <mms-icon name="magic-wand" size="md"></mms-icon>
          </div>
          <div class="chat-drawer__header-text">
            <h2 class="chat-drawer__title">The Navigator</h2>
            <span class="chat-drawer__badge">AI-assisted veteran navigator</span>
          </div>
        </div>
        <div class="chat-drawer__header-actions">
          <mms-button id="chat-drawer-close" label="Close" icon-only left-icon="x" variant="ghost" color-scheme="onyx" size="md"></mms-button>
        </div>
      </div>
      <div class="chat-drawer__body">
        <div class="chat-transcript" id="chat-transcript" role="log" aria-live="polite"></div>
        <div class="chat-quick-replies" id="chat-quick-replies" hidden></div>
        <div class="chat-drawer__need-help" id="chat-drawer-need-help">
          <mms-button id="chat-drawer-need-help-btn" label="Need help?" variant="ghost" color-scheme="primary" size="sm" left-icon="question"></mms-button>
        </div>
        <div class="chat-input-row">
          <label class="visually-hidden" for="chat-text-input">Type your answer</label>
          <mms-text-field id="chat-text-input" placeholder="Type your answer, or tap an option above" size="lg"></mms-text-field>
          <mms-button id="chat-send-button" label="Send" icon-only left-icon="paper-plane-right" variant="primary" color-scheme="primary" size="lg"></mms-button>
        </div>
        <div class="chat-safety-panel" aria-label="AI chat safety information">
          <mms-inline-alert alert-type="caution" summary="AI-powered tool—not a person." message="It cannot make decisions, determine eligibility, or provide legal or medical advice."></mms-inline-alert>
          <mms-inline-alert alert-type="caution" summary="In crisis, call 988, then press 1." message="Do not share sensitive personal information." action action-text="Talk to a Veterans Service Officer" action-href="find-a-cvso.html"></mms-inline-alert>
        </div>
      </div>
    </section>
  ` : ''}

  ${page.jobSeeker ? '' : '<mms-button class="navigator-launcher" id="navigator-launcher" variant="primary" color-scheme="primary" size="lg" roundness="rounded" left-icon="magic-wand" label="The Navigator"></mms-button>'}
`;

document.querySelectorAll('.chat-safety-panel mms-inline-alert').forEach((el) => { el.dismissible = false; });

await import('./nav.js?v=17');

if (!page.jobSeeker && !page.flow) {
  const { initChatDrawer, openChatDrawer } = await import('./chat-drawer.js?v=19');
  initChatDrawer();
  document.getElementById('resource-ask-navigator')?.addEventListener('click', (event) => {
    event.preventDefault();
    openChatDrawer();
  });
} else if (page.jobSeeker) {
  const { initChatDrawer, openChatDrawer } = await import('./chat-drawer.js?v=19');
  initChatDrawer();
  openChatDrawer({
    scenario: 'job-seeker',
    promptText: 'I need employment help',
  });
} else if (page.flow) {
  const [{ mountFlowChat }, flowModule] = await Promise.all([
    import('./flow-chat.js?v=7'),
    page.flow === 'resume-builder'
      ? import('./resume-builder-flow.js?v=7')
      : import('./interview-help-flow.js?v=7'),
  ]);
  const flow = page.flow === 'resume-builder'
    ? flowModule.RESUME_BUILDER_FLOW
    : flowModule.INTERVIEW_HELP_FLOW;
  mountFlowChat(document.getElementById('career-tool-chat'), flow);
}
