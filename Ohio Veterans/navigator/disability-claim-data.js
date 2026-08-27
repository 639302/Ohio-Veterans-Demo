// Ohio Veterans — Navigator
// Data layer for the Disability Claim Reporter persona's bespoke VA
// disability-claim conversation (Addendum 15). Pure data + curated static
// snapshots, following the va-benefits-data.js/employer-data.js precedent —
// no logic beyond simple lookups lives here. Agreement/What-to-Expect/Get
// Help copy is imported from va-benefits-data.js rather than duplicated —
// the spec's own screenshots for those screens match the ones already built
// for Healthcare Seeker.

export { AGREEMENT_CONTENT, WHAT_TO_EXPECT_CONTENT, GET_HELP_TEXT } from './va-benefits-data.js';

export const DISABILITY_PROFILE = {
  name: 'John Doe',
  dob: '09-22-1975',
  ssnLast4: '1234',
  vaFilingNumber: '00112233', // shown only when filedBefore === 'yes'
  address: '776 Lake Avenue',
  city: 'Cincinnati',
  state: 'OH',
  zip: '45201',
  // Same real Hamilton County CVSO as va-benefits-data.js's MOCK_PROFILE —
  // kept identical on purpose, not a shared record.
  county: 'Hamilton',
  email: 'john.doe@email.com',
  phone: '555-555-1023',
  branch: 'Army',
  serviceStart: '11/12/1999',
  serviceEnd: '05/06/2021', // omitted from summary when stillServing === true
  dd214Uploaded: true,
};

// SSN, service dates, and DD214 status are treated as institutional/verified
// data, not freely editable — same convention as va-benefits-data.js's
// EDITABLE_PROFILE_FIELDS.
export const EDITABLE_DISABILITY_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'address', label: 'Mailing address' },
  { key: 'email', label: 'Email address' },
  { key: 'phone', label: 'Phone number' },
];

export const TOXIC_EXPOSURE_OPTIONS = [
  { value: 'asbestos', label: 'Asbestos' },
  { value: 'shad', label: 'SHAD (Shipboard Hazard and Defense)' },
  { value: 'mustard-gas', label: 'Mustard Gas' },
  { value: 'mos-toxin', label: 'Military Occupational Specialty (MOS) related toxin' },
  { value: 'radiation', label: 'Radiation' },
  { value: 'camp-lejeune', label: 'Contaminated Water at Camp Lejeune' },
  { value: 'other', label: 'Other' }, // selecting triggers a one-line free-text follow-up
];

export const BDD_REQUIREMENTS = {
  intro: 'You may be eligible for the Benefits Delivery at Discharge (BDD) program if you meet all of these requirements:',
  bullets: [
    "You're a service member on full-time active duty (including a member of the National Guard, Reserve, or Coast Guard)",
    'You have a known separation date with 180 to 90 days left on active duty',
    "You're available to go to VA exams within 45 days of the date you submitted your claim",
  ],
  closing: 'Do you meet these requirements?',
};

// Document-upload categories on the document-upload screen — spec calls this
// "DD215," which isn't a real VA form; the real separation document is the
// DD214, used consistently here.
export const DOCUMENT_UPLOAD_CATEGORIES = [
  { key: 'dd214', label: 'DD214 or other separation documents' },
  { key: 'serviceRecords', label: 'Service treatment records' },
  { key: 'medicalEvidence', label: 'Medical evidence' },
  { key: 'layEvidence', label: 'Lay evidence (statements from family, friends, etc.)' },
];
