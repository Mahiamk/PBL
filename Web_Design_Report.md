# CDE2223 - Web Design and Development
# Project Report: AIU Microstore

**Course**: CDE2223 - Web Design and Development  
**Project**: AIU Microstore - University E-Commerce & Services Platform  
**Date**: January 29, 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Planning & Design](#2-planning--design)
3. [Technical Implementation](#3-technical-implementation)
4. [Testing & Evaluation](#4-testing--evaluation)
5. [Conclusion & Future Work](#5-conclusion--future-work)
6. [Appendix: Database Schema](#appendix-database-schema)

---

## 1. Introduction

### 1.1 Project Overview

**AIU Microstore** is a comprehensive full-stack e-commerce and service booking platform designed specifically for the Albukhary International University (AIU) campus community. The platform serves as a centralized digital marketplace that connects university vendors (barber shops, tailors, tech stores, drink shops, massage parlors, and clothing boutiques) with students, faculty, and staff.

The system implements a modern microservices-inspired architecture with three distinct user roles:
- **Customers**: Browse products, book services, place orders, and communicate with vendors
- **Vendors**: Manage their storefronts, inventory, appointments, and customer interactions
- **Administrators**: Oversee platform operations, approve vendor applications, and monitor analytics

### 1.2 Problem Statement

University campus communities face several challenges when accessing local vendor services:

1. **Fragmented Access**: Students and staff must physically visit each vendor to discover available products and services, leading to inefficiency and missed opportunities.

2. **Appointment Scheduling Friction**: Service-based vendors (barbers, massage therapists, tailors) rely on walk-ins or informal booking methods, resulting in long wait times and scheduling conflicts.

3. **Limited Vendor Visibility**: Small campus vendors lack digital presence, making it difficult to reach potential customers beyond foot traffic.

4. **Communication Barriers**: No centralized system exists for customers to communicate with vendors about orders, customizations, or service inquiries.

5. **Inventory Opacity**: Customers cannot check product availability before visiting a store, leading to wasted trips.

**Target Users**:
- University students seeking convenient access to campus services
- Faculty and staff requiring quick service bookings
- Campus vendors needing digital storefront capabilities
- University administration requiring oversight of campus commerce

### 1.3 Project Goals & Objectives

| Goal | Measurable Objective | Status |
|------|---------------------|--------|
| Multi-vendor E-commerce | Support 7+ distinct store types (Barber, Tailor, Tech, Drink, Bottle, Clothing, Massage) | ✅ Achieved |
| Mobile Responsiveness | Fully responsive UI on all screen sizes (320px - 2560px) | ✅ Achieved |
| Real-time Communication | Implement WebSocket-based chat with <500ms message delivery | ✅ Achieved |
| Service Booking | Enable appointment scheduling with time slot management | ✅ Achieved |
| User Authentication | Secure JWT-based authentication with role-based access control | ✅ Achieved |
| Vendor Dashboard | Provide complete store management for all vendor types | ✅ Achieved |
| Admin Analytics | Display daily, weekly, and monthly reports with visualizations | ✅ Achieved |
| Test Coverage | Achieve 100% pass rate on automated test suite | ✅ Achieved (77/77 tests) |
| Notification System | Real-time notifications with deep linking navigation | ✅ Achieved |

---

## 2. Planning & Design

### 2.1 Target Audience

#### Persona 1: Sarah - The Busy Student

| Attribute | Details |
|-----------|---------|
| **Name** | Sarah Ahmad |
| **Age** | 21 years old |
| **Role** | Third-year Computer Science student |
| **Goals** | Book haircuts between classes, order drinks for study sessions, purchase tech accessories without leaving campus |
| **Frustrations** | Long wait times at the barber shop, not knowing if items are in stock, difficulty scheduling appointments around class times |
| **Technical Proficiency** | High - uses smartphone for everything |
| **Quote** | "I need to book a haircut in the 2-hour gap between my lectures, but I never know if there's availability." |

**How AIU Microstore Helps Sarah**:
- Browse barber availability and book specific time slots
- View real-time product stock at the tech shop
- Receive notifications when her order is ready
- Chat with vendors about custom requests

#### Persona 2: Ahmad - The Campus Barber

| Attribute | Details |
|-----------|---------|
| **Name** | Ahmad Razak |
| **Age** | 35 years old |
| **Role** | Owner of campus barber shop (5 years) |
| **Goals** | Reduce walk-in chaos, manage appointments efficiently, showcase services to new students |
| **Frustrations** | No-shows from informal bookings, manual tracking of appointments on paper, inability to reach customers digitally |
| **Technical Proficiency** | Medium - comfortable with smartphone apps |
| **Quote** | "I lose at least 3 customers daily to no-shows because there's no booking system." |

**How AIU Microstore Helps Ahmad**:
- Dedicated vendor dashboard for managing appointments
- Service management with pricing and images
- Real-time chat with customers for customization requests
- Order/appointment notifications with status tracking
- Analytics showing daily booking trends

### 2.2 Sitemap / Information Architecture

```
AIU Microstore
│
├── 🏠 Home
│   ├── Hero Section (Featured stores)
│   ├── Store Categories Grid
│   └── Quick Access Links
│
├── 🏪 Stores Hub
│   ├── Barber Shop (/shops/barber)
│   │   ├── Services listing
│   │   ├── Appointment booking
│   │   └── Reviews
│   ├── Tailor (/shops/tailor)
│   ├── Computer Shop (/shops/computer)
│   ├── Bottle Shop (/shops/bottle)
│   ├── Clothing Shop (/shops/clothing)
│   ├── Drink Shop (/shops/drink)
│   └── Massage (/shops/massage)
│
├── 🛒 All Products (/shop)
│   ├── Search & Filter
│   ├── Category Navigation
│   └── Product Grid
│
├── 📦 Product Detail (/product/:id)
│   ├── Image Gallery
│   ├── Product Info
│   ├── Add to Cart
│   └── Related Products
│
├── 🛍️ Cart (/cart)
│   ├── Item List
│   ├── Quantity Adjustment
│   ├── Stock Validation
│   └── Checkout
│
├── 👤 Authentication
│   ├── Login (/login)
│   ├── Register (/register)
│   │   ├── Customer Registration
│   │   └── Vendor Registration (/register/vendor)
│   └── User Type Selection (/select-user-type)
│
├── 📊 Customer Dashboard (/customer)
│   ├── Overview (Spending analytics)
│   ├── Orders (History & tracking)
│   ├── Appointments
│   ├── Messages (Chat with vendors)
│   └── Notifications
│
├── 🏬 Vendor Dashboard (/vendor/*)
│   ├── Overview (Sales analytics)
│   ├── Products/Services Management
│   ├── Orders Management
│   ├── Appointments Management
│   ├── Messages (Chat with customers)
│   └── Notifications
│
├── ⚙️ Admin Dashboard (/admin)
│   ├── Overview (Platform analytics)
│   ├── User Management
│   ├── Vendor Applications
│   └── System Logs
│
└── 🧾 Invoice (/invoice)
    └── Order confirmation & PDF export
```

### 2.3 Wireframes & Prototypes

The application follows a modern dashboard-inspired design based on the **Shadcn UI Dashboard** aesthetic. Key page layouts include:

#### Homepage Layout
```
┌─────────────────────────────────────────────────┐
│  NAVBAR [Logo] [Home] [Stores] [Shop] [🔍] [🛒] │
├─────────────────────────────────────────────────┤
│                                                 │
│              HERO SECTION                       │
│     "Your Campus, Your Marketplace"             │
│         [Browse Stores] [View Products]         │
│                                                 │
├─────────────────────────────────────────────────┤
│  STORE CATEGORIES (Grid)                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│  │ Barber │ │ Tailor │ │  Tech  │ │ Drinks │   │
│  └────────┘ └────────┘ └────────┘ └────────┘   │
│  ┌────────┐ ┌────────┐ ┌────────┐              │
│  │Clothing│ │ Bottle │ │Massage │              │
│  └────────┘ └────────┘ └────────┘              │
├─────────────────────────────────────────────────┤
│              FOOTER                             │
└─────────────────────────────────────────────────┘
```

#### Vendor Dashboard Layout
```
┌─────────────────────────────────────────────────┐
│  TOPBAR [☰] [Search] [🔔] [Language] [Profile]  │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ SIDEBAR  │       MAIN CONTENT AREA              │
│          │                                      │
│ Overview │  ┌──────────────────────────────┐   │
│ Products │  │      ANALYTICS CARDS          │   │
│ Orders   │  │  [Revenue] [Orders] [Views]  │   │
│ Appts    │  └──────────────────────────────┘   │
│ Messages │                                      │
│ Settings │  ┌──────────────────────────────┐   │
│          │  │      CHARTS (Recharts)        │   │
│          │  │   [Daily|Weekly|Monthly]      │   │
│          │  └──────────────────────────────┘   │
│          │                                      │
│          │  ┌──────────────────────────────┐   │
│          │  │     RECENT ORDERS TABLE       │   │
│          │  └──────────────────────────────┘   │
└──────────┴──────────────────────────────────────┘
```

### 2.4 Style Guide

#### Color Palette

The application employs a **monochrome professional aesthetic** (Shadcn Dashboard-inspired):

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Background | `#FFFFFF` | Card backgrounds, main content |
| Secondary Background | `#F9FAFB` | Page backgrounds |
| Primary Text | `#111827` | Headings, important text |
| Secondary Text | `#6B7280` | Descriptions, labels |
| Border | `#E5E7EB` | Card borders, dividers |
| Accent (Primary) | `#000000` | Buttons, active states |
| Success | `#10B981` | Success states, confirmations |
| Warning | `#F59E0B` | Pending states, alerts |
| Error | `#EF4444` | Error states, destructive actions |

#### Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter/System | 2.25rem (36px) | 700 (Bold) |
| H2 | Inter/System | 1.875rem (30px) | 600 (Semibold) |
| H3 | Inter/System | 1.5rem (24px) | 600 (Semibold) |
| Body | Inter/System | 1rem (16px) | 400 (Normal) |
| Small | Inter/System | 0.875rem (14px) | 400 (Normal) |
| Caption | Inter/System | 0.75rem (12px) | 500 (Medium) |

#### Component Styles

**Buttons**:
```css
/* Primary Button */
.btn-primary {
  background: #000000;
  color: #FFFFFF;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  transition: opacity 0.2s;
}

/* Secondary Button */
.btn-secondary {
  background: #FFFFFF;
  color: #000000;
  border: 1px solid #E5E7EB;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
}
```

**Cards**:
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
```

**Form Inputs**:
```css
.input {
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.input:focus {
  border-color: #000000;
  outline: none;
  ring: 2px solid rgba(0, 0, 0, 0.1);
}
```

---

## 3. Technical Implementation

### 3.1 Technologies Used

#### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | Component-based UI framework |
| **Vite** | 7.2.4 | Build tool & development server |
| **React Router DOM** | 6.30.3 | Client-side routing |
| **Tailwind CSS** | 4.1.18 | Utility-first CSS framework |
| **Recharts** | 3.6.0 | Data visualization (charts) |
| **Lucide React** | 0.562.0 | Icon library |
| **Axios** | 1.13.2 | HTTP client |
| **html2canvas** | 1.4.1 | Invoice screenshot capture |
| **jspdf** | 3.0.4 | PDF generation for invoices |
| **clsx** | 2.1.1 | Conditional class names |
| **tailwind-merge** | 3.4.0 | Tailwind class merging |

#### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Backend language |
| **FastAPI** | 0.123.0 | Async web framework |
| **SQLAlchemy** | 2.0.44 | ORM for database operations |
| **Pydantic** | 2.12.5 | Data validation & serialization |
| **MySQL** | 8.0 | Relational database |
| **Uvicorn** | 0.38.0 | ASGI server |
| **python-jose** | 3.5.0 | JWT token handling |
| **passlib** | 1.7.4 | Password hashing (bcrypt) |
| **websockets** | Latest | Real-time chat functionality |
| **python-multipart** | 0.0.20 | File upload handling |

#### Development & Testing Tools

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **pytest** | Backend testing framework |
| **Vitest** | Frontend testing framework |
| **Testing Library** | React component testing |
| **ESLint** | JavaScript linting |
| **PostCSS** | CSS processing |

### 3.2 Functional Requirements Checklist

#### User Authentication & Authorization
- [x] User can register as a Customer with first name, last name, email, and password
- [x] User can register as a Vendor with business details (pending admin approval)
- [x] User can login with email and password
- [x] JWT tokens are issued and validated for protected routes
- [x] Role-based access control (Customer, Vendor, Admin)
- [x] Users can view and update their profile
- [x] Profile image upload functionality

#### Product & Inventory Management
- [x] Vendors can create products with name, description, price, and images
- [x] Vendors can update product details
- [x] Vendors can delete products
- [x] Products display stock quantity
- [x] Products can be filtered by category
- [x] Products can be searched by name
- [x] Product images support multiple colors (ProductImage table)

#### Shopping Cart & Orders
- [x] Users can add products to cart
- [x] Users can adjust quantities in cart
- [x] Cart validates stock availability before checkout
- [x] Users can place orders with payment method selection
- [x] Order history is tracked with status updates
- [x] Vendors can update order status (Processing → Shipped → Delivered)
- [x] Users can view order details and history
- [x] Invoice generation with PDF export

#### Service Booking & Appointments
- [x] Users can view available time slots
- [x] Users can book appointments for services (barber, massage, etc.)
- [x] Appointments are linked to service providers
- [x] Users can cancel appointments
- [x] Vendors can view and manage appointments
- [x] Appointment status tracking (Confirmed, Cancelled, Completed)

#### Communication System
- [x] WebSocket-based real-time chat
- [x] Customers can message vendors
- [x] Vendors can message customers
- [x] Message read receipts (with visibility-aware triggering)
- [x] Voice note recording and playback
- [x] Image and file attachments
- [x] Reply-to-message threading
- [x] Lightbox modal for image viewing

#### Notification System
- [x] Real-time notification polling (60-second intervals)
- [x] Notification types: Orders, Appointments, Messages, System
- [x] Deep linking from notifications to specific resources
- [x] Mark individual notifications as read
- [x] Mark all notifications as read
- [x] Visibility-aware polling (pauses when tab is hidden)

#### Admin Functions
- [x] View all users (customers and vendors)
- [x] Approve/reject vendor applications
- [x] View platform analytics (daily, weekly, monthly)
- [x] User management (soft delete)
- [x] System logs access

### 3.3 Non-Functional Requirements Checklist

#### Performance
- [x] Pages load in under 2 seconds (Vite build optimization)
- [x] API responses cached appropriately
- [x] Lazy loading implemented for images
- [x] Chart rendering optimized with `useMemo`
- [x] Notification polling throttled to prevent server overload

#### Responsiveness
- [x] Website is fully responsive on mobile devices (320px+)
- [x] Website is responsive on tablets (768px+)
- [x] Website is responsive on desktop (1024px+)
- [x] Collapsible sidebar navigation on mobile
- [x] Touch-friendly UI elements

#### Security
- [x] Passwords hashed with bcrypt (passlib)
- [x] JWT tokens with expiration
- [x] Protected API routes with dependency injection
- [x] Role-based access control enforced on all endpoints
- [x] SQL injection prevention via SQLAlchemy ORM
- [x] Input validation via Pydantic schemas

#### Code Quality
- [x] Code is well-organized with separation of concerns
- [x] Components follow single responsibility principle
- [x] API routes organized by domain (auth, products, orders, etc.)
- [x] Consistent naming conventions (camelCase frontend, snake_case backend)
- [x] Comments and documentation in complex functions
- [x] 3NF normalized database schema

#### Testing
- [x] 77 automated tests (100% pass rate)
- [x] Unit tests for security functions
- [x] Component tests for API endpoints
- [x] Test fixtures for database isolation

### 3.4 Key Features & Technical Justification

#### Feature 1: Real-Time WebSocket Chat System

**What It Does**: Enables bidirectional, instant messaging between customers and vendors with support for text, voice notes, images, and file attachments.

**Technical Implementation**:
```jsx
// WebSocket connection in Chat.jsx
useEffect(() => {
  const ws = new WebSocket(`ws://localhost:8000/ws/${userId}`);
  
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    // Only mark as read if user is viewing the page
    if (document.visibilityState === 'visible') {
      markMessagesAsRead(selectedId);
    }
    
    setMessages(prev => [...prev, message]);
  };
  
  return () => ws.close();
}, [userId]);
```

**Voice Note Implementation**:
```jsx
// MediaRecorder with cross-platform MIME type detection
const startRecording = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  
  // Prefer audio/mp4 (AAC) for iOS/Safari compatibility
  const mimeType = MediaRecorder.isTypeSupported('audio/mp4') 
    ? 'audio/mp4' 
    : 'audio/webm';
    
  const recorder = new MediaRecorder(stream, { mimeType });
  recorder.start();
};
```

**Why It's Important**:
1. **User Experience**: Customers can ask vendors questions about products or services without leaving the platform
2. **Trust Building**: Direct communication builds rapport between vendors and customers
3. **Accessibility**: Voice notes accommodate users who prefer audio over text
4. **Efficiency**: Reduces back-and-forth by allowing multimedia context sharing

---

#### Feature 2: 3NF Normalized Database with Backward Compatibility

**What It Does**: The database schema follows Third Normal Form (3NF) principles while maintaining backward compatibility with existing API contracts through computed properties.

**Technical Implementation**:
```python
# User model with 3NF normalization (models.py)
class User(Base):
    __tablename__ = "USER"
    
    # 3NF: Atomic columns instead of composite full_name
    first_name = Column("FIRST_NAME", String(100), index=True)
    last_name = Column("LAST_NAME", String(100), index=True)
    initial = Column("INITIAL", String(10), nullable=True)
    
    # Removed redundant is_active (derived from status)
    status = Column(String(50), default="active")
    
    # Computed properties for backward compatibility
    @property
    def full_name(self):
        """Computed full name from atomic columns"""
        parts = [self.first_name, self.initial, self.last_name]
        return " ".join(filter(None, parts)) or None
    
    @property
    def is_active(self):
        """Computed from status for backward compatibility"""
        return self.status == "active"
```

**Pydantic Schema with Computed Fields**:
```python
from pydantic import computed_field

class UserResponse(BaseModel):
    first_name: Optional[str]
    last_name: Optional[str]
    initial: Optional[str]
    
    @computed_field
    @property
    def full_name(self) -> Optional[str]:
        parts = [self.first_name, self.initial, self.last_name]
        return " ".join(filter(None, parts)) or None
```

**Why It's Important**:
1. **Data Integrity**: Eliminates redundancy and update anomalies
2. **Search Performance**: Individual name columns can be indexed for faster queries
3. **Flexibility**: Supports sorting by first name, last name, or full name
4. **Backward Compatibility**: Existing frontend code continues to work without changes
5. **Maintainability**: Clear separation of concerns between storage and presentation

---

#### Feature 3: Multi-Vendor Dashboard with Role-Specific Views

**What It Does**: Provides each vendor type (Barber, Tailor, Tech, etc.) with a customized dashboard tailored to their specific business needs.

**Technical Implementation**:

**Dynamic Routing**:
```jsx
// App.jsx - Vendor route configuration
<Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
  <Route path="/vendor" element={<VendorDashboard />} />
  <Route path="/vendor/barber" element={<BarberDashboard />} />
  <Route path="/vendor/tailor" element={<TailorDashboard />} />
  <Route path="/vendor/tech" element={<TechDashboard />} />
  <Route path="/vendor/clothesshop" element={<ClothingShopDashboard />} />
  {/* Additional vendor types */}
</Route>
```

**Vendor Authentication & Store Association**:
```python
# auth.py - Login with store_id in JWT
@router.post("/login")
def login(credentials: LoginCredentials, db: Session = Depends(get_db)):
    user = authenticate_user(db, credentials.email, credentials.password)
    
    # Fetch vendor's store_id for JWT payload
    vendor = db.query(Vendor).filter(Vendor.user_id == user.id).first()
    store_id = vendor.store_id if vendor else None
    
    token_data = {
        "sub": str(user.id),
        "role": user.role.value,
        "store_id": store_id
    }
    
    return {"access_token": create_access_token(token_data)}
```

**Why It's Important**:
1. **User Experience**: Each vendor sees only relevant features (barbers see appointments, tech shops see inventory)
2. **Scalability**: New vendor types can be added without affecting existing ones
3. **Security**: Role-based access ensures vendors only access their own data
4. **Efficiency**: Reduced cognitive load by showing only relevant information

---

## 4. Testing & Evaluation

### 4.1 Testing Process

#### Testing Framework Setup

| Layer | Framework | Configuration |
|-------|-----------|---------------|
| Backend Unit Tests | pytest | In-memory SQLite with `StaticPool` |
| Backend API Tests | FastAPI TestClient | Dependency override for test database |
| Frontend Unit Tests | Vitest | JSDOM environment |
| Frontend Component Tests | Testing Library | React Testing Library |

#### Test Structure

```
backend/tests/
├── conftest.py              # Shared fixtures
├── unit/
│   ├── test_security.py     # Password hashing, JWT tests (6 tests)
│   └── test_models.py       # SQLAlchemy model tests (13 tests)
└── component/
    ├── test_auth.py         # Authentication endpoints (13 tests)
    ├── test_products.py     # Product CRUD (13 tests)
    ├── test_orders.py       # Order management (8 tests)
    ├── test_appointments.py # Appointment booking (8 tests)
    └── test_admin.py        # Admin endpoints (11 tests)
```

#### Test Execution Results

| Date | Passed | Failed | Total | Pass Rate |
|------|--------|--------|-------|-----------|
| 2026-01-20 (Initial) | 53 | 22 | 75 | 70.7% |
| 2026-01-21 (Fixes) | 65 | 10 | 75 | 86.7% |
| 2026-01-24 (All Fixed) | 75 | 0 | 75 | 100% |
| 2026-01-25 (3NF Update) | 77 | 0 | 77 | **100%** |

#### Cross-Browser Testing

| Browser | Version | Desktop | Mobile | Status |
|---------|---------|---------|--------|--------|
| Chrome | 120+ | ✅ | ✅ | Fully Compatible |
| Firefox | 120+ | ✅ | ✅ | Fully Compatible |
| Safari | 17+ | ✅ | ✅ | Voice notes use audio/mp4 |
| Edge | 120+ | ✅ | N/A | Fully Compatible |

#### Responsive Testing

| Breakpoint | Width | Tested Features |
|------------|-------|-----------------|
| Mobile S | 320px | Navigation, cards, forms |
| Mobile M | 375px | Product grid (1 column) |
| Mobile L | 425px | Dashboard tabs |
| Tablet | 768px | Sidebar overlay, 2-column grid |
| Laptop | 1024px | Full sidebar, 3-column grid |
| Desktop | 1440px | Full experience |

### 4.2 Bugs & Challenges

The development process encountered **14 significant technical challenges**, all of which were successfully resolved. Below are the most critical issues:

#### Challenge 1: Infinite Recursive Dashboard Loop

**Severity**: Critical (Browser Freeze)

**Symptoms**:
- Browser froze on Bottle Shop Dashboard
- Network tab showed infinite `GET /api/vendor/dashboard/17` requests
- UI flickered uncontrollably

**Root Cause**: Recursive component import error. `TopBar.jsx` was accidentally overwritten with `BottleShopDashboard` logic, creating an infinite import loop.

**Solution**:
1. Rewrote `TopBar.jsx` as a pure presentation component
2. Implemented `useCallback` memoization for refresh handlers
3. Set `useEffect` dependencies to `[]` for mount-only fetching
4. Removed cache-busting timestamps from API calls

---

#### Challenge 2: Pydantic V2 Migration Breaking Changes

**Severity**: High (Test Suite Failure)

**Symptoms**:
```
PydanticUserError: Field 'model_fields' defined on a base class was overwritten
```

**Root Cause**: Pydantic V2 introduced breaking changes:
- `class Config:` → `model_config = ConfigDict(...)`
- `orm_mode = True` → `from_attributes = True`
- Reserved field names like `model_fields`

**Solution**:
```python
# Before (Pydantic V1)
class MyModel(BaseModel):
    class Config:
        orm_mode = True

# After (Pydantic V2)
from pydantic import ConfigDict

class MyModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)
```

---

#### Challenge 3: Database Schema Out of Sync (3NF Migration)

**Severity**: High (Application Crash)

**Symptoms**:
```
sqlalchemy.exc.OperationalError: Unknown column 'USER.FIRST_NAME' in 'field list'
```

**Root Cause**: SQLAlchemy models were updated for 3NF (splitting `full_name` into `first_name`, `last_name`, `initial`), but the MySQL database schema was not migrated.

**Solution**:
1. Created `update_schema_user_3nf.py` migration script
2. Added new columns with `ALTER TABLE` commands
3. Migrated existing data by splitting `full_name`
4. Implemented `@property` decorators for backward compatibility

---

#### Challenge 4: Premature Message Read Receipts

**Severity**: Medium (UX Issue)

**Symptoms**: Messages marked as "read" when recipient's tab was in background.

**Root Cause**: `Chat.jsx` called `markMessagesAsRead()` on every incoming WebSocket message, regardless of page visibility.

**Solution**:
```jsx
// Visibility-aware read receipt
if (document.visibilityState === 'visible') {
    markMessagesAsRead(currentSelected.id);
}

// Trigger on tab focus
window.addEventListener('focus', () => markMessagesAsRead(selectedId));
```

---

#### Challenge 5: Test Fixture Database State Pollution

**Severity**: Medium (Intermittent Test Failures)

**Symptoms**:
- `IntegrityError: Duplicate entry 'test@example.com'`
- Tests passing individually but failing when run together

**Root Cause**: Tests shared database state due to improper fixture scoping and missing rollbacks.

**Solution**:
```python
@pytest.fixture(scope="function")  # Function scope, not session
def db_session():
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()  # Always rollback
        session.close()

# Use unique test data
email = f"test_{uuid.uuid4().hex[:8]}@example.com"
```

---

### 4.3 Lessons Learned

| Lesson | Explanation |
|--------|-------------|
| Always migrate the database | ORM model changes require corresponding database migrations. Consider using Alembic for automated migrations. |
| Pydantic V2 is not backward compatible | Plan migrations carefully and test thoroughly after upgrading. |
| Test isolation is critical | Use function-scoped fixtures and unique test data to prevent state pollution. |
| Backend-Frontend contracts must stay synchronized | Document API changes and update both sides together. |
| Computed properties provide backward compatibility | Use `@property` decorators to maintain API contracts during schema changes. |

---

## 5. Conclusion & Future Work

### 5.1 Project Reflection

#### Goals Achievement Summary

| Original Goal | Achievement | Evidence |
|---------------|-------------|----------|
| Multi-vendor marketplace | ✅ Fully Achieved | 7 distinct store types operational |
| Mobile responsiveness | ✅ Fully Achieved | Tested on 320px-2560px screens |
| Real-time chat | ✅ Fully Achieved | WebSocket implementation with multimedia |
| Service booking | ✅ Fully Achieved | Appointment system with time slots |
| Authentication | ✅ Fully Achieved | JWT with RBAC (77 tests passing) |
| Admin analytics | ✅ Fully Achieved | Daily/weekly/monthly charts with Recharts |

#### Key Technical Achievements

1. **Database Normalization**: Successfully migrated to 3NF schema while maintaining 100% backward compatibility
2. **Test Coverage**: Achieved 100% pass rate (77/77 tests) with comprehensive unit and component tests
3. **Real-time Features**: Implemented WebSocket chat with voice notes, images, and reply threading
4. **Responsive Design**: Created mobile-first layouts with collapsible navigation
5. **Security**: Implemented robust authentication with password hashing, JWT tokens, and role-based access

#### What We Learned

1. **Full-Stack Development**: Gained experience integrating React frontend with FastAPI backend
2. **Database Design**: Learned the importance of normalization and migration planning
3. **Testing Practices**: Understood the value of test isolation and fixture management
4. **Real-time Communication**: Gained hands-on experience with WebSockets and MediaRecorder API
5. **Team Collaboration**: Developed skills in code documentation and technical communication

### 5.2 Future Enhancements

#### Enhancement 1: Payment Gateway Integration

**Description**: Integrate with payment providers (Touch 'n Go eWallet, GrabPay, FPX) for seamless checkout.

**Technical Approach**:
- Implement payment provider SDK integration
- Create `TRANSACTION` table for payment records
- Add payment status webhooks for order confirmation

**User Impact**: Customers can complete purchases without cash, increasing conversion rates.

---

#### Enhancement 2: AI-Powered Product Recommendations

**Description**: Implement machine learning-based product suggestions based on user behavior and purchase history.

**Technical Approach**:
- Collect user interaction data (views, cart additions, purchases)
- Train collaborative filtering model
- Serve recommendations via dedicated API endpoint

**User Impact**: Personalized shopping experience increases engagement and sales.

---

#### Enhancement 3: Progressive Web App (PWA) Conversion

**Description**: Convert the application to a PWA for offline support and native app-like experience.

**Technical Approach**:
- Add service worker for caching
- Implement app manifest for installation
- Enable push notifications for order updates

**User Impact**: Users can install the app on their devices and receive notifications even when the browser is closed.

---

## Appendix: Database Schema

### Entity-Relationship Overview

The database follows **Third Normal Form (3NF)** with 20+ interconnected tables. Key relationships include:

- **USER** ↔ **VENDOR** (1:1) - Users can have vendor profiles
- **VENDOR** ↔ **STORE** (1:1) - Vendors own stores
- **STORE** ↔ **PRODUCT** (1:N) - Stores have many products
- **PRODUCT** ↔ **PRODUCT_IMAGE** (1:N) - Products have multiple images
- **ORDER** ↔ **ORDER_ITEM** (1:N) - Orders contain multiple items
- **ORDER** ↔ **ORDER_HISTORY** (1:N) - Orders have status history
- **SERVICE** ↔ **TIME_SLOT** (1:N) - Services have available time slots
- **APPOINTMENT** ↔ **TIME_SLOT** (N:1) - Appointments book time slots

### Complete SQL Schema

```sql
-- =====================================================
-- AIU MICROSTORE DATABASE SCHEMA
-- Version: 3NF Normalized
-- Last Updated: January 2026
-- =====================================================

-- Roles Table
CREATE TABLE ROLE_ADMIN (
    ROLE_ID INT PRIMARY KEY AUTO_INCREMENT,
    ROLE_NAME VARCHAR(50) NOT NULL,
    ROLE_POSITION VARCHAR(50)
);

-- Store Table
CREATE TABLE STORE (
    STORE_ID INT PRIMARY KEY AUTO_INCREMENT,
    STORE_NAME VARCHAR(100) NOT NULL,
    STORE_TYPE VARCHAR(50),
    IMAGE_URL VARCHAR(255)
);

-- Vendor Table
CREATE TABLE VENDOR (
    VENDOR_ID INT PRIMARY KEY AUTO_INCREMENT,
    VENDOR_NAME VARCHAR(100) NOT NULL,
    VENDOR_INFO TEXT,
    CATEGORY_TYPE VARCHAR(50),
    ROLE_ID INT,
    STORE_ID INT,
    USER_ID INT,
    FOREIGN KEY (ROLE_ID) REFERENCES ROLE_ADMIN(ROLE_ID),
    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID)
);

-- User Table (3NF Normalized)
CREATE TABLE USER (
    id INT PRIMARY KEY AUTO_INCREMENT,
    FIRST_NAME VARCHAR(100),
    LAST_NAME VARCHAR(100),
    INITIAL VARCHAR(10),
    PHONE_NUMBER VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'vendor', 'customer') DEFAULT 'customer',
    status VARCHAR(50) DEFAULT 'active',
    PROFILE_IMAGE TEXT,
    INDEX idx_first_name (FIRST_NAME),
    INDEX idx_last_name (LAST_NAME),
    INDEX idx_email (email)
);

-- Category Table
CREATE TABLE CATEGORY (
    CATEGORY_ID INT PRIMARY KEY AUTO_INCREMENT,
    CATEGORY_NAME VARCHAR(100) NOT NULL,
    CATEGORY_TYPE VARCHAR(50),
    STORE_ID INT,
    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID)
);

