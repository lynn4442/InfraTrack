# InfraTrack — Infrastructure Management Platform

**Stack:** Angular 21 - Django - PyMongo - MongoDB - JWT

---

## Overview

InfraTrack is a web-based IT infrastructure management platform. It provides authenticated users with centralized control over IT assets (servers, virtual machines, network devices), the technicians responsible for those assets, and incidents reported against them. The goal is to replace ad-hoc tracking with a structured, role-aware interface backed by a RESTful API and a document-oriented database.

---

## Data Models

The application is organized around three MongoDB collections, each mapped to a Django model class. Every document is automatically assigned a unique `_id` (ObjectId) which serves as the primary key across all API endpoints and inter-collection references.

### Technician
Represents a staff member responsible for one or more assets.

| Field | Type | Notes |
|---|---|---|
| `name` | string | Full name |
| `email` | Email | Validated email address |
| `hire_date` | Date | Date of employment |
| `specialization` | string | `cloud` / `network` / `security` / `devops` |
| `photo` | Image | Profile photograph upload |
| `certification` | PDF | Professional certification document |

### Asset
Represents a managed IT resource.

| Field | Type | Notes |
|---|---|---|
| `name` | string | Display name |
| `asset_type` | string | `server` / `vm` / `database` / `network` / `storage` |
| `ip_address` | string | Validated IPv4 address |
| `purchase_date` | Date | Acquisition date |
| `status` | string | `active` / `maintenance` / `decommissioned` |
| `asset_image` | Image | Equipment photo upload |
| `technical_doc` | PDF | Technical documentation upload |
| `technician_ids` | array | References to assigned Technicians (Many-to-Many) |

### Incident
Records a fault or event linked to a specific asset and assigned technician.

| Field | Type | Notes |
|---|---|---|
| `title` | string | Short incident label |
| `description` | text | Full incident narrative |
| `severity` | string | `critical` / `high` / `medium` / `low` |
| `reported_date` | Date | Timestamp of creation |
| `resolved_date` | Date | Timestamp of resolution (optional) |
| `asset_id` | FK → Asset | Affected asset |
| `assigned_to_id` | FK → Technician | Technician handling the incident |
| `report_pdf` | PDF | Attached incident report document |

### Relationships

- **Incident → Asset** (Foreign Key): each incident is linked to exactly one asset via `asset_id`.
- **Incident → Technician** (Foreign Key): each incident is assigned to exactly one technician via `assigned_to_id`.
- **Asset ↔ Technician** (Many-to-Many): an asset may be managed by multiple technicians, stored as an array of references (`technician_ids`) within the Asset document.

---

## Project Structure

### Backend (`/backend`)

```
api/
├── models.py       # Django model classes for all three collections
├── db.py           # PyMongo connection setup and collection handle exports
├── views.py        # APIView classes with CRUD, search, filter, and ordering
└── urls.py         # Route definitions for all API endpoints

core/
├── settings.py     # JWT auth, CORS headers, media file paths
└── urls.py         # Root URL config including media file serving (dev)
```

> PyMongo is used as the database driver (the Python/Django equivalent of Mongoose for Node.js).

### Frontend (`/frontend/src/app`)

```
core/
├── services/           # AuthService, TechnicianService, AssetService, IncidentService
├── guards/
│   └── auth.guard.ts   # Blocks unauthenticated access; redirects to /login
└── interceptors/
    └── jwt.interceptor.ts  # Attaches Bearer token; redirects on 401

components/
├── login/              # Login form
├── register/           # Registration form
├── technicians/        # technician-list + technician-form (with file uploads)
├── assets/             # asset-list + asset-form (Many-to-Many technician checkboxes)
└── incidents/          # incident-list + incident-form (FK dropdowns)
```

Uploaded images render as thumbnails in list views. Uploaded PDFs are accessible via direct links that open in a new browser tab.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register/` | Register a new user account |
| `POST` | `/api/auth/login/` | Authenticate and return JWT access + refresh tokens |
| `GET / POST` | `/api/technicians/` | List all / create — supports `?search=`, `?ordering=` |
| `GET / PUT / DELETE` | `/api/technicians/<id>/` | Retrieve, update, or delete a specific technician |
| `GET / POST` | `/api/assets/` | List all / create — supports `?search=`, `?ordering=`, `?status=` |
| `GET / PUT / DELETE` | `/api/assets/<id>/` | Retrieve, update, or delete a specific asset |
| `GET / POST` | `/api/incidents/` | List all / create — supports `?search=`, `?ordering=`, `?severity=` |
| `GET / PUT / DELETE` | `/api/incidents/<id>/` | Retrieve, update, or delete a specific incident |

---

## Angular Features

### Reactive Forms
All forms (login, register, technician, asset, incident) are built with Angular's Reactive Forms API. `FormBuilder` defines the structure in the component class; inputs are bound via `formControlName` in the template, centralizing validation logic.

### Validators
| Validator | Applied to |
|---|---|
| `Validators.required` | All mandatory fields on every form |
| `Validators.email` | Email field on Technician and Register forms |
| `Validators.minLength(6)` | Password field on Register form |
| `Validators.pattern` | `ip_address` on Asset form (IPv4 regex) |

Inline error messages are shown conditionally per field.

### Routing
- **Lazy loading:** All routes in `app.routes.ts` use `loadComponent`, deferring component loading until route activation to reduce the initial bundle size.
- **Auth guard:** `AuthGuard` on all protected routes redirects to `/login` if no valid token is present.
- **Navigation:** The nav bar uses `RouterLink` for list pages. Edit buttons pass the record ID in the URL; `ActivatedRoute` detects create vs. edit mode in form components. Incident form dropdowns are populated with live data from the Assets and Technicians services.

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ / npm
- MongoDB instance (local or Atlas)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Configure MongoDB URI and JWT secret in core/settings.py or a .env file
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```

The app will be available at `http://localhost:4200`. API calls go directly to `http://localhost:8000` — ensure the Django server is running.
