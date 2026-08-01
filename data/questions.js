// CPACC practice question bank — grounded in IAAP CPACC Body of Knowledge (October 2023, v4.0).
// Page numbers in `cite` refer to the IAAP CPACC Body of Knowledge (BoK) PDF, copyrighted
// IAAP material not redistributed with this repo (see .gitignore) — obtain it directly from
// IAAP (International Association of Accessibility Professionals), the CPACC certifying body.
//
// Each item:
//   id, domain (1|2|3), type ("recall"|"application"|"analysis"),
//   q, choices {A,B,C,D}, answer, why {A,B,C,D}, cite
//
// Domains follow BoK weighting: D1=40%, D2=40%, D3=20%.
/**
 * AI provenance for the main CPACC question bank.
 *
 * Every item in CPACC_BANK was AI-authored from the IAAP CPACC Body of
 * Knowledge PDF and carries a `cite` field pointing to the source page.
 * The author reviewed each item against its cited page before release.
 *
 * Per-item override: an item may include its own `provenance` field that
 * supersedes this default — used when a question has a different source
 * (e.g. external WHO stat) or a known confidence caveat (`flag`).
 */
export const CPACC_BANK_PROVENANCE = {
  category: 'ai-from-source',
  label: 'AI-authored from BoK',
  citations: ['IAAP CPACC Body of Knowledge (October 2023, v4.0)'],
  generatedBy: 'Claude Sonnet 4.6',
  generatedAt: '2025-04',
  humanReview: 'Item-by-item review against the cited BoK pages by the author.',
  confidence: 'high',
  limitations: [
    'Study aid — not equivalent to the actual IAAP exam.',
    'Some items carry a `flag` field indicating known uncertainty.',
    'Not authorized or endorsed by IAAP.',
  ],
};