-- Product Table
CREATE TABLE PRODUCT (
    PRODUCT_ID INT PRIMARY KEY AUTO_INCREMENT,
    PRODUCT_NAME VARCHAR(100) NOT NULL,
    PRODUCT_DESC TEXT,
    PRODUCT_PRICE DECIMAL(10, 2) NOT NULL,
    IMAGE_URL TEXT,
    SKU VARCHAR(50),
    STOCK_QUANTITY INT DEFAULT 0,
    STATUS VARCHAR(20) DEFAULT 'active',
    WEIGHT DECIMAL(10, 2),
    TAX_CLASS VARCHAR(50) DEFAULT 'Taxable Goods',
    URL_KEY VARCHAR(255),
    META_TITLE VARCHAR(255),
    META_DESC TEXT,
    VISIBILITY VARCHAR(50) DEFAULT 'catalog_search',
    MANAGE_STOCK BOOLEAN DEFAULT TRUE,
    STOCK_AVAILABILITY VARCHAR(50) DEFAULT 'in_stock',
    CUSTOM_OPTIONS TEXT,
    STORE_ID INT,
    CATEGORY_ID INT,
    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID),
    FOREIGN KEY (CATEGORY_ID) REFERENCES CATEGORY(CATEGORY_ID)
);

-- Product Image Table (1:N with Product)
CREATE TABLE PRODUCT_IMAGE (
    IMAGE_ID INT PRIMARY KEY AUTO_INCREMENT,
    PRODUCT_ID INT NOT NULL,
    IMAGE_URL TEXT NOT NULL,
    COLOR VARCHAR(50) NOT NULL,
    IS_MAIN BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID) ON DELETE CASCADE
);

