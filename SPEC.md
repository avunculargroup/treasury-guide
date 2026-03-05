# Bitcoin Treasury Platform — MVP Specification

> **For Claude Code**: Build this application exactly as specified. This is a complete one-shot specification. Follow the build order in Section 9. Ask no clarifying questions — make sensible decisions for anything not explicitly specified.

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Journey & Phases](#2-user-journey--phases)
3. [Entity Types & Branching](#3-entity-types--branching)
4. [Core Features](#4-core-features)
5. [Technical Architecture](#5-technical-architecture)
6. [Data Model](#6-data-model)
7. [Routes & Pages](#7-routes--pages)
8. [Mastra AI Integration](#8-mastra-ai-integration)
9. [Content Structure](#9-content-structure)
10. [MVP Scope & Exclusions](#10-mvp-scope--exclusions)
11. [Non-Functional Requirements](#11-non-functional-requirements)
12. [Build Order](#12-build-order)

---

## 1. Product Overview

### What It Is

A guided, single-user web application that helps Australian entities navigate the process of adopting and maintaining a Bitcoin treasury. It functions as a **smart advisory wizard** — combining structured educational content, an AI-powered chat assistant, and automated Mastra agent workflows to guide a decision-maker (CFO, trustee, director, or sole trader) from initial awareness through to a personalised implementation plan.

### What It Is NOT

- Not a financial advice service
- Not a live portfolio tracker or price dashboard
- Not a transaction or accounting system
- Not a multi-user / collaborative platform
- Not integrated with exchanges, wallets, or banking APIs

### Core Value Proposition

- Personalised guidance anchored in Australian regulatory context (ATO, ASIC, APRA)
- Entity-aware journey that branches based on organisation type
- Persistent AI chat assistant available throughout all phases
- Mastra-powered workflows that produce tangible, personalised business artifacts
- Progress saved across sessions

### Disclaimer Requirement

Every page must display a footer disclaimer: _"This platform provides general educational information only and does not constitute financial, legal, or tax advice. Consult a qualified adviser for guidance specific to your circumstances."_

AI-generated outputs must include an inline disclaimer above the content.

---

## 2. User Journey & Phases

The platform guides users through **four sequential phases**. Users can move forward and backward freely. All progress, responses, and artifacts are persisted.

```
Onboarding → Phase 1: LEARN → Phase 2: DECIDE → Phase 3: PLAN → Phase 4: TRACK
```

### Phase 1 — Learn

Educational content tailored to the user's entity type. Covers Bitcoin treasury fundamentals and the Australian-specific regulatory landscape.

**Content areas:**

- What is a Bitcoin treasury? (global context, company case studies)
- Why companies hold Bitcoin (inflation hedge, diversification, brand signal)
- Australian regulatory context:
  - ATO treatment: CGT vs trading stock, FY reporting obligations
  - ASIC considerations for listed vs unlisted entities
  - APRA relevance (where applicable)
  - Banking relationships and AML/CTF obligations
- Risks: volatility, custody, regulatory, reputational
- Custody models: exchange custody, third-party custodian, self-custody, multi-sig

**Behaviour:** Content modules render based on `entityType`. All entity types share the core modules; entity-specific modules are injected where relevant.

---

### Phase 2 — Decide

A structured self-assessment. Responses are stored to the user profile and used to personalise Phase 3 content and artifact generation.

**Assessment fields to collect:**

| Field | Type | Notes |
|-------|------|-------|
| `riskAppetite` | `low \| medium \| high` | Slider or 3-option select |
| `cashReserveBand` | enum | `<$100k \| $100k–$500k \| $500k–$2m \| $2m–$10m \| $10m+` |
| `investmentHorizon` | enum | `<1yr \| 1–3yrs \| 3–5yrs \| 5yrs+` |
| `hasTreasuryPolicy` | boolean | |
| `accountingSoftware` | string | Xero, MYOB, QuickBooks, Other, None |
| `stakeholderConcerns` | boolean | Shareholders / beneficiaries / members to consider |
| `priorCryptoExposure` | `none \| some \| significant` | |
| `boardApprovalRequired` | boolean | Auto-set based on entityType; editable |
| `listedEntity` | boolean | Auto-set for Public Company; editable |

**Output: Fit Assessment**

After completing the questionnaire, a Mastra workflow generates a fit assessment with:
- A fit score: `Recommended | Explore Further | Not Recommended`
- Plain-language explanation (3–5 sentences)
- 3–5 entity-specific risk flags
- Suggested next steps

---

### Phase 3 — Plan

Strategy development guided by Phase 2 responses. AI agent workflows are most active here.

**Content areas (entity-branched):**

- Allocation sizing: % of treasury, DCA vs lump sum guidance
- Legal and structural considerations by entity type
- Custody selection framework → recommendation based on `cashReserveBand` + `riskAppetite`
- Accounting policy elections and treatment
- Purchase process and internal approval workflow
- Security and key management basics

**Primary output triggered here:** Implementation Checklist (see Section 8).

---

### Phase 4 — Track

A lightweight checklist tracker. No live financial data — purely task and milestone tracking tied to the generated implementation checklist.

**Features:**
- View full generated checklist organised by category
- Mark items: `not_started | in_progress | complete | blocked`
- Add a notes field to any item
- Flag blocked items with a reason
- Category-level progress bars
- Overall completion percentage

---

## 3. Entity Types & Branching

Entity type is captured at onboarding. It drives content branching, regulatory context, and artifact personalisation throughout.

| Entity Type | Typical User | Key Regulatory Scope |
|------------|-------------|---------------------|
| **Self Managed Super Fund (SMSF)** | Trustee / Member | SIS Act, sole purpose test, SMSF investment strategy, ATO SMSF reporting, no LRBA for crypto |
| **Sole Trader** | Individual / Tradesperson | Personal income tax, ATO CGT vs trading stock, simplified accounting |
| **Not For Profit (NFP)** | CEO / Finance Manager | ACNC obligations, investment mandate, donor/grant compliance |
| **Private Company** | CFO / Director | Corporations Act duties, board approval, shareholder considerations, corporate tax |
| **Public Company** | CFO / Company Secretary | ASX/ASIC continuous disclosure, shareholder approval thresholds, enhanced reporting |

### Branching Logic

Implement a `getEntityContent(entityType, phase)` utility that returns entity-specific content modules, checklist templates, and risk flags. Store branching data in `/content/entities/{entityType}/`.

---

## 4. Core Features

### 4.1 Authentication

- Use **Clerk** for authentication (simplest integration with Next.js App Router)
- Email/password sign up and sign in
- Single user per account (no organisations/teams in MVP)
- Protect all `/journey/*` routes — redirect unauthenticated users to `/sign-in`
- On first sign-in after account creation, redirect to `/onboarding`

### 4.2 Onboarding

Route: `/onboarding`

- Step 1: Select entity type (5 options, card-based UI with icon and one-line description each)
- Step 2: Enter display name (used to personalise UI, e.g. "Welcome back, Sarah")
- Step 3: Brief intro to the platform and what to expect
- On complete: create `UserProfile` record, redirect to `/journey`

### 4.3 Journey Dashboard

Route: `/journey`

- Shows all 4 phases as cards with status: `locked | available | in_progress | complete`
- Phase 2 unlocks after Phase 1 is marked complete; Phase 3 after Phase 2; Phase 4 after checklist is generated
- Shows entity type badge and display name
- Quick access to the AI chat panel

### 4.4 AI Chat Assistant

- Persistent slide-out panel accessible from any page via a floating button
- Powered by a Mastra Agent (see Section 8)
- Context injected per request: `entityType`, `currentPhase`, `assessmentResponses` (summary)
- Conversation history stored in `ChatMessage` table, last 20 messages sent as context
- Includes inline disclaimer: _"This assistant provides general information only."_
- Loading state with typing indicator

### 4.5 Progress Persistence

- All phase completions stored in `JourneyProgress`
- All assessment responses stored in `Assessment`
- Generated artifacts stored in `Artifact`
- Checklist item statuses stored in `ChecklistItem`
- On page load, hydrate UI state from DB — user resumes exactly where they left off

---

## 5. Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Database | PostgreSQL |
| ORM | Prisma |
| Hosting | Vercel |
| AI Orchestration | Mastra AI |
| LLM | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| PDF Export | `@react-pdf/renderer` |

### Environment Variables Required

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/journey
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database
DATABASE_URL=

# Anthropic
ANTHROPIC_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Project Structure

```
/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── onboarding/
│   ├── journey/
│   │   ├── page.tsx              # Dashboard
│   │   ├── learn/
│   │   ├── decide/
│   │   ├── plan/
│   │   └── track/
│   ├── artifacts/
│   │   └── [id]/
│   ├── api/
│   │   ├── chat/
│   │   └── workflows/
│   │       ├── fit-assessment/
│   │       └── checklist/
│   └── layout.tsx
├── components/
│   ├── chat/
│   ├── journey/
│   ├── checklist/
│   └── ui/
├── lib/
│   ├── mastra/
│   │   ├── agents/
│   │   ├── workflows/
│   │   └── tools/
│   ├── prisma.ts
│   └── utils.ts
├── content/
│   ├── entities/
│   │   ├── smsf/
│   │   ├── sole-trader/
│   │   ├── nfp/
│   │   ├── private-company/
│   │   └── public-company/
│   └── shared/
├── prisma/
│   └── schema.prisma
└── types/
```

---

## 6. Data Model

### Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum EntityType {
  SMSF
  SOLE_TRADER
  NFP
  PRIVATE_COMPANY
  PUBLIC_COMPANY
}

enum PhaseStatus {
  LOCKED
  AVAILABLE
  IN_PROGRESS
  COMPLETE
}

enum ChecklistItemStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETE
  BLOCKED
}

enum FitScore {
  RECOMMENDED
  EXPLORE_FURTHER
  NOT_RECOMMENDED
}

model UserProfile {
  id          String     @id @default(cuid())
  clerkUserId String     @unique
  displayName String
  entityType  EntityType
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  progress     JourneyProgress[]
  assessments  Assessment[]
  artifacts    Artifact[]
  chatMessages ChatMessage[]
}

model JourneyProgress {
  id          String      @id @default(cuid())
  userId      String
  phase       Int         // 1, 2, 3, 4
  status      PhaseStatus @default(AVAILABLE)
  completedAt DateTime?
  updatedAt   DateTime    @updatedAt

  user UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, phase])
}

model Assessment {
  id        String   @id @default(cuid())
  userId    String
  responses Json     // stores all Phase 2 form responses
  fitScore  FitScore?
  fitSummary String?  // AI-generated plain language explanation
  riskFlags  Json?   // array of entity-specific risk flag strings
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Artifact {
  id            String   @id @default(cuid())
  userId        String
  type          String   // "implementation_checklist" | "risk_assessment"
  title         String
  content       Json     // structured artifact content
  generatedAt   DateTime @default(now())
  version       Int      @default(1)

  user          UserProfile    @relation(fields: [userId], references: [id], onDelete: Cascade)
  checklistItems ChecklistItem[]
}

model ChecklistItem {
  id         String              @id @default(cuid())
  artifactId String
  category   String
  title      String
  description String?
  responsible String?            // e.g. "CFO", "Board", "Accountant"
  estimatedDays Int?
  status     ChecklistItemStatus @default(NOT_STARTED)
  notes      String?
  blockedReason String?
  order      Int

  artifact Artifact @relation(fields: [artifactId], references: [id], onDelete: Cascade)
}

model ChatMessage {
  id        String   @id @default(cuid())
  userId    String
  role      String   // "user" | "assistant"
  content   String
  phase     Int?     // which phase the user was on when message was sent
  createdAt DateTime @default(now())

  user UserProfile @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 7. Routes & Pages

| Route | Description | Auth |
|-------|-------------|------|
| `/` | Landing page | Public |
| `/sign-in` | Clerk sign in | Public |
| `/sign-up` | Clerk sign up | Public |
| `/onboarding` | Entity type selection + setup | Required |
| `/journey` | Phase dashboard | Required |
| `/journey/learn` | Phase 1 — educational content | Required |
| `/journey/decide` | Phase 2 — assessment questionnaire | Required |
| `/journey/plan` | Phase 3 — strategy builder | Required |
| `/journey/track` | Phase 4 — checklist tracker | Required |
| `/artifacts/[id]` | View generated artifact | Required |
| `/api/chat` | POST — Mastra agent chat | Required |
| `/api/workflows/fit-assessment` | POST — trigger fit assessment workflow | Required |
| `/api/workflows/checklist` | POST — trigger checklist generation workflow | Required |

### Landing Page (`/`)

Must include:
- Headline and value proposition
- The 5 entity types listed as use cases
- A "Get Started" CTA → `/sign-up`
- Brief explanation of the 4-phase journey
- Disclaimer in footer

---

## 8. Mastra AI Integration

### Setup

Install Mastra: `npm install @mastra/core`

Create `/lib/mastra/index.ts` as the Mastra instance. All agents and workflows are registered here.

### Agent: Treasury Chat Assistant

**File:** `/lib/mastra/agents/chat-agent.ts`

```typescript
// Pseudocode — implement using Mastra agent API
const chatAgent = new Agent({
  name: 'TreasuryChatAssistant',
  model: 'claude-sonnet-4-20250514',
  systemPrompt: `You are an expert assistant helping Australian businesses and individuals 
    understand Bitcoin treasury management. You have deep knowledge of Australian tax law (ATO), 
    corporate regulations (ASIC, Corporations Act), superannuation law (SIS Act), and 
    Bitcoin custody and security practices.
    
    The user's entity type is: {entityType}
    The user is currently on phase: {currentPhase}
    
    IMPORTANT RULES:
    - Always answer in the context of Australian law and regulations
    - Never provide specific financial, legal, or tax advice
    - Always recommend the user consult a qualified professional for their specific situation
    - Be helpful, clear, and educational
    - Keep responses concise — 2-4 paragraphs maximum unless the user asks for detail`,
  tools: [getEntityGuidanceTool, getPhaseContentTool]
})
```

**API Route:** `/api/chat/route.ts`

- Accepts `POST` with `{ message: string, conversationHistory: Message[] }`
- Injects user context (entityType, currentPhase) from session
- Returns streaming response
- Stores user message and assistant response to `ChatMessage` table

### Tool: getEntityGuidanceTool

Returns regulatory context and key considerations for the user's entity type. Reads from `/content/entities/{entityType}/guidance.json`.

### Tool: getPhaseContentTool

Returns a summary of the current phase's content and where the user is up to.

---

### Workflow 1: Fit Assessment Generator

**File:** `/lib/mastra/workflows/fit-assessment.ts`  
**Trigger:** User submits Phase 2 questionnaire  
**API Route:** `POST /api/workflows/fit-assessment`

**Input:**
```typescript
{
  entityType: EntityType,
  responses: AssessmentResponses  // all Phase 2 fields
}
```

**Steps:**
1. **Validate inputs** — ensure all required fields present
2. **Score** — apply rule-based scoring logic:
   - SMSF + `riskAppetite: low` + `cashReserveBand: <$100k` → likely `NOT_RECOMMENDED`
   - `riskAppetite: high` + `cashReserveBand: $2m+` + `investmentHorizon: 3yrs+` → likely `RECOMMENDED`
   - All others → `EXPLORE_FURTHER` as default, adjusted by Claude
3. **Generate summary** — Claude call with assessment responses, returns:
   - `fitScore: FitScore`
   - `fitSummary: string` (3–5 sentence plain English explanation)
   - `riskFlags: string[]` (3–5 entity-specific risks)
4. **Persist** — save to `Assessment` record
5. **Return** — full assessment result to client

**Prompt template for Step 3:**
```
You are assessing whether a Bitcoin treasury is appropriate for the following Australian entity.

Entity Type: {entityType}
Assessment Responses: {responses}
Preliminary Score: {prelimScore}

Provide a JSON response with:
- fitScore: "RECOMMENDED" | "EXPLORE_FURTHER" | "NOT_RECOMMENDED"  
- fitSummary: plain English explanation in 3-5 sentences, specific to their entity type and responses
- riskFlags: array of 3-5 specific risks relevant to this entity type and their situation

Consider Australian regulatory context. Be honest if Bitcoin is not appropriate.
Return valid JSON only, no other text.
```

---

### Workflow 2: Implementation Checklist Generator

**File:** `/lib/mastra/workflows/checklist.ts`  
**Trigger:** User completes Phase 3 planning steps  
**API Route:** `POST /api/workflows/checklist`

**Input:**
```typescript
{
  entityType: EntityType,
  assessmentResponses: AssessmentResponses,
  planningResponses: {
    custodyPreference: 'exchange' | 'third_party' | 'self_custody' | 'multi_sig',
    allocationApproach: 'dca' | 'lump_sum' | 'undecided',
    accountingSoftware: string,
    targetAllocationPercent: number,
    boardApprovalRequired: boolean,
    hasExistingCryptoPolicy: boolean
  }
}
```

**Steps:**
1. **Load base template** — read `/content/entities/{entityType}/checklist-template.json`
2. **Personalise with Claude** — send template + user inputs, Claude returns personalised checklist JSON
3. **Validate output** — ensure all required fields present
4. **Persist** — create `Artifact` and `ChecklistItem` records
5. **Return** — artifact ID to client → client navigates to `/artifacts/{id}`

**Checklist Structure:**

```typescript
interface ChecklistOutput {
  title: string
  entityType: EntityType
  generatedAt: string
  categories: {
    name: string
    description: string
    items: {
      title: string
      description: string
      responsible: string      // "CFO" | "Board" | "Accountant" | "Legal" | "IT"
      estimatedDays: number
      order: number
    }[]
  }[]
}
```

**Required checklist categories (all entity types):**

1. Internal Approval & Governance
2. Legal & Compliance Setup
3. Accounting & Tax Preparation
4. Custody & Security Setup
5. Banking & Fiat On-ramp
6. First Purchase Execution
7. Ongoing Maintenance Setup

Entity-specific categories to add:
- SMSF: "SMSF Trust Deed & Investment Strategy Update"
- Public Company: "ASX/ASIC Disclosure Requirements"
- NFP: "Board & Governance Approvals", "Donor/Grant Compliance Review"

---

## 9. Content Structure

All content lives in `/content/`. Use MDX for prose modules and JSON for structured data.

### Content Files Required

```
/content/
├── shared/
│   ├── what-is-bitcoin-treasury.mdx
│   ├── why-companies-hold-bitcoin.mdx
│   ├── custody-models.mdx
│   └── risks-overview.mdx
├── entities/
│   ├── smsf/
│   │   ├── guidance.json          # regulatory context for chat tool
│   │   ├── learn.mdx              # entity-specific Phase 1 content
│   │   ├── regulatory-context.mdx
│   │   └── checklist-template.json
│   ├── sole-trader/
│   │   └── [same files]
│   ├── nfp/
│   │   └── [same files]
│   ├── private-company/
│   │   └── [same files]
│   └── public-company/
│       └── [same files]
```

### guidance.json Shape (per entity)

```json
{
  "entityType": "SMSF",
  "regulatoryBodies": ["ATO", "APRA"],
  "keyLegislation": ["SIS Act 1993", "ITAA 1997"],
  "keyConsiderations": [
    "Bitcoin must pass the sole purpose test",
    "Must be included in the fund's investment strategy",
    "Trustees have personal liability for compliance breaches"
  ],
  "commonRisks": [...],
  "recommendedProfessionals": ["SMSF Auditor", "SMSF Specialist Adviser", "Tax Agent"]
}
```

### checklist-template.json Shape (per entity)

```json
{
  "entityType": "SMSF",
  "categories": [
    {
      "name": "SMSF Trust Deed & Investment Strategy Update",
      "description": "Ensure your trust deed and investment strategy permit Bitcoin investment",
      "items": [
        {
          "title": "Review trust deed for crypto investment permissions",
          "description": "Engage your SMSF administrator to review whether the trust deed explicitly permits digital assets",
          "responsible": "SMSF Administrator",
          "estimatedDays": 14,
          "order": 1
        }
      ]
    }
  ]
}
```

> **Note for Claude Code:** Populate the content files with accurate, well-researched information. For Australian regulatory content, be specific and accurate — this is the core value of the product.

---

## 10. MVP Scope & Exclusions

### In Scope

- All 5 entity types with branched content and checklist templates
- All 4 journey phases
- Clerk authentication + persistent single-user session
- AI Chat Assistant (Mastra Agent)
- Fit Assessment workflow (Mastra)
- Implementation Checklist workflow (Mastra)
- Phase 4 checklist tracker with status, notes, progress bars
- PDF export of implementation checklist
- Responsive design (desktop primary, tablet acceptable, mobile best-effort)
- Landing page

### Explicitly Out of Scope

- Multi-user / team features
- Live Bitcoin price or portfolio data
- Exchange or wallet API integrations
- Accounting software integrations (Xero, MYOB, etc.)
- Board presentation or treasury policy generation (post-MVP workflows)
- Email notifications or reminders
- Admin CMS
- Billing / subscriptions
- Native mobile app

---

## 11. Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Performance | LCP < 2.5s, page load < 3s |
| Security | All API keys server-side only. No secrets in client bundle. HTTPS enforced. |
| Accessibility | WCAG 2.1 AA target |
| AI Safety | Chat agent must not provide specific financial advice. All AI outputs include disclaimer. |
| Error Handling | All API routes return consistent `{ success, data, error }` shape. Mastra workflow failures show user-friendly error with retry option. |
| Loading States | All async operations show loading UI. Chat uses streaming with typing indicator. Workflow generation shows multi-step progress. |
| TypeScript | Strict mode. No `any` types. |

---

## 12. Build Order

Build in this exact sequence. Each step should be complete and working before moving to the next.

1. **Scaffold** — `npx create-next-app@latest` with TypeScript, Tailwind, App Router. Install all dependencies. Set up Prisma with PostgreSQL. Configure Clerk.

2. **Database** — Write and apply Prisma schema. Generate client. Seed with test user.

3. **Auth + Middleware** — Clerk integration. Protect `/journey/*` and `/onboarding` routes. Handle post-signup redirect to `/onboarding`.

4. **Onboarding flow** — `/onboarding` with entity type selection (card UI), display name input, create `UserProfile` on complete.

5. **Journey shell** — `/journey` dashboard, phase card components with lock/unlock logic, phase layout with nav and disclaimer footer. No phase content yet.

6. **Chat infrastructure** — Mastra setup, chat agent, `/api/chat` route with streaming, chat panel UI component, message persistence.

7. **Phase 1 — Learn** — Content rendering from MDX, entity-branched module loading, mark-as-complete flow.

8. **Phase 2 — Decide** — Assessment questionnaire UI (all fields from Section 2), response persistence, trigger fit assessment workflow, display result.

9. **Fit Assessment Workflow** — Mastra workflow, Claude prompt, result persisted to `Assessment`, result display component.

10. **Phase 3 — Plan** — Strategy content (entity-branched), planning response collection, checklist generation trigger.

11. **Checklist Generation Workflow** — Mastra workflow, Claude personalisation, `Artifact` + `ChecklistItem` persistence, redirect to artifact page.

12. **Phase 4 — Track** — Checklist display with categories, status controls, notes, progress bars, completion percentage.

13. **PDF Export** — `@react-pdf/renderer` checklist export, download button on artifact page.

14. **Landing Page** — `/` with value proposition, entity types, phase overview, CTA, disclaimer.

15. **Polish** — Responsive design pass, error states, empty states, loading states, accessibility audit.

---

## Appendix: Key Design Decisions

- **Clerk over NextAuth**: Simpler setup, better Next.js App Router support, handles edge cases (session refresh, etc.)
- **JSON for assessment responses**: Flexible schema as questions evolve; no migrations needed for new fields
- **MDX for content**: Allows rich content with components (callout boxes, entity badges) without a CMS
- **Mastra over raw Claude API calls**: Structured workflow execution, retry logic, tool calling, and agent memory management
- **Artifact versioning**: `version` field on `Artifact` allows regeneration without losing history (increment version, keep old)
- **Checklist as separate model**: `ChecklistItem` records allow granular status tracking in Phase 4 without re-parsing the artifact JSON

---

_Bitcoin Treasury Platform MVP Specification v1.0_  
_Stack: Next.js 15 · TypeScript · Clerk · Prisma · PostgreSQL · Mastra AI · Anthropic Claude API_

# SPEC Addendum — BTS Service Promotions
## Section 13: In-Product Service Promotion System

> **For Claude Code:** Append this section to `SPEC.md` as Section 13. Build after Step 14 (Landing Page) in the Build Order. This section is self-contained and complete — make sensible decisions for anything not explicitly specified.

---

## 13.1 Overview

The platform is free to use. Bitcoin Treasury Solutions (BTS) offers paid advisory services — education sessions, board pitch support, staff training, and a curated expert referral network. These services should be promoted tastefully throughout the product at contextually relevant moments.

**Design principle:** Promotions must feel like helpful suggestions from an advisor, not advertisements. They appear at moments of natural friction or decision-making, where a human expert provides genuine additional value. They must never interrupt the user's flow or feel pushy.

**Never:**
- Use the word "advertisement", "sponsored", or "ad"
- Show promotions in the middle of active form-filling or assessment steps
- Show the same promotion twice in a single session if the user has dismissed it
- Use urgency language ("Limited spots", "Act now")
- Place more than one promotion variant on the same page

**Always:**
- Label BTS-sourced content with a subtle `BTS` badge in the brand gold
- Provide a "Maybe later" or equivalent dismiss option on inline variants
- Include a clear path to the user continuing without engaging

---

## 13.2 BTS Services Reference

All promotion copy and service definitions are driven by `/content/bts-services.json`. Claude Code must create this file. Components must read service data from this file — do not hardcode service names, descriptions, or URLs in components.

### `/content/bts-services.json`

```json
{
  "company": {
    "name": "Bitcoin Treasury Solutions",
    "shortName": "BTS",
    "tagline": "Expert guidance for Australian bitcoin treasury adoption",
    "contactUrl": "/contact",
    "servicesUrl": "/services"
  },
  "services": [
    {
      "id": "advisory_session",
      "icon": "Video",
      "title": "1:1 Advisory Session",
      "shortDesc": "60-min video call with a BTS advisor",
      "longDesc": "A focused session with an experienced BTS advisor who can review your situation, answer your specific questions, and help you navigate the next steps with confidence.",
      "format": "Video call — 60 minutes",
      "ctaLabel": "Book a session",
      "ctaUrl": "/contact?service=advisory_session",
      "relevantPhases": [1, 2, 3, 4],
      "relevantFitScores": ["RECOMMENDED", "EXPLORE_FURTHER", "NOT_RECOMMENDED"]
    },
    {
      "id": "team_education",
      "icon": "GraduationCap",
      "title": "Team Education Workshop",
      "shortDesc": "Tailored bitcoin fundamentals for your finance team",
      "longDesc": "We run structured education sessions for finance teams and boards, covering bitcoin fundamentals, treasury rationale, and Australian regulatory context — tailored to your entity type.",
      "format": "In-person or video — half or full day",
      "ctaLabel": "Enquire about a workshop",
      "ctaUrl": "/contact?service=team_education",
      "relevantPhases": [1, 2],
      "relevantFitScores": ["RECOMMENDED", "EXPLORE_FURTHER"]
    },
    {
      "id": "board_pitch",
      "icon": "Presentation",
      "title": "Board Pitch Support",
      "shortDesc": "Help preparing and presenting to your board",
      "longDesc": "BTS advisors help finance leaders build a compelling internal case for bitcoin treasury adoption — from preparing board papers through to supporting the presentation itself.",
      "format": "Consulting engagement — variable scope",
      "ctaLabel": "Get pitch support",
      "ctaUrl": "/contact?service=board_pitch",
      "relevantPhases": [2, 3],
      "relevantFitScores": ["RECOMMENDED", "EXPLORE_FURTHER"]
    },
    {
      "id": "expert_referral",
      "icon": "Users",
      "title": "Expert Referral",
      "shortDesc": "Connect with legal, accounting, or custody specialists",
      "longDesc": "Access BTS's curated network of Australian professionals with direct bitcoin experience — including solicitors, tax accountants, SMSF specialists, and custody consultants.",
      "format": "Referral — you engage directly with the specialist",
      "ctaLabel": "Find an expert",
      "ctaUrl": "/contact?service=expert_referral",
      "relevantPhases": [2, 3, 4],
      "relevantFitScores": ["RECOMMENDED", "EXPLORE_FURTHER", "NOT_RECOMMENDED"]
    },
    {
      "id": "staff_training",
      "icon": "BookOpen",
      "title": "Staff Training",
      "shortDesc": "Practical bitcoin literacy for your broader team",
      "longDesc": "Structured training for finance, compliance, and operations staff who need to understand bitcoin custody, accounting treatment, and risk management in day-to-day work.",
      "format": "In-person or video — modular sessions",
      "ctaLabel": "Enquire about training",
      "ctaUrl": "/contact?service=staff_training",
      "relevantPhases": [3, 4],
      "relevantFitScores": ["RECOMMENDED"]
    }
  ],
  "expertNetwork": [
    {
      "role": "Bitcoin-Literate Solicitor",
      "description": "Entity structure, trust deeds, compliance",
      "icon": "Scale",
      "iconBg": "#F0EAD6",
      "ctaUrl": "/contact?service=expert_referral&type=legal"
    },
    {
      "role": "Crypto Tax Accountant",
      "description": "ATO treatment, CGT elections, FY reporting",
      "icon": "BarChart2",
      "iconBg": "#E8F0EC",
      "ctaUrl": "/contact?service=expert_referral&type=accounting"
    },
    {
      "role": "Custody Specialist",
      "description": "Multi-sig setup, key management, audits",
      "icon": "Shield",
      "iconBg": "#EAE8F0",
      "ctaUrl": "/contact?service=expert_referral&type=custody"
    },
    {
      "role": "SMSF Specialist Adviser",
      "description": "SIS Act compliance, investment strategy",
      "icon": "FileText",
      "iconBg": "#F0ECE8",
      "ctaUrl": "/contact?service=expert_referral&type=smsf",
      "entityTypes": ["SMSF"]
    },
    {
      "role": "ASIC / Listed Entity Adviser",
      "description": "Continuous disclosure, shareholder approval",
      "icon": "Landmark",
      "iconBg": "#E8EDF0",
      "ctaUrl": "/contact?service=expert_referral&type=listed",
      "entityTypes": ["PUBLIC_COMPANY"]
    }
  ]
}
```

**Notes on `expertNetwork`:**
- Items with an `entityTypes` array are only shown when the user's entity type matches
- Items without `entityTypes` are shown to all entity types
- Show a maximum of 4 expert items at a time; prioritise entity-matched items first

---

## 13.3 Dismissal & Session Persistence

Use `sessionStorage` (not `localStorage`) to track which promotion variants have been dismissed in the current session. Do not persist dismissals across sessions — the user should see promotions again on their next visit.

```typescript
// lib/promotions.ts

const DISMISSED_KEY = 'bts_dismissed_promos';

export function isDismissed(variantId: string): boolean {
  if (typeof window === 'undefined') return false;
  const dismissed = JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]');
  return dismissed.includes(variantId);
}

export function dismiss(variantId: string): void {
  const dismissed = JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]');
  if (!dismissed.includes(variantId)) {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, variantId]));
  }
}
```

Each promotion variant has a unique `variantId` string (specified per variant below). Pass this to the dismiss utility on user dismissal.

---

## 13.4 Component File Structure

Create the following files. All components are client components (`'use client'`).

```
/components/promotions/
├── InlineAdvisoryBanner.tsx      # Variant 1
├── ExpertNetworkCard.tsx         # Variant 2
├── PostAssessmentCTA.tsx         # Variant 3
├── BlockedItemPrompt.tsx         # Variant 4
├── DashboardBTSCard.tsx          # Variant 5
├── LandingServicesStrip.tsx      # Variant 6
└── index.ts                      # barrel export
```

All components accept only the props defined in Section 13.5. Do not pass raw service data as props — components load from `bts-services.json` directly or receive the minimum context needed (e.g. `entityType`, `fitScore`).

---

## 13.5 Component Specifications

### Variant 1 — `InlineAdvisoryBanner`

**File:** `/components/promotions/InlineAdvisoryBanner.tsx`  
**Variant ID:** `inline_advisory_[phase]_[moduleSlug]` (e.g. `inline_advisory_1_ato-tax-treatment`)

**Props:**
```typescript
interface InlineAdvisoryBannerProps {
  context: string         // e.g. "ATO tax treatment for SMSFs" — inserted into headline
  serviceId: string       // which service from bts-services.json to promote
  phase: number           // current phase (1–4)
  variantId: string       // unique ID for dismissal tracking
}
```

**Behaviour:**
- Renders only if not dismissed (check `isDismissed(variantId)`)
- Gold-tinted background (`#F0E4C0`), left gold border stripe (3px, `#C9A84C`)
- "BTS Advisory Services" eyebrow label in gold
- Headline: "Want a guided walkthrough of {context}?"
- Supporting sentence about the specific service
- Two actions: primary CTA button (links to `service.ctaUrl`), "Maybe later" ghost button (calls `dismiss(variantId)`)
- On dismiss: fades out smoothly (150ms), does not reappear in session

**Design:** Warm gold tint, left border accent, icon in gold square. See DESIGN_BRIEF.md for full token reference.

---

### Variant 2 — `ExpertNetworkCard`

**File:** `/components/promotions/ExpertNetworkCard.tsx`  
**Variant ID:** `expert_network_[phase]`

**Props:**
```typescript
interface ExpertNetworkCardProps {
  entityType: EntityType
  phase: number
}
```

**Behaviour:**
- Loads `expertNetwork` from `bts-services.json`
- Filters items: show entity-matched items first, then universal items, max 4 total
- Each row is a clickable item linking to `expert.ctaUrl`
- Card header shows "BTS Expert Network" heading + gold `BTS` badge + `Australia` country note
- Footer: "🇦🇺 All specialists are Australia-based and Bitcoin-experienced"
- No dismiss option — this is reference information, not a CTA prompt
- On hover per row: gold-tinted background, gold border

**Design:** White card, `--shadow-sm`, `12px` radius. See DESIGN_BRIEF.md.

---

### Variant 3 — `PostAssessmentCTA`

**File:** `/components/promotions/PostAssessmentCTA.tsx`  
**Variant ID:** `post_assessment_cta`

**Props:**
```typescript
interface PostAssessmentCTAProps {
  fitScore: FitScore       // RECOMMENDED | EXPLORE_FURTHER | NOT_RECOMMENDED
  entityType: EntityType
}
```

**Behaviour:**
- Headline and sub-copy adapt per `fitScore`:
  - `RECOMMENDED`: "Ready to move forward — with confidence" / "Bitcoin treasury looks like a strong fit. Here's how BTS can help you execute it properly."
  - `EXPLORE_FURTHER`: "A few questions worth talking through" / "Your situation has nuances worth exploring with an advisor before proceeding."
  - `NOT_RECOMMENDED`: "It may not be the right time — let's talk" / "That's a valuable insight. Our advisors can help you understand what would change the picture."
- Shows a 2×2 grid of service option cards (selectable): `advisory_session`, `team_education`, `board_pitch`, `expert_referral`
- User selects one (single select); primary CTA label updates to reflect selection: "Enquire — {service.title}"
- If no selection, CTA label: "Get in touch with BTS"
- Primary CTA links to selected service's `ctaUrl` (or `/contact` if none selected)
- Secondary action: "Continue on my own" — no dismiss, just a neutral exit
- No session dismissal — this always renders after assessment; it is part of the phase completion flow

**Design:** Dark header (`#1A1915`) with gold icon, white body. Grid of selectable tiles with gold selection state.

---

### Variant 4 — `BlockedItemPrompt`

**File:** `/components/promotions/BlockedItemPrompt.tsx`  
**Variant ID:** `blocked_item_[checklistItemId]`

**Props:**
```typescript
interface BlockedItemPromptProps {
  checklistItemId: string
  itemTitle: string
  itemCategory: string    // used to suggest relevant expert type
  entityType: EntityType
}
```

**Behaviour:**
- Only renders when a checklist item's status is `BLOCKED`
- Appears inline beneath the blocked item's notes field
- Maps `itemCategory` to a relevant expert referral URL:
  - "Legal & Compliance Setup" → `expert_referral&type=legal`
  - "Accounting & Tax Preparation" → `expert_referral&type=accounting`
  - "Custody & Security Setup" → `expert_referral&type=custody`
  - "SMSF Trust Deed..." → `expert_referral&type=smsf`
  - All others → `expert_referral` (generic)
- Copy: "Stuck on "{itemTitle}"? BTS can connect you with an Australia-based specialist who's done this before."
- Single text-link CTA: "Find an expert through BTS →"
- No dismiss option — it disappears automatically when item status changes from `BLOCKED`
- `variantId` used only if a full dismiss button is added later; not needed in MVP

**Design:** Warm amber tint (`#FFF8E8`), amber border (`#E8D28A`), compact, inline. No shadow.

---

### Variant 5 — `DashboardBTSCard`

**File:** `/components/promotions/DashboardBTSCard.tsx`  
**Variant ID:** `dashboard_bts_card`

**Props:**
```typescript
interface DashboardBTSCardProps {
  // no required props — loads all data from bts-services.json
}
```

**Behaviour:**
- Always visible on the Journey dashboard — no dismiss
- Shows all 5 service names as compact pills
- Two actions: "Speak with an advisor" (→ `/contact`) and "View all services" (→ `/services`)
- Radial gold glow effect in top-right corner (decorative, CSS only)
- Positioned below the phase cards, above the footer

**Design:** Dark background (`#1A1915`), gold accent text, gold pills with low-opacity gold border. See DESIGN_BRIEF.md for the inverted palette treatment.

---

### Variant 6 — `LandingServicesStrip`

**File:** `/components/promotions/LandingServicesStrip.tsx`  
**Variant ID:** `landing_services_strip`

**Props:**
```typescript
interface LandingServicesStripProps {
  // no required props — loads from bts-services.json
}
```

**Behaviour:**
- Always visible on landing page — no dismiss
- Headline: "Beyond the guide" with sub-label "Bitcoin Treasury Solutions services"
- Shows 3 featured services in a grid (hardcode these IDs in the component): `team_education`, `board_pitch`, `expert_referral`
- Footer strip: "This guide is free to use. When you're ready for expert human support, BTS is here." + gold CTA button "Explore BTS services →" → `/services`

**Placement on landing page:** After the "4-phase journey" section, before the footer disclaimer.

**Design:** White card, `--shadow-sm`, warm border, 3-column grid on desktop, 1-column on mobile.

---

## 13.6 Phase Placement Map

This table defines exactly where each variant is placed. One variant per page maximum.

| Phase / Page | Variant | Placement | Trigger Condition |
|---|---|---|---|
| Landing (`/`) | `LandingServicesStrip` | After phase overview section | Always |
| Journey Dashboard (`/journey`) | `DashboardBTSCard` | Below phase cards | Always |
| Learn (`/journey/learn`) | `InlineAdvisoryBanner` | After the `regulatory-context` module | After user has scrolled past the module (use Intersection Observer) |
| Decide (`/journey/decide`) | `PostAssessmentCTA` | After fit assessment result renders | Only after fit score is returned — never before |
| Plan (`/journey/plan`) | `ExpertNetworkCard` | After the "Custody selection" section | Always visible once user reaches that section |
| Track (`/journey/track`) | `BlockedItemPrompt` | Inline beneath each blocked checklist item | Only when item status === `BLOCKED` |

### Learn Phase — `InlineAdvisoryBanner` Configuration

Render the banner after the following module slugs (these map to the MDX file names in `/content/`):

| Module slug | `context` prop value | `serviceId` |
|---|---|---|
| `regulatory-context` | "Australian regulatory obligations" | `advisory_session` |
| `ato-tax-treatment` (entity: SMSF, Private Company, Public Company) | "ATO tax treatment for your entity" | `team_education` |
| `custody-models` | "bitcoin custody and key management" | `advisory_session` |

Only show one banner per Learn session. Once any banner is dismissed for the session, do not show additional ones even if the user proceeds to further modules.

---

## 13.7 `/contact` Page

Create a minimal `/contact` page at `app/contact/page.tsx`.

**Route:** `/contact` (public — no auth required)

**Behaviour:**
- Reads `service` and `type` query params to pre-select the relevant service
- Simple form: Name, Email, Company name, Entity type (pre-filled if logged in), Message, selected service (pre-filled from query param, shown as a read-only badge)
- On submit: `POST /api/contact` — log to console in MVP (no email sending required in MVP; add a `// TODO: wire up email provider` comment)
- Success state: confirmation message in-page, no redirect
- Auth: public page, but pre-fill fields from user profile if authenticated

**Form fields:**

```typescript
interface ContactFormData {
  name: string          // required
  email: string         // required
  company: string       // required
  entityType: string    // optional, pre-filled if logged in
  service: string       // pre-filled from query param, user can change
  message: string       // required, min 20 chars
}
```

**Design:** Matches platform design system. Single-column centred form, max-width 560px. Gold focus rings on inputs. Primary submit button in gold.

---

## 13.8 `/services` Page

Create a full services listing page at `app/services/page.tsx`.

**Route:** `/services` (public — no auth required)

**Behaviour:**
- Loads all services from `bts-services.json`
- Renders each service as a card with: icon, title, `longDesc`, `format` label, and CTA button linking to `/contact?service={service.id}`
- Expert network section below services: heading "The BTS Expert Network", renders all expert network entries (no entity filtering on this page — show all)
- Footer CTA strip: "Ready to get started? Book a free 20-minute discovery call." → `/contact`

**Design:** 2-column service grid on desktop, 1-column on mobile. Expert network in a separate section with warm background (`#F4F4F1`). Consistent with platform design system.

---

## 13.9 API Route

**Route:** `POST /api/contact`

```typescript
// Expected request body
{
  name: string
  email: string
  company: string
  entityType?: string
  service?: string
  message: string
}

// Response shape (consistent with platform convention)
{
  success: boolean
  data?: { message: string }
  error?: string
}
```

Validate all required fields. Return `400` with error message if validation fails. In MVP, log the submission to console and return success. Add `// TODO: integrate email provider (e.g. Resend, Postmark)` comment.

---

## 13.10 Build Order Addition

Insert after Step 14 (Landing Page) in the existing build order:

**Step 15a — BTS Promotions System**

1. Create `/content/bts-services.json` with all data from Section 13.2
2. Create `lib/promotions.ts` with dismissal utilities (Section 13.3)
3. Build all 6 promotion components (Section 13.5) in order — Variant 5 and 6 first (no dismissal logic needed), then Variants 1–4
4. Create `/app/contact/page.tsx` and `/api/contact/route.ts` (Section 13.7–13.9)
5. Create `/app/services/page.tsx` (Section 13.8)
6. Inject components into the correct phase pages per the placement map (Section 13.6)
7. Test: dismiss a Variant 1 banner, navigate away, return — confirm it does not reappear in the same session; open a new tab — confirm it does reappear

---

_SPEC Addendum v1.0 — BTS Service Promotions_  
_Append to: Bitcoin Treasury Platform MVP Specification_
