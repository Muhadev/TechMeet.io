# TechMeet.io
A modern tech event management platform built with Django and React. TechMeet.io streamlines the entire event lifecycle for organizers while delivering a seamless experience for attendees.

# Tech Event Management MVP - Project Plan

## Project Overview
An MVP for tech event management that allows:
- Event creation by organizers
- Ticket generation with uploaded pictures
- QR code verification for attendees
- User authentication via JWT, Google, and GitHub
- Payment processing with Paystack
- Email notifications with SendGrid

## Task List

### 1. Backend Development (Django/MySQL)

#### Authentication & User Management
- [ ] Set up Django project with necessary dependencies
- [ ] Configure JWT authentication system
- [ ] Implement Google OAuth integration
- [ ] Implement GitHub OAuth integration
- [ ] Create user registration and login endpoints
- [ ] Build user profile management (basic details, profile picture)
- [ ] Implement user roles (admin, organizer, attendee)
- [ ] Create password reset functionality using SendGrid

#### Event Management
- [ ] Design and implement event database models
- [ ] Create CRUD endpoints for events
- [ ] Implement event search and filtering
- [ ] Add event categorization
- [ ] Build event scheduling system
- [ ] Create organizer dashboard endpoints
- [ ] Implement event statistics tracking

#### Ticket Management
- [ ] Design ticket database models
- [ ] Create ticket generation system
- [ ] Implement QR code generation
- [ ] Build ticket customization (add user photo, name, role)
- [ ] Create email delivery for tickets via SendGrid
- [ ] Implement ticket validation endpoints
- [ ] Build check-in system for events

#### Payment Integration
- [ ] Integrate Paystack API
- [ ] Implement payment processing for tickets
- [ ] Create payment verification system
- [ ] Build receipt generation and delivery
- [ ] Implement refund process
- [ ] Add payment analytics

#### Email Notifications
- [ ] Configure SendGrid integration
- [ ] Create email templates (registration, ticket confirmation, event reminders)
- [ ] Implement notification triggers for key events
- [ ] Build email preference management

#### Security & Performance
- [ ] Implement proper error handling and logging
- [ ] Set up database optimization and indexing
- [ ] Conduct security audit of endpoints
- [ ] Implement rate limiting
- [ ] Set up CORS and security headers

### 2. Frontend Development (React/Tailwind/shadcn)

#### Setup & Configuration
- [ ] Initialize React application with Vite
- [ ] Configure Tailwind CSS and shadcn/ui
- [ ] Set up routing system (React Router)
- [ ] Create responsive layout templates
- [ ] Implement global state management (Context or Redux)
- [ ] Build authentication HOC/guards for protected routes

#### Authentication UI
- [ ] Create login screen with email/password
- [ ] Implement social login buttons (Google, GitHub)
- [ ] Build registration form with validation
- [ ] Design password reset workflow
- [ ] Implement auth token storage and refresh

#### User Dashboard
- [ ] Build profile management page
- [ ] Create dashboard overview with stats
- [ ] Implement settings page
- [ ] Design notification center

#### Event Management UI
- [ ] Create event browsing page with filters
- [ ] Build event detail page
- [ ] Implement event creation form for organizers
- [ ] Design organizer dashboard
- [ ] Create event analytics visualizations

#### Ticket Management UI
- [ ] Design ticket purchasing workflow
- [ ] Build ticket customization interface (upload photo)
- [ ] Create ticket display component with QR code
- [ ] Implement ticket list/wallet for users
- [ ] Build QR code scanner for organizers

#### Payment UI
- [ ] Implement Paystack payment form
- [ ] Create payment confirmation screens
- [ ] Design receipt view
- [ ] Build payment history page

#### Responsive Design
- [ ] Ensure mobile responsiveness
- [ ] Implement dark/light mode
- [ ] Test across different devices and browsers

### 3. Integration & Testing

- [ ] Develop end-to-end tests for critical flows
- [ ] Implement unit tests for core functionality
- [ ] Conduct integration testing
- [ ] Perform security testing
- [ ] Test payment processing in sandbox mode
- [ ] Conduct performance testing

### 4. Deployment & DevOps

- [ ] Set up CI/CD pipeline
- [ ] Configure staging and production environments
- [ ] Implement database backup strategy
- [ ] Set up monitoring and logging
- [ ] Configure SSL certificates

## Directory Structure

### Backend (Django)

