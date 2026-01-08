// CBSE Curriculum Data - Classes 6-12

export const CLASS_STANDARDS = [6, 7, 8, 9, 10, 11, 12] as const;
export type ClassStandard = typeof CLASS_STANDARDS[number];

export const SUBJECTS: Record<ClassStandard, string[]> = {
  6: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
  7: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
  8: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
  9: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Information Technology'],
  10: ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi', 'Information Technology'],
  11: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'Economics', 'Accountancy', 'Business Studies', 'History', 'Political Science', 'Geography'],
  12: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science', 'Economics', 'Accountancy', 'Business Studies', 'History', 'Political Science', 'Geography'],
};

export const CHAPTERS: Record<ClassStandard, Record<string, string[]>> = {
  6: {
    'Mathematics': [
      'Knowing Our Numbers', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometrical Ideas',
      'Understanding Elementary Shapes', 'Integers', 'Fractions', 'Decimals', 'Data Handling',
      'Mensuration', 'Algebra', 'Ratio and Proportion', 'Symmetry', 'Practical Geometry'
    ],
    'Science': [
      'Food: Where Does It Come From?', 'Components of Food', 'Fibre to Fabric', 'Sorting Materials',
      'Separation of Substances', 'Changes Around Us', 'Getting to Know Plants', 'Body Movements',
      'The Living Organisms', 'Motion and Measurement', 'Light, Shadows and Reflections',
      'Electricity and Circuits', 'Fun with Magnets', 'Water', 'Air Around Us', 'Garbage In, Garbage Out'
    ],
    'Social Science': [
      'What, Where, How and When?', 'From Gathering to Growing Food', 'In the Earliest Cities',
      'What Books and Burials Tell Us', 'Kingdoms, Kings and Early Republic', 'New Questions and Ideas',
      'The Earth in the Solar System', 'Globe: Latitudes and Longitudes', 'Motions of the Earth',
      'Maps', 'Major Domains of the Earth', 'India: Climate, Vegetation and Wildlife'
    ],
    'English': [
      'A Tale of Two Birds', 'The Friendly Mongoose', 'The Shepherd\'s Treasure', 'Tansen',
      'The Monkey and the Crocodile', 'The Wonder Called Sleep', 'A Pact with the Sun'
    ],
    'Hindi': [
      'वह चिड़िया जो', 'बचपन', 'नादान दोस्त', 'चाँद से थोड़ी सी गप्पें', 'अक्षरों का महत्व',
      'पार नज़र के', 'साथी हाथ बढ़ाना', 'ऐसे-ऐसे', 'टिकट एल्बम', 'झाँसी की रानी'
    ]
  },
  7: {
    'Mathematics': [
      'Integers', 'Fractions and Decimals', 'Data Handling', 'Simple Equations',
      'Lines and Angles', 'The Triangle and Its Properties', 'Congruence of Triangles',
      'Comparing Quantities', 'Rational Numbers', 'Practical Geometry', 'Perimeter and Area',
      'Algebraic Expressions', 'Exponents and Powers', 'Symmetry', 'Visualising Solid Shapes'
    ],
    'Science': [
      'Nutrition in Plants', 'Nutrition in Animals', 'Fibre to Fabric', 'Heat',
      'Acids, Bases and Salts', 'Physical and Chemical Changes', 'Weather, Climate and Adaptations',
      'Winds, Storms and Cyclones', 'Soil', 'Respiration in Organisms', 'Transportation in Animals and Plants',
      'Reproduction in Plants', 'Motion and Time', 'Electric Current and Its Effects',
      'Light', 'Water: A Precious Resource', 'Forests: Our Lifeline', 'Wastewater Story'
    ],
    'Social Science': [
      'Environment', 'Inside Our Earth', 'Our Changing Earth', 'Air', 'Water',
      'Natural Vegetation and Wildlife', 'Human Environment: Settlement, Transport and Communication',
      'Human Environment Interactions', 'Life in the Deserts', 'Tracing Changes Through a Thousand Years'
    ],
    'English': [
      'Three Questions', 'A Gift of Chappals', 'Gopal and the Hilsa Fish', 'The Ashes That Made Trees Bloom',
      'Quality', 'Expert Detectives', 'The Invention of Vita-Wonk', 'Fire: Friend and Foe', 'A Bicycle in Good Repair'
    ],
    'Hindi': [
      'हम पंछी उन्मुक्त गगन के', 'दादी माँ', 'हिमालय की बेटियाँ', 'कठपुतली', 'मीठाईवाला',
      'रक्त और हमारा शरीर', 'पापा खो गए', 'शाम एक किसान', 'चिड़िया की बच्ची'
    ]
  },
  8: {
    'Mathematics': [
      'Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals',
      'Practical Geometry', 'Data Handling', 'Squares and Square Roots', 'Cubes and Cube Roots',
      'Comparing Quantities', 'Algebraic Expressions and Identities', 'Visualising Solid Shapes',
      'Mensuration', 'Exponents and Powers', 'Direct and Inverse Proportions',
      'Factorisation', 'Introduction to Graphs', 'Playing with Numbers'
    ],
    'Science': [
      'Crop Production and Management', 'Microorganisms: Friend and Foe', 'Synthetic Fibres and Plastics',
      'Materials: Metals and Non-Metals', 'Coal and Petroleum', 'Combustion and Flame',
      'Conservation of Plants and Animals', 'Cell: Structure and Functions', 'Reproduction in Animals',
      'Reaching the Age of Adolescence', 'Force and Pressure', 'Friction', 'Sound',
      'Chemical Effects of Electric Current', 'Some Natural Phenomena', 'Light', 'Stars and The Solar System',
      'Pollution of Air and Water'
    ],
    'Social Science': [
      'How, When and Where', 'From Trade to Territory', 'Ruling the Countryside',
      'Tribals, Dikus and the Vision of a Golden Age', 'When People Rebel', 'Weavers, Iron Smelters and Factory Owners',
      'Civilising the Native, Educating the Nation', 'Women, Caste and Reform', 'The Making of the National Movement',
      'Resources', 'Land, Soil, Water, Natural Vegetation and Wildlife Resources', 'Agriculture', 'Industries'
    ],
    'English': [
      'The Best Christmas Present in the World', 'The Tsunami', 'Glimpses of the Past',
      'Bepin Choudhury\'s Lapse of Memory', 'The Summit Within', 'This is Jody\'s Fawn',
      'A Visit to Cambridge', 'A Short Monsoon Diary'
    ],
    'Hindi': [
      'ध्वनि', 'लाख की चूड़ियाँ', 'बस की यात्रा', 'दीवानों की हस्ती', 'चिट्ठियों की अनूठी दुनिया',
      'भगवान के डाकिए', 'क्या निराश हुआ जाए', 'यह सबसे कठिन समय नहीं', 'कबीर की साखियाँ'
    ]
  },
  9: {
    'Mathematics': [
      'Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables',
      'Introduction to Euclid\'s Geometry', 'Lines and Angles', 'Triangles', 'Quadrilaterals',
      'Areas of Parallelograms and Triangles', 'Circles', 'Constructions', 'Heron\'s Formula',
      'Surface Areas and Volumes', 'Statistics', 'Probability'
    ],
    'Science': [
      'Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms and Molecules',
      'Structure of the Atom', 'The Fundamental Unit of Life', 'Tissues',
      'Diversity in Living Organisms', 'Motion', 'Force and Laws of Motion', 'Gravitation',
      'Work and Energy', 'Sound', 'Why Do We Fall Ill', 'Natural Resources', 'Improvement in Food Resources'
    ],
    'Social Science': [
      'The French Revolution', 'Socialism in Europe and the Russian Revolution', 'Nazism and the Rise of Hitler',
      'Forest Society and Colonialism', 'Pastoralists in the Modern World', 'India: Size and Location',
      'Physical Features of India', 'Drainage', 'Climate', 'Natural Vegetation and Wildlife',
      'Population', 'What is Democracy?', 'Constitutional Design', 'Electoral Politics',
      'Working of Institutions', 'Democratic Rights'
    ],
    'English': [
      'The Fun They Had', 'The Sound of Music', 'The Little Girl', 'A Truly Beautiful Mind',
      'The Snake and the Mirror', 'My Childhood', 'Packing', 'Reach for the Top',
      'The Bond of Love', 'Kathmandu', 'If I Were You'
    ],
    'Hindi': [
      'दो बैलों की कथा', 'ल्हासा की ओर', 'उपभोक्तावाद की संस्कृति', 'साँवले सपनों की याद',
      'नाना साहब की पुत्री देवी मैना को भस्म कर दिया गया', 'प्रेमचंद के फटे जूते', 'मेरे बचपन के दिन'
    ],
    'Information Technology': [
      'Communication Skills', 'Self-Management Skills', 'ICT Skills', 'Entrepreneurial Skills',
      'Green Skills', 'Introduction to IT', 'Electronic Spreadsheet', 'Digital Documentation',
      'Electronic Presentation'
    ]
  },
  10: {
    'Mathematics': [
      'Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations',
      'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Introduction to Trigonometry',
      'Some Applications of Trigonometry', 'Circles', 'Constructions', 'Areas Related to Circles',
      'Surface Areas and Volumes', 'Statistics', 'Probability'
    ],
    'Science': [
      'Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals',
      'Carbon and its Compounds', 'Periodic Classification of Elements', 'Life Processes',
      'Control and Coordination', 'How do Organisms Reproduce?', 'Heredity and Evolution',
      'Light: Reflection and Refraction', 'Human Eye and Colourful World', 'Electricity',
      'Magnetic Effects of Electric Current', 'Sources of Energy', 'Our Environment',
      'Management of Natural Resources'
    ],
    'Social Science': [
      'The Rise of Nationalism in Europe', 'Nationalism in India', 'The Making of a Global World',
      'The Age of Industrialisation', 'Print Culture and the Modern World', 'Resources and Development',
      'Forest and Wildlife Resources', 'Water Resources', 'Agriculture', 'Minerals and Energy Resources',
      'Manufacturing Industries', 'Lifelines of National Economy', 'Power Sharing', 'Federalism',
      'Democracy and Diversity', 'Gender, Religion and Caste', 'Popular Struggles and Movements',
      'Political Parties', 'Outcomes of Democracy', 'Challenges to Democracy'
    ],
    'English': [
      'A Letter to God', 'Nelson Mandela: Long Walk to Freedom', 'Two Stories about Flying',
      'From the Diary of Anne Frank', 'The Hundred Dresses', 'The Making of a Scientist',
      'The Necklace', 'The Hack Driver', 'Bholi', 'The Book That Saved the Earth'
    ],
    'Hindi': [
      'सूरदास के पद', 'राम-लक्ष्मण-परशुराम संवाद', 'आत्मत्राण', 'बालगोबिन भगत', 'नेताजी का चश्मा',
      'मानवीय करुणा की दिव्य चमक', 'एक कहानी यह भी', 'स्त्री शिक्षा के विरोधी कुतर्कों का खंडन'
    ],
    'Information Technology': [
      'Communication Skills', 'Self-Management Skills', 'ICT Skills', 'Entrepreneurial Skills',
      'Green Skills', 'Database Management System', 'Electronic Spreadsheet Advanced',
      'Web Applications', 'Maintaining Web Server'
    ]
  },
  11: {
    'Mathematics': [
      'Sets', 'Relations and Functions', 'Trigonometric Functions', 'Principle of Mathematical Induction',
      'Complex Numbers and Quadratic Equations', 'Linear Inequalities', 'Permutations and Combinations',
      'Binomial Theorem', 'Sequences and Series', 'Straight Lines', 'Conic Sections',
      'Introduction to Three Dimensional Geometry', 'Limits and Derivatives', 'Mathematical Reasoning',
      'Statistics', 'Probability'
    ],
    'Physics': [
      'Physical World', 'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane',
      'Laws of Motion', 'Work, Energy and Power', 'System of Particles and Rotational Motion',
      'Gravitation', 'Mechanical Properties of Solids', 'Mechanical Properties of Fluids',
      'Thermal Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves'
    ],
    'Chemistry': [
      'Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements',
      'Chemical Bonding and Molecular Structure', 'States of Matter', 'Thermodynamics', 'Equilibrium',
      'Redox Reactions', 'Hydrogen', 'The s-Block Elements', 'The p-Block Elements',
      'Organic Chemistry: Some Basic Principles', 'Hydrocarbons', 'Environmental Chemistry'
    ],
    'Biology': [
      'The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom',
      'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals',
      'Cell: The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 'Transport in Plants',
      'Mineral Nutrition', 'Photosynthesis in Higher Plants', 'Respiration in Plants',
      'Plant Growth and Development', 'Digestion and Absorption', 'Breathing and Exchange of Gases',
      'Body Fluids and Circulation', 'Excretory Products and their Elimination', 'Locomotion and Movement',
      'Neural Control and Coordination', 'Chemical Coordination and Integration'
    ],
    'English': [
      'The Portrait of a Lady', 'We\'re Not Afraid to Die', 'Discovering Tut: the Saga Continues',
      'Landscape of the Soul', 'The Ailing Planet: the Green Movement\'s Role', 'The Browning Version',
      'The Adventure', 'Silk Road'
    ],
    'Computer Science': [
      'Computer System', 'Encoding Schemes and Number System', 'Emerging Trends', 'Problem Solving',
      'Getting Started with Python', 'Flow of Control', 'Functions', 'Strings', 'Lists',
      'Tuples and Dictionaries', 'Societal Impact'
    ],
    'Economics': [
      'Introduction to Economics', 'Collection of Data', 'Organisation of Data', 'Presentation of Data',
      'Measures of Central Tendency', 'Measures of Dispersion', 'Correlation', 'Introduction to Index Numbers',
      'Use of Statistical Tools', 'Indian Economy on the Eve of Independence', 'Indian Economy 1950-1990',
      'Liberalisation, Privatisation and Globalisation', 'Poverty', 'Human Capital Formation',
      'Rural Development', 'Employment', 'Infrastructure', 'Environment and Sustainable Development'
    ],
    'Accountancy': [
      'Introduction to Accounting', 'Theory Base of Accounting', 'Recording of Business Transactions',
      'Preparation of Ledger, Trial Balance and Bank Reconciliation Statement',
      'Depreciation, Provisions and Reserves', 'Bills of Exchange',
      'Rectification of Errors', 'Financial Statements', 'Financial Statements of Not-for-Profit Organisations',
      'Accounts from Incomplete Records', 'Applications of Computers in Accounting', 'Computerised Accounting System'
    ],
    'Business Studies': [
      'Business, Trade and Commerce', 'Forms of Business Organisations', 'Private, Public and Global Enterprises',
      'Business Services', 'Emerging Modes of Business', 'Social Responsibilities of Business and Business Ethics',
      'Sources of Business Finance', 'Small Business', 'Internal Trade', 'International Business'
    ],
    'History': [
      'From the Beginning of Time', 'Writing and City Life', 'An Empire Across Three Continents',
      'The Central Islamic Lands', 'Nomadic Empires', 'The Three Orders', 'Changing Cultural Traditions',
      'Confrontation of Cultures', 'The Industrial Revolution', 'Displacing Indigenous Peoples', 'Paths to Modernisation'
    ],
    'Political Science': [
      'Constitution: Why and How?', 'Rights in the Indian Constitution', 'Election and Representation',
      'Executive', 'Legislature', 'Judiciary', 'Federalism', 'Local Governments',
      'Political Theory: An Introduction', 'Freedom', 'Equality', 'Social Justice', 'Rights', 'Citizenship', 'Nationalism'
    ],
    'Geography': [
      'Geography as a Discipline', 'The Origin and Evolution of the Earth', 'Interior of the Earth',
      'Distribution of Oceans and Continents', 'Minerals and Rocks', 'Geomorphic Processes',
      'Landforms and their Evolution', 'Composition and Structure of Atmosphere', 'Solar Radiation, Heat Balance and Temperature',
      'Atmospheric Circulation and Weather Systems', 'Water in the Atmosphere', 'World Climate and Climate Change',
      'Water (Oceans)', 'Movements of Ocean Water', 'Life on the Earth', 'Biodiversity and Conservation'
    ]
  },
  12: {
    'Mathematics': [
      'Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants',
      'Continuity and Differentiability', 'Application of Derivatives', 'Integrals',
      'Application of Integrals', 'Differential Equations', 'Vector Algebra',
      'Three Dimensional Geometry', 'Linear Programming', 'Probability'
    ],
    'Physics': [
      'Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity',
      'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction',
      'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments',
      'Wave Optics', 'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei',
      'Semiconductor Electronics', 'Communication Systems'
    ],
    'Chemistry': [
      'The Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics',
      'Surface Chemistry', 'General Principles and Processes of Isolation of Elements',
      'The p-Block Elements', 'The d and f Block Elements', 'Coordination Compounds',
      'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers', 'Aldehydes, Ketones and Carboxylic Acids',
      'Amines', 'Biomolecules', 'Polymers', 'Chemistry in Everyday Life'
    ],
    'Biology': [
      'Reproduction in Organisms', 'Sexual Reproduction in Flowering Plants', 'Human Reproduction',
      'Reproductive Health', 'Principles of Inheritance and Variation', 'Molecular Basis of Inheritance',
      'Evolution', 'Human Health and Disease', 'Strategies for Enhancement in Food Production',
      'Microbes in Human Welfare', 'Biotechnology: Principles and Processes', 'Biotechnology and its Applications',
      'Organisms and Populations', 'Ecosystem', 'Biodiversity and Conservation', 'Environmental Issues'
    ],
    'English': [
      'The Last Lesson', 'Lost Spring', 'Deep Water', 'The Rattrap', 'Indigo', 'Poets and Pancakes',
      'The Interview', 'Going Places', 'My Mother at Sixty-six', 'An Elementary School Classroom',
      'Keeping Quiet', 'A Thing of Beauty', 'A Roadside Stand', 'Aunt Jennifer\'s Tigers'
    ],
    'Computer Science': [
      'Python Revision Tour', 'Functions and Recursion', 'Exception Handling', 'File Handling',
      'Data Structures', 'Computer Networks', 'Database Concepts', 'Structured Query Language',
      'Interface Python with SQL', 'Cyber Safety'
    ],
    'Economics': [
      'Introduction to Microeconomics', 'Theory of Consumer Behaviour', 'Production and Costs',
      'Theory of Firm under Perfect Competition', 'Market Equilibrium', 'Non-Competitive Markets',
      'National Income and Related Aggregates', 'Money and Banking', 'Determination of Income and Employment',
      'Government Budget and the Economy', 'Balance of Payments', 'Development Experience (1947-90)',
      'Economic Reforms Since 1991', 'Current Challenges Facing Indian Economy',
      'Development Experience of India: A Comparison with Neighbours'
    ],
    'Accountancy': [
      'Accounting for Not-for-Profit Organisations', 'Accounting for Partnership Firms: Fundamentals',
      'Reconstitution of Partnership Firm: Admission of a Partner', 'Reconstitution of Partnership Firm: Retirement/Death',
      'Dissolution of Partnership Firm', 'Accounting for Share Capital', 'Issue and Redemption of Debentures',
      'Financial Statements of a Company', 'Analysis of Financial Statements',
      'Accounting Ratios', 'Cash Flow Statement'
    ],
    'Business Studies': [
      'Nature and Significance of Management', 'Principles of Management', 'Business Environment',
      'Planning', 'Organising', 'Staffing', 'Directing', 'Controlling', 'Financial Management',
      'Financial Markets', 'Marketing Management', 'Consumer Protection'
    ],
    'History': [
      'Bricks, Beads and Bones', 'Kings, Farmers and Towns', 'Kinship, Caste and Class',
      'Thinkers, Beliefs and Buildings', 'Through the Eyes of Travellers', 'Bhakti-Sufi Traditions',
      'An Imperial Capital: Vijayanagara', 'Peasants, Zamindars and the State', 'Kings and Chronicles',
      'Colonialism and the Countryside', 'Rebels and the Raj', 'Colonial Cities', 'Mahatma Gandhi',
      'Understanding Partition', 'Framing the Constitution'
    ],
    'Political Science': [
      'The Cold War Era', 'The End of Bipolarity', 'US Hegemony in World Politics', 'Alternative Centres of Power',
      'Contemporary South Asia', 'International Organisations', 'Security in the Contemporary World',
      'Environment and Natural Resources', 'Globalisation', 'Challenges of Nation Building',
      'Era of One Party Dominance', 'Politics of Planned Development', 'India\'s External Relations',
      'Challenges to the Congress System', 'Crisis of Democratic Order', 'Rise of Popular Movements',
      'Regional Aspirations', 'Recent Developments in Indian Politics'
    ],
    'Geography': [
      'Human Geography: Nature and Scope', 'The World Population', 'Population Composition',
      'Human Development', 'Primary Activities', 'Secondary Activities', 'Tertiary and Quaternary Activities',
      'Transport and Communication', 'International Trade', 'Human Settlements',
      'Population: Distribution, Density, Growth and Composition', 'Migration',
      'Human Development', 'Human Settlements', 'Land Resources and Agriculture',
      'Water Resources', 'Mineral and Energy Resources', 'Manufacturing Industries',
      'Planning and Sustainable Development', 'Transport and Communication', 'International Trade',
      'Geographical Perspective on Selected Issues and Problems'
    ]
  }
};

export const DIFFICULTY_LEVELS = ['easy', 'medium', 'hard'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

export const DIFFICULTY_LABELS: Record<DifficultyLevel, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard'
};

export const getSubjectsForClass = (classStandard: ClassStandard): string[] => {
  return SUBJECTS[classStandard] || [];
};

export const getChaptersForSubject = (classStandard: ClassStandard, subject: string): string[] => {
  return CHAPTERS[classStandard]?.[subject] || [];
};
