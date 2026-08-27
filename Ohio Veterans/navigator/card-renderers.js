// Ohio Veterans — Navigator
// Shared card DOM-rendering functions, used by both result.js (CVSO,
// Employment, Next Steps — the intake-personalized content) and landing.js
// (Benefits, GI Bill, Mental Health, Housing, Family — the static content).
// Outbound links use <mms-link>, section glyphs use <mms-icon>; card
// containers use the DS's <mms-card>, content goes in its body-content slot.

function cardShell(card, { crisis = false } = {}) {
  const el = document.createElement('mms-card');
  el.className = 'result-card' + (crisis ? ' result-card--crisis' : '');
  el.setAttribute('variant', 'accent-left');
  el.setAttribute('color-scheme', crisis ? 'accent' : 'primary');
  el.setAttribute('roundness', 'subtle');
  el.setAttribute('surface', 'tint');
  el.setAttribute('title-text', card.title);
  if (card.icon) el.setAttribute('icon', card.icon);

  const body = document.createElement('div');
  body.setAttribute('slot', 'body-content');
  el.appendChild(body);

  return { el, body };
}

function renderCvsoCard(card) {
  const { el, body } = cardShell(card);
  const p1 = document.createElement('p');
  p1.textContent = card.officeName;
  const p2 = document.createElement('p');
  p2.innerHTML = `<strong>Phone:</strong> ${card.phone}`;
  body.append(p1, p2);
  if (card.address) {
    const p3 = document.createElement('p');
    p3.innerHTML = `<strong>Address:</strong> ${card.address}`;
    body.appendChild(p3);
  }
  if (card.email) {
    const p4 = document.createElement('p');
    const emailLabel = document.createElement('strong');
    emailLabel.textContent = 'Email: ';
    const emailLink = document.createElement('mms-link');
    emailLink.setAttribute('href', `mailto:${card.email}`);
    emailLink.setAttribute('label', card.email);
    p4.append(emailLabel, emailLink);
    body.appendChild(p4);
  }
  if (card.website) {
    const p5 = document.createElement('p');
    const websiteLink = document.createElement('mms-link');
    websiteLink.setAttribute('href', card.website);
    websiteLink.setAttribute('target', '_blank');
    websiteLink.setAttribute('label', 'Visit office website');
    websiteLink.setAttribute('right-icon', 'arrow-square-out');
    p5.appendChild(websiteLink);
    body.appendChild(p5);
  }
  if (card.referenceNumber) {
    const ref = document.createElement('p');
    ref.innerHTML = `<strong>Reference number:</strong> <span style="font-family: var(--font-family-tabular, monospace);">${card.referenceNumber}</span>`;
    body.appendChild(ref);
  }
  return el;
}

function renderLinkedParagraph(content) {
  const p = document.createElement('p');
  if (typeof content === 'string') {
    p.textContent = content;
  } else {
    const link = document.createElement('mms-link');
    link.setAttribute('href', content.linkHref);
    link.setAttribute('target', '_blank');
    link.setAttribute('label', content.linkLabel);
    link.setAttribute('right-icon', 'arrow-square-out');
    p.append(content.before, link, content.after);
  }
  return p;
}

function renderMentalHealthCard(card) {
  const { el, body } = cardShell(card, { crisis: card.variant === 'crisis' });
  const headline = document.createElement('p');
  headline.innerHTML = `<strong>${card.headline}</strong>`;
  body.appendChild(headline);
  body.appendChild(renderLinkedParagraph(card.body));
  if (card.communityCare) body.appendChild(renderLinkedParagraph(card.communityCare));
  return el;
}

