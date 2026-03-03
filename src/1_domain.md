---
# REQUIREMENTS DOCUMENT

## Multi-Tenant SaaS Automated Quotation System
Version 2.0
---

# 1. System Objective

Develop a multi-tenant SaaS system that enables multiple companies to:

* Create automated quotations
* Generate professional PDF documents
* Send quotations via WhatsApp using Evolution API
* Manage clients initially identified by phone number
* Allow optional client registration at a later stage
* Operate with strict tenant isolation

---

# 2. Architecture

## 2.1 Architectural Style

* Modular Monolith
* Clean Architecture (Hexagonal / Ports & Adapters)

The domain layer MUST NOT depend on:

* Express
* Prisma
* MySQL
* Evolution API
* PDF libraries

---

## 2.2 Layers

### 1 Core (Domain)

Contains:

* Entities
* Value Objects
* Business rules
* Use cases
* Interfaces (Ports)

It has zero knowledge of infrastructure.

---

### 2️ Application Layer

Primary use cases:

* CreateCompany
* RegisterAdmin
* LoginUser
* CreateClient
* RegisterClientUser
* CreateService
* CreateQuote
* AddQuoteItem
* ApproveQuote
* RejectQuote
* GenerateQuotePDF
* SendQuoteViaWhatsApp

---

### 3️ Infrastructure (Adapters)

Concrete implementations:

* Prisma repositories
* EvolutionApiWhatsAppAdapter
* PDFGeneratorAdapter
* JWTService
* MySQL connection

---

### 4️ Interface Layer (Express)

* Controllers
* Routes
* Middlewares
* Validation (Zod)
* Error handling

---

# 3. Technology Stack

Backend:

* Node.js 24
* Express
* TypeScript
* Prisma ORM
* MySQL (initially local)
* JWT (Access + Refresh tokens)
* bcrypt
* Zod

WhatsApp Integration:

* Evolution API

PDF Generation:

* Puppeteer (HTML → PDF)

---

# 4. Real Multi-Tenancy

## Strategy

Single database, shared schema, strict logical isolation.

All tables must include:

```
companyId UUID NOT NULL
```

Rules:

* Every query must filter by companyId.
* companyId is extracted from JWT.
* Cross-tenant access is strictly forbidden.

---

# 5. Data Model (Updated)

---

## Company

* id (UUID)
* name
* plan
* createdAt

---

## User (Authenticated Users)

* id (UUID)
* companyId (FK)
* name
* email (globally unique)
* passwordHash
* role (ADMIN | CLIENT)
* createdAt

Represents authenticated SaaS users.

---

## Client (Commercial Client Entity)

* id (UUID)
* companyId (FK)
* name (optional)
* phone (required)
* email (optional)
* userId (optional FK → User.id)
* createdAt

### Rules:

* phone is mandatory.
* phone must be unique per company.
* email is optional.
* userId is optional.
* If userId != null → client is registered.
* If userId == null → client is a prospect.

Phone number is the primary operational identifier.

---

## Service

* id
* companyId
* name
* description
* basePrice
* taxRate
* createdAt

---

## Quote

* id
* companyId
* clientId
* status (DRAFT | SENT | APPROVED | REJECTED)
* subtotal
* tax
* total
* expiresAt
* createdAt

---

## QuoteItem

* id
* quoteId
* serviceId
* quantity
* unitPrice
* total

---

# 6. Client Flow

---

## Scenario 1: Prospect Client (No Account)

1. Admin creates quotation.
2. Only required:

   * phone
   * optional name
3. PDF is generated.
4. Sent via WhatsApp.
5. Client can approve/reject via signed token.
6. No login required.

---

## Scenario 2: Client Registers Later

1. Client decides to create account.
2. System verifies existing Client by phone.
3. A User is created with role CLIENT.
4. userId is linked to Client.

Benefits unlocked:

* Quotation history
* Authenticated dashboard
* Direct PDF download
* Future features

---

# 7. Authentication

## JWT Strategy

Access Token:

* 15 minutes expiration
* Contains:

  * userId
  * companyId
  * role

Refresh Token:

* 7–30 days
* Persisted in database

---

# 8. Authorization

ADMIN:

* Full CRUD
* Manage users
* Manage clients
* Manage services
* Manage quotations

CLIENT (Authenticated):

* View own quotations
* Approve/reject
* Download PDF

CLIENT (Prospect):

* Approve/reject only via signed token

---

# 9. REST Endpoints

Base:
`/api/v1`

---

## AUTH

POST /auth/register-company
POST /auth/login
POST /auth/refresh
POST /auth/logout

---

## Client Registration (Post-Quotation)

POST /auth/register-client

Body:

```
{
  "phone": "521234567890",
  "email": "client@email.com",
  "password": "securePassword"
}
```

Logic:

1. Find Client by phone + companyId
2. Ensure userId is null
3. Create User
4. Associate userId

---

## CLIENTS (ADMIN)

POST /clients
GET /clients
GET /clients/:id
PATCH /clients/:id
DELETE /clients/:id

Minimum creation:

```
{
  "phone": "521234567890"
}
```

---

## SERVICES

POST /services
GET /services
PATCH /services/:id
DELETE /services/:id

---

## QUOTES

POST /quotes
GET /quotes
GET /quotes/:id
PATCH /quotes/:id
DELETE /quotes/:id

---

## PDF

GET /quotes/:id/pdf

---

## WHATSAPP

POST /quotes/:id/send-whatsapp

---

## Public Endpoints (No Authentication)

POST /public/quotes/:id/approve?token=xxx
POST /public/quotes/:id/reject?token=xxx

Token:

* Signed JWT
* Includes:

  * quoteId
  * clientPhone
  * companyId
* Must expire

---

# 10. WhatsApp Integration

Adapter Interface:

```
interface NotificationService {
  sendMessage(to: string, message: string): Promise<void>
  sendDocument(to: string, fileUrl: string): Promise<void>
}
```

Concrete implementation:

EvolutionApiWhatsAppAdapter

Responsibilities:

* Instance management
* Session handling
* Basic retry logic
* Error handling

The domain depends only on the interface.

---

# 11. PDF Generation

Process:

1. Dynamic HTML template
2. Render using Puppeteer
3. Generate PDF
4. Return stream or signed temporary URL

PDF must include:

* Company logo
* Tax information
* Client details
* Service list
* Totals
* Expiration date
* Unique quotation number

---

# 12. Security

* Helmet
* Rate limiting
* Zod validation
* Input sanitization
* Structured logging
* Strict tenant isolation
* Signed tokens with expiration

---

# 13. PostgreSQL Migration

With Prisma:

Change provider:

```
provider = "postgresql"
```

Domain remains untouched.
Only database migration required.

---

# 14. Future Scalability

Prepared for:

* Redis + BullMQ
* Webhooks
* Tenant subdomains
* Subscription plans
* Electronic invoicing
* Advanced client dashboard

---

# 15. Non-Functional Requirements

* API response time < 500ms
* PDF generation < 2s
* Mandatory multi-tenant isolation
* Minimum 70% test coverage
* 100% TypeScript codebase
* Strict architectural decoupling

---

# 16. Key Architectural Decisions

* Client identified primarily by phone number
* Registration optional and progressive
* Domain fully decoupled from infrastructure
* Real multi-tenancy from day one
* No microservices in v1

---

