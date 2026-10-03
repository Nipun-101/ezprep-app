# EZ Prep Mobile Migration — Documentation Index

This folder is the specification for building the **EZ Prep native mobile app** (React Native + Expo + Expo Router + TypeScript, Android first, iOS later). It was produced by analysing this Next.js repository (`ezprep-app`), which remains the reference implementation and must not be changed by the migration.

Nothing in this folder is application code. It is planning material for future implementation sessions.

## How to use these documents

Every future implementation session follows the execution model in [`phases/README.md`](phases/README.md):

1. Read [`engineering-rules.md`](engineering-rules.md) (global project rules).
2. Read [`MOBILE_STATUS.md`](MOBILE_STATUS.md).
3. Read the phase file for the phase being implemented.
4. Read only the web source files that the phase file lists.
5. Implement only that phase, validate, update `MOBILE_STATUS.md`.

## Evidence labels

All documents use these labels:

| Label | Meaning |
| --- | --- |
| **[Verified]** | Read directly in this repository's source, config, or git history. File paths are given. |
| **[Inferred]** | A reasonable conclusion from verified facts, not directly stated in code. |
| **[Unknown]** | Cannot be determined from this repository. Tracked in [`unknowns.md`](unknowns.md) with an ID like `U-03`. |

## Document map

### Assessment of the existing web app

| Document | Contents |
| --- | --- |
| [executive-summary.md](executive-summary.md) | One-page summary, top risks, recommended sequence |
| [existing-architecture.md](existing-architecture.md) | Stack, rendering model, folder structure, diagrams |
| [route-inventory.md](route-inventory.md) | Every route with auth, params, APIs, states, edge cases |
| [navigation-map.md](navigation-map.md) | User journeys and route dependency graph |
| [authentication.md](authentication.md) | How web auth works today (OTP, Google, session, guards) |
| [api-architecture.md](api-architecture.md) | API client, every endpoint, request/response shapes |
| [state-management.md](state-management.md) | Every state category and its mobile disposition |
| [design-system.md](design-system.md) | Visual language: color, type, spacing, components |
| [responsive-analysis.md](responsive-analysis.md) | Breakpoint behavior per screen and native intent |
| [mobile-compatibility.md](mobile-compatibility.md) | Web-only APIs and their native replacements |
| [dependency-audit.md](dependency-audit.md) | Every npm dependency, compatibility, replacement |
| [asset-analysis.md](asset-analysis.md) | Logos, images, fonts, remote images |
| [performance-analysis.md](performance-analysis.md) | Current performance traits and native techniques |
| [accessibility-analysis.md](accessibility-analysis.md) | Current a11y and native equivalents |
| [security-analysis.md](security-analysis.md) | Current security posture and mobile rules |

### Target mobile design

| Document | Contents |
| --- | --- |
| [mobile-architecture.md](mobile-architecture.md) | Target folder structure, layers, navigation, diagrams |
| [mobile-authentication.md](mobile-authentication.md) | Mobile auth architecture (OTP, Google, secure storage) |
| [package-strategy.md](package-strategy.md) | Proposed dependency matrix |
| [testing-strategy.md](testing-strategy.md) | Validation layers and device testing |
| [engineering-rules.md](engineering-rules.md) | Rules every implementation session must follow |
| [risk-register.md](risk-register.md) | Ranked migration risks with mitigations |
| [unknowns.md](unknowns.md) | Open questions that must be validated |
| [MOBILE_STATUS.md](MOBILE_STATUS.md) | Live implementation status tracker |

### Phases

| Document | Contents |
| --- | --- |
| [phases/README.md](phases/README.md) | Phase list, dependency graph, execution order |
| `phases/phase-NN-*.md` | One independently executable phase per file |

## Scope boundaries

- The Next.js app, its dependencies, and the backend (`ez-prep-api`, a separate repository) stay unchanged. Any backend change the mobile app needs is recorded as an unknown or risk. It is never assumed.
- The mobile app is a **new codebase**. Web components are not ported. Product behavior, business rules, API contracts, and visual intent are.