function renderEmploymentCard(card) {
  const { el, body } = cardShell(card);

  const mosTitle = document.createElement('p');
  mosTitle.className = 'result-card__section-title';
  mosTitle.textContent = 'Military Occupational Specialty to Civilian Translation';
  const mosBody = document.createElement('p');
  mosBody.textContent = card.mosTranslation;
  body.append(mosTitle, mosBody);

  if (card.skillbridge) {
    const title = document.createElement('p');
    title.className = 'result-card__section-title';
    title.textContent = 'SkillBridge Opportunities';
    body.appendChild(title);

    const list = document.createElement('div');
    list.className = 'sub-card-list';
    card.skillbridge.forEach((listing) => {
      const sub = document.createElement('div');
      sub.className = 'sub-card';
      const subTitle = document.createElement('p');
      subTitle.className = 'sub-card__title';
      subTitle.textContent = `${listing.provider} — ${listing.city}, ${listing.state}`;
      const mission = document.createElement('p');
      mission.textContent = listing.mission;
      const meta = document.createElement('p');
      meta.className = 'sub-card__meta';
      meta.textContent = `${listing.duration} · ${listing.deliveryMethod} · ${listing.employerContact}`;
      const applyButton = document.createElement('mms-button');
      applyButton.className = 'sub-card__cta';
      applyButton.setAttribute('label', 'Apply now');
      applyButton.setAttribute('right-icon', 'arrow-square-out');
      applyButton.setAttribute('variant', 'primary');
      applyButton.setAttribute('color-scheme', 'primary');
      applyButton.setAttribute('size', 'md');
      sub.append(subTitle, mission, meta, applyButton);
      list.appendChild(sub);
    });
    body.appendChild(list);
  }

  if (card.jobListings) {
    const title = document.createElement('p');
    title.className = 'result-card__section-title';
    title.textContent = 'Open Job Listings';
    body.appendChild(title);

    const list = document.createElement('div');
    list.className = 'sub-card-list';
    card.jobListings.forEach((job) => {
      const sub = document.createElement('div');
      sub.className = 'sub-card';
      const subTitle = document.createElement('p');
      subTitle.className = 'sub-card__title';
      subTitle.textContent = `${job.title} — ${job.company}`;
      const meta = document.createElement('p');
      meta.className = 'sub-card__meta';
      meta.textContent = `${job.city}, OH · ${job.type}`;
      const applyButton = document.createElement('mms-button');
      applyButton.className = 'sub-card__cta';
      applyButton.setAttribute('label', 'Apply now');
      applyButton.setAttribute('right-icon', 'arrow-square-out');
      applyButton.setAttribute('variant', 'primary');
      applyButton.setAttribute('color-scheme', 'primary');
      applyButton.setAttribute('size', 'md');
      sub.append(subTitle, meta, applyButton);
      list.appendChild(sub);
    });
    body.appendChild(list);

    if (card.jobSearchLink) {
      const link = document.createElement('mms-link');
      link.setAttribute('href', card.jobSearchLink.href);
      link.setAttribute('target', '_blank');
      link.setAttribute('label', card.jobSearchLink.label);
      link.setAttribute('right-icon', 'arrow-square-out');
      body.appendChild(link);
    }
  }

  if (card.employers) {
    const title = document.createElement('p');
    title.className = 'result-card__section-title';
    title.textContent = 'Military-Friendly Employers Near You';
    body.appendChild(title);

    const list = document.createElement('div');
    list.className = 'sub-card-list';
    card.employers.forEach((employer) => {
      const sub = document.createElement('div');
      sub.className = 'sub-card';
      const subTitle = document.createElement('p');
      subTitle.className = 'sub-card__title';
      subTitle.textContent = employer.company;
      const meta = document.createElement('p');
      meta.className = 'sub-card__meta';
      meta.textContent = employer.address
        ? `${employer.address} · ${employer.industrySector}`
        : `${employer.city}, OH · ${employer.industrySector}`;
      sub.append(subTitle, meta);
      list.appendChild(sub);
    });
    body.appendChild(list);

    const seeAll = document.createElement('mms-link');
    seeAll.setAttribute('href', 'https://ohiomeansjobs.ohio.gov/');
    seeAll.setAttribute('target', '_blank');
    seeAll.setAttribute('label', 'See all 9,310 military-friendly employers on OhioMeansJobs');
    seeAll.setAttribute('right-icon', 'arrow-square-out');
    body.appendChild(seeAll);
  }

  return el;
}

// Job-seeker "Employment" tab: same sections as renderEmploymentCard above,
// split into one card each.
function renderMosCard(card) {
  const { el, body } = cardShell(card);
  const bodyText = document.createElement('p');
  bodyText.textContent = card.body;
  body.appendChild(bodyText);
  return el;
}

