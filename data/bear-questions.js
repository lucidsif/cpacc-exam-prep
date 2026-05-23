export const BEAR_BANK = [
  // ===== DOMAIN 1: Disabilities & AT =====
  {
    id: 1001, domain: 1, type: "recall",
    q: "A user with cataracts struggles primarily with which aspect of vision?",
    choices: {
      A: "Peripheral vision loss creating a tunnel effect",
      B: "Clarity — vision becomes cloudy, frosted, or hazy",
      C: "Distinguishing red from green hues",
      D: "Sudden episodic vision loss with aura"
    },
    answer: "B",
    why: {
      A: "That describes glaucoma, not cataracts.",
      B: "Correct — cataracts are a clarity problem; the lens becomes blurry and colors appear faded.",
      C: "That describes red-green color vision deficiency.",
      D: "That describes a migraine aura, not cataracts."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1002, domain: 1, type: "analysis",
    q: "Why is glaucoma sometimes called the 'silent thief of the night'?",
    choices: {
      A: "Because it primarily affects night vision before day vision",
      B: "Because it causes sudden total blindness without warning",
      C: "Because peripheral vision is lost gradually before people notice",
      D: "Because damage is fully reversible if caught early"
    },
    answer: "C",
    why: {
      A: "The notes don't characterize glaucoma as a night-vision condition.",
      B: "Glaucoma progresses gradually, not suddenly.",
      C: "Correct — it takes out peripheral vision and progresses toward center, so people don't notice until significant damage has occurred.",
      D: "Damage from glaucoma is NOT reversible per the notes — progression can only be slowed."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1003, domain: 1, type: "recall",
    q: "What percentage of males have red-green color vision deficiency?",
    choices: { A: "0.5%", B: "3.5%", C: "8%", D: "16%" },
    answer: "C",
    why: {
      A: "0.5% is the figure for females, not males.",
      B: "3.5% is the proportion of the world's population with low vision.",
      C: "Correct — red-green color vision defects occur in 8% of males.",
      D: "16% is the WHO figure for total disability prevalence."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1004, domain: 1, type: "recall",
    q: "Approximately what percentage of the world's population is deaf or hard of hearing?",
    choices: { A: "1%", B: "3.5%", C: "6.1%", D: "11%" },
    answer: "C",
    why: {
      A: "1% is roughly the prevalence of autism spectrum disorder.",
      B: "3.5% is the share of the world's population with low vision.",
      C: "Correct — about 466 million people, or 6.1% of the world's population.",
      D: "11% is the US CDC figure for adults with mobility disabilities."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1005, domain: 1, type: "application",
    q: "A deafblind user is consuming a recorded lecture. Which format do they typically prefer, and why?",
    choices: {
      A: "Captions, because they are synchronized with the video timing",
      B: "Audio description, because it narrates visual content",
      C: "Transcripts, because they can be consumed via a braille display at the user's own pace",
      D: "Sign language interpretation embedded in the video"
    },
    answer: "C",
    why: {
      A: "Captions are time-synced; braille users cannot keep up with that pace.",
      B: "Audio description is for blind/low-vision users with hearing; a deafblind user cannot hear it.",
      C: "Correct — deafblind users prefer transcripts because braille displays let them read at their own pace.",
      D: "A deafblind user cannot see signed interpretation on screen."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1006, domain: 1, type: "analysis",
    q: "Why does concise link text matter MORE for braille users than for typical screen reader users?",
    choices: {
      A: "Braille displays cannot render punctuation reliably",
      B: "Braille displays are typically only 40 or 80 characters wide",
      C: "Braille users navigate by headings only, never by links",
      D: "Verbose link text crashes most braille hardware"
    },
    answer: "B",
    why: {
      A: "The notes don't mention any punctuation rendering limitation.",
      B: "Correct — verbose labels are tedious to read one line at a time on a 40 or 80 character display.",
      C: "Not stated; braille users absolutely use links.",
      D: "Hardware crashes are not mentioned in the notes."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1007, domain: 1, type: "recall",
    q: "Which type of AAC device requires NO literacy from its user?",
    choices: {
      A: "Alphabet-based systems using spelling and letter codes",
      B: "Semantic compaction using multi-meaning icons",
      C: "Single-meaning picture systems",
      D: "Text-to-speech keyboards"
    },
    answer: "C",
    why: {
      A: "Alphabet-based systems require basic literacy.",
      B: "Semantic compaction requires training to combine 1-2 symbols per word.",
      C: "Correct — each picture represents a single word, making them the simplest to use without literacy.",
      D: "Text-to-speech keyboards inherently require literacy to type."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1008, domain: 1, type: "recall",
    q: "According to the US CDC, what percentage of US adults have mobility disabilities?",
    choices: { A: "3%", B: "8%", C: "11%", D: "16%" },
    answer: "C",
    why: {
      A: "3% is roughly the lower bound for dyscalculia prevalence.",
      B: "8% is the prevalence of red-green color vision deficiency in males.",
      C: "Correct — 11 percent of US adults have mobility disabilities, per the CDC.",
      D: "16% is the WHO global figure for total disability prevalence."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1009, domain: 1, type: "recall",
    q: "Per the AAIDD criteria cited in the notes, which is NOT a criterion for intellectual disability?",
    choices: {
      A: "IQ below 70-75",
      B: "Impairments in adaptive behavior",
      C: "The condition manifests in childhood",
      D: "A documented genetic mutation"
    },
    answer: "D",
    why: {
      A: "IQ below 70-75 is one of the three criteria listed.",
      B: "Impairments in adaptive behavior (daily, social, communication, school/work skills) is a criterion.",
      C: "Manifestation in childhood is the third criterion.",
      D: "Correct — the notes list only IQ, adaptive behavior, and childhood onset; no genetic test is required."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1010, domain: 1, type: "recall",
    q: "Approximately what share of people with reading difficulties have some form of dyslexia?",
    choices: { A: "20-30%", B: "40-50%", C: "70-80%", D: "Over 95%" },
    answer: "C",
    why: {
      A: "Too low — the notes specifically cite the 70-80% figure.",
      B: "Too low — the notes specifically cite the 70-80% figure.",
      C: "Correct — of people with reading difficulties, 70-80% are likely to have some form of dyslexia.",
      D: "Too high — the figure cited is 70-80%."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1011, domain: 1, type: "recall",
    q: "After back pain, what is the world's second most common disability?",
    choices: { A: "Depression", B: "Migraine disease", C: "Hearing loss", D: "Arthritis" },
    answer: "B",
    why: {
      A: "Mood disorders affect about 1 in 8 people but are not described as the #2 disability.",
      B: "Correct — migraine disease is described as the world's second most common disability after back pain.",
      C: "Hearing loss affects about 6.1% but is not ranked second globally in the notes.",
      D: "Arthritis is mentioned as a cause of conditions but not as the #2 disability."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1012, domain: 1, type: "recall",
    q: "Flashing or flickering lights are MOST likely to trigger photosensitive seizures at what rate?",
    choices: {
      A: "1-2 times per second",
      B: "3-10 times per second",
      C: "16-25 times per second",
      D: "Over 60 times per second"
    },
    answer: "C",
    why: {
      A: "Below the most-likely trigger range cited in the notes.",
      B: "Some people are sensitive as low as 3/sec, but the most likely trigger range is higher.",
      C: "Correct — lights that flash between 16 and 25 times a second are the most likely to trigger seizures.",
      D: "Some people are sensitive up to 60/sec, but that is the upper edge, not the most-likely range."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1013, domain: 1, type: "application",
    q: "A coworker has a seizure that has lasted six minutes. According to disability etiquette guidance, what should you do?",
    choices: {
      A: "Restrain their limbs to prevent injury",
      B: "Give them water once movements slow",
      C: "Call an ambulance",
      D: "Move them to a quiet room immediately"
    },
    answer: "C",
    why: {
      A: "The notes explicitly say don't restrain their movements.",
      B: "The notes say don't give anything to eat or drink until the person is recovered.",
      C: "Correct — if a seizure lasts more than 5 minutes, call an ambulance.",
      D: "The notes say don't move the person."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1014, domain: 1, type: "recall",
    q: "Eli Chadwick, a software engineer with chronic RSI, uses which combination of assistive technologies?",
    choices: {
      A: "Screen reader and refreshable braille display",
      B: "Eye tracking, voice control, and ergonomic keyboard/mouse",
      C: "Sip-and-puff switch and head wand",
      D: "AAC device and word prediction software"
    },
    answer: "B",
    why: {
      A: "Screen readers and braille are for vision-related needs, not RSI.",
      B: "Correct — he uses a customized combination of eye tracking, voice control, and an ergonomic keyboard and mouse.",
      C: "Not the combination described in the notes for Eli.",
      D: "AAC devices are for speech disabilities, not RSI."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1015, domain: 1, type: "recall",
    q: "Globally, about how many people are estimated to have seizure disorders?",
    choices: { A: "About 2.8 million", B: "About 17 million", C: "About 65 million", D: "About 200 million" },
    answer: "C",
    why: {
      A: "2.8 million is the global estimate for people living with MS.",
      B: "17 million is the global figure for people with cerebral palsy.",
      C: "Correct — about 65 million people, or 1 in 26, have seizure disorders worldwide.",
      D: "200 million is the estimate for people with intellectual disability."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1016, domain: 1, type: "analysis",
    q: "What distinguishes an 'accommodation' from a feature that an organization is required to provide under disability law?",
    choices: {
      A: "Accommodations always require formal documentation regardless of context",
      B: "An accommodation is NOT required if it would cause undue burden or a fundamental alteration",
      C: "Accommodations apply only in education, not employment",
      D: "Accommodations are voluntary and never legally protected"
    },
    answer: "B",
    why: {
      A: "Formal accommodations require documentation, but the defining limit is undue burden, not paperwork.",
      B: "Correct — accommodations are not required if they impose undue burden/hardship or fundamentally alter the service.",
      C: "The notes give examples in both education and the workplace.",
      D: "Accommodations are protected by legislation that varies by country."
    },
    cite: "Bear: #a11y/disabilities"
  },

  // ===== DOMAIN 2: Accessibility / UD / ICT / UX =====
  {
    id: 1017, domain: 2, type: "recall",
    q: "Which is NOT one of the four phases of user-centered design as listed in the notes?",
    choices: {
      A: "Understand the users and their context",
      B: "Identify user and business requirements",
      C: "Market the solution to stakeholders",
      D: "Evaluate the solution against the context and requirements"
    },
    answer: "C",
    why: {
      A: "This is the first phase.",
      B: "This is the second phase.",
      C: "Correct — marketing is not one of the four UCD phases listed.",
      D: "This is the fourth phase."
    },
    cite: "Bear: #a11y/uxdesign"
  },
  {
    id: 1018, domain: 2, type: "analysis",
    q: "What does 'reducing cognitive load' mean in the context of usability?",
    choices: {
      A: "Reducing the bandwidth needed to load a web page",
      B: "Reducing the effort needed to think while using the product",
      C: "Reducing the number of users who must be tested",
      D: "Eliminating all images and graphics from interfaces"
    },
    answer: "B",
    why: {
      A: "Cognitive load is about mental effort, not network performance.",
      B: "Correct — cognitive load is defined as the effort needed to think.",
      C: "Unrelated to user-research sample size.",
      D: "The notes recommend multiple modalities, not removing images."
    },
    cite: "Bear: #a11y/uxdesign"
  },
  {
    id: 1019, domain: 2, type: "recall",
    q: "Who first developed the principles of universal design?",
    choices: {
      A: "Ronald Mace, an architect",
      B: "Tim Berners-Lee, computer scientist",
      C: "The W3C Web Accessibility Initiative",
      D: "The United Nations General Assembly"
    },
    answer: "A",
    why: {
      A: "Correct — the principles of universal design were first developed by architect Ronald Mace.",
      B: "Tim Berners-Lee is associated with the WWW, not UD principles.",
      C: "The W3C develops WCAG, not the UD principles.",
      D: "The UN drafted the UDHR and CRPD, not the UD principles."
    },
    cite: "Bear: #a11y/uxdesign"
  },
  {
    id: 1020, domain: 2, type: "application",
    q: "Curb cuts in sidewalks and providing closed captions on videos are both examples of which UD principle?",
    choices: {
      A: "Flexibility in use",
      B: "Equitable use",
      C: "Tolerance for error",
      D: "Low physical effort"
    },
    answer: "B",
    why: {
      A: "Flexibility in use is about accommodating diverse preferences, e.g. left/right handed.",
      B: "Correct — both examples provide the same means of use for all users without segregation or stigma.",
      C: "Tolerance for error is about preventing/recovering from mistakes (e.g., date pickers).",
      D: "Low physical effort relates to minimizing fatigue (e.g., lever handles)."
    },
    cite: "Bear: #a11y/uxdesign"
  },
  {
    id: 1021, domain: 2, type: "application",
    q: "Supporting review and correction of form data before submission and using a date picker to enforce format are examples of which UD principle?",
    choices: {
      A: "Perceptible information",
      B: "Simple and intuitive use",
      C: "Tolerance for error",
      D: "Size and space for approach and use"
    },
    answer: "C",
    why: {
      A: "Perceptible information is about communicating regardless of sensory ability (e.g., alt text).",
      B: "Simple and intuitive use is about eliminating unnecessary complexity.",
      C: "Correct — both examples minimize adverse consequences of unintended actions.",
      D: "Size and space is about physical reach and target dimensions."
    },
    cite: "Bear: #a11y/uxdesign"
  },
  {
    id: 1022, domain: 2, type: "recall",
    q: "Which principle of Universal Design for Learning answers the learner's question 'Why should I learn this?'",
    choices: {
      A: "Multiple means of representation",
      B: "Multiple means of action and expression",
      C: "Multiple means of engagement",
      D: "Multiple means of assessment"
    },
    answer: "C",
    why: {
      A: "Representation answers 'What am I learning?' via the recognition network.",
      B: "Action and expression answers 'How can I learn and show I understand?'",
      C: "Correct — engagement uses the affective/caring network and addresses the 'why' of learning.",
      D: "Not one of the three UDL principles in the notes."
    },
    cite: "Bear: #a11y/uxdesign"
  },
  {
    id: 1023, domain: 2, type: "recall",
    q: "Which ISO standard do the notes recommend for the built environment?",
    choices: { A: "ISO 9001", B: "ISO 21542", C: "ISO 14001", D: "ISO 27001" },
    answer: "B",
    why: {
      A: "ISO 9001 is for quality management.",
      B: "Correct — built environments should meet ISO 21542.",
      C: "ISO 14001 is for environmental management.",
      D: "ISO 27001 is for information security."
    },
    cite: "Bear: #a11y/uxdesign"
  },
  {
    id: 1024, domain: 2, type: "recall",
    q: "The EU Web Accessibility Directive references which technical standard?",
    choices: {
      A: "Section 508",
      B: "EN 301 549, which aligns with WCAG 2.1 AA",
      C: "ISO 21542",
      D: "PDF/UA only"
    },
    answer: "B",
    why: {
      A: "Section 508 is the US standard, not the EU's.",
      B: "Correct — the Directive refers to EN 301 549, which aligns with WCAG 2.1 AA.",
      C: "ISO 21542 covers the built environment, not the Web Accessibility Directive.",
      D: "PDF/UA is a document standard, not the directive's referenced standard."
    },
    cite: "Bear: #a11y/ict"
  },
  {
    id: 1025, domain: 2, type: "recall",
    q: "Under the ADA, which Title covers e-commerce websites and public mobile applications of private businesses?",
    choices: {
      A: "Title I (employment)",
      B: "Title II (state and local government)",
      C: "Title III (private places open to the public)",
      D: "Title VII (religious discrimination)"
    },
    answer: "C",
    why: {
      A: "Title I covers employment discrimination, not e-commerce sites.",
      B: "Title II covers state and local government, including their websites.",
      C: "Correct — Title III covers private places that welcome the public, including e-commerce and public mobile apps.",
      D: "Title VII (Civil Rights Act) covers religious discrimination, not ADA Title III scope."
    },
    cite: "Bear: #a11y/ict"
  },
  {
    id: 1026, domain: 2, type: "recall",
    q: "What is a VPAT?",
    choices: {
      A: "A US federal certification mark for accessible products",
      B: "A template for documenting how an ICT product meets accessibility standards",
      C: "An automated WCAG testing tool",
      D: "A type of assistive technology for low vision users"
    },
    answer: "B",
    why: {
      A: "VPAT is not a federal certification mark.",
      B: "Correct — the Voluntary Product Accessibility Template documents how well an ICT product meets accessibility standards.",
      C: "It is documentation, not a testing tool.",
      D: "It is not assistive technology."
    },
    cite: "Bear: #a11y/ict"
  },
  {
    id: 1027, domain: 2, type: "analysis",
    q: "According to the notes, automated accessibility checkers catch approximately what share of defects?",
    choices: { A: "About 25%", B: "About 50%", C: "About 75%", D: "Nearly 100%" },
    answer: "A",
    why: {
      A: "Correct — automated checkers catch about 25% of defects, so human evaluation is critical.",
      B: "Higher than the figure cited in the notes.",
      C: "Higher than the figure cited in the notes.",
      D: "The notes specifically warn against relying solely on automated checkers."
    },
    cite: "Bear: #a11y/org-integration"
  },
  {
    id: 1028, domain: 2, type: "recall",
    q: "When did the European Accessibility Act come into full force, applying to both public and private sectors?",
    choices: { A: "2018", B: "2020", C: "2024", D: "2025" },
    answer: "D",
    why: {
      A: "2018 is when the EU Web Accessibility Directive took effect.",
      B: "Not the date specified in the notes.",
      C: "2024 is when the African Disability Rights Protocol came into force.",
      D: "Correct — the European Accessibility Act came into full force in 2025."
    },
    cite: "Bear: #a11y/ict"
  },
  {
    id: 1029, domain: 2, type: "application",
    q: "A government agency in the United States is procuring a content management system. Which standard primarily governs its ICT accessibility requirements?",
    choices: {
      A: "ADA Title III",
      B: "Section 508, which uses WCAG as its conformance criteria",
      C: "EN 301 549",
      D: "ISO 21542"
    },
    answer: "B",
    why: {
      A: "ADA Title III covers private businesses, not federal ICT procurement.",
      B: "Correct — Section 508 governs ICT developed, procured, maintained, or used by US federal agencies and uses WCAG criteria.",
      C: "EN 301 549 is the EU standard.",
      D: "ISO 21542 governs the built environment."
    },
    cite: "Bear: #a11y/legal"
  },

  // ===== DOMAIN 3: Standards / Laws / Mgmt / Society =====
  {
    id: 1030, domain: 3, type: "recall",
    q: "According to the WHO, approximately how many people experience significant disability worldwide?",
    choices: {
      A: "About 200 million (3% of the population)",
      B: "About 800 million (10% of the population)",
      C: "About 1.3 billion (16% of the population)",
      D: "About 2 billion (25% of the population)"
    },
    answer: "C",
    why: {
      A: "200 million is roughly the estimate for intellectual disability alone.",
      B: "Lower than the WHO estimate cited in the notes.",
      C: "Correct — WHO estimates 1.3 billion people, or 16%, or 1 in 6.",
      D: "Higher than the WHO estimate cited in the notes."
    },
    cite: "Bear: #a11y/stats"
  },
  {
    id: 1031, domain: 3, type: "recall",
    q: "According to the UN Fact Sheet, the global literacy rate for adults with disabilities is as low as what figure?",
    choices: { A: "3%", B: "16%", C: "33%", D: "50%" },
    answer: "A",
    why: {
      A: "Correct — the global literacy rate is as low as 3% for adults with disabilities, and 1% for women with disabilities.",
      B: "16% is the WHO overall disability prevalence figure.",
      C: "Not the figure cited.",
      D: "Far higher than the figure cited."
    },
    cite: "Bear: #a11y/stats"
  },
  {
    id: 1032, domain: 3, type: "recall",
    q: "The World Bank estimates that what share of the world's poorest people have some kind of disability?",
    choices: { A: "5%", B: "10%", C: "20%", D: "50%" },
    answer: "C",
    why: {
      A: "Lower than the World Bank estimate.",
      B: "Lower than the World Bank estimate.",
      C: "Correct — the World Bank estimates 20% of the world's poorest people have some kind of disability.",
      D: "Higher than the figure cited."
    },
    cite: "Bear: #a11y/disabilities-challenges-at"
  },
  {
    id: 1033, domain: 3, type: "recall",
    q: "What share of children with disabilities in developing countries do NOT attend school?",
    choices: { A: "20%", B: "50%", C: "75%", D: "90%" },
    answer: "D",
    why: {
      A: "Far lower than the UN figure.",
      B: "Lower than the UN figure.",
      C: "Lower than the UN figure.",
      D: "Correct — 90% of children with disabilities in developing countries do not attend school."
    },
    cite: "Bear: #a11y/stats"
  },
  {
    id: 1034, domain: 3, type: "recall",
    q: "The CRPD (Convention on the Rights of Persons with Disabilities) was adopted by the UN in what year?",
    choices: { A: "1948", B: "1990", C: "2006", D: "2010" },
    answer: "C",
    why: {
      A: "1948 is when the Universal Declaration of Human Rights was drafted.",
      B: "1990 is when the ADA was passed.",
      C: "Correct — the CRPD is the 2006 UN Convention and is the first binding international instrument protecting people with disabilities.",
      D: "Not the year cited for the CRPD."
    },
    cite: "Bear: #a11y/legal"
  },
  {
    id: 1035, domain: 3, type: "recall",
    q: "Which article of the CRPD specifically addresses accessibility?",
    choices: { A: "Article 1", B: "Article 9", C: "Article 14", D: "Article 21" },
    answer: "B",
    why: {
      A: "Article 1 states the convention's overall purpose.",
      B: "Correct — Article 9 covers accessibility to the physical environment, transportation, ICT, and other public facilities.",
      C: "Not the accessibility article per the notes.",
      D: "Not the accessibility article per the notes."
    },
    cite: "Bear: #a11y/legal"
  },
  {
    id: 1036, domain: 3, type: "recall",
    q: "What is the purpose of the Marrakesh Treaty?",
    choices: {
      A: "To create global standards for assistive technologies",
      B: "To ensure people with print disabilities have access to books and printed materials",
      C: "To regulate ICT procurement across signatory states",
      D: "To prohibit employment discrimination against people with disabilities"
    },
    answer: "B",
    why: {
      A: "The treaty is about print access, not AT standards generally.",
      B: "Correct — the Marrakesh Treaty facilitates access to published works for people who are blind, visually impaired, or otherwise print disabled.",
      C: "Not the scope of the Marrakesh Treaty.",
      D: "Employment is addressed by other instruments like the EU Employment Equality Directive."
    },
    cite: "Bear: #a11y/legal"
  },
  {
    id: 1037, domain: 3, type: "recall",
    q: "The Accessible Canada Act aims to create a barrier-free Canada by what year?",
    choices: { A: "2025", B: "2030", C: "2040", D: "2050" },
    answer: "C",
    why: {
      A: "Not the target year cited in the notes.",
      B: "2030 is the UN's Sustainable Development Agenda target year, not the ACA's.",
      C: "Correct — the ACA aims to create a barrier-free Canada by 2040.",
      D: "Not the target year cited."
    },
    cite: "Bear: #a11y/rights"
  },
  {
    id: 1038, domain: 3, type: "analysis",
    q: "Which is NOT one of the priority areas of the Accessible Canada Act as listed in the notes?",
    choices: {
      A: "Employment",
      B: "The built environment",
      C: "Healthcare service delivery",
      D: "Procurement of goods, services, and facilities"
    },
    answer: "C",
    why: {
      A: "Employment is explicitly listed.",
      B: "The built environment is explicitly listed.",
      C: "Correct — healthcare is not among the ACA's priority areas in the notes; transportation, ICT, and program design are.",
      D: "Procurement is explicitly listed."
    },
    cite: "Bear: #a11y/rights"
  },
  {
    id: 1039, domain: 3, type: "recall",
    q: "The UK's Equality Act 2010 lists protected characteristics. Which of the following is NOT one of them per the notes?",
    choices: {
      A: "Disability",
      B: "Marriage and civil partnership",
      C: "Citizenship status",
      D: "Gender reassignment"
    },
    answer: "C",
    why: {
      A: "Disability is explicitly a protected characteristic.",
      B: "Marriage and civil partnership is explicitly listed.",
      C: "Correct — citizenship status is not among the listed protected characteristics in the notes.",
      D: "Gender reassignment is explicitly listed."
    },
    cite: "Bear: #a11y/rights"
  },
  {
    id: 1040, domain: 3, type: "recall",
    q: "Which US law updates federal communications law to require accessibility of modern communications and video programming?",
    choices: {
      A: "Section 508 of the Rehabilitation Act",
      B: "The Twenty-First Century Communications and Video Accessibility Act (CVAA) of 2010",
      C: "Air Carrier Access Amendments Act of 2017",
      D: "ADA Title II"
    },
    answer: "B",
    why: {
      A: "Section 508 governs ICT in federal agencies, not communications/video broadly.",
      B: "Correct — the CVAA of 2010 updates federal communications law to require accessibility of communications and video programming.",
      C: "That act applies to air transportation, not communications.",
      D: "Title II covers state and local government services, not the CVAA's scope."
    },
    cite: "Bear: #a11y/rights"
  },
  {
    id: 1041, domain: 3, type: "recall",
    q: "In the Accessibility Maturity Model used with the Accessible Technology Charter, what does level 3 ('Repeatable') mean?",
    choices: {
      A: "No documentation or process in place",
      B: "Documented but not actioned",
      C: "Process established and actioned consistently",
      D: "Innovate, improve, and share"
    },
    answer: "C",
    why: {
      A: "That describes level 1, Informal.",
      B: "That describes level 2, Defined.",
      C: "Correct — level 3, Repeatable, means the process is established and actioned consistently.",
      D: "That describes level 5, Best practice."
    },
    cite: "Bear: #a11y/org-integration"
  },
  {
    id: 1042, domain: 3, type: "recall",
    q: "Which is NOT one of the four phases of the organizational ICT accessibility plan described in the notes?",
    choices: { A: "Initiate", B: "Plan", C: "Implement", D: "Certify" },
    answer: "D",
    why: {
      A: "Initiate is the first phase.",
      B: "Plan is the second phase.",
      C: "Implement is the third phase.",
      D: "Correct — the four phases are Initiate, Plan, Implement, and Sustain; Certify is not one of them."
    },
    cite: "Bear: #a11y/org-integration"
  },
  {
    id: 1043, domain: 3, type: "recall",
    q: "According to the W3C business case excerpted in the notes, the global extended market for people with disabilities has estimated annual disposable income of approximately how much?",
    choices: { A: "$600 billion", B: "$1 trillion", C: "$6 trillion", D: "$13 trillion" },
    answer: "C",
    why: {
      A: "Lower than the W3C figure cited.",
      B: "Lower than the W3C figure cited.",
      C: "Correct — globally, the extended market is estimated to have $6 trillion in annual disposable income.",
      D: "Higher than the W3C figure cited."
    },
    cite: "Bear: #a11y/society"
  },
  {
    id: 1044, domain: 3, type: "analysis",
    q: "Which best describes the difference between people-first and identity-first language?",
    choices: {
      A: "People-first is for adults; identity-first is for children",
      B: "People-first emphasizes the person; identity-first treats the disability as a key part of identity",
      C: "Identity-first is always offensive and should be avoided",
      D: "People-first is required by the CRPD and identity-first is banned"
    },
    answer: "B",
    why: {
      A: "Age has nothing to do with the distinction.",
      B: "Correct — 'a person with a disability' emphasizes the person; 'a disabled person' or 'a Deaf person' centers disability as identity.",
      C: "Identity-first is often used by self-advocates within disability communities.",
      D: "The CRPD uses people-first language but does not ban identity-first."
    },
    cite: "Bear: #a11y/disabilities-challenges-at"
  },
  {
    id: 1045, domain: 3, type: "application",
    q: "Which of the following is an OUTDATED or offensive term that should be avoided per the notes?",
    choices: { A: "Person who uses a wheelchair", B: "Deaf person (capital D)", C: "Handicapped", D: "Person with a disability" },
    answer: "C",
    why: {
      A: "This is an example of acceptable people-first language.",
      B: "Deaf with a capital D indicates identity with Deaf culture and is acceptable.",
      C: "Correct — 'handicapped' is listed among outdated/offensive terms alongside 'crippled', 'suffers from', 'invalid'.",
      D: "This is the canonical people-first construction."
    },
    cite: "Bear: #a11y/disabilities-challenges-at"
  },
  {
    id: 1046, domain: 3, type: "recall",
    q: "In countries with life expectancies over 70 years, people spend on average how many years living with disabilities?",
    choices: { A: "2 years", B: "4 years", C: "8 years", D: "15 years" },
    answer: "C",
    why: {
      A: "Lower than the figure cited.",
      B: "Lower than the figure cited.",
      C: "Correct — people spend an average of 8 years living with disabilities in those countries.",
      D: "Higher than the figure cited."
    },
    cite: "Bear: #a11y/disabilities-challenges-at"
  },
  {
    id: 1047, domain: 3, type: "recall",
    q: "The Inter-American Convention on the Elimination of All Forms of Discrimination Against Persons with Disabilities was adopted in what year and location?",
    choices: {
      A: "1990, Washington DC",
      B: "1999, Guatemala",
      C: "2006, New York",
      D: "2018, Addis Ababa"
    },
    answer: "B",
    why: {
      A: "1990 is the year of the ADA, not the Inter-American Convention.",
      B: "Correct — it was adopted in 1999 in Guatemala as the first regional binding treaty expressly prohibiting disability discrimination.",
      C: "2006 New York is associated with the UN CRPD.",
      D: "2018 is when the African Union adopted the African Disability Rights Protocol."
    },
    cite: "Bear: #a11y/rights"
  },

  // From #cpacc/practice (past practice questions the user has worked through)
  {
    id: 1048, domain: 1, type: "recall",
    q: "The WHO's International Classification of Functioning, Disability and Health (ICF) is derived from which model?",
    choices: {
      A: "Medical model",
      B: "Social model",
      C: "Economic model",
      D: "Biopsychosocial model"
    },
    answer: "D",
    why: {
      A: "The medical model frames disability as an individual problem; ICF is broader.",
      B: "The social model attributes disability to societal barriers; ICF integrates multiple models.",
      C: "The economic model centers on work/income; ICF is not derived from it.",
      D: "Correct — ICF (WHO, 2002) integrates biological, psychological, and social factors, derived from the biopsychosocial model."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1049, domain: 1, type: "analysis",
    q: "A weakness of the economic model of disability is that it:",
    choices: {
      A: "Focuses too much on technological innovation",
      B: "Creates a legally defined category that can be stigmatizing, and people may not meet the threshold",
      C: "Ignores the medical aspects of disability",
      D: "Can be condescending toward people with disabilities"
    },
    answer: "B",
    why: {
      A: "Tech focus is associated with the Functional Solutions Model, not the economic model.",
      B: "Correct — the economic model creates a legally defined category of 'needy' people, which can stigmatize and exclude those who don't meet the threshold.",
      C: "Ignoring medical aspects isn't the economic model's hallmark weakness.",
      D: "Condescension is more characteristic of the Charity Model."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1050, domain: 1, type: "recall",
    q: "The social identity or cultural affiliation model of disability is most evident among which group?",
    choices: {
      A: "People with low vision",
      B: "People with cognitive disabilities",
      C: "People with mobility impairments",
      D: "People who are deaf"
    },
    answer: "D",
    why: {
      A: "Low vision is not the prototypical example for this model.",
      B: "Cognitive disabilities are not the BoK's example.",
      C: "Mobility impairments are not the BoK's example.",
      D: "Correct — Deaf culture and identity, a close-knit linguistic minority, is the canonical example of disability as a point of pride."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1051, domain: 1, type: "recall",
    q: "According to WHO statistics, approximately how many people globally have vision impairment or blindness?",
    choices: {
      A: "2.2 billion",
      B: "3.5 billion",
      C: "500 million",
      D: "1 billion"
    },
    answer: "A",
    why: {
      A: "Correct — WHO reports at least 2.2 billion people globally have vision impairment or blindness.",
      B: "3.5 billion overstates the figure.",
      C: "500 million understates the figure.",
      D: "1 billion is closer to the subset with conditions that could have been prevented or addressed, not the total."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1052, domain: 1, type: "recall",
    q: "Central Auditory Processing Disorder (APD) is best described as:",
    choices: {
      A: "Complete hearing loss in both ears",
      B: "Greater than expected difficulty hearing and understanding speech despite normal hearing sensitivity",
      C: "Loss of hearing due to aging",
      D: "Difficulty with balance and spatial orientation"
    },
    answer: "B",
    why: {
      A: "That describes total deafness, not APD.",
      B: "Correct — APD is an inability to interpret/organize what is heard, despite measurably normal hearing.",
      C: "That describes presbycusis (age-related hearing loss).",
      D: "That describes vestibular dysfunction, not APD."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1053, domain: 1, type: "recall",
    q: "Which speech disability involves weak muscles used for speech due to damage in the nervous system?",
    choices: {
      A: "Cluttering",
      B: "Apraxia",
      C: "Dysarthria",
      D: "Stuttering"
    },
    answer: "C",
    why: {
      A: "Cluttering is a fluency disorder involving rapid/disorganized speech, not muscle weakness.",
      B: "Apraxia is a coordination/planning issue, not muscle weakness.",
      C: "Correct — Dysarthria is a motor speech disability from neurological injury causing weak speech muscles.",
      D: "Stuttering is a fluency disorder, not muscle weakness."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1054, domain: 2, type: "analysis",
    q: "Key ICT accessibility solutions for people with cognitive disabilities include all of the following EXCEPT:",
    choices: {
      A: "Audio descriptions for video content",
      B: "Simplified content and distraction-free interfaces",
      C: "Enabling personalized settings for layout and time management",
      D: "Allowing adequate time to complete tasks"
    },
    answer: "A",
    why: {
      A: "Correct — audio descriptions primarily serve people with visual disabilities, not cognitive ones.",
      B: "Simplified content and reduced distractions are core cognitive a11y solutions.",
      C: "Personalization for layout and timing supports cognitive needs.",
      D: "Generous timing helps users with cognitive disabilities complete tasks."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1055, domain: 1, type: "recall",
    q: "According to the WHO, approximately how many people worldwide have epilepsy?",
    choices: {
      A: "100 million",
      B: "50 million",
      C: "5 million",
      D: "20 million"
    },
    answer: "B",
    why: {
      A: "100 million overstates the WHO figure.",
      B: "Correct — WHO reports about 50 million people have epilepsy globally, one of the most common neurological diseases.",
      C: "5 million understates the figure.",
      D: "20 million understates the figure."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1056, domain: 1, type: "recall",
    q: "What percentage of people with epilepsy have photosensitive epilepsy?",
    choices: {
      A: "Approximately 3%",
      B: "Approximately 10%",
      C: "Approximately 25%",
      D: "Approximately 50%"
    },
    answer: "A",
    why: {
      A: "Correct — about 3% of people with epilepsy have photosensitive epilepsy; flash rates of 16–25 Hz are most likely to trigger seizures.",
      B: "10% overstates the prevalence.",
      C: "25% significantly overstates the prevalence.",
      D: "50% greatly overstates the prevalence."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1057, domain: 2, type: "recall",
    q: "The 7 Principles of Universal Design were developed in 1997 by a working group led by:",
    choices: {
      A: "The European Commission",
      B: "Ronald Mace at North Carolina State University",
      C: "The United Nations Office for Disability",
      D: "Tim Berners-Lee at W3C"
    },
    answer: "B",
    why: {
      A: "The European Commission was not the originator of the 7 Principles.",
      B: "Correct — Ronald Mace led the working group at NC State's Center for Universal Design in 1997.",
      C: "The UN did not develop the 7 Principles.",
      D: "Tim Berners-Lee and W3C produced WCAG, not the 7 Principles of UD."
    },
    cite: "Bear: #cpacc/practice"
  },
  {
    id: 1058, domain: 1, type: "recall",
    q: "Per the notes, the prevalence of anxiety disorders worldwide ranges from approximately:",
    choices: {
      A: "0.5–1% by country",
      B: "2.5–7% by country",
      C: "10–15% by country",
      D: "20–30% by country"
    },
    answer: "B",
    why: {
      A: "Understates the range cited in the notes.",
      B: "Correct — the notes give 2.5–7% by country; anxiety is the most prevalent type of psychological disability.",
      C: "Overstates the range.",
      D: "Significantly overstates the range."
    },
    cite: "Bear: #a11y/disabilities"
  },
  {
    id: 1059, domain: 1, type: "recall",
    q: "Per the notes, among psychological disabilities, which is the MOST prevalent?",
    choices: {
      A: "Mood disorders (e.g., depression, bipolar)",
      B: "Psychotic disorders (e.g., schizophrenia)",
      C: "Anxiety disorders (e.g., GAD, social anxiety, panic)",
      D: "Personality disorders"
    },
    answer: "C",
    why: {
      A: "Mood disorders are common but not the most prevalent category per the notes.",
      B: "Psychotic disorders are far less prevalent than anxiety.",
      C: "Correct — the notes explicitly state anxiety is the most prevalent type of psychological disability.",
      D: "Not the BoK/notes' answer."
    },
    cite: "Bear: #a11y/disabilities"
  }
];