```
tech_event_backend/
│
├── config/                      # Project configuration
│   ├── settings/
│   │   ├── base.py              # Base settings
│   │   ├── development.py       # Development settings
│   │   └── production.py        # Production settings
│   ├── urls.py                  # Main URL routing
│   └── wsgi.py                  # WSGI configuration
│
├── apps/
│   ├── users/                   # User management app
│   │   ├── migrations/
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── models.py
│   │   ├── services.py          # Business logic
│   │   └── tests.py
│   │
│   ├── events/                  # Event management app
│   │   ├── migrations/
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── models.py
│   │   ├── services.py
│   │   └── tests.py
│   │
│   ├── tickets/                 # Ticket management app
│   │   ├── migrations/
│   │   ├── api/
│   │   │   ├── serializers.py
│   │   │   ├── views.py
│   │   │   └── urls.py
│   │   ├── models.py
│   │   ├── services.py
│   │   └── tests.py
│   │
│   └── payments/                # Payment processing app
│       ├── migrations/
│       ├── api/
│       │   ├── serializers.py
│       │   ├── views.py
│       │   └── urls.py
│       ├── models.py
│       ├── services.py
│       └── tests.py
│
├── core/                        # Shared functionality
│   ├── authentication/          # JWT and social auth
│   ├── permissions/             # Custom permissions
│   ├── email/                   # SendGrid integration
│   └── utils/                   # Utility functions
│
├── static/                      # Static files
│
├── templates/                   # HTML templates (for emails)
│
├── requirements/
│   ├── base.txt                 # Base requirements
│   ├── development.txt          # Development requirements
│   └── production.txt           # Production requirements
│
├── manage.py                    # Django management script
│
└── .env.example                 # Environment variables example
```

### Frontend (React)

```
tech_event_frontend/
│
├── public/                      # Public assets
│   ├── favicon.ico
│   └── index.html
│
├── src/
│   ├── assets/                  # Static assets (images, fonts)
│   │
│   ├── components/              # Reusable components
│   │   ├── auth/                # Authentication components
│   │   ├── common/              # Common UI components
│   │   ├── dashboard/           # Dashboard components
│   │   ├── events/              # Event-related components
│   │   ├── tickets/             # Ticket-related components
│   │   ├── payments/            # Payment components
│   │   └── layout/              # Layout components
│   │
│   ├── hooks/                   # Custom React hooks
│   │
│   ├── lib/                     # Utility functions and libraries
│   │   ├── api.js               # API client
│   │   ├── auth.js              # Auth utilities
│   │   └── helpers.js           # Helper functions
│   │
│   ├── pages/                   # Page components
│   │   ├── auth/                # Auth pages
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── events/              # Event pages
│   │   │   ├── EventList.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   └── CreateEvent.jsx
│   │   ├── tickets/             # Ticket pages
│   │   │   ├── TicketPurchase.jsx
│   │   │   └── TicketWallet.jsx
│   │   ├── organizer/           # Organizer pages
│   │   │   ├── EventDashboard.jsx
│   │   │   ├── AttendeeList.jsx
│   │   │   └── ScanTicket.jsx
│   │   ├── user/                # User profile pages
│   │   │   ├── Profile.jsx
│   │   │   └── Settings.jsx
│   │   ├── Home.jsx             # Home page
│   │   └── NotFound.jsx         # 404 page
│   │
│   ├── context/                 # Context providers
│   │   ├── AuthContext.jsx      # Authentication context
│   │   └── UIContext.jsx        # UI state context
│   │
│   ├── routes/                  # Route configuration
│   │   ├── PrivateRoute.jsx     # Private route component
│   │   └── index.jsx            # Main routes file
│   │
│   ├── styles/                  # Global styles
│   │   └── globals.css          # Global CSS with Tailwind
│   │
│   ├── App.jsx                  # Main App component
│   ├── main.jsx                 # Entry point
│   └── vite-env.d.ts            # Vite environment types
│
├── tailwind.config.js           # Tailwind configuration
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies and scripts
├── .gitignore                   # Git ignore file
├── .eslintrc.js                 # ESLint configuration
└── README.md                    # Project documentation
```

## Database Schema (Key Models)

### User
- id (PK)
- email
- password (hashed)
- first_name
- last_name
- profile_picture
- role (admin, organizer, attendee)
- auth_provider (email, google, github)
- auth_provider_id
- created_at
- updated_at

### Event
- id (PK)
- title
- description
- organizer_id (FK to User)
- location
- start_date
- end_date
- category
- banner_image
- max_attendees
- ticket_price
- status (draft, published, completed, cancelled)
- created_at
- updated_at

### Ticket
- id (PK)
- event_id (FK to Event)
- user_id (FK to User)
- ticket_number
- qr_code
- ticket_type
- purchase_date
- price_paid
- payment_status
- checked_in (boolean)
- checked_in_time
- custom_image
- created_at
- updated_at

### Payment
- id (PK)
- user_id (FK to User)
- ticket_id (FK to Ticket)
- amount
- currency
- payment_method
- transaction_id
- status
- paystack_reference
- created_at
- updated_at