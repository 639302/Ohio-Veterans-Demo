// Ohio Veterans — Navigator
// Data layer for the Healthcare Seeker persona's bespoke VA-benefits
// application conversation (Addendum 14). Pure data + curated static
// snapshots, following the employer-data.js/skillbridge-data.js precedent —
// no logic beyond simple lookups lives here.

export const MOCK_PROFILE = {
  name: 'John Doe',
  dob: '09-22-1975',
  ssnLast4: '1234',
  sex: 'Male',
  country: 'United States',
  address: '776 Lake Avenue',
  city: 'Cincinnati',
  state: 'OH',
  zip: '45201',
  // Matches county-data.js's OHIO_COUNTIES value directly, used for CVSO
  // lookup — the spec gives a street address, not a county, and this demo
  // has no geocoding to derive one.
  county: 'Hamilton',
  email: 'john.doe@email.com',
  phone: '555-555-1023',
  disabilityRating: 'Yes, 40% or less',
  veteransPension: 'Yes',
  branch: 'Air Force',
  serviceStart: '11/12/1999',
  serviceEnd: '05/06/2021',
  characterOfService: 'Honorable',
  toxicExposure: 'No',
  dd214Uploaded: true,
  maritalStatus: 'Married',
  medicaidEligible: 'No',
};

// Fields a veteran can edit on the profile-summary screen. SSN, service
// dates, character of service, disability rating, DD214, and Medicaid
// eligibility are treated as institutional/verified data, not freely
// editable, consistent with the spec showing an edit *option* without
// implying every field is editable.
export const EDITABLE_PROFILE_FIELDS = [
  { key: 'name', label: 'Full name' },
  { key: 'dob', label: 'Date of birth' },
  { key: 'address', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'ZIP code' },
  { key: 'email', label: 'Email address' },
  { key: 'phone', label: 'Phone number' },
  { key: 'maritalStatus', label: 'Marital status' },
];

// Curated real Ohio VA facilities/clinics — Ohio-only, no state selector.
export const OHIO_VA_FACILITIES = [
  { value: 'columbus', label: 'Chalmers P. Wylie VA Ambulatory Care Center — Columbus' },
  { value: 'cleveland', label: 'Louis Stokes Cleveland VA Medical Center — Cleveland' },
  { value: 'cincinnati', label: 'Cincinnati VA Medical Center — Cincinnati' },
  { value: 'dayton', label: 'Dayton VA Medical Center — Dayton' },
  { value: 'chillicothe', label: 'Chillicothe VA Medical Center — Chillicothe' },
  { value: 'akron', label: 'Akron VA Clinic — Akron' },
  { value: 'toledo', label: 'Toledo VA Clinic — Toledo' },
  { value: 'youngstown', label: 'Youngstown VA Clinic — Youngstown' },
];

// Intentionally simplified eligibility screener — real VA health care
// eligibility involves income thresholds/priority groups this demo doesn't
// attempt to model (same honesty convention as the base plan's MOS
// translation/GI Bill disclaimers). Both Yes/No; answering `failValue` on
// either ends the branch as "not eligible."
export const ELIGIBILITY_QUESTIONS = [
  { id: 'active-duty', prompt: 'Did you serve on active duty in the U.S. military?', failValue: 'no' },
  { id: 'discharge', prompt: 'Was your discharge characterized as anything other than dishonorable?', failValue: 'no' },
];

export const AGREEMENT_CONTENT = {
  heading: 'Agreement',
  intro: 'Before you submit your application, please review and agree to the following:',
  bullets: [
    'I understand that I may be responsible for VA copays for care or medications I receive, depending on my assigned priority group and income.',
    'I consent to being contacted by VA by email, home phone, or mobile phone about my application and my care.',
    'I consent to the assignment of benefits and to VA billing my health insurance for care related to non-service-connected conditions.',
    'I have read and accept the privacy policy for how my information will be used and protected.',
  ],
  readMoreLabel: 'Read more about the assignment of benefits',
  readMoreBody: 'Assignment of benefits means VA may bill your health insurance provider for medical care you receive that is not related to a service-connected condition. This does not affect your eligibility for VA care and you will not be billed directly for any amount your insurer does not cover.',
  privacyLinkLabel: 'Read our privacy policy',
  privacyLinkHref: 'https://www.va.gov/privacy-policy/',
  penaltyNote: 'Note: There are severe criminal and civil penalties, including a fine, imprisonment, or both, for withholding information or for providing incorrect information (18 U.S.C. 1001).',
};

export const WHAT_TO_EXPECT_CONTENT = {
  heading: 'What to expect next',
  sections: [
    {
      title: 'Processing your application',
      paragraphs: [
        { text: "It typically takes about a week to process your application. We'll mail you a decision letter once a decision has been made." },
        {
          textBefore: 'You can check your application status online at any time, by returning to this chat or by visiting ',
          linkLabel: 'va.gov',
          linkHref: 'https://www.va.gov/health-care/apply-for-health-care-form-10-10ez/introduction',
          textAfter: '.',
        },
      ],
    },
    {
      title: 'How to contact us',
      paragraphs: [
        { text: 'Call our Health Benefits Hotline at 877-222-8387 (TTY: 711), Monday through Friday, 8:00 a.m. to 8:00 p.m. ET, or ask VA online.' },
      ],
    },
  ],
};

export const GET_HELP_TEXT = "If you have trouble using this online application, call our MyVA411 main information line at 800-698-2411 (TTY: 711). We're here 24/7.";
