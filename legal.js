window.LEGAL = {
  jurisdictions: [
    {
      id: "un",
      label: "UN / International",
      emoji: "🌍",
      color: "#7aa2ff",
      summary: "UN-level human rights instruments and international conventions establishing baseline disability rights."
    },
    {
      id: "eu",
      label: "European Union",
      emoji: "🇪🇺",
      color: "#5bd3a8",
      summary: "EU directives and standards governing accessibility for public sector ICT and private market products/services."
    },
    {
      id: "usa",
      label: "United States",
      emoji: "🇺🇸",
      color: "#ff9a7a",
      summary: "US federal civil rights laws and accessibility statutes covering government, employment, public accommodations, telecom, and broadcast."
    },
    {
      id: "canada",
      label: "Canada",
      emoji: "🇨🇦",
      color: "#ff7a9a",
      summary: "Federal and provincial accessibility laws — most notably Ontario's AODA and the federal Accessible Canada Act."
    },
    {
      id: "other",
      label: "Other Nations",
      emoji: "🗺️",
      color: "#d9a441",
      summary: "Key disability-rights and anti-discrimination laws from the UK, Australia, Ireland, and other jurisdictions."
    },
    {
      id: "standards",
      label: "Technical Standards",
      emoji: "📐",
      color: "#a87aff",
      summary: "Cross-jurisdictional technical standards: WCAG, EN 301 549, VPAT, ISO standards — what the laws actually point to."
    },
    {
      id: "timeline",
      label: "Timeline / History",
      emoji: "📅",
      color: "#7ad9d3",
      summary: "Chronological view of key dates, events, and milestones in disability rights and accessibility."
    }
  ],
  items: [
    // ===================== UN / INTERNATIONAL =====================
    {
      id: "udhr",
      jurisdiction: "un",
      type: "Declaration",
      year: "1948",
      name: "Universal Declaration of Human Rights (UDHR)",
      summary: "Drafted by the UN General Assembly in Paris in 1948 — the first declaration that all people have universal human rights. Does not specify disability explicitly, but PWD are understood to be included in 'everyone,' 'all,' and 'no one.'",
      keyFacts: [
        "Non-binding declaration, but foundation for all subsequent human rights law",
        "Written by representatives from all regions of the world",
        "Implicit inclusion of PWD via universal language"
      ]
    },
    {
      id: "drdp",
      jurisdiction: "un",
      type: "Declaration",
      year: "1975",
      name: "UN Declaration on the Rights of Disabled Persons",
      summary: "UN General Assembly Resolution 3447 — first UN declaration specifically dedicated to the rights of people with disabilities. Non-binding but foundational; preceded the binding CRPD (2006) by 31 years.",
      keyFacts: [
        "Adopted 9 December 1975 (UN GA Resolution 3447)",
        "First UN instrument focused specifically on disability",
        "Affirms PWD have the same civil and political rights as others",
        "Calls for measures enabling them to become as self-reliant as possible",
        "Built on the 1971 Declaration on the Rights of Mentally Retarded Persons (now considered dated in language; CPACC sometimes references it as a precursor)",
        "Non-binding — but its principles were absorbed into the CRPD"
      ]
    },
    {
      id: "crpd",
      jurisdiction: "un",
      type: "Convention (binding)",
      year: "2006 (in force 2008)",
      name: "UN Convention on the Rights of Persons with Disabilities (CRPD)",
      summary: "The FIRST binding international human-rights instrument specifically protecting the rights of people with disabilities. States that ratify must take steps to implement the rights it enumerates. 177+ countries have ratified (Canada 2010; US signed but never ratified).",
      keyFacts: [
        "Adopted 2006, entered into force 2008",
        "Frames disability through the social/human-rights model — not medical/charity",
        "Article 9 (Accessibility) is the foundation for digital a11y obligations: physical environment, transportation, information & communications (incl. ICT)",
        "Article 2 defines key terms: universal design, reasonable accommodation, communication (incl. Braille, sign language, plain language, accessible ICT)",
        "Article 21: freedom of expression / access to information — requires accessible formats and technologies",
        "Optional Protocol allows individuals to file complaints with the UN (Canada ratified 2018)"
      ]
    },
    {
      id: "marrakesh",
      jurisdiction: "un",
      type: "Treaty",
      year: "2013",
      name: "Marrakesh Treaty",
      summary: "Marrakesh Treaty to Facilitate Access to Published Works for Persons who are Blind, Visually Impaired, or Otherwise Print Disabled. Carves a copyright exception so accessible-format books can be created and shared across borders without rights-holder permission.",
      keyFacts: [
        "Addresses the global 'book famine' for print-disabled people (estimated <10% of books available in accessible formats)",
        "Allows authorized entities to make and exchange accessible-format copies internationally",
        "Administered by WIPO (World Intellectual Property Organization)"
      ]
    },
    {
      id: "inter-american",
      jurisdiction: "un",
      type: "Regional Convention",
      year: "1999",
      name: "Inter-American Convention on the Elimination of All Forms of Discrimination Against Persons with Disabilities",
      summary: "Adopted in Guatemala in 1999 — the first regional binding treaty expressly prohibiting disability discrimination. Provides one of the clearest legal definitions of disability discrimination.",
      keyFacts: [
        "Pre-dates the CRPD by 7 years",
        "Defines 'discrimination against PWD' as any distinction, exclusion, or restriction based on disability that impairs human rights",
        "Adopted by the Organization of American States (OAS)"
      ]
    },
    {
      id: "adrp",
      jurisdiction: "un",
      type: "Regional Protocol",
      year: "2018 (adopted) / 2024 (in force)",
      name: "African Disability Rights Protocol (ADRP)",
      summary: "Protocol to the African Charter on Human and Peoples' Rights on the Rights of Persons with Disabilities in Africa. Adopted 2018 by the African Union; entered into force in 2024.",
      keyFacts: [
        "Africa's binding regional disability rights instrument",
        "Builds on the African Charter on Human and Peoples' Rights (1981)",
        "Requires state parties to adopt legislation and policies promoting accessibility, inclusion, and non-discrimination"
      ]
    },
    {
      id: "icf",
      jurisdiction: "un",
      type: "Classification (WHO)",
      year: "2002",
      name: "International Classification of Functioning, Disability and Health (ICF)",
      summary: "WHO's classification framework — derived from the BIOPSYCHOSOCIAL model (Engel, 1977). Classifies functioning across body functions/structures, activities, participation, and environmental/personal factors.",
      keyFacts: [
        "Replaced the older ICIDH (which used a more medical-model framing)",
        "Adopted in 2001 by the World Health Assembly; published 2002",
        "Integrates the medical and social models",
        "Forms the basis for how disability is described in health and accessibility contexts globally"
      ]
    },

    // ===================== EU =====================
    {
      id: "eu-charter",
      jurisdiction: "eu",
      type: "Charter (fundamental rights)",
      year: "2000 (proclaimed) / 2009 (binding)",
      name: "EU Charter of Fundamental Rights",
      summary: "EU's fundamental rights charter. Article 21 prohibits discrimination on grounds including disability; Article 26 specifically recognizes the right of PWD to benefit from measures designed to ensure independence, social/occupational integration, and participation.",
      keyFacts: [
        "Proclaimed in Nice in 2000",
        "Became legally binding with the Lisbon Treaty in 2009",
        "Article 21 — non-discrimination including disability",
        "Article 26 — rights of PWD specifically"
      ]
    },
    {
      id: "employment-equality",
      jurisdiction: "eu",
      type: "Directive",
      year: "2000",
      name: "Employment Equality Directive (2000/78/EC)",
      summary: "Prohibits discrimination in employment on grounds of religion, belief, disability, age, and sexual orientation across all EU member states. Requires employers to provide reasonable accommodation for PWD.",
      keyFacts: [
        "Council Directive 2000/78/EC",
        "Covers access to employment, working conditions, vocational training, promotion",
        "Reasonable accommodation is mandatory unless it imposes a disproportionate burden"
      ]
    },
    {
      id: "wad",
      jurisdiction: "eu",
      type: "Directive",
      year: "2016/2102 (in force Sept 2018)",
      name: "Web Accessibility Directive (2016/2102)",
      summary: "Mandates minimum accessibility for EU PUBLIC SECTOR websites and mobile apps. References EN 301 549 (which aligns with WCAG 2.1 AA). Counterpart to the EAA (which covers the private sector).",
      keyFacts: [
        "Covers websites and mobile apps of public sector bodies",
        "Websites: in force September 2018; mobile apps: June 2019",
        "Requires a published 'detailed, comprehensive and clear' accessibility statement",
        "Technical standard: EN 301 549 (aligns with WCAG 2.1 AA)"
      ]
    },
    {
      id: "eaa",
      jurisdiction: "eu",
      type: "Directive",
      year: "2019/882 (applies June 28, 2025)",
      name: "European Accessibility Act (EAA, 2019/882)",
      summary: "EU directive harmonizing accessibility requirements for products and services across the EU market — PRIMARILY PRIVATE SECTOR. Counterpart to the Web Accessibility Directive (which covers the public sector).",
      keyFacts: [
        "Adopted April 2019; transposition deadline June 2022; APPLICATION DATE June 28, 2025 (when companies must actually comply)",
        "Covered products: computers + OS, smartphones, TV digital broadcast equipment, ATMs, ticketing/check-in machines, e-readers",
        "Covered services: e-commerce, consumer banking, telephone services (incl. 112), audiovisual media access services, passenger transport (websites/apps/ticketing), e-books",
        "Public bodies pulled in when acting as economic operators; member states may extend EAA to public sector domestically",
        "Microenterprise exemption (services only): <10 employees AND ≤€2M turnover/balance — exempt from substantive requirements but must notify authorities",
        "Manufacturer microenterprises must still comply",
        "Technical standard: EN 301 549"
      ]
    },

    // ===================== USA =====================
    {
      id: "section-504",
      jurisdiction: "usa",
      type: "Statute",
      year: "1973",
      name: "Section 504 of the Rehabilitation Act",
      summary: "First US federal civil rights statute prohibiting disability discrimination by recipients of FEDERAL FUNDING (federal agencies, schools, hospitals, contractors). Predates the ADA by 17 years.",
      keyFacts: [
        "Applies to programs and activities that receive federal financial assistance",
        "Established the concept of 'reasonable accommodation' in US law",
        "Foundation for later laws including the ADA",
        "Enforced by the relevant federal funding agency (e.g., HHS, ED)"
      ]
    },
    {
      id: "ada",
      jurisdiction: "usa",
      type: "Civil rights statute",
      year: "1990 (amended 2008)",
      name: "Americans with Disabilities Act (ADA)",
      summary: "US federal civil rights law prohibiting disability discrimination — applies broadly to employment, government, public accommodations, telecom. Five titles. Amended in 2008 (ADAAA) to broaden the definition of disability.",
      keyFacts: [
        "Title I — EMPLOYMENT: employers with 15+ employees must provide reasonable accommodation (enforced by EEOC)",
        "Title II — PUBLIC SERVICES: state and local government programs/services must be accessible (also covers public transit)",
        "Title III — PUBLIC ACCOMMODATIONS: private businesses open to the public (stores, restaurants, hotels, websites, etc.)",
        "Title IV — TELECOMMUNICATIONS: requires telecom companies to provide relay services for Deaf/hard-of-hearing users",
        "Title V — MISCELLANEOUS: prohibits retaliation, addresses attorneys' fees, etc.",
        "2008 ADAAA expanded the definition of 'disability' after court rulings narrowed it",
        "2024 DOJ rule under Title II: state and local government web/mobile content must meet WCAG 2.1 AA (phased compliance 2026–2027)"
      ]
    },
    {
      id: "section-508",
      jurisdiction: "usa",
      type: "Statute",
      year: "1998 (refreshed 2017)",
      name: "Section 508 of the Rehabilitation Act",
      summary: "Requires FEDERAL AGENCIES to make their ICT (developed, procured, maintained, or used) accessible. Refreshed in 2017 to align with WCAG 2.0 Level AA. Federal procurement leverage drives much of US a11y industry behavior.",
      keyFacts: [
        "Added to the Rehabilitation Act in 1998",
        "Refreshed January 2017 — adopted WCAG 2.0 Level AA as conformance criteria",
        "Applies to ICT the federal government develops, procures, maintains, or uses",
        "Government contractors must comply when selling to federal agencies (procurement leverage)",
        "Does NOT directly regulate the consumer market (that's CVAA's role)"
      ]
    },
    {
      id: "cvaa",
      jurisdiction: "usa",
      type: "Statute",
      year: "2010",
      name: "21st Century Communications and Video Accessibility Act (CVAA)",
      summary: "Modernizes US communications law for the broadband/smartphone era. Title I covers ADVANCED COMMUNICATIONS SERVICES (text, IM, email, VoIP, video conferencing). Title II covers VIDEO PROGRAMMING (captions on internet-delivered TV content, audio description, accessible TV menus/program guides).",
      keyFacts: [
        "Signed by Obama in 2010",
        "Title I — Communications: advanced comms services and equipment must be accessible (smartphones, VoIP, IM, email, video conf)",
        "Title II — Video programming: captions on internet-delivered TV, audio description, hearing-aid compatibility, accessible UIs",
        "Enforced by the FCC (not DOJ)",
        "Targets PRIVATE sector consumer products/services (Section 508's gap)",
        "Closes gaps left by the 1934 Communications Act (which only covered traditional telephone/broadcast TV)"
      ]
    },
    {
      cpacc: false,
      id: "acaa",
      jurisdiction: "usa",
      type: "Statute",
      year: "1986",
      name: "Air Carrier Access Act (ACAA)",
      summary: "Prohibits disability discrimination by US air carriers and (for relevant operations) foreign carriers. DOT issues accessibility regulations for aircraft, airport facilities, websites, kiosks, and lavatories.",
      keyFacts: [
        "Enforced by the US Department of Transportation (DOT)",
        "Covers reservations, boarding, in-flight services, websites, kiosks",
        "Recent DOT rules require airline websites and kiosks to be accessible (WCAG 2.0 AA)"
      ]
    },
    {
      cpacc: false,
      id: "fhaa",
      jurisdiction: "usa",
      type: "Statute",
      year: "1988",
      name: "Fair Housing Amendments Act (FHAA)",
      summary: "Amends the Fair Housing Act to prohibit housing discrimination based on disability and requires reasonable accommodations and accessibility in covered multi-family housing.",
      keyFacts: [
        "Covered multi-family housing (4+ units, first occupied after March 1991) must meet design and construction requirements",
        "Landlords must permit reasonable modifications (at tenant's expense) and provide reasonable accommodations",
        "Enforced by HUD (Department of Housing and Urban Development)"
      ]
    },
    {
      cpacc: false,
      id: "ideaUS",
      jurisdiction: "usa",
      type: "Statute",
      year: "1975 (current name: 1990)",
      name: "Individuals with Disabilities Education Act (IDEA)",
      summary: "Guarantees a free appropriate public education (FAPE) in the least restrictive environment to children with disabilities. Requires Individualized Education Programs (IEPs).",
      keyFacts: [
        "Originally enacted 1975 as the Education for All Handicapped Children Act",
        "Renamed IDEA in 1990",
        "Requires IEPs developed jointly by educators, parents, and (when appropriate) the student",
        "Enforced by the US Department of Education"
      ]
    },

    // ===================== CANADA =====================
    {
      id: "aca",
      jurisdiction: "canada",
      type: "Federal Statute",
      year: "2019",
      name: "Accessible Canada Act (ACA)",
      summary: "Canada's FEDERAL accessibility law — covers federally regulated entities (federal government, Crown corporations, banks, airlines, rail, marine, interprovincial transport, telecom, broadcasters). Goal: barrier-free Canada by 2040.",
      keyFacts: [
        "Enacted 2019",
        "Goal: barrier-free Canada by 2040",
        "Accessibility Commissioner enforces; fines up to $250K",
        "Accessibility plans required every 3 years + progress reports + feedback process",
        "Standards developed by Accessibility Standards Canada",
        "Priority areas: employment, built environment, ICT, communications, procurement, programs/services, transportation"
      ]
    },
    {
      id: "aoda",
      jurisdiction: "canada",
      type: "Provincial Statute",
      year: "2005",
      name: "Accessibility for Ontarians with Disabilities Act (AODA)",
      summary: "Ontario provincial law — applies to any Ontario org with 1+ employees, public AND private sector. Goal: accessible Ontario by 2025. Five enforceable standards bundled as the IASR (Integrated Accessibility Standards Regulation).",
      keyFacts: [
        "Enacted 2005",
        "Goal: accessible Ontario by 2025",
        "Applies to public + private sector (any Ontario org with 1+ employees)",
        "Five IASR standards: Customer Service, Information & Communications, Employment, Transportation, Design of Public Spaces",
        "Compliance reports required; fines up to $100K/day for corporations",
        "Replaced the toothless ODA (2001)"
      ]
    },
    {
      id: "oda",
      jurisdiction: "canada",
      type: "Provincial Statute (predecessor)",
      year: "2001",
      name: "Ontarians with Disabilities Act (ODA)",
      summary: "Ontario's earlier accessibility law — applied only to public sector (provincial govt, municipalities, hospitals, school boards, universities). Required annual accessibility plans but had NO standards and NO enforcement. Largely superseded by AODA.",
      keyFacts: [
        "Public sector only",
        "Required annual accessibility plans",
        "No standards, no penalties",
        "Largely superseded by AODA (2005)"
      ]
    },
    {
      cpacc: false,
      id: "canadian-charter",
      jurisdiction: "canada",
      type: "Constitutional",
      year: "1982",
      name: "Canadian Charter of Rights and Freedoms (Section 15)",
      summary: "Section 15 of the Charter guarantees equality rights — including for persons with mental or physical disability. Constitutional foundation for Canadian disability rights.",
      keyFacts: [
        "Part of the Constitution Act, 1982",
        "Section 15 came into force in 1985",
        "Includes 'mental or physical disability' as a prohibited ground of discrimination"
      ]
    },
    {
      cpacc: false,
      id: "provincial-canada",
      jurisdiction: "canada",
      type: "Provincial Statutes",
      year: "Various",
      name: "Other provincial accessibility laws",
      summary: "Several Canadian provinces have their own accessibility legislation in addition to the federal ACA.",
      keyFacts: [
        "Accessibility for Manitobans Act (2013)",
        "Nova Scotia Accessibility Act (2017) — goal: accessible NS by 2030",
        "Accessible British Columbia Act (2021)",
        "Accessible Newfoundland and Labrador Act (2024)",
        "Saskatchewan: Accessible Saskatchewan Act (2023)"
      ]
    },

    // ===================== OTHER NATIONS =====================
    {
      id: "uk-equality",
      jurisdiction: "other",
      type: "Statute (UK)",
      year: "2010",
      name: "UK Equality Act 2010",
      summary: "Consolidates and strengthens UK anti-discrimination law. Protects against direct discrimination, indirect discrimination, and discrimination arising from disability. Requires reasonable adjustments.",
      keyFacts: [
        "Combined several prior acts including the Disability Discrimination Act 1995",
        "Protected characteristics: age, disability, gender reassignment, marriage/civil partnership, pregnancy/maternity, race, religion or belief, sex, sexual orientation",
        "Duty to make reasonable adjustments is anticipatory (not just reactive)",
        "Enforced by the Equality and Human Rights Commission (EHRC)"
      ]
    },
    {
      id: "australia-dda",
      jurisdiction: "other",
      type: "Statute (Australia)",
      year: "1992",
      name: "Australia Disability Discrimination Act (DDA)",
      summary: "Makes disability discrimination unlawful in Australia. Covers employment, education, access to premises, provision of goods/services, accommodation. Includes a duty to provide reasonable adjustments.",
      keyFacts: [
        "Enacted 1992",
        "Enforced by the Australian Human Rights Commission",
        "July 2025: Attorney-General's Dept announced a review to modernize and strengthen the DDA"
      ]
    },
    {
      id: "ireland-disability",
      jurisdiction: "other",
      type: "Statute (Ireland)",
      year: "2005",
      name: "Ireland Disability Act 2005",
      summary: "Established the Centre for Excellence in Universal Design (CEUD) within the National Disability Authority. Provides the Irish statutory definition of universal design used widely in policy.",
      keyFacts: [
        "Created the Centre for Excellence in Universal Design (CEUD), established 2007",
        "CEUD extended UD beyond the built environment to ICT and services",
        "Statutory definition of UD: design of environments, products, services, and ICT so they can be accessed, understood, and used to the greatest extent possible by all people, regardless of age, size, ability, or disability"
      ]
    },
    {
      cpacc: false,
      id: "germany-bgg",
      jurisdiction: "other",
      type: "Statute (Germany)",
      year: "2002",
      name: "Behindertengleichstellungsgesetz (BGG)",
      summary: "Germany's federal Act on Equal Opportunities for Persons with Disabilities. Establishes accessibility obligations for federal authorities and requires BITV (the German accessibility ordinance) for federal websites and apps.",
      keyFacts: [
        "Federal-level law; many German states have their own LGGs",
        "BITV (Barrierefreie-Informationstechnik-Verordnung) sets technical accessibility requirements for federal websites",
        "Now aligned with EN 301 549 / WCAG 2.1 AA"
      ]
    },
    {
      cpacc: false,
      id: "japan",
      jurisdiction: "other",
      type: "Statute (Japan)",
      year: "2013 (in force 2016)",
      name: "Act on the Elimination of Discrimination Against Persons with Disabilities",
      summary: "Japan's primary disability discrimination law. Came into force in 2016 alongside Japan's ratification of the CRPD. Amended in 2024 to make reasonable accommodation by private businesses mandatory (previously voluntary).",
      keyFacts: [
        "In force April 2016",
        "Public sector: reasonable accommodation mandatory from the start",
        "Private sector: reasonable accommodation became mandatory in April 2024",
        "Enforced by the Cabinet Office"
      ]
    },

    // ===================== STANDARDS =====================
    {
      id: "wcag",
      jurisdiction: "standards",
      type: "Standard (W3C)",
      year: "2.0 (2008), 2.1 (2018), 2.2 (2023)",
      name: "Web Content Accessibility Guidelines (WCAG)",
      summary: "W3C's recommendation for web accessibility. The de-facto global standard cited by most accessibility laws. Organized around four principles (POUR), three conformance levels (A, AA, AAA), and testable success criteria.",
      keyFacts: [
        "POUR principles: Perceivable, Operable, Understandable, Robust",
        "Three conformance levels: A (minimum), AA (mid — most laws target this), AAA (highest)",
        "WCAG 2.0 (2008) — Section 508 (refresh 2017) uses this",
        "WCAG 2.1 (2018) — adds mobile, low vision, cognitive criteria",
        "WCAG 2.2 (2023) — adds focus appearance, dragging movements, target size, etc.",
        "WCAG 3.0 in development — different conformance model"
      ]
    },
    {
      id: "en301549",
      jurisdiction: "standards",
      type: "Standard (EU)",
      year: "v1.0 (2014), current v3.x",
      name: "EN 301 549",
      summary: "EU's harmonized technical standard for ICT accessibility. Referenced by both the Web Accessibility Directive (public sector) and the European Accessibility Act (private sector). Aligns with and incorporates WCAG.",
      keyFacts: [
        "Developed by ETSI, CEN, and CENELEC",
        "Current version aligns with WCAG 2.1 AA",
        "Covers websites, mobile apps, ICT hardware, documents, AV media, real-time communication",
        "Cited by both the EU WAD (2016/2102) and EAA (2019/882)"
      ]
    },
    {
      id: "vpat",
      jurisdiction: "standards",
      type: "Documentation template",
      year: "Originally early 2000s",
      name: "VPAT (Voluntary Product Accessibility Template)",
      summary: "Template documenting how a product or service conforms to accessibility standards. Used in procurement worldwide. Filling out a VPAT produces an Accessibility Conformance Report (ACR).",
      keyFacts: [
        "Maintained by the Information Technology Industry Council (ITI)",
        "Versions for WCAG, Section 508 (Revised), and EN 301 549",
        "Output is called an ACR (Accessibility Conformance Report)",
        "Used heavily in US federal procurement (Section 508) and increasingly globally"
      ]
    },
    {
      id: "iso21542",
      jurisdiction: "standards",
      type: "Standard (ISO)",
      year: "First published 2011",
      name: "ISO 21542 — Accessibility of the built environment",
      summary: "International standard for accessibility of the built environment. Covers design, construction, and management of buildings and external spaces.",
      keyFacts: [
        "Counterpart to ICT-focused standards (WCAG, EN 301 549)",
        "Used internationally as a reference for accessible architecture"
      ]
    },
    {
      cpacc: false,
      id: "iso30071",
      jurisdiction: "standards",
      type: "Standard (ISO)",
      year: "2019",
      name: "ISO 30071-1 — Information technology — Development of user interface accessibility",
      summary: "International standard providing requirements and recommendations for how organizations should systematically address accessibility in their ICT development.",
      keyFacts: [
        "Process-oriented (not just technical criteria like WCAG)",
        "Addresses governance, policy, training, lifecycle integration"
      ]
    },
    {
      id: "udl",
      jurisdiction: "standards",
      type: "Framework",
      year: "1990s (CAST)",
      name: "Universal Design for Learning (UDL)",
      summary: "Framework from CAST for designing learning environments accessible to all. Three core principles, each with provide-multiple-means-of guidance.",
      keyFacts: [
        "Three principles: Multiple Means of Engagement, Multiple Means of Representation, Multiple Means of Action and Expression",
        "Developed at CAST (Center for Applied Special Technology)",
        "Adopted in US education policy and many global education systems"
      ]
    },
    {
      id: "ud-7",
      jurisdiction: "standards",
      type: "Framework",
      year: "1997",
      name: "7 Principles of Universal Design",
      summary: "Foundational UD principles developed by Ronald Mace and colleagues at NC State Center for Universal Design.",
      keyFacts: [
        "1. Equitable Use",
        "2. Flexibility in Use",
        "3. Simple and Intuitive Use",
        "4. Perceptible Information",
        "5. Tolerance for Error",
        "6. Low Physical Effort",
        "7. Size and Space for Approach and Use",
        "Led by Ronald Mace at NC State CUD, 1997"
      ]
    },

    // ===================== TIMELINE / HISTORY =====================
    {
      id: "history-1948",
      jurisdiction: "timeline",
      type: "Milestone",
      year: "1948",
      name: "Universal Declaration of Human Rights",
      summary: "UN adopts the UDHR in Paris — first declaration of universal human rights. PWD implicitly included via universal language."
    },
    {
      id: "history-1973",
      jurisdiction: "timeline",
      type: "Milestone (US)",
      year: "1973",
      name: "Section 504 of the Rehabilitation Act",
      summary: "First US federal disability civil rights statute. Prohibits discrimination by recipients of federal funding."
    },
    {
      id: "history-1975",
      jurisdiction: "timeline",
      type: "Milestone (US)",
      year: "1975",
      name: "Education for All Handicapped Children Act",
      summary: "US passes EAHCA (later renamed IDEA, 1990) — guarantees FAPE for children with disabilities."
    },
    {
      id: "history-1975-un",
      jurisdiction: "timeline",
      type: "Milestone (UN)",
      year: "1975",
      name: "UN Declaration on the Rights of Disabled Persons",
      summary: "UN GA Resolution 3447 — first UN declaration dedicated to disability rights. Precursor to the binding CRPD (2006)."
    },
    {
      id: "history-1977",
      jurisdiction: "timeline",
      type: "Conceptual milestone",
      year: "1977",
      name: "Biopsychosocial Model (George Engel)",
      summary: "George Engel publishes the biopsychosocial model, integrating biological, psychological, and social factors. Becomes the basis for WHO's ICF (2002)."
    },
    {
      id: "history-1986",
      jurisdiction: "timeline",
      type: "Milestone (US)",
      year: "1986",
      name: "Air Carrier Access Act",
      summary: "US enacts ACAA prohibiting disability discrimination by air carriers."
    },
    {
      id: "history-1988",
      jurisdiction: "timeline",
      type: "Milestone (US)",
      year: "1988",
      name: "Fair Housing Amendments Act",
      summary: "US adds disability protections to fair housing law."
    },
    {
      id: "history-1990",
      jurisdiction: "timeline",
      type: "Milestone (US)",
      year: "1990",
      name: "Americans with Disabilities Act",
      summary: "ADA signed by President George H.W. Bush — broad US civil rights statute covering employment, government, public accommodations, telecom."
    },
    {
      id: "history-1992",
      jurisdiction: "timeline",
      type: "Milestone (Australia)",
      year: "1992",
      name: "Australia Disability Discrimination Act",
      summary: "Australia enacts the DDA."
    },
    {
      id: "history-1997",
      jurisdiction: "timeline",
      type: "Conceptual milestone",
      year: "1997",
      name: "7 Principles of Universal Design",
      summary: "Ronald Mace and team at NC State CUD publish the 7 Principles of Universal Design."
    },
    {
      id: "history-1998",
      jurisdiction: "timeline",
      type: "Milestone (US)",
      year: "1998",
      name: "Section 508",
      summary: "Section 508 added to the Rehabilitation Act. Refreshed 2017 to adopt WCAG 2.0 AA."
    },
    {
      id: "history-1999",
      jurisdiction: "timeline",
      type: "Milestone (Americas)",
      year: "1999",
      name: "Inter-American Convention",
      summary: "First regional binding treaty on disability discrimination — OAS adopts it in Guatemala."
    },
    {
      id: "history-2001",
      jurisdiction: "timeline",
      type: "Milestone (Canada)",
      year: "2001",
      name: "ODA (Ontario)",
      summary: "Ontario passes the ODA (public-sector only, no enforcement). Later superseded by AODA."
    },
    {
      id: "history-2002",
      jurisdiction: "timeline",
      type: "Milestone (WHO)",
      year: "2002",
      name: "ICF published",
      summary: "WHO publishes the International Classification of Functioning, Disability and Health — based on the biopsychosocial model."
    },
    {
      id: "history-2005",
      jurisdiction: "timeline",
      type: "Milestone (Canada)",
      year: "2005",
      name: "AODA",
      summary: "Ontario passes AODA — public + private sector, enforceable standards, goal: accessible Ontario by 2025."
    },
    {
      id: "history-2006",
      jurisdiction: "timeline",
      type: "Milestone (UN)",
      year: "2006",
      name: "CRPD adopted",
      summary: "UN adopts the Convention on the Rights of Persons with Disabilities — first binding international disability rights treaty. In force 2008."
    },
    {
      id: "history-2008",
      jurisdiction: "timeline",
      type: "Milestones",
      year: "2008",
      name: "WCAG 2.0, CRPD in force, ADAAA",
      summary: "Big year: W3C publishes WCAG 2.0, the CRPD enters into force, and the US passes the ADA Amendments Act broadening the definition of disability."
    },
    {
      id: "history-2010",
      jurisdiction: "timeline",
      type: "Milestones",
      year: "2010",
      name: "CVAA + UK Equality Act + Canada ratifies CRPD",
      summary: "US passes the CVAA modernizing communications law. UK passes the Equality Act. Canada ratifies CRPD."
    },
    {
      id: "history-2013",
      jurisdiction: "timeline",
      type: "Milestone (UN)",
      year: "2013",
      name: "Marrakesh Treaty",
      summary: "WIPO adopts the Marrakesh Treaty — copyright exception for accessible-format books for print-disabled people."
    },
    {
      id: "history-2017",
      jurisdiction: "timeline",
      type: "Milestone (US)",
      year: "2017",
      name: "Section 508 refresh",
      summary: "Section 508 refresh adopts WCAG 2.0 Level AA as conformance criteria."
    },
    {
      id: "history-2018",
      jurisdiction: "timeline",
      type: "Milestones",
      year: "2018",
      name: "EU Web Accessibility Directive in force; WCAG 2.1; ADRP adopted",
      summary: "EU WAD takes effect for public-sector websites (Sept 2018). W3C publishes WCAG 2.1. African Union adopts the ADRP."
    },
    {
      id: "history-2019",
      jurisdiction: "timeline",
      type: "Milestones",
      year: "2019",
      name: "EAA adopted + Accessible Canada Act",
      summary: "EU adopts the European Accessibility Act (Directive 2019/882). Canada enacts the Accessible Canada Act."
    },
    {
      id: "history-2023",
      jurisdiction: "timeline",
      type: "Milestones",
      year: "2023",
      name: "WCAG 2.2 published; updated CPACC BoK",
      summary: "W3C publishes WCAG 2.2. IAAP releases CPACC Body of Knowledge v4.0 (October 2023)."
    },
    {
      id: "history-2024",
      jurisdiction: "timeline",
      type: "Milestones",
      year: "2024",
      name: "ADRP in force; ADA Title II web rule",
      summary: "ADRP enters into force. US DOJ finalizes ADA Title II rule requiring WCAG 2.1 AA for state and local government web/mobile content."
    },
    {
      id: "history-2025",
      jurisdiction: "timeline",
      type: "Milestones",
      year: "2025",
      name: "EAA application; AODA goal year",
      summary: "EAA takes substantive effect for private-sector products/services on the EU market (June 28, 2025). AODA's goal year for accessible Ontario."
    },
    {
      id: "history-2040",
      jurisdiction: "timeline",
      type: "Future milestone (Canada)",
      year: "2040",
      name: "ACA goal year",
      summary: "Accessible Canada Act's goal: a barrier-free Canada."
    }
  ]
};