function renderSkillbridgeCard(card) {
  const { el, body } = cardShell(card);
  const list = document.createElement('div');
  list.className = 'sub-card-list';
  card.listings.forEach((listing) => {
    const sub = document.createElement('div');
    sub.className = 'sub-card';
    const subTitle = document.createElement('p');
    subTitle.className = 'sub-card__title';
    subTitle.textContent = `${listing.provider} — ${listing.city}, ${listing.state}`;
    const mission = document.createElement('p');
    mission.textContent = listing.mission;
    const meta = document.createElement('p');
    meta.className = 'sub-card__meta';
    meta.textContent = `${listing.duration} · ${listing.deliveryMethod} · ${listing.employerContact}`;
    const applyButton = document.createElement('mms-button');
    applyButton.className = 'sub-card__cta';
    applyButton.setAttribute('label', 'Apply now');
    applyButton.setAttribute('right-icon', 'arrow-square-out');
    applyButton.setAttribute('variant', 'primary');
    applyButton.setAttribute('color-scheme', 'primary');
    applyButton.setAttribute('size', 'md');
    sub.append(subTitle, mission, meta, applyButton);
    list.appendChild(sub);
  });
  body.appendChild(list);
  return el;
}

function renderJobListingsCard(card) {
  const { el, body } = cardShell(card);
  const list = document.createElement('div');
  list.className = 'sub-card-list';
  card.listings.forEach((job) => {
    const sub = document.createElement('div');
    sub.className = 'sub-card';
    const subTitle = document.createElement('p');
    subTitle.className = 'sub-card__title';
    subTitle.textContent = `${job.title} — ${job.company}`;
    const meta = document.createElement('p');
    meta.className = 'sub-card__meta';
    meta.textContent = `${job.city}, OH · ${job.type}`;
    const applyButton = document.createElement('mms-button');
    applyButton.className = 'sub-card__cta';
    applyButton.setAttribute('label', 'Apply now');
    applyButton.setAttribute('right-icon', 'arrow-square-out');
    applyButton.setAttribute('variant', 'primary');
    applyButton.setAttribute('color-scheme', 'primary');
    applyButton.setAttribute('size', 'md');
    sub.append(subTitle, meta, applyButton);
    list.appendChild(sub);
  });
  body.appendChild(list);
  if (card.jobSearchLink) {
    const link = document.createElement('mms-link');
    link.setAttribute('href', card.jobSearchLink.href);
    link.setAttribute('target', '_blank');
    link.setAttribute('label', card.jobSearchLink.label);
    link.setAttribute('right-icon', 'arrow-square-out');
    body.appendChild(link);
  }
  return el;
}

function renderEmployersCard(card) {
  const { el, body } = cardShell(card);
  const list = document.createElement('div');
  list.className = 'sub-card-list';
  card.employers.forEach((employer) => {
    const sub = document.createElement('div');
    sub.className = 'sub-card';
    const subTitle = document.createElement('p');
    subTitle.className = 'sub-card__title';
    subTitle.textContent = employer.company;
    const meta = document.createElement('p');
    meta.className = 'sub-card__meta';
    meta.textContent = employer.address
      ? `${employer.address} · ${employer.industrySector}`
      : `${employer.city}, OH · ${employer.industrySector}`;
    sub.append(subTitle, meta);
    list.appendChild(sub);
  });
  body.appendChild(list);

  const seeAll = document.createElement('mms-link');
  seeAll.setAttribute('href', 'https://ohiomeansjobs.ohio.gov/');
  seeAll.setAttribute('target', '_blank');
  seeAll.setAttribute('label', 'See all 9,310 military-friendly employers on OhioMeansJobs');
  seeAll.setAttribute('right-icon', 'arrow-square-out');
  body.appendChild(seeAll);
  return el;
}

function renderGiBillCard(card) {
  const { el, body } = cardShell(card);
  card.body.forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    body.appendChild(p);
  });
  if (card.cta) body.appendChild(renderLinkedParagraph(card.cta));
  return el;
}

function renderLinkList(links) {
  const list = document.createElement('div');
  list.className = 'result-card__link-list';
  links.forEach(({ label, href }) => {
    const link = document.createElement('mms-link');
    link.setAttribute('href', href);
    link.setAttribute('target', '_blank');
    link.setAttribute('label', label);
    link.setAttribute('right-icon', 'arrow-square-out');
    list.appendChild(link);
  });
  return list;
}

