// Ohio Veterans — Navigator
// Flow data for the Resume Builder tab's embedded chat widget (see
// flow-chat.js), transcribed from the user's "Resume builder logic flow"
// diagram. A few adaptations were made without changing the engine's
// question set/order:
// - "Upload your resume" uses flow-chat.js's `type: 'file'` node — a real
//   native file picker, but the "parsing" that follows is entirely scripted
//   for the demo (only the picked filename is used; contents are never
//   read).
// - Pure informational boxes with no real question ("Parsing and
//   Extracting...", "Generate a Preview...") are folded into the prompt of
//   the next real question, or given a single "Continue" chip when they need
//   their own beat before the next question.
// - "Add another position," "Add more education," the optional-sections
//   menu, and the "what would you like to edit" step are all loops, done by
//   pointing a node/option's `next` back at an earlier node id.
export const RESUME_BUILDER_FLOW = {
  id: 'resume-builder',
  start: 'has-resume',
  nodes: {
    // --- Start ---
    'has-resume': {
      prompt:
        "Welcome! Let's tailor your resume for your military and civilian career. Here's how it works. First — do you already have a resume to upload?",
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'upload-resume' },
        { value: 'no', label: 'No', next: 'create-name' },
      ],
    },

    // --- Upload / import existing resume ---
    'upload-resume': {
      prompt: "Great — go ahead and upload your resume.",
      type: 'file',
      uploadLabel: 'Upload resume',
      next: 'reviewing-resume',
    },
    'reviewing-resume': {
      prompt:
        "Thanks — I'm reading through your resume now. One more question: would you like advice for a specific job you're interested in?",
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'request-job-description' },
        { value: 'no', label: 'No', next: 'general-feedback' },
      ],
    },
    'general-feedback': {
      prompt:
        "Here's some general feedback on your resume — tone, grammar, structure, and clarity all look at least worth a pass. I'll help you tighten those up.",
      type: 'single',
      options: [{ value: 'continue', label: 'Continue', next: 'choose-format' }],
    },
    'request-job-description': {
      prompt: 'Share the job description here — paste it in or summarize the role.',
      type: 'text',
      next: 'keyword-feedback',
    },
    'keyword-feedback': {
      prompt:
        "Based on that job description, here are some keyword suggestions that could help your resume get through an initial AI screening. I'll help you weave those in.",
      type: 'single',
      options: [{ value: 'continue', label: 'Continue', next: 'choose-format' }],
    },

    // --- Create new resume from scratch: Personal Info ---
    'create-name': {
      prompt: "Let's build your resume from scratch. What's your full name?",
      type: 'text',
      next: 'create-contact',
    },
    'create-contact': {
      prompt: 'Please provide your email and phone number.',
      type: 'text',
      next: 'create-location',
    },
    'create-location': {
      prompt: 'What city or location are you based in?',
      type: 'text',
      next: 'create-links',
    },
    'create-links': {
      prompt: 'Share your LinkedIn, portfolio, or website links, if you have any (or type "none").',
      type: 'text',
      next: 'wants-summary',
    },
    'wants-summary': {
      prompt: 'Would you like to include a professional summary?',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'summary' },
        { value: 'no', label: 'No', next: 'has-work-experience' },
      ],
    },
    summary: {
      prompt: 'Briefly describe your professional background and career goals.',
      type: 'text',
      next: 'has-work-experience',
    },

    // --- Work Experience ---
    'has-work-experience': {
      prompt: 'Do you have military or civilian work experience to include?',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'work-company' },
        { value: 'no', label: 'No', next: 'education-degree' },
      ],
    },
    'work-company': {
      prompt: 'Which company or military branch did you serve with?',
      type: 'text',
      next: 'work-title',
    },
    'work-title': {
      prompt: 'What was your job title or military role?',
      type: 'text',
      next: 'work-dates',
    },
    'work-dates': {
      prompt: 'What were your employment or service dates?',
      type: 'text',
      next: 'work-responsibilities',
    },
    'work-responsibilities': {
      prompt: 'Describe your key responsibilities.',
      type: 'text',
      next: 'work-achievements',
    },
    'work-achievements': {
      prompt: 'What were your major achievements?',
      type: 'text',
      next: 'work-add-another',
    },
    'work-add-another': {
      prompt: 'Would you like to add another position or service period?',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'work-company' },
        { value: 'no', label: 'No', next: 'education-degree' },
      ],
    },

    // --- Education ---
    'education-degree': {
      prompt: 'What degree or certification did you earn?',
      type: 'text',
      next: 'education-institution',
    },
    'education-institution': {
      prompt: 'Which institution or military training center did you attend?',
      type: 'text',
      next: 'education-dates',
    },
    'education-dates': {
      prompt: 'When did you graduate or complete training?',
      type: 'text',
      next: 'education-honors-question',
    },
    'education-honors-question': {
      prompt: 'Any honors or special achievements?',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'education-honors' },
        { value: 'no', label: 'No', next: 'education-add-another' },
      ],
    },
    'education-honors': {
      prompt: 'List your academic or military honors.',
      type: 'text',
      next: 'education-add-another',
    },
    'education-add-another': {
      prompt: 'Would you like to add more education or training?',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'education-degree' },
        { value: 'no', label: 'No', next: 'skills-hard' },
      ],
    },

    // --- Skills ---
    'skills-hard': {
      prompt: 'List your technical or hard skills.',
      type: 'text',
      next: 'skills-soft',
    },
    'skills-soft': {
      prompt: 'List your soft skills.',
      type: 'text',
      next: 'skills-tools',
    },
    'skills-tools': {
      prompt: 'What tools or software are you proficient with?',
      type: 'text',
      next: 'wants-optional-sections',
    },

    // --- Optional Sections (repeating menu) ---
    'wants-optional-sections': {
      prompt:
        'Would you like to add any optional sections — certifications, projects, volunteer experience, languages, or awards?',
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'optional-sections-menu' },
        { value: 'no', label: 'No', next: 'choose-format' },
      ],
    },
    'optional-sections-menu': {
      prompt: 'Which optional section would you like to add?',
      type: 'single',
      options: [
        { value: 'certifications', label: 'Certifications', next: 'optional-certifications' },
        { value: 'projects', label: 'Projects', next: 'optional-projects' },
        { value: 'volunteer', label: 'Volunteer', next: 'optional-volunteer' },
        { value: 'languages', label: 'Languages', next: 'optional-languages' },
        { value: 'awards', label: 'Awards', next: 'optional-awards' },
        { value: 'done', label: 'Done', next: 'choose-format' },
      ],
    },
    'optional-certifications': {
      prompt: 'List your certifications and their dates.',
      type: 'text',
      next: 'optional-sections-menu',
    },
    'optional-projects': {
      prompt: "Describe relevant projects you've completed.",
      type: 'text',
      next: 'optional-sections-menu',
    },
    'optional-volunteer': {
      prompt: 'List your volunteer experience.',
      type: 'text',
      next: 'optional-sections-menu',
    },
    'optional-languages': {
      prompt: 'List languages you speak and your proficiency level.',
      type: 'text',
      next: 'optional-sections-menu',
    },
    'optional-awards': {
      prompt: "List awards and recognitions you've received.",
      type: 'text',
      next: 'optional-sections-menu',
    },

    // --- Formatting, Preview, Export ---
    'choose-format': {
      prompt:
        "Now let's choose your resume's visual style and layout. What style would you like (for example, Modern, Classic, or Simple)?",
      type: 'text',
      next: 'preview',
    },
    preview: {
      prompt: "Great — I'm generating a preview of your resume now. Are you happy with your resume so far?",
      type: 'single',
      options: [
        { value: 'yes', label: 'Yes', next: 'export-format' },
        { value: 'no', label: 'No', next: 'edit-what' },
      ],
    },
    'edit-what': {
      prompt: 'What would you like to edit?',
      type: 'text',
      next: 'preview',
    },
    'export-format': {
      prompt: "Let's export your resume. Which format would you like — PDF, DOCX, or TXT?",
      type: 'single',
      options: [
        { value: 'pdf', label: 'PDF' },
        { value: 'docx', label: 'DOCX' },
        { value: 'txt', label: 'TXT' },
      ],
    },
  },
  closingMessage: 'Your resume is ready to download. Resume building complete!',
};
