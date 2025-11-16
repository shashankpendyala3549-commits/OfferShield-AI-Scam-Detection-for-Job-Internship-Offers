OfferShield AI — Intelligent Job Offer Scam Detection Platform (v1.0.0)

MIT License | Project Status: Active | Developer: Shashank Preetham

Made with:

Vanilla JS • Tailwind • Firebase • Cloudflare Workers • OCR (PDF.js + Tesseract) • OpenAI (client-side minimal)
No backend servers • Fully browser-run for free-tier hosting

Live Demo

🚀 https://offershield.vercel.app
 (example — update with your link)

Table of Contents

Overview

The Global Problem

Our Solution: OfferShield AI

Core Features

Responsible AI & Safety

Architecture Overview

Tech Stack

Project Structure

Setup Guide

Environment Variables

Running Locally

Deployment Guide

User Experience

Roadmap

About the Developer

License

Overview

OfferShield AI is a real-time, AI-powered platform designed to protect job seekers from fraudulent job and internship offer letters.
Built for the YuKeSong 2025 Global Hackathon, OfferShield scans PDFs, images, and text-based offers to detect fake HR signatures, phishing links, unrealistic salaries, payment scams, and formatting inconsistencies using a multi-layer intelligence system running directly in the browser.

With OfferShield, job seekers finally have a free, instant, private, and accessible shield against modern employment scams — especially students and fresh graduates who are most vulnerable.

The Global Problem

Job offer scams have exploded worldwide due to:

1. Hyper-realistic fake offer letters

Scammers use cloned logos, fake HR signatures, legal formatting, and real company names.

2. Emotional vulnerability

Students fall for “urgent joining”, “refundable deposit”, and “training fee” scams.

3. No tools to verify authenticity

Most users cannot check domains, HR email validity, link safety, or company legitimacy.

4. Financial impact

Millions are lost globally every year from fake recruitment fees.

5. Privacy concerns

Most verification tools require uploading documents to external servers.

Our Solution: OfferShield AI

OfferShield provides a client-side, privacy-safe, AI-powered safety layer for every job seeker.

No backend.
No database needed for analysis.
Runs fully in the browser.

It uses OCR, heuristics, pattern matching, and a lightweight client-side AI model to detect fraud instantly.

Built for social good — as required by the hackathon theme.

Core Features
🧠 1. AI-Powered Offer Analysis (Client-side)

Extracts text from PDFs and images using PDF.js + Tesseract

Runs OpenAI lightweight safety prompts inside the browser

Detects red-flag phrases like:
“refundable deposit”, “urgent payment”, “training fee”, “confirm immediately”

🔍 2. Company Authenticity Scanner

Checks mismatch between HR email and official domain

Flags Gmail/Yahoo emails pretending to be corporate HR

Scans for SSL, domain age, suspicious TLDs

📎 3. Link & Domain Safety Check

Detects phishing URLs, shortened links, and lookalike domains

Flags unsafe TLDs (.xyz, .top, .club, .online)

💸 4. Salary Realism Engine

Compares CTC/Stipend lines with standard ranges

Flags unrealistic or inflated salary scams

📝 5. Document Integrity Score

Identifies mismatched fonts

Bad formatting

Fake logos

Missing legal footers

Inconsistent spacing

Suspicious signatures

🌐 6. Company Existence Check

Quick online presence check

LinkedIn/company website existence validation

GST/registration hints (India)

🔥 7. Scam Pattern Similarity

Trained on common global scam templates:

“Refundable after training”

“Pay before joining”

“WhatsApp only communication”

Produces a 0–100 scam similarity score.

👥 8. Community Scam Fingerprinting

Each offer generates an anonymized hash

If the same scam appears for others → instant warning

Stored in Firebase (free-tier)

💬 9. AI Rewrite Engine

Converts unsafe offers into clean, professional HR-style letters

Helps users learn what a real offer looks like

🛡️ 10. Final Trust Score

Clear classification:

🟢 Likely Genuine

🟡 Needs Verification

🔴 High Scam Risk

Responsible AI & Safety

OfferShield follows safety principles:

✔ Zero document upload to servers
✔ All OCR + analysis runs in the user’s browser
✔ Community reporting hashes do not store text
✔ Explanations are transparent and human-readable
✔ No personal data is collected

Architecture Overview
Browser (Client Only)
│
├── PDF.js → Extract text from PDFs
├── Tesseract.js → OCR for images
├── OpenAI (Browser) → Lightweight analysis
├── Heuristics Engine → 40+ rule-based checks
├── Link Scanner → Regex + domain heuristics
├── Scam Pattern Engine → Phrase similarity scoring
├── UI/UX Frontend → Tailwind + Vanilla JS
│
└── Firebase Realtime DB → Scam reports (optional)


⚡ Zero backend required.
Everything runs on the free tier.

Tech Stack
Frontend

HTML, CSS, JS

Tailwind CSS

PDF.js

Tesseract.js

AI

OpenAI gpt-4o-mini (client-side)

Pattern matching + heuristics

Storage & Infrastructure

Cloudflare Workers (secret key vault)

Firebase Realtime Database

Firebase Auth

Project Structure
OfferShield_AI/
│── index.html
│── app.js
│── styles.css
│── /assets
│── /utils
│── /ocr
│── /firebase
│── README.md

Setup Guide
1. Clone the Repo
git clone https://github.com/shashankpreetham/offershield
cd offershield

2. Install Dependencies (Optional)

If you use local OCR helpers:

npm install

Environment Variables

Create worker.js secret on Cloudflare:

OPENAI_API_KEY = xxxxxxxxxxxxx


Firebase config stored in app.js.

Running Locally

Just open the project in a browser:

index.html


No server needed.

Deployment Guide
🌩️ Cloudflare Pages

Upload static folder → done.

🔥 Firebase Hosting
firebase deploy

▲ Vercel

Drag-and-drop deploy.

User Experience

OfferShield provides:

Drag-and-drop PDF/Image upload

Animated preloader

Red-flag highlight visualizer

Trust score gauge

Clean report output

One-click scam reporting

Corporate-style safe letter generation

Designed for hackathon judges, students, and real-world users.

Roadmap
Short Term

Multi-language support

More scam pattern datasets

Offline PWA mode

Mid Term

Browser-based mini-ML model

Better company verification extensions

Plugin for LinkedIn/Job portals

Long Term Vision

Global decentralized scam database

Recruitment safety certifications

Government/campus onboarding partnerships

About the Developer

👨‍💻 Developer: Shashank Preetham
AI Engineer & Full Stack Developer passionate about solving real-world problems and building socially impactful AI tools.

License

MIT — free to use, improve, and build upon.
