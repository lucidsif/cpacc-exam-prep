/** AI provenance for the Bear-notes flashcards. Same source as BEAR_BANK. */
export const BEAR_FLASHCARDS_PROVENANCE = {
  category: 'ai-from-notes',
  label: 'AI-derived from author\'s notes',
  citations: ['Author\'s Bear notes tagged #cpacc/practice and #a11y/*'],
  generatedBy: 'Claude Sonnet 4.6',
  generatedAt: '2025-04',
  humanReview: 'Spot-checked by the author for factual alignment.',
  confidence: 'medium',
  limitations: [
    'Cards distill the author\'s notes — may not match how the BoK frames concepts.',
    'Not endorsed by IAAP.',
  ],
};

export const BEAR_FLASHCARDS = [
  {
    id: 1,
    tag: "stats",
    front: "Global disability statistics (WHO + UN)",
    back: "- 1.3 billion people (16% of world / 1 in 6) experience significant disability — world's largest minority group (WHO).\n- 80% of people with disabilities live in developing countries (UN).\n- Disability incidence is higher for women than men in most OECD countries.\n- 90% of children with disabilities in developing countries do not attend school.\n- Global adult literacy rate for people with disabilities: ~3% (1% for women with disabilities).\n- Unemployment among people with disabilities reaches 80% in some countries.\n- Inaccessible/unaffordable transportation is 15x more difficult for people with disabilities.\n- 2x risk of depression, asthma, diabetes, stroke, obesity, poor oral health."
  },
  {
    id: 2,
    tag: "stats",
    front: "Poverty, aging, and disability",
    back: "- World Bank: 20% of the world's poorest have a disability.\n- In developed countries, ~2x as many people with disabilities can't afford a protein meal every 2 days vs. those without.\n- In countries with life expectancy > 70, people spend an average of 8 years living with a disability.\n- Aging affects vision, hearing, muscle/bone strength, immunity, nerve function.\n- The first 2 goals of the UN 2030 Agenda for Sustainable Development aim to end poverty and hunger for persons with disabilities.\n- Service access barriers: healthcare, education, employment, transportation, information."
  },
  {
    id: 3,
    tag: "models",
    front: "Models of disability — name and summarize all 7",
    back: "1. Medical — disability as individual problem to be cured/fixed.\n2. Social — disability caused by societal barriers, attitudes, inaccessible environments (drives anti-discrimination law).\n3. Biopsychosocial — integrates medical + social; basis of WHO ICF (2002); originally from Engel (1977).\n4. Functional Solutions — practical; build tools/AT to overcome functional limits.\n5. Social Identity / Cultural Affiliation — disability as identity and pride; Deaf community is the canonical example.\n6. Economic — defines disability via legal/welfare categories; weakness: stigmatizing, threshold gatekeeping.\n7. Charity — pity-based; people with disabilities seen as needing help; can be condescending."
  },
  {
    id: 4,
    tag: "models",
    front: "WHO ICF — what is it and from which model?",
    back: "International Classification of Functioning, Disability and Health. Published by WHO in 2002. Derived from the Biopsychosocial model (Engel, 1977). Integrates biological (body functions/structures), psychological (individual activities), and social (participation) factors."
  },
  {
    id: 5,
    tag: "vision",
    front: "Vision impairment — global prevalence and top causes",
    back: "- 2.2B people globally have vision impairment or blindness (WHO).\n- At least 1B have a preventable or correctable condition.\n- 33M+ are blind; most are over 50.\n- ~246M (3.5%) have low vision.\n- 90% of people with vision impairment live in low-income settings.\n- #1 cause of blindness: Cataracts.\n- #2: Glaucoma."
  },
  {
    id: 6,
    tag: "vision",
    front: "Cataracts vs. Glaucoma — compare",
    back: "Cataracts: cloudy/blurry lens; faded colors, glare sensitivity. CLARITY problem. #1 cause of blindness. Treatable with surgery. Users benefit from high contrast and larger text.\n\nGlaucoma: optic nerve damage from eye pressure. Loss of peripheral vision → tunnel vision. FIELD-OF-VISION problem. 'Silent thief of the night' — irreversible damage; progression can be slowed. Users benefit from centrally located content, good focus management, and not relying on peripheral cues.\n\nBoth: benefit from zoom/reflow and high contrast."
  },
  {
    id: 7,
    tag: "vision",
    front: "Color vision deficiency — types and prevalence",
    back: "- Red-green CVD: 8% of males, 0.5% of females. Most common type.\n- Blue-yellow CVD: fewer than 1 in 10,000 people.\n- Low vision: permanently reduced vision not correctable with glasses, contacts, meds, or surgery — may need magnification, high contrast, may co-occur with CVD."
  },
  {
    id: 8,
    tag: "hearing",
    front: "Hearing disabilities — prevalence and key facts",
    back: "- ~466 million (6.1% of world) are deaf or hard of hearing.\n- Deafness = total or near-total hearing loss.\n- Deaf (capital D) signals cultural identity (Deaf community — canonical social identity / cultural affiliation model).\n- Central Auditory Processing Disorder (APD): greater-than-expected difficulty hearing/understanding speech despite normal hearing sensitivity. Issue is interpreting/organizing/analyzing, not detecting sound."
  },
  {
    id: 9,
    tag: "hearing",
    front: "Captions vs. transcripts vs. audio descriptions",
    back: "Captions: time-synced text of audio. For Deaf/HoH who can SEE.\n\nTranscripts: full text read visually or by screen reader. Preferred by deaf-blind users (consumed via braille display at their own pace). Also useful for cognitive/learning disabilities, non-native speakers, low vision, motor/dexterity, and situational.\n\nAudio descriptions: narration inserted into pauses describing visuals. For blind and low-vision, plus cognitive/learning and situational.\n\nCART = Communication Access Realtime Translation (live captioning)."
  },
  {
    id: 10,
    tag: "vision",
    front: "Deaf-blindness — prevalence and key needs",
    back: "- 0.2%–2% of people are deaf-blind.\n- Most are not completely deaf or completely blind — usually retain some hearing/vision.\n- Sensory inputs limited to touch, smell, taste.\n- Need braille (printed materials and websites via braille output).\n- Prefer transcripts over captions (can't keep up with timed captions).\n- Concise link text/labels matter — braille displays are only 40 or 80 characters wide.\n- AT: deaf-blind communicator, white cane, service animal, tactile sign language."
  },
  {
    id: 11,
    tag: "speech",
    front: "Speech disabilities — types and key distinction",
    back: "Speech ability may be unrelated to language ability — a person may read/write/understand fully.\n\nKey types:\n- Dysarthria: weak muscles used for speech due to nervous-system damage (motor speech disability).\n- Apraxia: coordination problem (not muscle weakness).\n- Stuttering: disruption in flow.\n- Cluttering: rapid/disorganized speech.\n- DLD: Developmental Language Disorder.\n\nSymptoms vary: inconsistent errors, distorted sounds, errors in tone/stress/rhythm."
  },
  {
    id: 12,
    tag: "at",
    front: "AAC — what is it and 3 categories",
    back: "Augmentative and Alternative Communication devices — for people who can't use speech as primary means.\n\n1. Single-meaning pictures (1 picture = 1 word). Simplest; no literacy required.\n2. Alphabet-based systems (spelling, letter codes). Requires basic literacy.\n3. Semantic compaction (multi-meaning icons). Short series (1–2) of symbols per word; training required."
  },
  {
    id: 13,
    tag: "motor",
    front: "Mobility / motor disabilities — categories and prevalence",
    back: "Categories:\n- Limb loss or limb disability (upper/lower)\n- Manual dexterity / fine motor challenges\n- Coordination issues across organs\n- Broken skeletal structure\n- Ambulation impairment (walking)\n- Muscle fatigue (progressive weakness, loss of mass)\n- Body size/shape (acromegaly, dwarfism, arthritis, obesity)\n\nMay be temporary or permanent; congenital, age-related, or disease-caused.\n\nPrevalence: ~11% of US adults have mobility disabilities (CDC). Similar rates in Europe and Canada."
  },
  {
    id: 14,
    tag: "motor",
    front: "Motor disabilities — assistive technologies",
    back: "Physical: walkers, canes, crutches, wheelchairs/scooters, stair lifts, elevators, grab bars, prosthetics, exoskeletons, adaptive clothing, button hooks, velcro, reach extenders.\n\nDigital: switch devices (buttons, sip-and-puff), adaptive/customizable keyboards, oversized mice/trackballs, speech input, eye tracking, bubble cursors, mouth sticks, head wands."
  },
  {
    id: 15,
    tag: "cognitive",
    front: "Intellectual disability — definition and prevalence",
    back: "AAIDD criteria (all three required):\n1. IQ below 70–75.\n2. Impairments in adaptive behavior (daily living, social, communication, school/work skills).\n3. Condition manifests in childhood.\n\nPrevalence: 1–3% of global population (~200M people)."
  },
  {
    id: 16,
    tag: "cognitive",
    front: "Learning disabilities — dyslexia, dysgraphia, dyscalculia",
    back: "Dyslexia: language-based learning disability; difficulty reading, phonological processing, spelling. 70–80% of people with reading difficulties have it. 5–10% of the population (some estimates as high as 17%). Most common cause of reading/writing/spelling difficulties.\n\nDysgraphia: difficulty with handwriting and other fine motor; written expression. Prevalence unknown.\n\nDyscalculia: math/computational disability — quantity, money, time, distance, math facts. 3–6% of people."
  },
  {
    id: 17,
    tag: "cognitive",
    front: "ADHD and Autism Spectrum Disorder — symptoms and prevalence",
    back: "ADHD: inattention, hyperactivity, impulsivity. Symptoms typically appear by age 7; not outgrown. Prevalence: 2–7% of children, ~4% of adults.\n\nASD (per WHO): range of brain developmental conditions. Impaired social behavior, communication, language; narrow interests; repetitive behaviors. Apparent in first 5 years. Co-occurring: epilepsy, depression, anxiety, ADHD. Intellectual functioning highly variable. ~1 in 100 people; prevalence rising."
  },
  {
    id: 18,
    tag: "cognitive",
    front: "Cognitive disabilities — ICT/digital solutions",
    back: "- Simplify the content.\n- Simplify and carefully organize the interface.\n- Provide info through multiple means — text, audio, images.\n- Allow adequate time to complete tasks.\n- Highlight the most important info.\n- Enable personalized settings (layout, time, content).\n- Use plain language; check for understanding.\n\nNote: Audio descriptions are NOT a cognitive solution (they're for blind/low vision)."
  },
  {
    id: 19,
    tag: "neuro",
    front: "Migraine — phases and prevalence",
    back: "World's #2 most common disability (after back pain). 14–15% of people globally.\n\nCurrent understanding: primary neuronal dysfunction (not vessel dilation). CGRPs play a key role; CGRP drugs treat/prevent.\n\nTriggers: hormones, alcohol, bright/flashing light, sleep changes, exertion, weather, certain foods/meds.\n\n4 phases:\n1. Prodrome — yawning, mood changes, cravings.\n2. Aura — visual disturbance, speech difficulty, weakness/numbness (some people).\n3. Attack — pain (often one-sided), sensory sensitivity, nausea. Hours to days.\n4. Postdrome — fatigue, confusion, sometimes elation. ~1 day."
  },
  {
    id: 20,
    tag: "neuro",
    front: "Stroke, MS, Cerebral Palsy, Vestibular — facts and prevalence",
    back: "Stroke: blocked or burst blood vessel in brain. ~15M people globally per year. Symptoms: aphasia, sudden confusion/severe headache, vision difficulty, numbness/weakness on one side, loss of coordination.\n\nMultiple Sclerosis: immune system attacks nerve coating; permanent damage. Blurry vision, cognitive issues, weakness/tingling, unsteady gait, speech trouble. ~2.8M globally.\n\nCerebral Palsy: brain injury during development affecting movement, learning, sensory, thinking. ~17M globally.\n\nVestibular disorders: inner ear / CNS problems → dizziness, vertigo. 15–20% of adults affected annually. Risk rises with age."
  },
  {
    id: 21,
    tag: "neuro",
    front: "Seizures and photosensitive epilepsy",
    back: "Seizure: sudden uncontrolled electrical disturbance in brain. Epilepsy = 2+ seizures or tendency to recurrent seizures.\n- ~65M people globally (1 in 26) have seizure disorders.\n- (WHO commonly cited at 50M with epilepsy globally.)\n\nPhotosensitive epilepsy: flashing/flickering lights or patterns trigger seizures.\n- 3% of people with epilepsy are photosensitive.\n- Most dangerous flash range: 16–25 Hz. Range of sensitivity: 3–60 Hz.\n- High-contrast or moving patterns more likely to trigger.\n- VR, video games, immersive rides especially risky.\n- People with migraine and vestibular disorders can also be triggered — avoid such content."
  },
  {
    id: 22,
    tag: "psych",
    front: "Anxiety disorders — types and prevalence",
    back: "Most prevalent psychological disability. Prevalence varies 2.5–7% by country.\n\n- Generalized Anxiety Disorder (GAD): persistent anxiety/dread for months+. Restlessness, fatigue, concentration issues, sleep problems, aches.\n- Panic Disorder: frequent, unexpected panic attacks (intense fear, racing heart, sweating, chest pain, sense of doom).\n- Social Anxiety Disorder: intense fear of being watched/judged. Self-consciousness, blushing, trembling, rigid posture."
  },
  {
    id: 23,
    tag: "psych",
    front: "Mood disorders — types and prevalence",
    back: "~1 in 8 people globally (~970 million) have a mood disorder.\n\n- Depression: lowered mood / loss of interest 2+ weeks affecting daily activities.\n- Bipolar disorder: episodes of depression alternating with mania (high energy, grand plans, risky decisions). Episodes can last weeks; may include delusions/hallucinations.\n- Seasonal Affective Disorder (SAD): depression following seasonal pattern (fall-winter or spring-summer).\n- Self-harm: deliberate physical harm, usually as coping mechanism.\n\nPsychotic disorders: schizophrenia, etc."
  },
  {
    id: 24,
    tag: "at",
    front: "Haptics — what and who they help",
    back: "Haptics use vibrations or tactile sensations for communication between people and devices/environment.\n\nExample: phone vibrates on silent for an incoming call.\n\nEspecially helpful to people with hearing and visual disabilities. Also used in deaf-blind communication."
  },
  {
    id: 25,
    tag: "legal-us",
    front: "ADA — year, structure, scope",
    back: "Americans with Disabilities Act, 1990. US civil rights law modeled the UN CRPD. Enforced by DOJ Civil Rights Division (Dept. of Education OCR for schools); EEOC for employment.\n\nGuarantees equal opportunity in: public accommodations, employment, transportation, state/local govt services, telecommunications.\n\nTitles I–V:\n- Title I: Employment (15+ employees).\n- Title II: State and local government services (including public websites).\n- Title III: Public accommodations — private places open to the public (businesses, schools, offices, medical, e-commerce, public mobile apps).\n- Title IV: Telecommunications.\n- Title V: Miscellaneous."
  },
  {
    id: 26,
    tag: "legal-us",
    front: "Section 508 — what it covers",
    back: "Section 508 of the US Rehabilitation Act of 1973.\n\n- Requires accessibility for ICT developed, procured, maintained, or used by US federal agencies.\n- Applies to federal employees and to public access to federal info/services.\n- Conformance standard: WCAG 2.0.\n- Applies ONLY to government websites (federal, and state/local government sites follow it too)."
  },
  {
    id: 27,
    tag: "legal-us",
    front: "Other US laws: CVAA, Air Carrier, 2024 ADA Title II update",
    back: "CVAA (Twenty-First Century Communications and Video Accessibility Act, 2010): updates federal communications law; requires modern communications and video programming to be accessible.\n\nAir Carrier Access Amendments Act of 2017: protects passengers with disabilities on all US airlines and foreign flights to/from US.\n\nAccessibility of Web Information and Services of State and Local Government Entities (2024): revises ADA Title II with digital content accessibility standards for state and local govts."
  },
  {
    id: 28,
    tag: "legal-international",
    front: "UN CRPD — what, when, why it matters",
    back: "United Nations Convention on the Rights of Persons with Disabilities, 2006.\n\n- First binding international human rights instrument specifically protecting people with disabilities.\n- Ratifying states must take steps to implement those rights.\n- Modeled on the US ADA (1990).\n- Article 1: Promote, protect, and ensure full and equal enjoyment of all human rights and freedoms; respect inherent dignity.\n- Article 9: Accessibility — physical environment, transportation, ICT, and other public services/facilities."
  },
  {
    id: 29,
    tag: "legal-international",
    front: "UDHR and Marrakesh Treaty",
    back: "Universal Declaration of Human Rights (UDHR): drafted by UN General Assembly in Paris, 1948. First declaration that people have fundamental human rights to be universally protected. Doesn't specifically mention disability — included under 'everyone,' 'all,' 'no one.'\n\nMarrakesh Treaty: ensures access to published works for people who are blind, visually impaired, or otherwise print-disabled."
  },
  {
    id: 30,
    tag: "legal-international",
    front: "Regional disability instruments — Africa and Americas",
    back: "African Charter on Human and People's Rights (1981): recognizes rights of all people; used to fight disability discrimination though not specifically mentioned.\n\nAfrican Disability Rights Protocol (ADRP): adopted by African Union in 2018; came into force 2024. Adds detail to CRPD — armed conflicts, forced displacement, harmful practices.\n\nInter-American Convention on the Elimination of All Forms of Discrimination Against Persons with Disabilities: adopted 1999 in Guatemala. First regional binding treaty expressly prohibiting disability discrimination. Provides clear definition of disability discrimination."
  },
  {
    id: 31,
    tag: "legal-eu",
    front: "EU Charter of Fundamental Rights and Employment Equality Directive",
    back: "Charter of Fundamental Rights of the EU: declared 2000, in force 2009. Civil, political, economic, social rights. Brings consistency to national constitutions, European Convention on Human Rights (1950), European Social Charter (1961).\n\nEmployment Equality Directive (2000): prohibits disability discrimination in employment and occupation. All EU member states have implemented in national law. Requires reasonable accommodation (unless disproportionate burden)."
  },
  {
    id: 32,
    tag: "legal-eu",
    front: "EU Web Accessibility Directive",
    back: "Took effect September 2018. Establishes minimum accessibility requirements for all public sector ICT in EU.\n\n- References EN 301 549, which aligns with WCAG 2.1 AA.\n- Covers websites, applications, mobile apps, downloadable documents.\n- Requires public sector bodies to provide and regularly update a 'detailed, comprehensive and clear' accessibility statement."
  },
  {
    id: 33,
    tag: "legal-eu",
    front: "European Accessibility Act (EAA)",
    back: "Directive (EU) 2019/882. Adopted April 2019; transposition deadline June 2022; application date June 28, 2025 (when companies must actually comply).\n\nPRIMARILY PRIVATE SECTOR — economic operators placing covered products/services on the EU market. (Public sector covered separately by Web Accessibility Directive 2016/2102.)\n\nCovered products/services: computers + OS, smartphones, TV digital broadcast equipment, ATMs/ticketing/check-in machines, e-readers, e-commerce, consumer banking, telephone services (incl. 112), audiovisual media access services, passenger transport (websites/apps/ticketing), e-books.\n\nPublic/private nuance:\n- Public bodies pulled in when acting as economic operators (e.g., public transit ticketing).\n- Member states MAY extend EAA to the public sector domestically.\n\nMicroenterprise exemption: <10 employees AND ≤€2M turnover/balance providing SERVICES are exempt from substantive requirements (still must notify authorities). Exemption is services only — microenterprises that manufacture products must still comply.\n\nTechnical standard: EN 301 549 (aligns with WCAG).\n\nQuick framing: 2016/2102 = public. 2019/882 = private."
  },
  {
    id: 34,
    tag: "legal-canada",
    front: "Accessible Canada Act",
    back: "Applies to government and federally regulated entities (banks, insurance, public transportation, telecommunications). Goal: a barrier-free Canada by 2040; expected to expand.\n\nPriority areas:\n- Employment\n- Built environment\n- Information and communication technologies (ICT)\n- Communication other than ICT\n- Procurement of goods, services, facilities\n- Design and delivery of programs and services\n- Transportation"
  },
  {
    id: 35,
    tag: "legal-eu",
    front: "UK Equality Act 2010 and Australia DDA",
    back: "UK Equality Act 2010: brings together and strengthens anti-discrimination laws. Protects against direct discrimination, discrimination arising from disability, and indirect discrimination.\n\nSection 4 — Protected characteristics: age, disability, gender reassignment, marriage/civil partnership, pregnancy/maternity, race, religion or belief, sex, sexual orientation.\n\nAustralia Disability Discrimination Act: makes disability discrimination unlawful. July 2025 — Attorney-General's Dept. announced a review to modernize and strengthen it."
  },
  {
    id: 36,
    tag: "legal-us",
    front: "Accommodation vs. Accessibility — key distinction",
    back: "Accommodation: individualized modifications for a specific person with a disability so they have equal access. Requires documentation from a licensed professional. Protected by legislation (varies by country). NOT required if it imposes undue burden/hardship or requires fundamental alteration.\n\nAccessibility: conditions/requirements met regardless of any individual's disability status — universal by design. Section 508 follows this approach.\n\nReasonable accommodation (EU Employment Equality Directive description): employers must take appropriate measures unless disproportionate burden."
  },
  {
    id: 37,
    tag: "ud-principles",
    front: "Universal Design — origin and definition",
    back: "Principles developed in 1997 by a working group of architects, product designers, engineers, and environmental design researchers led by Ronald Mace at North Carolina State University (NCSU).\n\nDefinition: 'The design of products and environments to be usable by all people, to the greatest extent possible, without the need for adaptation or specialized design.'\n\nSynonyms / related: inclusive design, design for all, human-centered design, lifespan design."
  },
  {
    id: 38,
    tag: "ud-principles",
    front: "7 Principles of Universal Design",
    back: "1. Equitable use — useful and marketable to people with diverse abilities; no segregation.\n2. Flexibility in use — accommodates range of preferences (left/right hand, pace).\n3. Simple and intuitive use — easy to understand regardless of experience, knowledge, language, concentration.\n4. Perceptible information — communicates effectively regardless of ambient conditions or user sensory abilities; redundant pictorial/verbal/tactile.\n5. Tolerance for error — minimizes hazards and adverse consequences of accidental actions; fail-safes.\n6. Low physical effort — efficient, comfortable, minimum fatigue; neutral body position.\n7. Size and approach for use — appropriate size/space for approach, reach, manipulation regardless of body size, posture, mobility."
  },
  {
    id: 39,
    tag: "ud-principles",
    front: "Universal Design for Learning (UDL) — 3 principles",
    back: "1. Multiple means of REPRESENTATION — recognition networks; the 'what' of learning. Don't depend on single sense; support comprehension.\n2. Multiple means of ACTION AND EXPRESSION — strategic networks; the 'how.' Learners vary in how they show what they know.\n3. Multiple means of ENGAGEMENT — affective / caring & prioritizing networks; the 'why.' Spark curiosity; motivation; self-reflection."
  },
  {
    id: 40,
    tag: "ux",
    front: "User-Centered Design — 4 phases",
    back: "Iterative process that puts people at the center of design of products, services, environments.\n\n1. Understand users and their context of use.\n2. Identify user and business requirements.\n3. Design a solution.\n4. Evaluate the solution against context and requirements.\n\nRepeats until product design is complete."
  },
  {
    id: 41,
    tag: "ux",
    front: "Usability, UX, and Cognitive Load",
    back: "Usability — ease of use. Three aspects:\n- Interface easy to use\n- Easy to achieve the goal\n- Easy to learn (easier next time)\n\nA highly usable product reduces COGNITIVE LOAD (the effort needed to think). Reduce it by: providing only needed info, clear language, removing distractions, simplifying, user research, following accessibility/UD standards.\n\nUser Experience — entire JOURNEY with a product: awareness, acquisition, first use, subsequent use, feelings about it."
  },
  {
    id: 42,
    tag: "ux",
    front: "Integrating accessibility into design",
    back: "1. Incorporate real (not theoretical) people with disabilities.\n2. Ensure everyone on a project understands needs of people with disabilities.\n3. Include users with disabilities throughout the design process.\n4. Have users with disabilities evaluate accessibility.\n\nFor ICT, follow WCAG. For built environments, follow ISO 21542."
  },
  {
    id: 43,
    tag: "ict",
    front: "WCAG, EN 301 549, VPAT — conformance documents",
    back: "WCAG: Web Content Accessibility Guidelines (W3C). Section 508 uses WCAG 2.0; EU Web Accessibility Directive aligns with WCAG 2.1 AA.\n\nEN 301 549: EU's ICT accessibility standard, aligned with WCAG 2.1 AA.\n\nVPAT (Voluntary Product Accessibility Template): documents how an ICT product meets accessibility standards. Used internationally by buyers and sellers in procurement.\n\nAccessibility Conformance Reports document compliance against WCAG, EN 301 549, or Section 508."
  },
  {
    id: 44,
    tag: "org",
    front: "W3C 4-step organizational accessibility framework",
    back: "Accessibility must be a PROGRAM, not a project.\n\n1. Initiate — learn basics, explore environment, set objectives, develop business case, raise awareness, gather support.\n2. Plan — create policy, assign responsibilities, set budget, review environment/websites, establish monitoring, engage stakeholders.\n3. Implement — build skills, integrate goals into policies, assign tasks, evaluate early/regularly, prioritize issues, track and communicate.\n4. Sustain — monitor websites, engage stakeholders, track standards/legislation, adapt to new tech, incorporate user feedback."
  },
  {
    id: 45,
    tag: "org",
    front: "Accessibility Maturity Model (5 levels)",
    back: "Used with the Accessible Technology Charter (Tech Taskforce) to track progress on a 1–5 scale:\n\n1. Informal — no documentation or process.\n2. Defined — documented but not actioned/completed.\n3. Repeatable — process established and actioned consistently.\n4. Managed — monitored and improved; business as usual.\n5. Best practice — innovate, improve, and share."
  },
  {
    id: 46,
    tag: "org",
    front: "Capability Maturity Model (CMU) — 5 levels for ICT a11y",
    back: "Developed by Carnegie Mellon for software process improvement; adapted for ICT accessibility:\n\n1. Initial — ad hoc, unpredictable.\n2. Repeatable — policies for project management; processes practiced, documented, enforced, trained, measured, improvable.\n3. Defined — standard processes documented and integrated.\n4. Managed — quantitative quality goals and consistent measurements.\n5. Optimizing — continuous improvement; proactive defect prevention; best practices spread."
  },
  {
    id: 47,
    tag: "org",
    front: "Automated testing limit and procurement best practices",
    back: "Automated checkers only catch about 25% of accessibility defects. Human evaluation is critical; include people with disabilities in testing.\n\nPerform formative, summative, and continuous evaluations throughout the project lifecycle.\n\nProcurement best practices:\n- Verify product accessibility claims\n- Verify vendor accessibility expertise/capacity\n- Require accessibility in contractual agreements\n- Periodically review vendor's accessibility roadmap\n- Leverage procurement policies to influence vendors"
  },
  {
    id: 48,
    tag: "society",
    front: "Business case for accessibility — 4 key advantages (W3C)",
    back: "1. Drives innovation — removes barriers; e.g. driverless cars (born from blind independence research) help with traffic safety; artificial retina helps robot vision.\n2. Enhances brand — corporate social responsibility; better reputation, sales, loyalty, workforce diversity.\n3. Increases market reach — 16%+ of world has disability; extended market has ~$6 trillion annual disposable income. Accessibility features help everyone (small screens, temporary disabilities, situational).\n4. Minimizes legal risk — laws are increasing globally; smart businesses build a11y policies to protect assets and reputation."
  },
  {
    id: 49,
    tag: "society",
    front: "Disability etiquette — people-first vs. identity-first language",
    back: "People-first: 'a person with a disability,' 'someone who uses a wheelchair.' Used in the UN CRPD and by G3ICT/IAAP. Emphasizes person, not disability.\n\nIdentity-first: 'a disabled person,' 'a Deaf person.' Often preferred by self-advocates within disability communities; signals disability as part of identity.\n\nOutdated/offensive: handicapped, suffers from, invalid, crippled, deformed, brave, afflicted, inspiring.\n\nTop DOs: people-first first, recognize identity-first preference, ask when unsure, speak to the person (not assistant), ask before helping, be patient.\nTop DON'Ts: don't assume help is wanted, don't grab a blind person (offer your arm), don't talk to the assistant, don't ask personal/medical questions, don't worry about mistakes — just ask."
  },
  {
    id: 50,
    tag: "ict",
    front: "ADA vs. Section 508 — coverage of websites",
    back: "Section 508: covers federal (and by extension state/local) GOVERNMENT websites. Uses WCAG 2.0.\n\nADA: does NOT include explicit legal standards for private business/non-profit website accessibility. Nevertheless, businesses CAN be sued for inaccessibility:\n- Title II — state/local government services and websites.\n- Title III — private places of public accommodation, including e-commerce, organizational websites, and public mobile apps.\n\nADA enforced by DOJ Civil Rights Division (and Dept. of Education OCR for educational institutions)."
  }
];
