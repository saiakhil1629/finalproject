-- SQL script to insert 22 real-world MERN stack internship projects into the problem_statements table.
-- You can copy and execute this code in your Supabase SQL Editor (https://supabase.com -> Project -> SQL Editor).

INSERT INTO problem_statements (title, description) VALUES
(
  'AI-Powered Mock Interview Platform',
  'An interactive AI mock interview platform for web developers.

Key Features & Requirements:
- User Audio Processing: Record answers in React using Web Speech API or MediaRecorder.
- AI Evaluator: Send voice transcripts to Gemini API along with technical questions.
- Feedback Loop: Generate scores, highlight grammatical/conceptual errors, and provide sample answers.
- Dashboard: Keep track of user progress, score histories, and weakness analysis.

Tech Stack Details:
- Frontend: React.js, Tailwind CSS, Web Speech API (Speech-to-Text).
- Backend: Node.js, Express.js, MongoDB (user sessions and scores).
- Integration: Gemini AI API for interview assessment and rating.'
),
(
  'Multi-Vendor E-Commerce Hub with Live Bidding',
  'A dynamic e-commerce system featuring multi-vendor registration and a real-time auction room.

Key Features & Requirements:
- Multi-Vendor Role Setup: Vendors can upload, delete, and modify products and track orders.
- Bidding Arena: Live item bidding section using Socket.io for active bidding state synchronization.
- Payments: Mock/Live payment flows utilizing Stripe SDK.
- Search & Filtration: Full-text search with nested filtering (price, category, ratings).

Tech Stack Details:
- Frontend: React.js, Redux Toolkit, Socket.io-client.
- Backend: Express.js, Node.js, MongoDB (Schema: Users, Products, Bids, Orders).
- Integration: Stripe API for processing payment checkouts.'
),
(
  'Collaborative Kanban Project Management Suite',
  'A team project management app similar to Trello and Jira.

Key Features & Requirements:
- Kanban Workspace: Drag-and-drop task items between columns (To Do, In Progress, Review, Done).
- Real-Time Updates: Multiple users on the same project see movements in real-time.
- Team Roles: Workspace administrators, managers, and collaborators.
- Analytics: Burndown charts and tasks allocation visual progress tracking.

Tech Stack Details:
- Frontend: React.js, Tailwind CSS, react-beautiful-dnd (or @hello-pangea/dnd), Socket.io-client.
- Backend: Node.js, Express.js, MongoDB, Socket.io.
- Integration: Recharts or Chart.js for task completion statistics.'
),
(
  'IoT Smart Home & Energy Monitoring Dashboard',
  'A central control panel to monitor smart devices and visualize electrical energy usage.

Key Features & Requirements:
- Virtual Device Simulation: Control virtual smart hubs (thermostats, bulbs, cameras) in real-time.
- Energy Analytics: Interactive energy consumption dashboards (daily, weekly, monthly logs).
- Action Scheduler: Setup timers and rules (e.g., Turn off AC at 10 PM).
- Alerts: In-app notifications for abnormal voltage fluctuations or high energy consumption.

Tech Stack Details:
- Frontend: React.js, Tailwind CSS, Recharts for charts.
- Backend: Node.js, Express.js, MongoDB (storing device states and metrics history).
- Integration: Node-Cron for scheduled automation checks.'
),
(
  'Telehealth Consultation & Patient Portal',
  'A secure web portal connecting certified doctors with patients.

Key Features & Requirements:
- Consultation Schedulers: Doctors update their availability; patients book appointment slots.
- Live Teleconsultation: Integrated peer-to-peer audio/video calling.
- Prescriptions: Digital prescription builder allowing doctors to export sign-verified PDFs.
- Records Vault: Encrypted upload portal for medical records and test reports.

Tech Stack Details:
- Frontend: React.js, WebRTC APIs (or Simple-Peer), Tailwind CSS.
- Backend: Node.js, Express.js, MongoDB, Socket.io (for signaling server).
- Integration: PDFKit or pdfmake for prescription generation, Cloudinary for reports storage.'
),
(
  'Interactive Learning Management System (LMS)',
  'A course creation and student learning application like Udemy.

Key Features & Requirements:
- Instructor Portal: Custom course creator, video lessons uploader, and quiz builder.
- Player Interface: Seamless video lessons progress tracking and interactive comments.
- Assessment: Auto-graded multiple-choice quizzes and programming assignment submittals.
- Certificates: Automatic PDF certificate generation upon course completion.

Tech Stack Details:
- Frontend: React.js, Redux, Video.js player integration.
- Backend: Express.js, Node.js, MongoDB (courses, quizzes, user progress records).
- Integration: AWS S3 or Cloudinary for secure video storage and streaming.'
),
(
  'Cryptocurrency Portfolio Tracker & Live Paper Trading',
  'A financial trading simulation platform matching real-time market data.

Key Features & Requirements:
- Asset Tracker: Search coins, view live prices, and visualize historical line graphs.
- Paper Simulator: Execute virtual buy/sell trades with mock currency balance.
- Portfolio Ledger: Dynamic statistics showing total net profit/loss calculations.
- Price Alerts: Web socket price tracking triggering email notifications.

Tech Stack Details:
- Frontend: React.js, Recharts, Tailwind CSS.
- Backend: Node.js, Express.js, MongoDB (user wallets, transaction history).
- Integration: CoinGecko API or Binance API, Nodemailer for alert emails.'
),
(
  'Real-time Collaborative Code Editor & Sandbox Compiler',
  'An online pair-programming workspace (similar to CodePen or Repl.it).

Key Features & Requirements:
- Editor Sandbox: Rich syntax highlighting editor (Monaco Editor) supporting HTML, CSS, JS, Python.
- Real-time Cursor Tracking: Socket.io integration to display multiple user cursors and changes.
- Compiler Sandbox: Submit code snippets to a compiler server for live evaluation.
- Live View: Live iframe rendering container for web-design code.

Tech Stack Details:
- Frontend: React.js, @monaco-editor/react, Socket.io-client.
- Backend: Node.js, Express.js, MongoDB, Socket.io.
- Integration: Judge0 API or third-party sandboxed execution runner.'
),
(
  'Smart Expense Tracker & Financial Planner',
  'A finance application to auto-analyze personal expenses and forecast budgets.

Key Features & Requirements:
- Expense Ledger: Add expenses, attach receipt snapshots, and categorize transactions.
- Smart Budgets: Set monthly spending limits per category with progress warning bars.
- Financial Auditor: Export transaction sheets into PDF invoices or CSV spreadsheets.
- Recurring Schedulers: Add subscription expenses that register automatically each month.

Tech Stack Details:
- Frontend: React.js, Tailwind CSS, Chart.js.
- Backend: Express.js, Node.js, MongoDB (receipt URLs, category collections).
- Integration: Multer & Cloudinary for receipts, json2csv/pdfkit for exporting files.'
),
(
  'Real Estate Rental & Property Aggregator',
  'A platform connecting property owners directly with potential tenants.

Key Features & Requirements:
- Interactive Locator: Display listed properties on an interactive map.
- Media Walkthroughs: Upload and navigate property image galleries and walkthrough feeds.
- Live Chat: Built-in messenger connecting tenants with property owners directly.
- Agreement Generator: Customizable digital leasing agreements with signature inputs.

Tech Stack Details:
- Frontend: React.js, Leaflet.js/Google Maps, Socket.io-client.
- Backend: Node.js, Express.js, MongoDB (Users, Listings, Chats).
- Integration: Socket.io for immediate real-time messaging, Canvas for digital sign.'
),
(
  'Restaurant QR-Code Menu & Kitchen Dashboard',
  'A contactless, digital dining solution for restaurants.

Key Features & Requirements:
- Table QR Generator: Unique QR codes per table that automatically open the digital menu on scan.
- Digital Ordering Cart: Add items, modify options, and place orders directly.
- Chef Interface: Live queue showing pending, cooking, and completed food items.
- UPI Payments: Checkout interface simulating bill sharing and UPI payment gateways.

Tech Stack Details:
- Frontend: React.js, Tailwind CSS, Socket.io-client.
- Backend: Node.js, Express.js, MongoDB (Tables, Menu items, Active Orders).
- Integration: qrcode generator package, Socket.io for real-time kitchen syncing.'
),
(
  'Logistics & Supply Chain Shipment Tracker',
  'A logistics solution to track shipments, delivery staff, and routes.

Key Features & Requirements:
- Stepper Progress Bar: Visual progress of packages (Created, In-Transit, Out-for-Delivery, Delivered).
- Interactive Delivery Map: Map interface tracing routes from depot to delivery address.
- Dispatch System: Admin logs packages, selects delivery drivers, and reviews delays.
- Sign-Off: Courier uploads delivery proof (signature + photo).

Tech Stack Details:
- Frontend: React.js, Tailwind CSS, Leaflet.js.
- Backend: Node.js, Express.js, MongoDB (Shipments database collection).
- Integration: Cloudinary (for proof upload), React Signature Canvas.'
),
(
  'Social Community Platform for Developers',
  'A blogging, discussion, and content networking hub like Dev.to.

Key Features & Requirements:
- Article Composer: Markdown-supported draft compiler and content editor.
- Thread discussions: Nested comment threads, upvotes, and topic tagging.
- Community Forums: Dedicated boards for different domains (React, Node, AI, Databases).
- Badges: System rewards user ratings and contributions with gamified profile badges.

Tech Stack Details:
- Frontend: React.js, React-Markdown, Tailwind CSS.
- Backend: Node.js, Express.js, MongoDB (complex nested queries for comments).
- Integration: JWT authentication, markdown parsers.'
),
(
  'Corporate Event Booking & QR Ticketing App',
  'An event management, seat allocation, and digital ticketing engine.

Key Features & Requirements:
- Ticket Booking: Select event, view seating plan, and purchase entry passes.
- QR Ticket Generator: Generates a PDF containing custom event details and a secure verification QR code.
- Checking Agent Dashboard: Scanner app UI for event gates to scan and check-in attendees.
- Event Metrics: Dashboard presenting ticket sales, gross revenue, and check-in ratios.

Tech Stack Details:
- Frontend: React.js, HTML5-Qrcode library, Chart.js.
- Backend: Node.js, Express.js, MongoDB (Events, Tickets database).
- Integration: Stripe API, qr-image generation, PDFKit.'
),
(
  'Secure Cloud Password Vault & Strength Auditor',
  'A cloud password manager tool using advanced encryption strategies.

Key Features & Requirements:
- Encrypted Storage: Cryptographically hashes and encrypts usernames and passwords in the client.
- Security Auditor: Warns on duplicate passwords and flags weak/breached credentials.
- Password Generator: Customizable, high-entropy password generator interface.
- Multi-factor Auth (MFA): Login protection via email OTP validation.

Tech Stack Details:
- Frontend: React.js, Crypto-JS (client-side AES encryption/decryption).
- Backend: Node.js, Express.js, MongoDB (storing base64 encrypted payloads).
- Integration: Nodemailer (for 2FA authentication validation codes).'
),
(
  'Crowdfunding and Social Donation Portal',
  'A platform to pitch charity projects and raise funds like GoFundMe.

Key Features & Requirements:
- Pitch Creator: Build and post campaigns with descriptions, target goals, and images.
- Milestones Stepper: Charts and progress tracking bars reflecting donation stats.
- Rewards Tiers: Dynamic reward packages configured per donation price range.
- Feedbacks: Support message wall where donors leave comments and reactions.

Tech Stack Details:
- Frontend: React.js, Tailwind CSS, Recharts.
- Backend: Node.js, Express.js, MongoDB (Campaigns, Donations, Users).
- Integration: Stripe API for credit card payments.'
),
(
  'Vehicle Rental & Ride Hailing Simulator',
  'A booking system for vehicle rental fleets or dynamic rides.

Key Features & Requirements:
- Booking Engine: Rent cars/bikes by day/hour or select drop-off locations.
- Live Simulation: Simulates vehicle movement on a leaflet map toward the destination.
- Pricing Engine: Dynamic fare calculations taking distance, vehicle class, and peak times.
- Feedback Portal: Double-sided feedback logging reviews for both drivers and riders.

Tech Stack Details:
- Frontend: React.js, Leaflet.js maps, Tailwind CSS.
- Backend: Node.js, Express.js, MongoDB (Vehicle status collections, bookings).
- Integration: Turf.js for geographical calculations.'
),
(
  'Digital Fitness Planner & Nutrition Coach',
  'A comprehensive daily log for workouts, exercises, and dietary tracking.

Key Features & Requirements:
- Workout Planner: Select and save workout routines from categorized libraries.
- Calorie Intake Log: Log meals and fetch detailed nutritional stats (carbs, proteins, fats).
- Tracker Dashboard: Visualize workout streaks and weight progress history.
- Water Tracker: Track intake limits with reminders.

Tech Stack Details:
- Frontend: React.js, Redux Toolkit, Recharts.
- Backend: Node.js, Express.js, MongoDB (user logs, workout plans).
- Integration: USDA Nutrition Database API or Nutritionix API.'
),
(
  'Automated Hotel Booking & Room Service Portal',
  'An administration engine for hotel reservation operations and room service requests.

Key Features & Requirements:
- Room Booker: Check room availability, preview pictures, choose options, and pay bills.
- Room Service App: Guests order room service items or request cleaning.
- Service Board: Kitchen and housekeeping personnel receive requests in real-time.
- Occupancy Chart: Calendar views and charts showing room statuses for hotel admins.

Tech Stack Details:
- Frontend: React.js, Tailwind CSS, Socket.io-client.
- Backend: Node.js, Express.js, MongoDB, Socket.io.
- Integration: FullCalendar library, Stripe API.'
),
(
  'Secure Document Signing & Workspace Agreements',
  'A document collaboration platform like DocuSign.

Key Features & Requirements:
- Sign Pad: Interactive canvas allowing users to draw and save signatures.
- Document Manager: Upload PDF contracts and specify signature locations.
- Invitations Flow: Email contracts to target receivers with active signing tokens.
- Secure Archive: Keeps logs of completed contracts with immutable tamper audits.

Tech Stack Details:
- Frontend: React.js, React-Signature-Canvas, Tailwind CSS.
- Backend: Node.js, Express.js, MongoDB (signed file hashes, user documents).
- Integration: Nodemailer (invitations), PDF-lib (manipulating PDFs on-the-fly).'
),
(
  'Personalized Subscription & OTT Streaming Dashboard',
  'A media video streaming and subscription manager dashboard.

Key Features & Requirements:
- Video Player: Smooth streaming layout supporting pause, forward, and playback speeds.
- Subscriptions Portal: Manage subscription tiers (Free, Premium, VIP) and payment details.
- Watch History: Track viewing status and suggest customized recommendations.
- Interactive Watchlist: Add and remove items from queue.

Tech Stack Details:
- Frontend: React.js, VideoJS, Tailwind CSS.
- Backend: Node.js, Express.js, MongoDB (videos collection, watch histories).
- Integration: Stripe API for subscription plans.'
),
(
  'Interactive Event Networking & Matchmaking App',
  'A matchmaking platform designed for event and professional conferences.

Key Features & Requirements:
- Profile Matcher: User defines skills and interests; matcher lists compatible profiles.
- Direct Networking: Connect, exchange digital business cards, and chat.
- Meeting Planner: Schedule and confirm brief 1-on-1 calls.
- Peer Video: Instant WebRTC calling inside chats.

Tech Stack Details:
- Frontend: React.js, WebRTC, Tailwind CSS.
- Backend: Node.js, Express.js, MongoDB (Matches, chats, events database).
- Integration: Socket.io for direct chat and signaling server.'
);