export const CPACC_BANK = [

  // =====================================================================
  // DOMAIN ONE — Disabilities, Challenges, and Assistive Technologies (40%)
  // =====================================================================

  {
    id: 1, domain: 1, type: "recall",
    q: "According to the CPACC Body of Knowledge, which model of disability sees the issue of disability as a socially created problem, addressed through environmental modification and the collective responsibility of society?",
    choices: {
      A: "Medical Model",
      B: "Social Model",
      C: "Economic Model",
      D: "Charity Model"
    },
    answer: "B",
    why: {
      A: "The Medical Model views disability as a problem of the individual requiring cure or medical management.",
      B: "Correct — the Social Model attributes disability to societal barriers and demands collective social action.",
      C: "The Economic Model frames disability in terms of inability to participate in work and economic consequences.",
      D: "The Charity Model views people with disabilities as unfortunate and in need of outside help."
    },
    cite: "BoK p.5"
  },
  {
    id: 2, domain: 1, type: "recall",
    q: "Which model of disability, first conceptualized by George Engel in 1977, integrates biological, psychological, and social factors — and is the model from which the WHO's International Classification of Functioning, Disability and Health (ICF) was derived?",
    choices: {
      A: "Social Identity Model",
      B: "Biopsychosocial Model",
      C: "Functional Solutions Model",
      D: "Charity Model"
    },
    answer: "B",
    why: {
      A: "The Social Identity / Cultural Affiliation Model concerns identity within disability communities (e.g., Deaf culture).",
      B: "Correct — Engel's 1977 Biopsychosocial Model underpins the WHO ICF (2002).",
      C: "The Functional Solutions Model focuses on practical, often technological, solutions to functional limitations.",
      D: "The Charity Model is unrelated to ICF and predates the biopsychosocial framework."
    },
    cite: "BoK p.6"
  },
  {
    id: 3, domain: 1, type: "recall",
    q: "The Social Identity or Cultural Affiliation Model of disability is MOST evident in which community, where membership in a close-knit linguistic minority is a source of identity and pride?",
    choices: {
      A: "Wheelchair users",
      B: "People with low vision",
      C: "Deaf community",
      D: "People with ADHD"
    },
    answer: "C",
    why: {
      A: "The BoK cites the Deaf community as the model's clearest example, not wheelchair users.",
      B: "Low vision is not the BoK's exemplar community for this model.",
      C: "Correct — the BoK explicitly cites Deaf culture as the prototypical example.",
      D: "ADHD is not the BoK's example for the Social Identity Model."
    },
    cite: "BoK p.7"
  },
  {
    id: 4, domain: 1, type: "application",
    q: "A web team is told an image-only product chart fails accessibility for blind users. Under the Functional Solutions Model of disability, the MOST appropriate response is to:",
    choices: {
      A: "Argue the user should adapt or seek a cure.",
      B: "Provide a text alternative so a screen reader can convey equivalent information.",
      C: "Frame the issue as a charitable accommodation for an unfortunate few.",
      D: "Treat the issue as a purely societal attitudes problem with no technical fix."
    },
    answer: "B",
    why: {
      A: "That reflects the Medical Model, not the Functional Solutions Model.",
      B: "Correct — Functional Solutions seeks practical (often technological) workarounds to functional limitations; a text alternative is exactly that.",
      C: "That reflects the Charity Model.",
      D: "That reflects an exclusive Social Model framing; Functional Solutions explicitly seeks practical solutions."
    },
    cite: "BoK p.7",
    flag: "Application example extrapolated from the Functional Solutions Model framing in BoK p.7; the BoK's section is brief and does not give this specific text-alternative example."
  },
  {
    id: 5, domain: 1, type: "recall",
    q: "Per the BoK and WHO, low vision is BEST defined as:",
    choices: {
      A: "Complete loss of sight in both eyes.",
      B: "Any vision problem correctable by standard glasses.",
      C: "Uncorrectable vision loss that interferes with daily activities — defined by function, not test results.",
      D: "Temporary blurriness from eye strain."
    },
    answer: "C",
    why: {
      A: "That is blindness, a separate category.",
      B: "Correctable vision is not considered a disability.",
      C: "Correct — the American Federation for the Blind's functional definition cited in the BoK.",
      D: "Transient symptoms are not low vision."
    },
    cite: "BoK p.10"
  },
  {
    id: 6, domain: 1, type: "recall",
    q: "According to the BoK (citing US NIH), red-green color vision deficiency affects approximately:",
    choices: {
      A: "1 in 12 males (8.3%) and 1 in 200 females (0.5%)",
      B: "1 in 4 males and 1 in 10 females",
      C: "Fewer than 1 in 10,000 people overall",
      D: "Equal proportions of males and females, about 5% each"
    },
    answer: "A",
    why: {
      A: "Correct — the exact figures cited in the BoK for red-green CVD.",
      B: "Overstates prevalence by a wide margin.",
      C: "That is the BoK figure for blue-yellow CVD, not red-green.",
      D: "Red-green CVD is strongly male-biased."
    },
    cite: "BoK p.10"
  },
  {
    id: 7, domain: 1, type: "application",
    q: "An e-learning team is publishing lecture videos. A learner who is Deaf and whose first language is sign language reports trouble keeping up. Per the BoK, the BEST combination of solutions is:",
    choices: {
      A: "Auto-generated captions only.",
      B: "Audio-only podcast version.",
      C: "Accurate human-edited captions (CART/STTR-style) and, where feasible, sign language interpretation, recognizing sign may be the user's first language.",
      D: "A higher-contrast video player skin."
    },
    answer: "C",
    why: {
      A: "BoK and W3C consistently note auto-captions are not sufficient on their own.",
      B: "Audio-only excludes Deaf users entirely.",
      C: "Correct — the BoK notes the first language of people born deaf is often sign language; text alone may be a second language for them.",
      D: "Skin contrast is unrelated to auditory access."
    },
    cite: "BoK p.12-13"
  },
  {
    id: 8, domain: 1, type: "recall",
    q: "Per the BoK, deaf-blindness is described as a rare condition that uses which sense as the PRIMARY means of communication?",
    choices: {
      A: "Residual hearing",
      B: "Residual vision",
      C: "Touch",
      D: "Smell"
    },
    answer: "C",
    why: {
      A: "Most deaf-blind people are not totally deaf, but residual hearing is not the primary channel cited by the BoK.",
      B: "Same: residual vision is common but not the primary channel for communication.",
      C: "Correct — the BoK explicitly states touch is the primary means of communication for deaf-blind individuals.",
      D: "Smell and taste are mentioned as available senses but not as the primary communication channel."
    },
    cite: "BoK p.14"
  },
  {
    id: 9, domain: 1, type: "recall",
    q: "Which speech disorder is defined by the BoK as a language disorder resulting from neurological damage (often stroke) that affects ALL use of language — not just speech?",
    choices: {
      A: "Dysarthria",
      B: "Apraxia of speech",
      C: "Aphasia",
      D: "Selective mutism"
    },
    answer: "C",
    why: {
      A: "Dysarthria is difficulty controlling the muscles used to speak.",
      B: "Apraxia is difficulty planning the movements of speech.",
      C: "Correct — the BoK (citing the National Aphasia Association) describes aphasia as a language disorder from brain injury, most commonly stroke.",
      D: "Selective mutism is a psychogenic condition, not neurological language loss."
    },
    cite: "BoK p.16"
  },
  {
    id: 10, domain: 1, type: "application",
    q: "A user has cerebral palsy with limited fine motor control and cannot reliably use a mouse or standard keyboard. Per the BoK's list of ICT assistive technologies for mobility/flexibility disabilities, the MOST appropriate options include:",
    choices: {
      A: "Screen reader and refreshable braille display.",
      B: "Switch devices, voice control, eye tracking, or speech-to-text.",
      C: "Audio description and captions.",
      D: "Large print and high-contrast themes."
    },
    answer: "B",
    why: {
      A: "Those serve people with vision loss, not motor disabilities.",
      B: "Correct — exactly the categories the BoK lists under ICT AT for mobility/flexibility/body structure.",
      C: "Those serve Deaf/HoH and blind users.",
      D: "Those serve low-vision users."
    },
    cite: "BoK p.20"
  },
  {
    id: 11, domain: 1, type: "recall",
    q: "Per the BoK, dyslexia prevalence in the general population is estimated at approximately:",
    choices: {
      A: "Less than 1%",
      B: "5% to 10% (sometimes as high as ~17%)",
      C: "25% to 30%",
      D: "Roughly 50% of children"
    },
    answer: "B",
    why: {
      A: "Far below the BoK figure.",
      B: "Correct — the BoK's stated range.",
      C: "Overstates by a wide margin.",
      D: "Wildly overstates prevalence."
    },
    cite: "BoK p.22"
  },
  {
    id: 12, domain: 1, type: "recall",
    q: "According to the BoK, autism spectrum disorder is estimated to affect approximately:",
    choices: {
      A: "1 in 1,000 people",
      B: "1 in 100 people",
      C: "1 in 10 people",
      D: "More than half of children"
    },
    answer: "B",
    why: {
      A: "Understates prevalence per the BoK.",
      B: "Correct — the BoK cites Autism Europe's epidemiological estimate of about 1 in 100.",
      C: "Overstates prevalence.",
      D: "Wildly overstates prevalence."
    },
    cite: "BoK p.24"
  },
  {
    id: 13, domain: 1, type: "application",
    q: "A user with a cognitive disability reports a checkout flow is overwhelming. Per the BoK's solutions for cognitive accessibility, which change is MOST aligned with the BoK guidance?",
    choices: {
      A: "Add a CAPTCHA on each step.",
      B: "Replace text with icons only.",
      C: "Simplify content, allow adequate time to complete tasks, highlight the most important information, and use plain language.",
      D: "Reduce contrast to make pages less stimulating."
    },
    answer: "C",
    why: {
      A: "CAPTCHAs create additional cognitive and accessibility barriers.",
      B: "Icons without text labels increase ambiguity.",
      C: "Correct — directly from the BoK's ICT solutions list for cognitive disabilities.",
      D: "Lower contrast worsens perception for many users."
    },
    cite: "BoK p.25"
  },
  {
    id: 14, domain: 1, type: "application",
    q: "Per the BoK's accessibility solution for users with seizure disorders, web content should avoid anything that flashes more than:",
    choices: {
      A: "Once per second",
      B: "Three times in any one-second period (and stay below the general flash and red flash thresholds)",
      C: "Ten times per second",
      D: "Sixty times per second"
    },
    answer: "B",
    why: {
      A: "Stricter than the BoK threshold.",
      B: "Correct — the BoK states the 'three flashes in any one second' threshold.",
      C: "Higher than the BoK threshold — and unsafe.",
      D: "Unsafe; well into seizure-triggering range."
    },
    cite: "BoK p.27",
    flag: "The BoK states the three-flashes threshold verbatim. The WCAG SC 2.3.1 attribution (originally in my explanation) is from WCAG itself, not the BoK."
  },
  {
    id: 15, domain: 1, type: "recall",
    q: "Per the BoK (citing Epilepsy Action), photosensitive epilepsy is estimated to affect approximately what share of people who have epilepsy?",
    choices: {
      A: "About 3%",
      B: "About 30%",
      C: "About 60%",
      D: "Nearly all"
    },
    answer: "A",
    why: {
      A: "Correct — the BoK states approximately 3% of people with epilepsy have photosensitive epilepsy.",
      B: "Overstates by a wide margin.",
      C: "Far higher than the BoK figure.",
      D: "Wildly overstates."
    },
    cite: "BoK p.27"
  },
  {
    id: 16, domain: 1, type: "application",
    q: "A solution that supports a user with anxiety disorder by allowing them to manage stress is BEST categorized by the BoK under:",
    choices: {
      A: "Assistive technologies for psychological disabilities (e.g., mood/stress/anxiety management apps).",
      B: "Assistive technologies for visual disabilities.",
      C: "Assistive technologies for mobility disabilities.",
      D: "Assistive technologies for seizure disabilities."
    },
    answer: "A",
    why: {
      A: "Correct — exactly the BoK's listed example AT for psychological disabilities.",
      B: "Wrong category.",
      C: "Wrong category.",
      D: "Wrong category."
    },
    cite: "BoK p.30"
  },
  {
    id: 17, domain: 1, type: "recall",
    q: "Per the BoK (citing the World Health Organization), what proportion of the world's population experiences significant disability?",
    choices: {
      A: "About 1% (around 80 million people)",
      B: "About 16% — roughly 1.3 billion people, or 1 in 6",
      C: "About 40% of the world's population",
      D: "Over half the world's population"
    },
    answer: "B",
    why: {
      A: "Understates by an order of magnitude.",
      B: "Correct — the BoK's current WHO figure.",
      C: "Wildly overstates.",
      D: "Wildly overstates."
    },
    cite: "BoK p.33"
  },
  {
    id: 18, domain: 1, type: "recall",
    q: "Per the BoK's disability etiquette guidance, which is the BEST general practice when communicating with a person with a disability?",
    choices: {
      A: "Always speak to their companion to avoid embarrassing them.",
      B: "Touch their wheelchair or service animal to show comfort.",
      C: "Speak to the person directly, do not assume what they can or cannot do, and offer assistance only if requested or after asking permission.",
      D: "Avoid eye contact so as not to draw attention to the disability."
    },
    answer: "C",
    why: {
      A: "Directly contradicts BoK etiquette: speak to the person, not the companion.",
      B: "BoK explicitly says do not touch a person's wheelchair or equipment without permission.",
      C: "Correct — these are the BoK's etiquette guidelines verbatim.",
      D: "Not in the BoK; can itself be patronizing."
    },
    cite: "BoK p.35"
  },
  {
    id: 19, domain: 1, type: "analysis",
    q: "A colleague refers to 'a disabled person' and asks whether you should correct them to 'person with a disability.' Per the BoK on inclusive language, the MOST accurate response is:",
    choices: {
      A: "Always use person-first language; identity-first language is offensive.",
      B: "Always use identity-first language; person-first is outdated.",
      C: "G3ict/IAAP follows UN CRPD person-first guidance, but some self-advocates (e.g., in the Deaf community) prefer identity-first; when speaking with or about a specific person, ask them.",
      D: "Language preference does not matter — only intent does."
    },
    answer: "C",
    why: {
      A: "Overstates; identity-first is preferred by many self-advocates.",
      B: "Overstates the other way; person-first is widely used and is IAAP's organizational practice.",
      C: "Correct — the BoK explicitly notes both forms exist and recommends asking the individual.",
      D: "BoK explicitly distinguishes appropriate vs inappropriate language."
    },
    cite: "BoK p.35"
  },
  {
    id: 20, domain: 1, type: "application",
    q: "A user with intellectual disability has difficulty filling out a long form. Per the BoK's solutions for cognitive disabilities, the BEST combination of approaches includes:",
    choices: {
      A: "Smaller font and dense layout to reduce scroll length.",
      B: "Allow adequate time to complete tasks, use plain/easy-read language, highlight the most important information, and enable personalized settings.",
      C: "Hide all instructions until the form is submitted.",
      D: "Replace the form with audio-only prompts."
    },
    answer: "B",
    why: {
      A: "Worsens cognitive load.",
      B: "Correct — directly from the BoK's ICT solutions list for cognitive disabilities.",
      C: "Hides exactly the support a user needs.",
      D: "Audio-only excludes many users and adds memory burden."
    },
    cite: "BoK p.25"
  },
  {
    id: 21, domain: 1, type: "recall",
    q: "Which category does the BoK use to describe people with more than one disability present at the same time, sometimes including the most profound disabilities?",
    choices: {
      A: "Comorbid",
      B: "Multiple/Complex Disabilities",
      C: "Episodic",
      D: "Acquired"
    },
    answer: "B",
    why: {
      A: "'Comorbid' is a general medical term, not the BoK's category label.",
      B: "Correct — the BoK's ninth disability category.",
      C: "Episodic refers to disabilities whose effects come and go, not to multiplicity.",
      D: "Acquired refers to onset (vs congenital), not to multiplicity."
    },
    cite: "BoK p.31"
  },
  {
    id: 22, domain: 1, type: "recall",
    q: "Per the BoK, augmentative and alternative communication (AAC) devices are commonly used by people with which type of disability?",
    choices: {
      A: "Color vision deficiency",
      B: "Speech and language disabilities",
      C: "Photosensitive epilepsy",
      D: "Body size or shape disabilities"
    },
    answer: "B",
    why: {
      A: "Not addressed by AAC.",
      B: "Correct — the BoK lists AAC under speech/language AT.",
      C: "AAC is unrelated to seizure disorders.",
      D: "Unrelated."
    },
    cite: "BoK p.17"
  },
  {
    id: 23, domain: 1, type: "application",
    q: "A user with body size differences (e.g., dwarfism) reports difficulty using a public kiosk. Per the BoK, the MOST relevant accessibility solution category is:",
    choices: {
      A: "Captioning",
      B: "Ensuring objects in the physical environment provide enough space and size for reach and use regardless of body size, posture, or mobility.",
      C: "Audio description",
      D: "Sign language interpretation"
    },
    answer: "B",
    why: {
      A: "Captioning addresses auditory access.",
      B: "Correct — the BoK's solution under mobility/flexibility/body structure disabilities.",
      C: "Addresses visual content.",
      D: "Addresses auditory content."
    },
    cite: "BoK p.19"
  },

  // =====================================================================
  // DOMAIN TWO — Accessibility and Universal Design (40%)
  // =====================================================================

  {
    id: 24, domain: 2, type: "recall",
    q: "Per the BoK, which BEST distinguishes Universal Design from individual accommodations?",
    choices: {
      A: "Accommodations are designed for the widest range of users from the outset; universal design is case-by-case.",
      B: "Universal design develops products so as many people as possible can use them without adaptation; accommodations are specific modifications for individuals in a specific case.",
      C: "Universal design applies only to ICT; accommodations apply only to the built environment.",
      D: "They are synonyms."
    },
    answer: "B",
    why: {
      A: "Reverses the definitions.",
      B: "Correct — verbatim distinction from the BoK.",
      C: "Both concepts span ICT and physical/built environments.",
      D: "They are related but distinct."
    },
    cite: "BoK p.36"
  },
  {
    id: 25, domain: 2, type: "recall",
    q: "Per the BoK, which set of related concepts develops the same core idea as Universal Design?",
    choices: {
      A: "Inclusive design, Design for all, Human-centered design, Life-span design",
      B: "Plan, Do, Check, Act",
      C: "Awareness, Adoption, Adherence, Accountability",
      D: "Equitable, Flexible, Simple, Perceptible"
    },
    answer: "A",
    why: {
      A: "Correct — the BoK explicitly lists these four related concepts.",
      B: "PDCA is a quality cycle.",
      C: "Not a recognized BoK framework.",
      D: "Those are individual UD principles, not the related-concepts list."
    },
    cite: "BoK p.36"
  },
  {
    id: 26, domain: 2, type: "recall",
    q: "Per the BoK, how does usability differ from accessibility?",
    choices: {
      A: "Accessibility focuses on ease of use; usability ensures equivalent UX for people with disabilities.",
      B: "Usability emphasizes ease of use and the broader user experience but does not always consider the needs of people with disabilities; accessibility ensures equivalent experience without barriers or discrimination.",
      C: "They are interchangeable.",
      D: "Usability is required by law; accessibility is voluntary."
    },
    answer: "B",
    why: {
      A: "Reverses the definitions.",
      B: "Correct — paraphrased directly from the BoK.",
      C: "They are related but distinct.",
      D: "Legal status is unrelated to the conceptual difference."
    },
    cite: "BoK p.37"
  },
  {
    id: 27, domain: 2, type: "recall",
    q: "WCAG is structured into how many top-level principles and guidelines?",
    choices: {
      A: "Three principles and ten guidelines",
      B: "Four principles (POUR) and 13 guidelines",
      C: "Seven principles and seven guidelines",
      D: "Five principles and 20 guidelines"
    },
    answer: "B",
    why: {
      A: "Wrong structure.",
      B: "Correct — Perceivable, Operable, Understandable, Robust + 13 guidelines, per the BoK.",
      C: "That resembles Universal Design, not WCAG.",
      D: "Wrong count."
    },
    cite: "BoK p.40"
  },
  {
    id: 28, domain: 2, type: "recall",
    q: "Per the BoK, which WCAG principle requires that 'all functionality be available from a keyboard'?",
    choices: {
      A: "Perceivable",
      B: "Operable",
      C: "Understandable",
      D: "Robust"
    },
    answer: "B",
    why: {
      A: "Perceivable addresses senses (text alternatives, captions, adaptable presentation).",
      B: "Correct — keyboard accessibility lives under Operable.",
      C: "Understandable addresses readability and predictability.",
      D: "Robust addresses compatibility with current and future user agents/AT."
    },
    cite: "BoK p.40"
  },
  {
    id: 29, domain: 2, type: "application",
    q: "A site uses only color to indicate required form fields (red labels, no asterisk or text). This MOST directly violates which WCAG principle, per the BoK's POUR framework?",
    choices: {
      A: "Perceivable",
      B: "Operable",
      C: "Understandable",
      D: "Robust"
    },
    answer: "A",
    why: {
      A: "Correct — color-only conveyance is a perceivability failure (info must not depend on a single sensory characteristic).",
      B: "Operable concerns interaction, not perception of information.",
      C: "Understandable concerns readability and predictability, not perception.",
      D: "Robust concerns AT compatibility, not visual conveyance."
    },
    cite: "BoK p.40",
    flag: "POUR principle is verified in BoK p.40, but the BoK doesn't explicitly map 'color-only' to Perceivable. The mapping comes from WCAG SC 1.4.1 (which lives under Perceivable). Standard CPACC interpretation."
  },
  {
    id: 30, domain: 2, type: "recall",
    q: "Per the BoK, the Seven Principles of Universal Design were developed in 1997 by a working group led by which person at which institution?",
    choices: {
      A: "Tim Berners-Lee at W3C",
      B: "Ron (Ronald) Mace at North Carolina State University",
      C: "Vint Cerf at Google",
      D: "Don Norman at Apple"
    },
    answer: "B",
    why: {
      A: "Berners-Lee leads W3C, not UD.",
      B: "Correct — Mace's group at NC State (Center for Universal Design) produced the seven principles.",
      C: "Not the originator.",
      D: "Norman coined 'user experience' but did not develop the UD principles."
    },
    cite: "BoK p.42"
  },
  {
    id: 31, domain: 2, type: "recall",
    q: "Which of the following is NOT one of the Seven Principles of Universal Design per the BoK?",
    choices: {
      A: "Equitable Use",
      B: "Tolerance for Error",
      C: "Backward Compatibility",
      D: "Size and Space for Approach and Use"
    },
    answer: "C",
    why: {
      A: "One of the seven.",
      B: "One of the seven.",
      C: "Correct — not a UD principle.",
      D: "One of the seven."
    },
    cite: "BoK p.42-43"
  },
  {
    id: 32, domain: 2, type: "application",
    q: "Automatic sliding doors at a hospital entrance that anyone can pass through without grasping a handle BEST exemplify which Universal Design principle?",
    choices: {
      A: "Equitable Use",
      B: "Low Physical Effort",
      C: "Tolerance for Error",
      D: "Perceptible Information"
    },
    answer: "B",
    why: {
      A: "Equitable Use focuses on identical or equivalent means of use for all users.",
      B: "Correct — Low Physical Effort emphasizes reasonable operating forces and minimized sustained effort.",
      C: "Tolerance for Error addresses minimizing hazards and consequences of mistakes.",
      D: "Perceptible Information addresses redundant sensory presentation."
    },
    cite: "BoK p.43",
    flag: "Automatic-doors example is a standard UD illustration and matches Low Physical Effort guidelines (e.g., 'use reasonable operating forces'), but is NOT specifically given in BoK p.43."
  },
  {
    id: 33, domain: 2, type: "application",
    q: "A signage system uses redundant pictorial, verbal, and tactile representation of essential information. Which UD principle does this MOST directly satisfy?",
    choices: {
      A: "Flexibility in Use",
      B: "Tolerance for Error",
      C: "Perceptible Information",
      D: "Equitable Use"
    },
    answer: "C",
    why: {
      A: "Flexibility in Use addresses accommodating user preferences (e.g., handedness, pace).",
      B: "Tolerance for Error addresses minimizing hazards.",
      C: "Correct — redundant sensory modes are the hallmark of Perceptible Information.",
      D: "Equitable Use addresses providing the same/equivalent means for all users."
    },
    cite: "BoK p.42-43"
  },
  {
    id: 34, domain: 2, type: "recall",
    q: "Per the BoK, Universal Design for Learning (UDL) is built around how many guidelines, and what are they?",
    choices: {
      A: "Four: Plan, Do, Check, Act",
      B: "Three: Engagement (the Why of learning), Representation (the What), and Action & Expression (the How)",
      C: "Seven, matching the Universal Design principles",
      D: "Four: Perceivable, Operable, Understandable, Robust"
    },
    answer: "B",
    why: {
      A: "That is PDCA, a process model.",
      B: "Correct — UDL's three overall guidelines, per CAST and the BoK.",
      C: "UDL is distinct from UD's seven principles.",
      D: "Those are WCAG's four principles, not UDL."
    },
    cite: "BoK p.44"
  },
  {
    id: 35, domain: 2, type: "application",
    q: "An online course provides lectures as video, text transcript, and an interactive infographic. Per the BoK's UDL framework, this BEST satisfies which UDL guideline?",
    choices: {
      A: "Multiple Means of Engagement",
      B: "Multiple Means of Representation",
      C: "Multiple Means of Action and Expression",
      D: "Multiple Means of Assessment"
    },
    answer: "B",
    why: {
      A: "Engagement addresses motivation and affect (the 'Why').",
      B: "Correct — multiple representations of the same content target Representation (the 'What').",
      C: "Action & Expression addresses how learners demonstrate knowledge.",
      D: "Not one of the three UDL guidelines."
    },
    cite: "BoK p.45"
  },
  {
    id: 36, domain: 2, type: "recall",
    q: "Per the BoK (citing Interaction Design Foundation), which BEST describes the relationship between usability and user experience (UX)?",
    choices: {
      A: "UX and usability are identical.",
      B: "Usability is a broader concept that contains UX.",
      C: "Usability is a sub-discipline of UX; UX also encompasses useful content, desirability, accessibility, and credibility.",
      D: "Neither concept applies to accessibility."
    },
    answer: "C",
    why: {
      A: "Once treated as synonymous; the BoK explicitly distinguishes them.",
      B: "Reverses the containment.",
      C: "Correct — the BoK's quoted explanation of the relationship.",
      D: "Both interact with accessibility."
    },
    cite: "BoK p.46"
  },
  {
    id: 37, domain: 2, type: "recall",
    q: "Per the BoK, accessibility in the built environment commonly addresses which AREAS of focus?",
    choices: {
      A: "Pricing, marketing, and brand consistency",
      B: "Access in and out of buildings; moving around in buildings; transport accessibility; inclusion in broader policies",
      C: "Backend infrastructure, server provisioning, and cloud scaling",
      D: "Color theory and typographic hierarchy"
    },
    answer: "B",
    why: {
      A: "Unrelated to built environment accessibility.",
      B: "Correct — exactly the BoK's listed focus areas.",
      C: "Unrelated.",
      D: "Unrelated."
    },
    cite: "BoK p.41"
  },
  {
    id: 38, domain: 2, type: "analysis",
    q: "Per the BoK, why do many jurisdictions publish BOTH minimum building standards AND best-practice Universal Design guidelines for the built environment?",
    choices: {
      A: "To create confusion and increase compliance costs.",
      B: "Minimum standards aim at compliance/accommodation; UD best practices aim at inclusion for far more users — together they support broader accessibility than minimums alone.",
      C: "Because Universal Design is not yet legal anywhere.",
      D: "Because minimum standards exceed Universal Design in scope."
    },
    answer: "B",
    why: {
      A: "Not the BoK's framing.",
      B: "Correct — paraphrased from the BoK on minimums vs UD.",
      C: "UD is widely adopted; not illegal.",
      D: "UD exceeds minimums, not the reverse."
    },
    cite: "BoK p.41"
  },
  {
    id: 39, domain: 2, type: "application",
    q: "An accessibility lead chooses between (a) only minimum-code compliance for a new library building and (b) applying Universal Design principles across the project. Per the BoK, the BEST argument for (b) is:",
    choices: {
      A: "Minimum codes never apply to libraries.",
      B: "Universal Design considers the needs of far more people than minimum standards and, when integrated from the design phase, often costs less than retrofitting later.",
      C: "Universal Design replaces all reasonable accommodation obligations.",
      D: "Minimum codes always exceed UD requirements."
    },
    answer: "B",
    why: {
      A: "Codes typically apply to public buildings including libraries.",
      B: "Correct — the BoK notes the cost of not integrating UD early is often greater than overall construction cost.",
      C: "UD does not replace accommodation obligations.",
      D: "Reverses the relationship."
    },
    cite: "BoK p.41"
  },
  {
    id: 40, domain: 2, type: "recall",
    q: "Per the BoK, web accessibility benefits not only people with disabilities but also which other groups?",
    choices: {
      A: "Only government employees",
      B: "Only mobile users",
      C: "Older people with changing abilities, users with temporary disabilities (e.g., broken arm), users in situational limitations (e.g., bright sun), users on slow connections",
      D: "Only software developers"
    },
    answer: "C",
    why: {
      A: "Not the BoK's beneficiary list.",
      B: "Includes mobile, but the BoK's list is much broader.",
      C: "Correct — directly from the BoK (citing W3C/WAI).",
      D: "Not the beneficiary group."
    },
    cite: "BoK p.39"
  },
  {
    id: 41, domain: 2, type: "application",
    q: "A team adopts user-centered design (UCD) for an app. Per the BoK, the BEST way to integrate accessibility into UCD is:",
    choices: {
      A: "Run a single audit just before launch.",
      B: "Include user testing for accessibility in the iterative cycles of testing built into UCD.",
      C: "Defer accessibility until after the first major release.",
      D: "Assume WCAG conformance alone guarantees accessibility for all users."
    },
    answer: "B",
    why: {
      A: "Late audits are too late to influence design.",
      B: "Correct — the BoK explicitly recommends iterating with users with disabilities throughout UCD cycles.",
      C: "Deferring is the opposite of UCD.",
      D: "Conformance is necessary but not sufficient."
    },
    cite: "BoK p.47"
  },
  {
    id: 42, domain: 2, type: "recall",
    q: "Which European standard is named in the BoK as supporting organizations in developing accessible products, goods, and services under a 'Design for All' approach?",
    choices: {
      A: "EN 17161:2019",
      B: "EN 301 549",
      C: "ISO 9241-171",
      D: "BITV 2.0"
    },
    answer: "A",
    why: {
      A: "Correct — EN 17161:2019 is the BoK's cited 'Design for All' standard.",
      B: "EN 301 549 is the harmonized ICT accessibility standard.",
      C: "ISO 9241-171 is general software accessibility guidance.",
      D: "BITV 2.0 is Germany's national web accessibility regulation."
    },
    cite: "BoK p.36"
  },
  {
    id: 43, domain: 2, type: "recall",
    q: "Per the BoK, Universal Design as defined by Ireland's Centre for Excellence in Universal Design is BEST summarized as:",
    choices: {
      A: "Design for the average user.",
      B: "Special design for a minority of users.",
      C: "Design and composition of an environment so it can be accessed, understood and used to the greatest extent possible by all people regardless of age, size, ability or disability — 'simply put, good design.'",
      D: "A regulatory minimum that all buildings must meet."
    },
    answer: "C",
    why: {
      A: "Designing for an 'average' is the opposite of UD.",
      B: "UD is explicitly not 'special' or 'minority' design.",
      C: "Correct — quoted/paraphrased verbatim from the BoK.",
      D: "UD is not itself a regulatory minimum."
    },
    cite: "BoK p.42"
  },

  // =====================================================================
  // DOMAIN THREE — Standards, Laws, and Management Strategies (20%)
  // =====================================================================

  {
    id: 44, domain: 3, type: "recall",
    q: "Per the BoK, the Universal Declaration of Human Rights (UDHR, 1948):",
    choices: {
      A: "Explicitly lists disability among protected groups.",
      B: "Was the first binding international treaty on disability rights.",
      C: "Does NOT list people with disabilities among the groups protected against discrimination; the CRPD (2006) was needed to address this gap.",
      D: "Was adopted by the WHO."
    },
    answer: "C",
    why: {
      A: "BoK explicitly notes the UDHR does not list disability.",
      B: "UDHR is a declaration, not a binding treaty; that role belongs to the CRPD.",
      C: "Correct — exactly the BoK's framing.",
      D: "Adopted by the UN, not WHO."
    },
    cite: "BoK p.48-49"
  },
  {
    id: 45, domain: 3, type: "recall",
    q: "Per the BoK, the UN Convention on the Rights of Persons with Disabilities (CRPD) was adopted in which year and is significant because:",
    choices: {
      A: "1948; it is a non-binding declaration.",
      B: "1975; it was the first declaration referring to disabled persons.",
      C: "2006; it is the first binding international human rights instrument specifically addressing the rights of people with disabilities.",
      D: "2013; it focuses on access to printed works."
    },
    answer: "C",
    why: {
      A: "That is the UDHR.",
      B: "That is the 1975 UN Declaration on the Rights of Disabled Persons, a non-binding precursor.",
      C: "Correct — the CRPD's adoption year and historic significance.",
      D: "That describes the Marrakesh Treaty."
    },
    cite: "BoK p.49"
  },
  {
    id: 46, domain: 3, type: "recall",
    q: "Per the BoK, which article of the CRPD specifically addresses accessibility?",
    choices: {
      A: "Article 3",
      B: "Article 9",
      C: "Article 19",
      D: "Article 24"
    },
    answer: "B",
    why: {
      A: "Article 3 lists General Principles, including accessibility as one of them.",
      B: "Correct — Article 9 details the right to accessibility.",
      C: "Article 19 addresses living independently and being included in the community.",
      D: "Article 24 addresses education."
    },
    cite: "BoK p.50"
  },
  {
    id: 47, domain: 3, type: "recall",
    q: "Per the BoK, the Marrakesh Treaty (adopted 2013, administered by WIPO) was created to:",
    choices: {
      A: "Harmonize ICT accessibility standards across the EU.",
      B: "Establish a copyright exception so accessible-format copies of published works can be made and shared internationally for people who are blind, visually impaired, or otherwise print disabled.",
      C: "Replace the CRPD with a binding accessibility treaty.",
      D: "Govern accessibility of physical buildings worldwide."
    },
    answer: "B",
    why: {
      A: "That is the scope of EN 301 549 / EU directives.",
      B: "Correct — Marrakesh is a copyright/IP treaty enabling accessible-format sharing.",
      C: "Marrakesh does not replace the CRPD.",
      D: "Built environment is not within Marrakesh's scope."
    },
    cite: "BoK p.50"
  },
  {
    id: 48, domain: 3, type: "recall",
    q: "Per the BoK, which 1999 regional treaty (in Guatemala) is recognized as the FIRST regional binding treaty that expressly prohibits discrimination against people with disabilities?",
    choices: {
      A: "EU Charter of Fundamental Rights",
      B: "African Charter on Human and People's Rights",
      C: "Inter-American Convention on the Elimination of All Forms of Discrimination Against Persons with Disabilities",
      D: "European Social Charter"
    },
    answer: "C",
    why: {
      A: "The EU Charter (2000) followed it and is broader than disability.",
      B: "Adopted 1981 but does not specifically name disability.",
      C: "Correct — the BoK explicitly cites this as the first regional binding treaty on disability discrimination.",
      D: "Adopted 1961; not the first to expressly prohibit disability discrimination."
    },
    cite: "BoK p.54"
  },
  {
    id: 49, domain: 3, type: "recall",
    q: "Per the BoK, the UK's Equality Act 2010 lists disability as one of how many protected characteristics?",
    choices: {
      A: "3",
      B: "9 (including age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, sexual orientation)",
      C: "15",
      D: "1 — disability is the sole protected characteristic in the Act."
    },
    answer: "B",
    why: {
      A: "Too few.",
      B: "Correct — the BoK quotes Section 4's list of nine protected characteristics.",
      C: "Too many.",
      D: "The Act covers nine characteristics, not just disability."
    },
    cite: "BoK p.56"
  },
  {
    id: 50, domain: 3, type: "recall",
    q: "Per the BoK, the Americans with Disabilities Act (ADA) of 1990 covers which areas?",
    choices: {
      A: "Federal procurement of ICT only.",
      B: "Public accommodations, employment, transportation, state and local government services, and telecommunications.",
      C: "Air travel only.",
      D: "Web accessibility standards exclusively."
    },
    answer: "B",
    why: {
      A: "That is Section 508.",
      B: "Correct — paraphrased from the BoK's ADA summary.",
      C: "Air travel is covered by the Air Carrier Access Act.",
      D: "The ADA itself does not set explicit web standards; ADA Title III has been applied to digital via case law."
    },
    cite: "BoK p.57"
  },
  {
    id: 51, domain: 3, type: "recall",
    q: "Per the BoK's Domain Three C, which provincial Canadian law (passed in 2001) ensures the rights of Ontarians with disabilities to equal opportunities and freedom from discrimination?",
    choices: {
      A: "AODA (2005)",
      B: "Ontarians with Disabilities Act (ODA), 2001",
      C: "Accessible Canada Act",
      D: "Section 508"
    },
    answer: "B",
    why: {
      A: "The BoK's section on Domain Three C specifically discusses the 2001 ODA, not the 2005 AODA.",
      B: "Correct — the BoK's explicit citation.",
      C: "The ACA is federal Canadian law.",
      D: "U.S. federal law."
    },
    cite: "BoK p.57"
  },
  {
    id: 52, domain: 3, type: "recall",
    q: "Per the BoK, in the United States, federal, state, and local government websites must meet Section 508 regulations, whose technical requirements are based on:",
    choices: {
      A: "WCAG 2.2 Level AAA",
      B: "WCAG 2.0 (the Section 508 Refresh aligned with WCAG 2.0)",
      C: "EN 301 549",
      D: "ATAG"
    },
    answer: "B",
    why: {
      A: "Section 508 does not require AAA.",
      B: "Correct — the BoK explicitly notes the Section 508 standards are based on WCAG 2.0.",
      C: "EN 301 549 is European.",
      D: "ATAG addresses authoring tools, not Section 508 web standards."
    },
    cite: "BoK p.61"
  },
  {
    id: 53, domain: 3, type: "recall",
    q: "Per the BoK, the EU Web Accessibility Directive (Directive 2016/2102, applied from September 2019) requires public sector body websites and mobile apps to comply with which harmonized European standard?",
    choices: {
      A: "EN 17161 'Design for All'",
      B: "EN 301 549 (Annex A aligning with WCAG 2.1)",
      C: "WCAG 1.0",
      D: "ISO 14289 (PDF/UA)"
    },
    answer: "B",
    why: {
      A: "EN 17161 covers Design for All, not the Web Accessibility Directive.",
      B: "Correct — the Directive points to EN 301 549; Annex A aligns with WCAG 2.1.",
      C: "WCAG 1.0 is obsolete.",
      D: "PDF/UA is for PDF documents, not the Directive's general scope."
    },
    cite: "BoK p.62"
  },
  {
    id: 54, domain: 3, type: "recall",
    q: "Per the BoK, the European Accessibility Act (EAA), adopted in 2019 and applying from 2025, covers which categories of products and services?",
    choices: {
      A: "Public sector websites only.",
      B: "Computers, ATMs, ticketing/check-in machines, smartphones, TV equipment, telephony, AV media services, transport services, consumer banking, e-books, e-commerce.",
      C: "Built environment only.",
      D: "Federal procurement of ICT only."
    },
    answer: "B",
    why: {
      A: "Public sector sites are covered by the Web Accessibility Directive, not the EAA.",
      B: "Correct — the BoK's full list of EAA-covered products/services.",
      C: "Built environment is largely national jurisdiction.",
      D: "That describes Section 508."
    },
    cite: "BoK p.62"
  },
  {
    id: 55, domain: 3, type: "recall",
    q: "Per the BoK, the US 21st Century Communications and Video Accessibility Act (CVAA) of 2010 primarily ensures that:",
    choices: {
      A: "Federal agencies procure accessible ICT.",
      B: "Accessibility laws enacted in the 1980s and 1990s are brought up to date with 21st-century technologies, including digital, broadband, and mobile innovations.",
      C: "EU member states harmonize accessibility requirements.",
      D: "Schools meet WCAG 2.0 AA."
    },
    answer: "B",
    why: {
      A: "That is Section 508 / Federal Acquisition Regulation.",
      B: "Correct — paraphrased from the BoK's CVAA summary.",
      C: "EU scope, not US CVAA.",
      D: "Outside CVAA's scope."
    },
    cite: "BoK p.59"
  },
  {
    id: 56, domain: 3, type: "application",
    q: "A multinational SaaS firm sells to U.S. consumers (private sector), Ontario public agencies, and EU consumers. Per the BoK, which combination of laws/standards is MOST directly relevant to its accessibility program?",
    choices: {
      A: "Section 508 only — it is a federal mandate.",
      B: "ADA Title III (US private-sector), Ontario's ODA framework (Ontario), and EN 301 549 / Web Accessibility Directive / EAA (EU).",
      C: "Marrakesh Treaty only.",
      D: "EN 17161 only."
    },
    answer: "B",
    why: {
      A: "Section 508 covers federal procurement; the firm sells to private and provincial customers.",
      B: "Correct — each market triggers its own regime per the BoK's coverage.",
      C: "Marrakesh is a print-disability copyright treaty.",
      D: "EN 17161 alone covers neither the U.S. nor Ontario."
    },
    cite: "BoK p.57-62",
    flag: "Application scenario. Note Ontario reference: the BoK's Domain 3C specifically covers ODA 2001, but in current practice the AODA 2005 + IASR are what set Ontario's web standard (WCAG 2.0 AA). For the exam, follow the BoK's framing of ODA."
  },
  {
    id: 57, domain: 3, type: "analysis",
    q: "An accessibility lead wants to argue that accessibility must be a 'program, not a project.' Per the BoK's Domain Three F on integrating ICT accessibility, the STRONGEST evidence for this view is:",
    choices: {
      A: "A single annual audit before each major release is sufficient.",
      B: "ICT accessibility must be approached strategically and programmatically and carried out as an integral, ongoing activity; maturity models, management champions, and W3C's Initiate/Plan/Implement/Sustain support continuous, integrated practice.",
      C: "Hiring one accessibility specialist eliminates the need for organizational change.",
      D: "Publishing an accessibility statement is the most important step."
    },
    answer: "B",
    why: {
      A: "Late audits are reactive and contradict the BoK's stance.",
      B: "Correct — directly from the BoK Domain Three F overview.",
      C: "A single specialist creates a bottleneck and does not scale.",
      D: "Statements without integration are symbolic."
    },
    cite: "BoK p.64-68"
  },
  {
    id: 58, domain: 3, type: "recall",
    q: "Per the BoK, the Capability Maturity Model (Carnegie Mellon SEI) — when adapted to ICT accessibility — describes five maturity levels in which order?",
    choices: {
      A: "Initial → Repeatable → Defined → Managed → Optimizing",
      B: "Informal → Defined → Repeatable → Managed → Best practice",
      C: "Plan → Do → Check → Act → Repeat",
      D: "Awareness → Adoption → Adherence → Accountability → Advocacy"
    },
    answer: "A",
    why: {
      A: "Correct — the BoK's adaptation of CMM 1.1 levels.",
      B: "That is the Business Disability Forum's Accessibility Maturity Model, not CMM.",
      C: "PDCA is a process cycle, not the CMM.",
      D: "Not a CMM levels list."
    },
    cite: "BoK p.67-68"
  },

  // ----- Expansion batch 1 -----

  {
    id: 59, domain: 1, type: "recall",
    q: "Per the BoK, which BEST describes the difference between assistive technology and adaptive strategy?",
    choices: {
      A: "They are synonyms.",
      B: "Assistive technology refers to products, devices, systems, or items used to perform tasks; adaptive strategies are tweaks and adjustments (including environmental ones, like moving closer to a speaker) to perform daily activities.",
      C: "Assistive technology is always computer-based; adaptive strategies never are.",
      D: "Assistive technology applies only to ICT; adaptive strategy applies only to physical environments."
    },
    answer: "B",
    why: {
      A: "Distinct concepts per the BoK.",
      B: "Correct — directly from the BoK's definitions in Domain 1B/1C.",
      C: "BoK explicitly notes not all AT is computer-based (e.g., cardboard communication boards).",
      D: "Both apply across ICT and physical settings."
    },
    cite: "BoK p.9"
  },
  {
    id: 60, domain: 1, type: "recall",
    q: "Per the BoK (WHO), approximately how many people globally have vision impairment or blindness?",
    choices: {
      A: "About 50 million",
      B: "About 246 million",
      C: "At least 2.2 billion",
      D: "About 13 billion"
    },
    answer: "C",
    why: {
      A: "Far too low.",
      B: "That is the BoK's WHO figure for LOW vision, not total vision impairment.",
      C: "Correct — at least 2.2 billion with vision impairment or blindness, per WHO via the BoK.",
      D: "Exceeds world population."
    },
    cite: "BoK p.10"
  },
  {
    id: 61, domain: 1, type: "recall",
    q: "Per the BoK (WHO), approximately how many people have disabling hearing loss globally?",
    choices: {
      A: "~5 million",
      B: "~50 million",
      C: "~430 million",
      D: "~2 billion"
    },
    answer: "C",
    why: {
      A: "Far too low.",
      B: "Matches the WHO figure for epilepsy, not hearing loss.",
      C: "Correct — the WHO estimate cited by the BoK.",
      D: "Far too high."
    },
    cite: "BoK p.13"
  },
  {
    id: 62, domain: 1, type: "recall",
    q: "Per the BoK (citing ASHA), Central Auditory Processing Disorder (CAPD) is BEST described as:",
    choices: {
      A: "An inability to hear at the level of the ear.",
      B: "Greater-than-expected difficulty hearing and understanding speech even though no measurable hearing loss exists — the hearing pathway works but parts of the brain do not.",
      C: "A vision-processing condition often confused with dyslexia.",
      D: "A subtype of bipolar disorder."
    },
    answer: "B",
    why: {
      A: "CAPD is processing, not inability to hear.",
      B: "Correct — verbatim from the BoK/ASHA description.",
      C: "Confuses categories.",
      D: "Unrelated."
    },
    cite: "BoK p.13"
  },
  {
    id: 63, domain: 1, type: "application",
    q: "A deaf-blind user needs to participate in a live conversation. Per the BoK's list of solutions and AT for deaf-blindness, the MOST appropriate primary option is:",
    choices: {
      A: "Audio description through a hearing aid.",
      B: "Tactile sign language interpretation (e.g., feeling the signing hands of the conversation partner).",
      C: "Large-print captions only.",
      D: "An ASL video interpreter on a screen."
    },
    answer: "B",
    why: {
      A: "Audio description targets blind viewers and requires hearing.",
      B: "Correct — BoK explicitly lists tactile sign language interpretation; deaf-blind users often use touch as the primary channel.",
      C: "Visual captions don't work for users without functional sight.",
      D: "On-screen video requires functional sight."
    },
    cite: "BoK p.14-15"
  },
  {
    id: 64, domain: 1, type: "recall",
    q: "Per the BoK (DSM-V), intellectual disability is diagnosed when which THREE criteria are met?",
    choices: {
      A: "Deficits in intellectual functions (typically IQ below ~70–75); impairments in adaptive behavior; onset during the developmental period (childhood).",
      B: "Inattention; hyperactivity; impulsivity.",
      C: "Restricted social communication; sensory sensitivities; repetitive behaviors.",
      D: "Depression; anxiety; insomnia."
    },
    answer: "A",
    why: {
      A: "Correct — the three DSM-V criteria cited by the BoK.",
      B: "Those are ADHD criteria.",
      C: "Those describe autism spectrum disorder.",
      D: "Those are general psychological symptoms, not the intellectual-disability criteria."
    },
    cite: "BoK p.21"
  },
  {
    id: 65, domain: 1, type: "recall",
    q: "Per the BoK, what is the estimated adult prevalence of ADHD globally?",
    choices: {
      A: "Less than 0.1%",
      B: "Around 4%",
      C: "About 25%",
      D: "Over 50%"
    },
    answer: "B",
    why: {
      A: "Far too low.",
      B: "Correct — the BoK figure for adult ADHD (children: 2–7% globally).",
      C: "Wildly overstates.",
      D: "Wildly overstates."
    },
    cite: "BoK p.23"
  },
  {
    id: 66, domain: 1, type: "recall",
    q: "Per the BoK (Epilepsy Action), flashes of light that flicker at what rates are MOST likely to trigger seizures in people with photosensitive epilepsy?",
    choices: {
      A: "1 to 2 times per second",
      B: "Between 16 and 25 times per second (some sensitive as low as 3 or as high as 60)",
      C: "Around 100 times per second",
      D: "Only continuous (non-flickering) light triggers seizures"
    },
    answer: "B",
    why: {
      A: "Below the range most likely to trigger seizures.",
      B: "Correct — the BoK's stated trigger range.",
      C: "Outside human-perceptible flicker ranges typically discussed.",
      D: "Continuous light does not flicker."
    },
    cite: "BoK p.27"
  },
  {
    id: 67, domain: 1, type: "recall",
    q: "Per the BoK (CDC), approximately what percent of US adults have a mobility disability?",
    choices: {
      A: "About 1%",
      B: "About 11%",
      C: "About 35%",
      D: "About 75%"
    },
    answer: "B",
    why: {
      A: "Too low.",
      B: "Correct — CDC figure cited by the BoK.",
      C: "Overstates.",
      D: "Wildly overstates."
    },
    cite: "BoK p.18"
  },
  {
    id: 68, domain: 1, type: "recall",
    q: "Per the BoK, which is true of people with disabilities compared to people without disabilities (WHO data)?",
    choices: {
      A: "They die at the same rates and ages as the general population.",
      B: "They have half the risk of conditions like depression and diabetes.",
      C: "Some die up to 20 years earlier; they have twice the risk of conditions like depression, asthma, diabetes; they find inaccessible/unaffordable transportation 15 times more difficult.",
      D: "They face no health inequities."
    },
    answer: "C",
    why: {
      A: "Contradicted by WHO data in the BoK.",
      B: "Reverses the figure (it's 2x more, not half).",
      C: "Correct — verbatim/paraphrased from the BoK's WHO statistics.",
      D: "BoK explicitly notes many health inequities."
    },
    cite: "BoK p.33"
  },
  {
    id: 69, domain: 1, type: "application",
    q: "An accessibility advocate writes a feature spec referring to 'a disabled student.' Per the BoK on inclusive language, this is:",
    choices: {
      A: "Always inappropriate; only person-first is acceptable.",
      B: "Always preferable; identity-first is the only correct form.",
      C: "Identity-first language, which is preferred by some self-advocates; whether to use it depends on context and the person's preference.",
      D: "A grammatical error that should be corrected to 'student of disability'."
    },
    answer: "C",
    why: {
      A: "Overstates; identity-first is preferred by some communities.",
      B: "Overstates; G3ict/IAAP uses person-first per UN CRPD.",
      C: "Correct — matches the BoK guidance.",
      D: "Not a grammatical issue."
    },
    cite: "BoK p.35"
  },
  {
    id: 70, domain: 1, type: "recall",
    q: "Per the BoK, augmentative and alternative communication (AAC) supports people primarily by:",
    choices: {
      A: "Replacing reading with audio.",
      B: "Helping people produce speech or communicate without speech (e.g., text-to-speech, symbol/picture boards, voice output communication aids).",
      C: "Improving keyboard typing speed.",
      D: "Magnifying on-screen content."
    },
    answer: "B",
    why: {
      A: "That describes screen readers/audiobooks, not AAC.",
      B: "Correct — the BoK lists these tools under speech/language AT.",
      C: "Not the function of AAC.",
      D: "That's screen magnification."
    },
    cite: "BoK p.17"
  },
  {
    id: 71, domain: 1, type: "application",
    q: "A team is debating whether to call autism a 'disorder' or 'difference.' Per the BoK and Autism Europe, which framing is MOST consistent with the BoK's treatment?",
    choices: {
      A: "Autism is a single uniform condition with severe impairment in all cases.",
      B: "Autism is a spectrum; the degree and manifestation vary widely, and many people with autism are of average to high intelligence and live highly independent lives.",
      C: "Autism is purely a behavioral choice without neurological basis.",
      D: "Autism only affects children and resolves in adulthood."
    },
    answer: "B",
    why: {
      A: "BoK explicitly says autism is a spectrum with wide variation.",
      B: "Correct — paraphrased from the BoK / Autism Europe.",
      C: "Contradicts the BoK's framing as a brain-development difference.",
      D: "BoK notes autism persists into adulthood."
    },
    cite: "BoK p.23-24"
  },
  {
    id: 72, domain: 1, type: "recall",
    q: "Per the BoK, the term that describes psychogenic mutism in which a person wants to speak but cannot in certain situations due to anxiety is:",
    choices: {
      A: "Elective mutism",
      B: "Selective mutism",
      C: "Total mutism",
      D: "Neurogenic mutism"
    },
    answer: "B",
    why: {
      A: "Elective mutism is where the person chooses not to speak.",
      B: "Correct — the BoK's definition of selective mutism.",
      C: "Total mutism means the person does not speak at all.",
      D: "Neurogenic mutism is caused by brain injury, not anxiety."
    },
    cite: "BoK p.16"
  },

  // Domain Two additions
  {
    id: 73, domain: 2, type: "recall",
    q: "Per the BoK, which UD principle's guidelines include 'Provide choice in methods of use,' 'Accommodate right- or left-handed access,' and 'Provide adaptability to the user's pace'?",
    choices: {
      A: "Equitable Use",
      B: "Flexibility in Use",
      C: "Tolerance for Error",
      D: "Size and Space for Approach and Use"
    },
    answer: "B",
    why: {
      A: "Equitable Use focuses on identical/equivalent means for all.",
      B: "Correct — these are the BoK's exact guidelines under Flexibility in Use.",
      C: "Tolerance for Error addresses minimizing hazards and consequences of mistakes.",
      D: "Size and Space addresses physical reach and clearance."
    },
    cite: "BoK p.42"
  },
  {
    id: 74, domain: 2, type: "recall",
    q: "Per the BoK, which UD principle's guidelines include 'Arrange elements to minimize hazards and errors,' 'Provide warnings of hazards and errors,' and 'Provide fail-safe features'?",
    choices: {
      A: "Tolerance for Error",
      B: "Low Physical Effort",
      C: "Perceptible Information",
      D: "Simple and Intuitive Use"
    },
    answer: "A",
    why: {
      A: "Correct — verbatim guidelines under Tolerance for Error.",
      B: "Low Physical Effort addresses operating forces and effort.",
      C: "Perceptible Information addresses redundant sensory modes.",
      D: "Simple and Intuitive Use addresses eliminating unnecessary complexity."
    },
    cite: "BoK p.43"
  },
  {
    id: 75, domain: 2, type: "recall",
    q: "Per the BoK, which UD principle includes 'Eliminate unnecessary complexity,' 'Be consistent with user expectations and intuition,' and 'Accommodate a wide range of literacy and language skills'?",
    choices: {
      A: "Equitable Use",
      B: "Flexibility in Use",
      C: "Simple and Intuitive Use",
      D: "Perceptible Information"
    },
    answer: "C",
    why: {
      A: "Equitable Use focuses on equal means of use.",
      B: "Flexibility in Use focuses on accommodating preferences/pace.",
      C: "Correct — those are the BoK's listed guidelines for Simple and Intuitive Use.",
      D: "Perceptible Information addresses redundant sensory presentation."
    },
    cite: "BoK p.42"
  },
  {
    id: 76, domain: 2, type: "application",
    q: "Per the BoK's UDL framework, providing multiple ways for learners to demonstrate what they have learned (e.g., essay, presentation, or video) BEST satisfies which UDL guideline?",
    choices: {
      A: "Multiple Means of Engagement",
      B: "Multiple Means of Representation",
      C: "Multiple Means of Action and Expression",
      D: "Multiple Means of Compliance"
    },
    answer: "C",
    why: {
      A: "Engagement addresses motivation and the 'Why' of learning.",
      B: "Representation addresses how content is presented to learners.",
      C: "Correct — Action & Expression is the 'How' of learning, including how learners express knowledge.",
      D: "Not a UDL guideline."
    },
    cite: "BoK p.45"
  },
  {
    id: 77, domain: 2, type: "application",
    q: "An instructor adds choice of topics, optional group vs solo work, and clear goals tied to learner interests. Per the BoK's UDL, this BEST satisfies:",
    choices: {
      A: "Multiple Means of Engagement",
      B: "Multiple Means of Representation",
      C: "Multiple Means of Action and Expression",
      D: "Multiple Means of Curriculum Mapping"
    },
    answer: "A",
    why: {
      A: "Correct — Engagement is the 'Why' of learning, addressing motivation, interest, and self-regulation.",
      B: "Representation concerns how content is presented.",
      C: "Action & Expression concerns how learners show what they know.",
      D: "Not a UDL guideline."
    },
    cite: "BoK p.44-45"
  },
  {
    id: 78, domain: 2, type: "recall",
    q: "Per the BoK, web accessibility's beneficiaries explicitly INCLUDE which of the following?",
    choices: {
      A: "Only people with permanent disabilities.",
      B: "Only paying customers.",
      C: "People using mobile/small-screen devices; older people with changing abilities; people with temporary disabilities (e.g., broken arm); people in situational limitations (e.g., bright sunlight); users on slow/expensive connections.",
      D: "Only people in high-income countries."
    },
    answer: "C",
    why: {
      A: "Underspecifies; the BoK lists many additional beneficiaries.",
      B: "Not the BoK's framing.",
      C: "Correct — exactly the BoK's list (citing W3C/WAI).",
      D: "Not the BoK's framing."
    },
    cite: "BoK p.39"
  },
  {
    id: 79, domain: 2, type: "application",
    q: "A keyboard user can tab into a search-autocomplete dropdown but cannot tab back out. Per the BoK's POUR framing, this is MOST directly a failure of:",
    choices: {
      A: "Perceivable",
      B: "Operable",
      C: "Understandable",
      D: "Robust"
    },
    answer: "B",
    why: {
      A: "Perceivable concerns whether information can be perceived.",
      B: "Correct — keyboard accessibility (including not trapping focus) lives under Operable.",
      C: "Understandable concerns readability and predictability.",
      D: "Robust concerns compatibility with AT and user agents."
    },
    cite: "BoK p.40",
    flag: "BoK p.40 lists 'Make all functionality available from a keyboard' under Operable. The specific 'keyboard trap' scenario maps to WCAG SC 2.1.2, which is under Operable. Standard interpretation."
  },
  {
    id: 80, domain: 2, type: "application",
    q: "An auto-playing slideshow advances every two seconds and cannot be paused. Per the BoK's POUR framing, this fails MOST directly under which principle (which states 'Give users enough time to read and use content')?",
    choices: {
      A: "Perceivable",
      B: "Operable",
      C: "Understandable",
      D: "Robust"
    },
    answer: "B",
    why: {
      A: "Perceivable addresses presentation across senses.",
      B: "Correct — Operable explicitly includes giving users enough time to read and use content.",
      C: "Understandable addresses readability and predictability.",
      D: "Robust addresses AT compatibility."
    },
    cite: "BoK p.40",
    flag: "BoK p.40 verbatim lists 'Give users enough time to read and use content' under Operable. The slideshow scenario is my example."
  },
  {
    id: 81, domain: 2, type: "application",
    q: "A site claims WCAG conformance, but interactive widgets do not expose proper roles/states to assistive technology and break in screen readers. This is MOST directly a failure of which POUR principle?",
    choices: {
      A: "Perceivable",
      B: "Operable",
      C: "Understandable",
      D: "Robust"
    },
    answer: "D",
    why: {
      A: "Perceivable concerns whether information is presented to the senses.",
      B: "Operable concerns interaction.",
      C: "Understandable concerns clarity.",
      D: "Correct — Robust addresses compatibility with current and future user tools, including assistive technology."
    },
    cite: "BoK p.40",
    flag: "BoK p.40 verbatim lists 'Maximize compatibility with current and future user tools' under Robust. The 'roles/states not exposed to AT' scenario is my example (mapping to WCAG SC 4.1.2)."
  },
  {
    id: 82, domain: 2, type: "recall",
    q: "Per the BoK, accessibility benefits society at the macro level partly because exclusion of people with disabilities from the labor market creates:",
    choices: {
      A: "A documented loss of gross domestic product (GDP).",
      B: "An inflationary spiral.",
      C: "Trade surpluses for accessible markets.",
      D: "No measurable economic effect."
    },
    answer: "A",
    why: {
      A: "Correct — the BoK explicitly cites global GDP loss as a macro-level consequence.",
      B: "Not the BoK's framing.",
      C: "Not in the BoK.",
      D: "Contradicts BoK explicitly."
    },
    cite: "BoK p.38"
  },
  {
    id: 83, domain: 2, type: "analysis",
    q: "A designer argues that adopting Universal Design will eliminate any need for accommodations. Per the BoK, the BEST counterpoint is:",
    choices: {
      A: "UD prevents all need for accommodation.",
      B: "Adoption of UD principles does NOT prevent the use of adaptive devices or reasonable accommodation where needed; UD can reduce, but not eliminate, the need for them.",
      C: "UD and accommodation are the same concept.",
      D: "Accommodation always exceeds UD in scope."
    },
    answer: "B",
    why: {
      A: "Directly contradicts the BoK's statement.",
      B: "Correct — verbatim from the BoK.",
      C: "BoK distinguishes them.",
      D: "Reverses the relationship."
    },
    cite: "BoK p.36"
  },
  {
    id: 84, domain: 2, type: "recall",
    q: "Per the BoK, key elements of User-Centered Design (UCD) include:",
    choices: {
      A: "Involving users only at the launch event.",
      B: "Involving users from the beginning and throughout design and development; taking an iterative approach with testing after each stage; including accessibility user testing in those cycles.",
      C: "Designing exclusively for the average user.",
      D: "Avoiding any direct contact with users to remain objective."
    },
    answer: "B",
    why: {
      A: "Late-only involvement contradicts UCD.",
      B: "Correct — the BoK's key elements of UCD.",
      C: "Opposite of UCD.",
      D: "Opposite of UCD."
    },
    cite: "BoK p.47"
  },
  {
    id: 85, domain: 2, type: "application",
    q: "An accessibility lead is asked whether following WCAG 2.1 AA conformance guarantees a usable product for all users with disabilities. The BEST answer, consistent with the BoK's treatment of usability/accessibility/UD, is:",
    choices: {
      A: "Yes — conformance guarantees full usability.",
      B: "No — WCAG conformance establishes a critical baseline but usability testing with people with disabilities remains essential.",
      C: "WCAG is irrelevant to usability.",
      D: "Usability testing alone replaces standards."
    },
    answer: "B",
    why: {
      A: "Conformance ≠ usability; the BoK distinguishes them.",
      B: "Correct — consistent with the BoK's treatment.",
      C: "WCAG underpins usability for AT users.",
      D: "Testing alone lacks the shared baseline standards provide."
    },
    cite: "BoK p.37"
  },
  {
    id: 86, domain: 2, type: "recall",
    q: "Per the BoK's Domain Two D on the Built Environment, which statement is MOST accurate?",
    choices: {
      A: "Built environment accessibility is governed by a single global standard.",
      B: "UD principles were originally developed for the built environment and remain key guidelines; the cost of not integrating UD early in design is often greater than overall construction cost.",
      C: "Built environment standards have no relationship to UD.",
      D: "UD applies only to ICT."
    },
    answer: "B",
    why: {
      A: "Built environment rules vary by country.",
      B: "Correct — paraphrased verbatim from the BoK.",
      C: "BoK ties UD origins directly to the built environment.",
      D: "BoK applies UD beyond ICT."
    },
    cite: "BoK p.41"
  },

  // Domain Three additions
  {
    id: 87, domain: 3, type: "recall",
    q: "Per the BoK, the 1975 UN 'Declaration on the Rights of Disabled Persons' is significant because:",
    choices: {
      A: "It is a binding international treaty.",
      B: "It is a non-binding declaration that recognized civil and political rights for people with disabilities and preceded the binding CRPD (2006).",
      C: "It was issued by the WHO and addresses health policy only.",
      D: "It replaced the UDHR."
    },
    answer: "B",
    why: {
      A: "BoK is explicit that the 1975 declaration is non-binding.",
      B: "Correct — the BoK's framing.",
      C: "Issued by the UN, not the WHO.",
      D: "Did not replace the UDHR."
    },
    cite: "BoK p.48"
  },
  {
    id: 88, domain: 3, type: "recall",
    q: "Per the BoK, roughly how many countries/organizations have signed and ratified the CRPD?",
    choices: {
      A: "Fewer than 20 signed; 10 ratified",
      B: "About 50 signed; 25 ratified",
      C: "Over 160 signed; more than 180 ratified",
      D: "Only 1 EU bloc signed; no individual country ratified"
    },
    answer: "C",
    why: {
      A: "Far too few.",
      B: "Understates.",
      C: "Correct — the BoK's stated figures.",
      D: "Misrepresents the EU's signature and member ratifications."
    },
    cite: "BoK p.49"
  },
  {
    id: 89, domain: 3, type: "recall",
    q: "Per the BoK, the EU Charter of Fundamental Rights includes Article 26 (Integration of persons with disabilities) and Article 21 (Non-discrimination). The Charter became legally binding on EU Member States when:",
    choices: {
      A: "It was adopted in 2000.",
      B: "The Treaty of Lisbon entered into force in December 2009.",
      C: "The CRPD was ratified.",
      D: "The European Accessibility Act took effect in 2025."
    },
    answer: "B",
    why: {
      A: "Adopted in 2000 but not binding at that time.",
      B: "Correct — per the BoK, binding after the Lisbon Treaty came into force in Dec 2009.",
      C: "CRPD ratification is separate from Charter binding.",
      D: "Unrelated to Charter binding."
    },
    cite: "BoK p.53"
  },
  {
    id: 90, domain: 3, type: "recall",
    q: "Per the BoK, the US Air Carrier Access Act prohibits discrimination on the basis of disability in air travel and applies to:",
    choices: {
      A: "Only U.S. airlines on domestic routes.",
      B: "All flights of U.S. airlines, and flights to or from the United States by foreign airlines.",
      C: "Only state-funded air travel.",
      D: "Only military air transport."
    },
    answer: "B",
    why: {
      A: "Too narrow.",
      B: "Correct — verbatim from the BoK.",
      C: "Not the law's scope.",
      D: "Not the law's scope."
    },
    cite: "BoK p.59"
  },
  {
    id: 91, domain: 3, type: "recall",
    q: "Per the BoK, in U.S. federal procurement, Section 508 is implemented operationally through which mechanism?",
    choices: {
      A: "The US Federal Acquisition Regulation (FAR).",
      B: "The ADA Title III implementing regulations.",
      C: "EN 301 549.",
      D: "The CVAA."
    },
    answer: "A",
    why: {
      A: "Correct — the BoK explicitly states the FAR implements Section 508 for federal departments/agencies.",
      B: "ADA Title III concerns public accommodations, not federal procurement.",
      C: "European standard.",
      D: "CVAA addresses communications/video, not federal procurement broadly."
    },
    cite: "BoK p.61"
  },
  {
    id: 92, domain: 3, type: "recall",
    q: "Per the BoK, the EU Web Accessibility Directive requires covered websites and mobile apps to include which of the following items?",
    choices: {
      A: "A privacy policy, cookie banner, and terms of service.",
      B: "An accessibility statement, a method for users to report accessibility issues, and a link to enforcement procedures.",
      C: "A Section 508 VPAT and a CRPD signature page.",
      D: "EN 17161 Design-for-All certification."
    },
    answer: "B",
    why: {
      A: "Not what the Directive requires.",
      B: "Correct — directly from the BoK's list of WAD requirements.",
      C: "Mixes EU/US/UN concepts incorrectly.",
      D: "EN 17161 isn't the Directive's required artifact."
    },
    cite: "BoK p.62"
  },
  {
    id: 93, domain: 3, type: "recall",
    q: "Per the BoK, the Business Disability Forum's Accessibility Maturity Model uses how many levels, in what order?",
    choices: {
      A: "Three: Bronze, Silver, Gold",
      B: "Five: Informal → Defined → Repeatable → Managed → Best practice",
      C: "Four: Plan, Do, Check, Act",
      D: "Five: Initial → Repeatable → Defined → Managed → Optimizing"
    },
    answer: "B",
    why: {
      A: "Not the BoK's framing.",
      B: "Correct — exactly the BDF's 1–5 levels as listed in the BoK.",
      C: "That is PDCA, a process cycle.",
      D: "Those are the CMM levels (Carnegie Mellon), not BDF's."
    },
    cite: "BoK p.67"
  },
  {
    id: 94, domain: 3, type: "recall",
    q: "Per the BoK, W3C/WAI's recommended framework for planning and managing organizational ICT accessibility uses which phases?",
    choices: {
      A: "Initiate, Plan, Implement, Sustain",
      B: "Acquire, Develop, Test, Release",
      C: "Map, Build, Run, Retire",
      D: "Awareness, Adoption, Adherence, Accountability"
    },
    answer: "A",
    why: {
      A: "Correct — directly from the BoK's WAI section.",
      B: "Generic SDLC, not WAI's framework.",
      C: "Generic IT lifecycle.",
      D: "Not WAI's framework."
    },
    cite: "BoK p.64-65"
  },
  {
    id: 95, domain: 3, type: "application",
    q: "An organization has an executive sponsor who advocates internally, leads adoption, sustains commitment, and helps integrate accessibility programmatically. Per the BoK, this person is BEST described as:",
    choices: {
      A: "A compliance auditor.",
      B: "An accessibility champion.",
      C: "An external user researcher.",
      D: "A procurement officer."
    },
    answer: "B",
    why: {
      A: "Auditors verify compliance; the BoK distinguishes champions.",
      B: "Correct — matches the BoK's description of management champions.",
      C: "User researchers focus on research, not organizational advocacy.",
      D: "Procurement officers manage purchasing."
    },
    cite: "BoK p.68"
  },
  {
    id: 96, domain: 3, type: "analysis",
    q: "An organization considers (a) waiting until after launch for accessibility testing or (b) evaluating early and often throughout design and development. Per the BoK's Domain Three F guidance, option (b) is preferable because:",
    choices: {
      A: "Early testing is mandated by all WCAG success criteria.",
      B: "Per W3C, it is easier and less costly to find and address accessibility issues early in the process.",
      C: "Post-launch testing is not legally permitted.",
      D: "Early testing eliminates the need for any user feedback later."
    },
    answer: "B",
    why: {
      A: "WCAG doesn't dictate process timing.",
      B: "Correct — directly quoted/paraphrased from the BoK on evaluating for accessibility.",
      C: "Not true.",
      D: "User feedback remains essential throughout."
    },
    cite: "BoK p.68"
  }
];
