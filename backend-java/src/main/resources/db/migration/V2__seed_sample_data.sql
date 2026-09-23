-- Track B Flyway Migration: Seed realistic sample tasks and student proposals

INSERT INTO tasks (title, category, owner, status, priority, tags, readiness_score, last_updated, notes, attachment_key, attachment_name)
VALUES
(
    'Build E-Commerce Recommender System Engine',
    'Data',
    'RetailTech Solutions (contact@retailtech.io)',
    'Published',
    'High',
    'Python, Machine Learning, FastAPI, Recommendation Systems',
    92,
    CURRENT_DATE,
    '## Problem Statement\nOur online retail platform currently displays generic trending items. We want a personalized recommendation engine to boost cart conversion by 15%.\n\n## Deliverables\n1. Collaborative filtering model using LightFM.\n2. FastAPI endpoint returning top-10 item IDs.\n3. Evaluation benchmarks in Jupyter.\n\n## Stack\nPython, Docker, Scikit-learn.',
    'brief-ecommerce-recsys.pdf',
    'Project_Brief_RecSys_v1.pdf'
),
(
    'Design Mobile App UX/UI for Student Community Hub',
    'Design',
    'CampusVibe Media (product@campusvibe.org)',
    'Published',
    'Medium',
    'Figma, UI/UX, Mobile Design, User Testing, Prototyping',
    85,
    CURRENT_DATE,
    '## Overview\nCommunity discovery app for students to find campus events and hackathon teams.\n\n## Deliverables\n1. Design system in Figma.\n2. Interactive clickable prototype for 5 core flows.\n3. Usability testing report.',
    'wireframes-campusvibe.pdf',
    'CampusVibe_Early_Sketches.pdf'
),
(
    'Develop Automated Invoicing & Tax Report Generator',
    'Engineering',
    'FintechWorks Accounting (tech-lead@fintechworks.com)',
    'Published',
    'High',
    'Java, Spring Boot, PostgreSQL, PDFBox, REST API',
    88,
    CURRENT_DATE,
    '## Background\nAutomate cross-border tax calculation and PDF invoice generation.\n\n## Deliverables\n1. Spring Boot microservice with PostgreSQL.\n2. PDF generation with Apache PDFBox.\n3. Comprehensive test suite.',
    'tax-rules-spec.pdf',
    'Tax_Compliance_Requirements_2026.pdf'
),
(
    'B2B Market Analysis for Green Energy Storage in EU',
    'Business',
    'EcoPower Global (research@ecopower.eu)',
    'Published',
    'Medium',
    'Market Research, CleanTech, Strategy, Financial Modeling',
    78,
    CURRENT_DATE,
    '## Objective\nAssess market size and competitor landscape for commercial battery storage systems across EU.\n\n## Scope\nTop 5 competitors, financial modeling, executive presentation.',
    NULL,
    NULL
),
(
    'Build Internal Knowledge Base Slack Bot with RAG',
    'Engineering',
    'DevSquad Internal Tools (ops@devsquad.team)',
    'In Progress',
    'Medium',
    'TypeScript, Node.js, Slack API, Vector Database, OpenAI',
    90,
    CURRENT_DATE,
    '## Goal\nInstant answers to internal policy and dev environment questions directly in Slack.\n\n## Deliverables\nVector embeddings index and Slack webhook receiver.',
    'slack-bot-architecture.png',
    'Architecture_Diagram_SlackBot.png'
),
(
    'quick idea for website',
    'Design',
    'SoloFounder',
    'Draft',
    'Low',
    'web',
    28,
    CURRENT_DATE,
    'we need a simple website for shoes quickly.',
    NULL,
    NULL
),
(
    'Customer Churn Prediction Model & Alert Pipeline',
    'Data',
    'Telecom Data Science (ds-team@telecomglobal.com)',
    'Published',
    'High',
    'Python, Scikit-Learn, XGBoost, SQL, Customer Analytics',
    94,
    CURRENT_DATE,
    '## Context\nTrain and deploy customer churn model.\n\n## Deliverables\nFeature engineering, XGBoost classifier with >= 0.84 ROC-AUC, daily automated scoring pipeline.',
    'churn-dataset-schema.pdf',
    'Telecom_Churn_Schema_v2.pdf'
),
(
    'Brand Identity & Style Guide for HealthTech Startup',
    'Design',
    'MedStart Co',
    'Needs Info',
    'Low',
    'Branding, Logo',
    45,
    CURRENT_DATE,
    'We are a medical startup needing branding. Needs logo and colors. Target audience not fully defined yet.',
    NULL,
    NULL
);

INSERT INTO proposals (task_id, student_name, student_contact, pitch, status, created_at, attachment_key, attachment_name)
VALUES
(
    1,
    'Alex Rivera',
    'alex.rivera@cs.edu',
    'Senior CS student with recommendation engine experience. Proficient in Python, LightFM, and Docker. Can deliver within 2 weeks.',
    'Shortlisted',
    CURRENT_TIMESTAMP,
    'resume-alex-rivera.pdf',
    'Alex_Rivera_CV_2026.pdf'
),
(
    1,
    'Elena Rostova',
    't.me/elena_ml',
    'Kaggle Master in ranking competitions. Propose implicit factorization with ALS and FAISS index.',
    'Submitted',
    CURRENT_TIMESTAMP,
    NULL,
    NULL
),
(
    2,
    'Maya Chen',
    'maya.design@uni.edu',
    'Senior Interaction Design student. Experienced in Figma auto-layouts and accessibility standards.',
    'Submitted',
    CURRENT_TIMESTAMP,
    'portfolio-maya-chen.pdf',
    'Maya_Chen_Design_Portfolio.pdf'
),
(
    3,
    'David Park',
    'david.park@dev.io',
    'Software Engineering senior with enterprise Java and Spring Boot experience. Ready to build with 100% test coverage.',
    'Submitted',
    CURRENT_TIMESTAMP,
    'david-park-github.pdf',
    'David_Park_Resume.pdf'
);