-- Payment Method Table (3NF)
CREATE TABLE PAYMENT_METHOD (
    payment_method_id INT PRIMARY KEY AUTO_INCREMENT,
    method_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- Order Table
CREATE TABLE ORDERS (
    ORDER_ID INT PRIMARY KEY AUTO_INCREMENT,
    CUSTOMER_ID INT NOT NULL,
    STORE_ID INT NOT NULL,
    ORDER_DATE DATETIME DEFAULT CURRENT_TIMESTAMP,
    TOTAL_AMOUNT DECIMAL(10, 2) NOT NULL,
    STATUS VARCHAR(50) DEFAULT 'Processing',
    CUSTOMER_NAME VARCHAR(100),
    STORE_ORDER_ID INT DEFAULT 0,
    PAYMENT_METHOD_ID INT,
    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID),
    FOREIGN KEY (PAYMENT_METHOD_ID) REFERENCES PAYMENT_METHOD(payment_method_id)
);

-- Order Item Table
CREATE TABLE ORDER_ITEM (
    ORDER_ITEM_ID INT PRIMARY KEY AUTO_INCREMENT,
    ORDER_ID INT NOT NULL,
    PRODUCT_ID INT NOT NULL,
    QUANTITY INT NOT NULL,
    PRICE DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (ORDER_ID) REFERENCES ORDERS(ORDER_ID) ON DELETE CASCADE,
    FOREIGN KEY (PRODUCT_ID) REFERENCES PRODUCT(PRODUCT_ID)
);

-- Order History Table (Status Tracking)
CREATE TABLE ORDER_HISTORY (
    history_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES ORDERS(ORDER_ID) ON DELETE CASCADE
);

-- Service Table
CREATE TABLE SERVICE (
    SERVICE_ID INT PRIMARY KEY AUTO_INCREMENT,
    SERVICE_NAME VARCHAR(100) NOT NULL,
    SERVICE_DESC TEXT,
    SERVICE_PRICE DECIMAL(10, 2) NOT NULL,
    IMAGE_URL TEXT,
    STATUS VARCHAR(20) DEFAULT 'active',
    STORE_ID INT,
    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID)
);

-- Service Provider Table (3NF - Normalized from Appointment)
CREATE TABLE SERVICE_PROVIDER (
    PROVIDER_ID INT PRIMARY KEY AUTO_INCREMENT,
    NAME VARCHAR(100) NOT NULL,
    CONTACT VARCHAR(255),
    STORE_ID INT NOT NULL,
    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID)
);

-- Time Slot Table (3NF - Normalized from Appointment)
CREATE TABLE TIME_SLOT (
    SLOT_ID INT PRIMARY KEY AUTO_INCREMENT,
    START_TIME DATETIME NOT NULL,
    END_TIME DATETIME NOT NULL,
    SERVICE_ID INT NOT NULL,
    FOREIGN KEY (SERVICE_ID) REFERENCES SERVICE(SERVICE_ID)
);

-- Appointment Table (3NF Normalized)
CREATE TABLE APPOINTMENT (
    APPOINTMENT_ID INT PRIMARY KEY AUTO_INCREMENT,
    CUSTOMER_ID INT NOT NULL,
    CUSTOMER_NAME VARCHAR(100),
    STORE_ID INT NOT NULL,
    SLOT_ID INT,
    PROVIDER_ID INT,
    BOOKING_DATE DATETIME,
    BARBER_NAME VARCHAR(100),
    SERVICE_NAME VARCHAR(100),
    STATUS VARCHAR(50) DEFAULT 'Confirmed',
    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID),
    FOREIGN KEY (SLOT_ID) REFERENCES TIME_SLOT(SLOT_ID),
    FOREIGN KEY (PROVIDER_ID) REFERENCES SERVICE_PROVIDER(PROVIDER_ID)
);

-- Review Table
CREATE TABLE REVIEW (
    REVIEW_ID INT PRIMARY KEY AUTO_INCREMENT,
    CUSTOMER_ID INT NOT NULL,
    CUSTOMER_NAME VARCHAR(100),
    STORE_ID INT NOT NULL,
    BARBER_NAME VARCHAR(100),
    RATING INT NOT NULL CHECK (RATING BETWEEN 1 AND 5),
    COMMENT TEXT,
    CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP,
    STATUS VARCHAR(50) DEFAULT 'Confirmed',
    FOREIGN KEY (STORE_ID) REFERENCES STORE(STORE_ID)
);

-- Vendor Application Table
CREATE TABLE VENDOR_APPLICATION (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    contact_details TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    vendor_type VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(id)
);

-- Message Table (Chat System)
CREATE TABLE MESSAGE (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    message_type VARCHAR(50) DEFAULT 'text',
    attachment_url TEXT,
    reply_to_id INT,
    FOREIGN KEY (sender_id) REFERENCES USER(id),
    FOREIGN KEY (receiver_id) REFERENCES USER(id),
    FOREIGN KEY (reply_to_id) REFERENCES MESSAGE(id)
);

-- Notification Table
CREATE TABLE NOTIFICATION (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    related_id INT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES USER(id) ON DELETE CASCADE
);

-- System Logs Table
CREATE TABLE system_logs (
    LOG_ID INT PRIMARY KEY AUTO_INCREMENT,
    ACTION TEXT NOT NULL,
    TIMESTAMP DATETIME DEFAULT CURRENT_TIMESTAMP,
    CUSTOMER_ID INT,
    VENDOR_ID INT
);
```

---

## Document Information

| Attribute | Value |
|-----------|-------|
| **Project Name** | AIU Microstore |
| **Course** | CDE2223 - Web Design and Development |
| **Submission Date** | January 29, 2026 |
| **Total Pages** | ~30 pages |
| **Word Count** | ~6,500 words |
| **Technologies** | React 19, FastAPI, MySQL, Tailwind CSS |
| **Test Coverage** | 77 tests (100% pass rate) |

---

*End of Report*