function renderHousingCard(card) {
  const { el, body } = cardShell(card);

  body.appendChild(renderLinkedParagraph(card.base.eligibilityCta));

  const baseBody = document.createElement('p');
  baseBody.textContent = card.base.body;
  body.appendChild(baseBody);

  body.appendChild(renderLinkList(card.base.links));

  if (card.ovh) {
    const title = document.createElement('p');
    title.className = 'result-card__section-title';
    title.textContent = 'Ohio Veterans Homes';
    body.appendChild(title);

    const ovhBody = document.createElement('p');
    ovhBody.textContent = card.ovh.body;
    body.appendChild(ovhBody);

    const list = document.createElement('div');
    list.className = 'sub-card-list';
    card.ovh.facilities.forEach((facility) => {
      const sub = document.createElement('div');
      sub.className = 'sub-card';
      const subTitle = document.createElement('p');
      subTitle.className = 'sub-card__title';
      subTitle.textContent = `${facility.name} (est. ${facility.established})`;
      const note = document.createElement('p');
      note.className = 'sub-card__meta';
      note.textContent = facility.note;
      sub.append(subTitle, note);
      list.appendChild(sub);
    });
    body.appendChild(list);

    const contact = document.createElement('p');
    contact.className = 'sub-card__meta';
    contact.textContent = card.ovh.contact;
    body.appendChild(contact);

    const detailsLink = document.createElement('mms-link');
    detailsLink.setAttribute('href', card.ovh.detailsHref);
    detailsLink.setAttribute('target', '_blank');
    detailsLink.setAttribute('label', 'Determining eligibility for Ohio Veterans Homes');
    detailsLink.setAttribute('right-icon', 'arrow-square-out');
    body.appendChild(detailsLink);
  }

  const fragment = document.createDocumentFragment();
  fragment.append(el, renderHomeLoanCard(card.homeLoanCard));
  return fragment;
}

function renderHomeLoanCard(card) {
  const { el, body } = cardShell(card);
  card.sections.forEach((section) => {
    const subhead = document.createElement('p');
    subhead.className = 'result-card__section-title';
    subhead.textContent = section.subhead;
    body.appendChild(subhead);
    section.paragraphs.forEach((paragraph) => {
      body.appendChild(renderLinkedParagraph(paragraph));
    });
    if (section.links) body.appendChild(renderLinkList(section.links));
  });
  return el;
}

function renderNextStepsCard(card) {
  const { el, body } = cardShell(card);
  const urgency = document.createElement('p');
  urgency.textContent = card.urgencyNote;
  const contact = document.createElement('p');
  contact.textContent = card.contactNote;
  const ref = document.createElement('p');
  ref.innerHTML = `<strong>Reference number:</strong> <span style="font-family: var(--font-family-tabular, monospace);">${card.referenceNumber}</span>`;
  body.append(urgency, contact, ref);
  return el;
}

function renderBenefitsCard(card) {
  const { el, body } = cardShell(card);
  const bodyText = document.createElement('p');
  bodyText.textContent = card.body;
  body.appendChild(bodyText);
  body.appendChild(renderLinkList(card.links));
  return el;
}

function renderFamilyCard(card) {
  const { el, body } = cardShell(card);
  const bodyText = document.createElement('p');
  bodyText.textContent = card.body;
  body.appendChild(bodyText);
  body.appendChild(renderLinkList(card.links));
  return el;
}

function renderApplicationStatusCard(card) {
  const { el, body } = cardShell(card);
  card.body.forEach((item) => body.appendChild(renderLinkedParagraph(item)));
  return el;
}

export const RENDERERS = {
  cvso: renderCvsoCard,
  'mental-health': renderMentalHealthCard,
  employment: renderEmploymentCard,
  'mos-translation': renderMosCard,
  skillbridge: renderSkillbridgeCard,
  'job-listings': renderJobListingsCard,
  employers: renderEmployersCard,
  'gi-bill': renderGiBillCard,
  housing: renderHousingCard,
  'next-steps': renderNextStepsCard,
  benefits: renderBenefitsCard,
  family: renderFamilyCard,
  'application-status': renderApplicationStatusCard,
};
