/**
 * seed.js – Compact seed script
 * Run with: npm run seed
 *
 * Creates:
 *   - 1  Super Admin  (admin@admin.com / 123456)
 *   - 5  Admins
 *   - 50 Instructors
 *   - 100 Students
 *   - 50  Courses (with topic-relevant photos from Picsum/Unsplash)
 *   - 6 Lessons per course
 *   - Progress records for enrolled students
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config();

const User     = require('./src/models/user.model');
const Course   = require('./src/models/course.model');
const Lesson   = require('./src/models/lesson.model');
const Progress = require('./src/models/progress.model');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shuffle  = arr => { const a = [...arr]; for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const sample   = (arr, n) => shuffle(arr).slice(0, n);
const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pastDate = (days = 120) => new Date(Date.now() - randInt(0, days * 86400000));

// ─── Course catalogue (50 courses with topic-relevant photo seeds) ────────────
// Photos use picsum.photos/seed/<word>/640/360 — stable, free, no API key needed

const COURSES = [
  // JavaScript / TypeScript
  { title: 'JavaScript for Beginners', category: 'javascript', photo: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?auto=format&fit=crop&w=640&q=80', desc: 'Learn JS from scratch — variables, functions, DOM and ES6+.' },
  { title: 'Advanced JavaScript Patterns', category: 'javascript', photo: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=640&q=80', desc: 'Master closures, prototypes, design patterns and metaprogramming.' },
  { title: 'TypeScript Deep Dive', category: 'javascript', photo: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=640&q=80', desc: 'Static typing, generics, decorators and strict-mode best practices.' },
  { title: 'Async JavaScript & Promises', category: 'javascript', photo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=640&q=80', desc: 'Callbacks → Promises → async/await with real-world API projects.' },
  { title: 'Node.js & Express Fundamentals', category: 'javascript', photo: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=640&q=80', desc: 'Build RESTful APIs with Node, Express, middleware and JWT auth.' },

  // React / Frontend
  { title: 'React for Beginners', category: 'react', photo: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=640&q=80', desc: 'JSX, props, state, hooks and your first SPA from scratch.' },
  { title: 'React Hooks in Depth', category: 'react', photo: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=640&q=80', desc: 'useState, useEffect, useReducer, useRef and custom hooks.' },
  { title: 'Next.js Full-Stack Apps', category: 'react', photo: 'https://images.unsplash.com/photo-1618477247222-acbdb0e159b3?auto=format&fit=crop&w=640&q=80', desc: 'SSR, SSG, API routes, authentication and deployment on Vercel.' },
  { title: 'Redux Toolkit Masterclass', category: 'react', photo: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=640&q=80', desc: 'Global state management with slices, thunks and RTK Query.' },
  { title: 'React Performance Optimization', category: 'react', photo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=640&q=80', desc: 'Memoization, lazy loading, code splitting and profiling tools.' },

  // CSS / UI
  { title: 'Modern CSS Layouts', category: 'css', photo: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=640&q=80', desc: 'Flexbox, Grid, container queries and modern layout techniques.' },
  { title: 'Tailwind CSS from Scratch', category: 'css', photo: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=640&q=80', desc: 'Utility-first CSS, responsive design and component patterns.' },
  { title: 'CSS Animations & Transitions', category: 'css', photo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=640&q=80', desc: 'Keyframes, timing functions, scroll-driven animations and GSAP.' },
  { title: 'UI/UX Fundamentals', category: 'css', photo: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&w=640&q=80', desc: 'Wireframing, design principles, accessibility and prototyping.' },
  { title: 'Figma to Code', category: 'css', photo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=640&q=80', desc: 'Turn Figma designs into pixel-perfect HTML/CSS components.' },

  // Python
  { title: 'Python for Absolute Beginners', category: 'python', photo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=640&q=80', desc: 'Syntax, data types, loops, functions and your first programs.' },
  { title: 'Python Data Structures & Algos', category: 'python', photo: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=640&q=80', desc: 'Arrays, trees, graphs, sorting and Big-O complexity.' },
  { title: 'Automate the Boring Stuff', category: 'python', photo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=640&q=80', desc: 'File handling, web scraping, email automation and scheduling.' },
  { title: 'Django REST Framework', category: 'python', photo: 'https://images.unsplash.com/photo-1536148935079-bd25580e45b4?auto=format&fit=crop&w=640&q=80', desc: 'Build production-ready REST APIs with Django and DRF.' },
  { title: 'Python for Data Science', category: 'python', photo: 'https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&w=640&q=80', desc: 'Pandas, NumPy, Matplotlib and exploratory data analysis.' },

  // Machine Learning / AI
  { title: 'Machine Learning Foundations', category: 'ml', photo: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=640&q=80', desc: 'Supervised & unsupervised learning, evaluation and feature engineering.' },
  { title: 'Deep Learning with PyTorch', category: 'ml', photo: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=640&q=80', desc: 'Neural networks, CNNs, RNNs and model training from scratch.' },
  { title: 'Natural Language Processing', category: 'ml', photo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=640&q=80', desc: 'Tokenisation, embeddings, transformers and LLM fine-tuning.' },
  { title: 'Computer Vision Fundamentals', category: 'ml', photo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=640&q=80', desc: 'Image classification, object detection and OpenCV.' },
  { title: 'Generative AI & LLMs', category: 'ml', photo: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=640&q=80', desc: 'Prompt engineering, RAG, agents and deploying LLM-powered apps.' },

  // Databases
  { title: 'SQL for Beginners', category: 'database', photo: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=640&q=80', desc: 'SELECT, JOINs, aggregation, indexes and schema design.' },
  { title: 'Advanced PostgreSQL', category: 'database', photo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&w=640&q=80', desc: 'Window functions, CTEs, partitioning and performance tuning.' },
  { title: 'MongoDB & NoSQL Design', category: 'database', photo: 'https://images.unsplash.com/photo-1560732488-6b0df240254a?auto=format&fit=crop&w=640&q=80', desc: 'Documents, aggregation pipeline, indexes and Atlas search.' },
  { title: 'Redis Caching Strategies', category: 'database', photo: 'https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&w=640&q=80', desc: 'Data structures, pub/sub, sessions and rate limiting with Redis.' },
  { title: 'GraphQL API Design', category: 'database', photo: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=640&q=80', desc: 'Schemas, resolvers, subscriptions and Apollo Server.' },

  // DevOps / Cloud
  { title: 'Docker for Developers', category: 'devops', photo: 'https://images.unsplash.com/photo-1605745341112-85968b193ef5?auto=format&fit=crop&w=640&q=80', desc: 'Images, containers, Compose, networking and multi-stage builds.' },
  { title: 'Kubernetes in Production', category: 'devops', photo: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=640&q=80', desc: 'Pods, deployments, services, Helm charts and cluster management.' },
  { title: 'CI/CD with GitHub Actions', category: 'devops', photo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=640&q=80', desc: 'Automate build, test, lint and deploy with reusable workflows.' },
  { title: 'AWS Cloud Practitioner', category: 'devops', photo: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=640&q=80', desc: 'Core AWS services, IAM, S3, EC2, Lambda and billing.' },
  { title: 'Linux for Developers', category: 'devops', photo: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=640&q=80', desc: 'Shell scripting, file system, permissions and process management.' },

  // Cyber Security
  { title: 'Ethical Hacking Fundamentals', category: 'security', photo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=640&q=80', desc: 'Recon, scanning, exploitation and responsible disclosure.' },
  { title: 'Web Application Security', category: 'security', photo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=640&q=80', desc: 'SQLi, XSS, CSRF, broken auth and OWASP Top 10 mitigations.' },
  { title: 'Cryptography for Developers', category: 'security', photo: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=640&q=80', desc: 'Hashing, symmetric/asymmetric encryption, TLS and JWTs.' },
  { title: 'Network Security Essentials', category: 'security', photo: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&w=640&q=80', desc: 'Firewalls, VPNs, IDS/IPS, Wireshark and network hardening.' },
  { title: 'Bug Bounty Hunting', category: 'security', photo: 'https://images.unsplash.com/photo-1526374876133-9d7956a2f30c?auto=format&fit=crop&w=640&q=80', desc: 'Recon techniques, report writing and real-world bug bounty platforms.' },

  // Mobile
  { title: 'Flutter from Scratch', category: 'mobile', photo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=640&q=80', desc: 'Widgets, state management, navigation and publishing to stores.' },
  { title: 'Swift & iOS Development', category: 'mobile', photo: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=640&q=80', desc: 'SwiftUI, navigation, data persistence and App Store submission.' },
  { title: 'Android with Kotlin', category: 'mobile', photo: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?auto=format&fit=crop&w=640&q=80', desc: 'Jetpack Compose, ViewModel, Room and Google Play publishing.' },
  { title: 'React Native Mobile Dev', category: 'mobile', photo: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=640&q=80', desc: 'Cross-platform apps with Expo, navigation and native modules.' },
  { title: 'Mobile UI/UX Design', category: 'mobile', photo: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=640&q=80', desc: 'Human Interface Guidelines, Material Design and accessibility.' },

  // Career
  { title: 'Technical Interview Prep', category: 'career', photo: 'https://images.unsplash.com/photo-1521791136064-7986c2923216?auto=format&fit=crop&w=640&q=80', desc: 'LeetCode patterns, system design questions and mock interviews.' },
  { title: 'System Design Interviews', category: 'career', photo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=640&q=80', desc: 'Scalability, caching, databases, load balancers and real examples.' },
  { title: 'Git & GitHub Mastery', category: 'career', photo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=640&q=80', desc: 'Branching, rebasing, PRs, Actions and open-source workflows.' },
  { title: 'Building a Dev Portfolio', category: 'career', photo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=640&q=80', desc: 'Projects, GitHub profile, personal site and LinkedIn optimisation.' },
  { title: 'Freelancing as a Developer', category: 'career', photo: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=640&q=80', desc: 'Finding clients, writing proposals, pricing and managing projects.' },
];

// ─── Lesson templates per category (6 lessons each) ──────────────────────────

const LESSONS = {
  javascript: [
    { title: 'Variables & Data Types',        content: 'let, const, var and the 7 primitive types.',          duration: 20 },
    { title: 'Functions & Arrow Functions',    content: 'Declarations, expressions, closures and arrows.',    duration: 25 },
    { title: 'Arrays & Higher-Order Methods',  content: 'map, filter, reduce, find and flatMap.',             duration: 30 },
    { title: 'Objects & Destructuring',        content: 'Object literals, spread, rest and patterns.',        duration: 25 },
    { title: 'Promises & Async/Await',         content: 'Async control flow from callbacks to async/await.',  duration: 35 },
    { title: 'ES Modules & Tooling',           content: 'import/export, bundlers and package.json scripts.',  duration: 20 },
  ],
  react: [
    { title: 'JSX & Components',              content: 'Writing JSX and building reusable components.',       duration: 20 },
    { title: 'Props & State',                  content: 'Passing data down and managing local state.',        duration: 25 },
    { title: 'useEffect & Side Effects',       content: 'Effect cleanup and dependency arrays.',              duration: 30 },
    { title: 'Context & Global State',         content: 'React Context API and avoiding prop drilling.',      duration: 25 },
    { title: 'Custom Hooks',                   content: 'Extracting reusable logic into custom hooks.',       duration: 30 },
    { title: 'Performance & Memoization',      content: 'useMemo, useCallback and React.memo.',               duration: 35 },
  ],
  css: [
    { title: 'The Box Model',                  content: 'Margin, border, padding and content areas.',         duration: 15 },
    { title: 'Flexbox Layout',                 content: 'Flex container props and alignment.',                duration: 25 },
    { title: 'CSS Grid',                       content: 'Grid tracks, areas and auto-placement.',             duration: 30 },
    { title: 'Responsive Design',              content: 'Media queries, fluid units and breakpoints.',        duration: 20 },
    { title: 'Custom Properties',              content: 'CSS variables, theming and cascade.',                duration: 20 },
    { title: 'Animations & Keyframes',         content: 'Transitions, transforms and animation timing.',      duration: 25 },
  ],
  python: [
    { title: 'Python Basics',                  content: 'Syntax, types and control flow.',                    duration: 20 },
    { title: 'Functions & Modules',            content: 'Defining functions, scope and imports.',             duration: 25 },
    { title: 'OOP in Python',                  content: 'Classes, inheritance and dunder methods.',           duration: 30 },
    { title: 'File I/O & Exceptions',          content: 'Reading/writing files and error handling.',          duration: 20 },
    { title: 'List Comprehensions',            content: 'Pythonic idioms for transforming data.',             duration: 15 },
    { title: 'Pip & Virtual Environments',     content: 'Managing dependencies and packaging.',               duration: 15 },
  ],
  ml: [
    { title: 'What is ML?',                    content: 'Supervised, unsupervised and RL overview.',          duration: 20 },
    { title: 'Data Preparation',               content: 'Cleaning, scaling and feature selection.',           duration: 30 },
    { title: 'Model Training & Evaluation',    content: 'Train/test split, metrics and cross-validation.',    duration: 35 },
    { title: 'Neural Network Basics',          content: 'Perceptrons, layers, activations and backprop.',     duration: 40 },
    { title: 'Hyperparameter Tuning',          content: 'Grid search, random search and Bayesian opt.',       duration: 25 },
    { title: 'Deploying ML Models',            content: 'Exporting models and serving via REST.',             duration: 30 },
  ],
  database: [
    { title: 'Relational Model Basics',        content: 'Tables, rows, columns and primary keys.',            duration: 20 },
    { title: 'SELECT Queries',                 content: 'Filtering, sorting and aggregating data.',           duration: 25 },
    { title: 'JOINs Explained',                content: 'INNER, LEFT, RIGHT and FULL OUTER joins.',           duration: 30 },
    { title: 'Indexing & Query Plans',         content: 'How indexes speed up reads and cost writes.',        duration: 25 },
    { title: 'Transactions & ACID',            content: 'Atomicity, consistency, isolation, durability.',     duration: 20 },
    { title: 'Schema Design Patterns',         content: 'Normalisation, denormalisation and trade-offs.',     duration: 30 },
  ],
  devops: [
    { title: 'Intro to DevOps',                content: 'Culture, principles and the DevOps lifecycle.',      duration: 20 },
    { title: 'Containerisation with Docker',   content: 'Images, containers, volumes and networking.',        duration: 30 },
    { title: 'Writing Dockerfiles',            content: 'Multi-stage builds and layer caching.',              duration: 25 },
    { title: 'CI/CD Pipelines',                content: 'Automating build, test and deploy steps.',           duration: 30 },
    { title: 'Infrastructure as Code',         content: 'Declarative config with Terraform and Ansible.',     duration: 35 },
    { title: 'Observability & Alerting',       content: 'Logs, metrics, traces and SLOs.',                   duration: 25 },
  ],
  security: [
    { title: 'Security Mindset',               content: 'Threat modelling and attacker perspective.',         duration: 20 },
    { title: 'Common Vulnerabilities',         content: 'SQLi, XSS, CSRF, SSRF and mitigations.',            duration: 30 },
    { title: 'Authentication & Sessions',      content: 'Cookies, JWTs, OAuth 2.0 and pitfalls.',            duration: 25 },
    { title: 'Cryptography Essentials',        content: 'Hashing, symmetric and asymmetric encryption.',     duration: 30 },
    { title: 'Penetration Testing Workflow',   content: 'Recon, scanning, exploitation, reporting.',         duration: 35 },
    { title: 'Hardening Checklists',           content: 'Server, app and dependency hardening steps.',       duration: 20 },
  ],
  mobile: [
    { title: 'Mobile Platform Overview',       content: 'iOS vs Android architecture differences.',          duration: 15 },
    { title: 'Your First Screen',              content: 'Building and navigating between screens.',          duration: 25 },
    { title: 'State Management',               content: 'Local state, providers and shared state.',          duration: 30 },
    { title: 'Networking & REST',              content: 'Fetching data and handling loading states.',        duration: 25 },
    { title: 'Local Storage & Offline',        content: 'AsyncStorage, SQLite and sync strategies.',         duration: 25 },
    { title: 'Publishing Your App',            content: 'App Store and Google Play submission checklist.',   duration: 20 },
  ],
  career: [
    { title: 'Crafting Your Resume',           content: 'Highlighting impact over responsibilities.',        duration: 20 },
    { title: 'Behavioural Interviews',         content: 'STAR method and common questions.',                 duration: 25 },
    { title: 'Coding Interview Patterns',      content: 'Sliding window, two pointers, BFS/DFS.',            duration: 40 },
    { title: 'Negotiating Your Offer',         content: 'Market research, anchoring and counter-offering.',  duration: 20 },
    { title: 'Building in Public',             content: 'GitHub, Twitter/X and personal brand.',             duration: 15 },
    { title: 'Continuous Learning Habits',     content: 'Spaced repetition, side projects and reading.',     duration: 15 },
  ],
};

// ─── Name pools ───────────────────────────────────────────────────────────────

const FIRST = [
  'Liam','Noah','Emma','Olivia','Ava','Sophia','James','Lucas','Mason','Ethan',
  'Mohammed','Fatima','Yusuf','Aisha','Omar','Wei','Jing','Lei','Ming','Hui',
  'Carlos','Sofia','Miguel','Valentina','Diego','Arjun','Priya','Ravi','Neha','Rohit',
  'Kofi','Amara','Kwame','Abena','Yaw','Ivan','Natasha','Dmitri','Olga','Sergei',
  'Hiroshi','Yuki','Kenji','Sakura','Ryo','Daniel','Grace','Chloe','Samuel','Hannah',
];
const LAST = [
  'Smith','Johnson','Williams','Brown','Garcia','Miller','Davis','Wilson','Moore','Taylor',
  'Hassan','Ahmed','Khan','Ibrahim','Rahman','Chen','Wang','Zhang','Liu','Yang',
  'Fernandez','Lopez','Martinez','Gonzalez','Rodriguez','Patel','Shah','Sharma','Singh','Kumar',
  'Osei','Mensah','Asante','Boateng','Owusu','Petrov','Ivanov','Sokolov','Popov','Volkov',
  'Tanaka','Yamamoto','Watanabe','Ito','Nakamura','Anderson','Thomas','Jackson','White','Harris',
];

const usedEmails = new Set();
const makeName  = () => `${FIRST[randInt(0, FIRST.length-1)]} ${LAST[randInt(0, LAST.length-1)]}`;
const makeEmail = (name, role, idx) => {
  let email = `${name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z.]/g, '')}.${role}${idx}@example.com`;
  while (usedEmails.has(email)) email = email.replace(`${role}${idx}`, `${role}${idx}_${randInt(1, 999)}`);
  usedEmails.add(email);
  return email;
};

// Stable topic-relevant thumbnail — picsum.photos/seed/<word>/640/360
const makePhoto = (seed, w = 640, h = 360) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

// ─── Seed ─────────────────────────────────────────────────────────────────────

const seedData = async () => {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // 1. Clear all collections ───────────────────────────────────────────────
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Progress.deleteMany({}),
    ]);
    console.log('🗑️  Old data cleared');

    // 2. Super Admin (fixed, always predictable) ─────────────────────────────
    await User.create({
      username: 'Super Admin',
      email:    'admin@admin.com',
      password: '123456',
      role:     'admin',
    });
    console.log('👑 Super Admin created → admin@admin.com / 123456');

    // 3. Admins (5) ──────────────────────────────────────────────────────────
    const adminDocs = Array.from({ length: 5 }, (_, i) => {
      const name = makeName();
      return {
        username: name,
        email:    makeEmail(name, 'admin', i + 1),
        password: '123456',
        role:     'admin',
      };
    });
    const admins = await User.create(adminDocs);
    console.log(`👑 ${admins.length} admins created`);

    // 4. Instructors (50) ────────────────────────────────────────────────────
    const instructorDocs = Array.from({ length: 50 }, (_, i) => {
      const name = makeName();
      return {
        username: name,
        email:    makeEmail(name, 'instructor', i + 1),
        password: '123456',
        role:     'instructor',
      };
    });
    const instructors = await User.create(instructorDocs);
    console.log(`🎓 ${instructors.length} instructors created`);

    // 5. Students (100) ──────────────────────────────────────────────────────
    const studentDocs = Array.from({ length: 100 }, (_, i) => {
      const name = makeName();
      return {
        username: name,
        email:    makeEmail(name, 'student', i + 1),
        password: '123456',
        role:     'student',
      };
    });
    const students = await User.create(studentDocs);
    console.log(`👩‍🎓 ${students.length} students created`);

    // 6. Courses (50) ────────────────────────────────────────────────────────
    const courseDocs = COURSES.map((c, i) => {
      const instructor = instructors[i % instructors.length];
      const enrolled   = sample(students, randInt(20, 60)).map(s => s._id);
      return {
        title:         c.title,
        description:   c.desc,
        thumbnail: c.photo,   // ← topic-relevant photo URL
        instructor_id: instructor._id,
        students:      enrolled,
        category:      c.category,
      };
    });
    const courses = await Course.create(courseDocs);
    console.log(`📚 ${courses.length} courses created`);

    // 7. Lessons (6 per course = 300 total) ──────────────────────────────────
    const lessonDocs = [];
    for (const course of courses) {
      const templates = LESSONS[course.category] || LESSONS.javascript;
      templates.forEach((tpl, idx) => {
        lessonDocs.push({
          course_id: course._id,
          title:     tpl.title,
          content:   tpl.content,
          order:     idx + 1,
          duration:  tpl.duration,
        });
      });
    }
    const allLessons = await Lesson.create(lessonDocs);
    console.log(`📖 ${allLessons.length} lessons created`);

    // Build courseId → sorted lessons lookup
    const lessonsByCourse = {};
    for (const l of allLessons) {
      const key = l.course_id.toString();
      (lessonsByCourse[key] = lessonsByCourse[key] || []).push(l);
    }

    // 8. Progress records ────────────────────────────────────────────────────
    const progressDocs = [];

    for (const course of courses) {
      const lessons = (lessonsByCourse[course._id.toString()] || [])
        .sort((a, b) => a.order - b.order);
      if (!lessons.length) continue;

      for (const studentId of course.students) {
        if (Math.random() > 0.75) continue; // ~75 % of enrolled students have started

        // Quadratic distribution → more students are early in the course
        const reached = Math.max(1, Math.ceil(Math.random() ** 1.5 * lessons.length));

        for (let li = 0; li < reached && li < lessons.length; li++) {
          const completed = li < reached - 1; // all but the last reached lesson are completed
          const rec = { student_id: studentId, lesson_id: lessons[li]._id, completed };
          if (completed) rec.completed_at = pastDate(120);
          progressDocs.push(rec);
        }
      }
    }

    // Insert in batches of 300
    for (let i = 0; i < progressDocs.length; i += 300) {
      await Progress.create(progressDocs.slice(i, i + 300));
    }
    console.log(`📊 ${progressDocs.length} progress records created`);

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  Admins       : ${admins.length + 1} (incl. Super Admin)`);
    console.log(`  Instructors  : ${instructors.length}`);
    console.log(`  Students     : ${students.length}`);
    console.log(`  Courses      : ${courses.length}`);
    console.log(`  Lessons      : ${allLessons.length}`);
    console.log(`  Progress recs: ${progressDocs.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🔑 Credentials (password: 123456 for all)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Super Admin  →  admin@admin.com');
    console.log(`  Instructor   →  ${instructors[0].email}`);
    console.log(`  Student      →  ${students[0].email}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message);
    if (err.errors) {
      Object.keys(err.errors).forEach(k =>
        console.error(` • ${k}: ${err.errors[k].message}`)
      );
    }
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedData();