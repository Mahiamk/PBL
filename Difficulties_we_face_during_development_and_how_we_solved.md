# Development Challenges & Solutions

This document logs critical technical issues encountered during the development of the Vendor Management System and Microstore Frontend, detailing the root causes and the specific solutions implemented.

---

### 1. The "Infinite Recursive Dashboard" Loop

**The Problem:**
We encountered a severe bug where the Bottle Shop Dashboard triggered an infinite loop of network requests (`GET /api/vendor/dashboard/17`) and caused the browser to freeze. The UI showed blinking/flickering elements, and the backend logs were spammed with dozens of requests per second.

**Root Cause:**
Upon deep inspection, we discovered a **recursive import error**. The file `TopBar.jsx` (intended to be just a header UI) had been accidentally overwritten with a copy of the `BottleShopDashboard` logic.
- `Dashboard` imported `TopBar`.
- `TopBar` (containing Dashboard code) tried to render itself.
- `TopBar` then ran its own `useEffect`, fetching data, and rendering another `TopBar`.
- This created an infinite chain of distinct component instances, each mounting and firing a network request.

**The Solution:**
1. **Component Isolation:** We completely rewrote `TopBar.jsx` to be a pure presentation component (receiving props for search/language) with no internal fetching logic.
2. **Fetch Control:** In `BottleShopDashboard.jsx`, we implemented aggressive memoization. We used `useCallback` for the refresh handler and set the initial data fetch `useEffect` dependency array to `[]` (empty) to strictly ensure it only runs once on mount.
3. **API Cleanup:** We removed the timestamp cache-busting (`?t=timestamp`) from the default `api.js` fetch method to prevent new URL generation from bypassing React's reconciliation.

---

### 2. "Infinite Sidebar" Layout Glitch

**The Problem:**
Specifically in the Bottle Shop vendor view, the sidebar would visually duplicate itself or stretch infinitely down the page, breaking the layout.

**Root Cause:**
The original `Sidebar` component was designed for a different layout structure (likely the admin panel) and had CSS class conflicts when placed inside the new Vendor Dashboard layout. It was also tightly coupled to a generic global state that didn't align with the specific Bottle Shop tab logic.

**The Solution:**
We created a **Dedicated Sidebar Component** (`frontend/src/pages/vendor/bottleshop/Sidebar.jsx`).
- This isolated the styles from the rest of the application.
- We switched to explicit prop passing (`activeTab`, `onTabChange`) instead of relying on complex context consumers for unrelated state.
- This decoupling ensured the Bottle Shop layout remained stable regardless of changes to the main admin sidebar.

---

### 3. Product "Cross-Contamination" between Shops

**The Problem:**
When a vendor added a product (e.g., a "MacBook") via the Computer Shop dashboard, it would appear in the Drink Shop public page. Conversely, computer products weren't showing up correctly in the Computer Shop.

**Root Cause:**
1. **Lazy Filtering:** The Drink Shop's `fetchLogic` was using a loose heuristic: `if (store_id > 8) show_product`. This meant *any* new vendor's products were dumped into the Drink Shop.
2. **Prop Mismatch:** The `ComputerShop.jsx` component was passing its filtering function prop as `fetchLogic`, but the `ShopTemplate` component expected a prop named `customFetch`. As a result, the custom filter was ignored entirely.

**The Solution:**
1. **Regex-Based Filtering:** We updated both `DrinkShop.jsx` and `ComputerShop.jsx` to use robust content filtering.
   - Drink Shop now checks for keywords like `/juice|drink|water/`.
   - Computer Shop checks for `/laptop|computer|ssd|ram/`.
2. **Prop Correction:** Renamed the prop in `ComputerShop.jsx` from `fetchLogic` to `customFetch` to correctly hook into the `ShopTemplate` data loading lifecycle.

---

### 4. Dynamic Vendor Authentication & Schema Validation

**The Problem:**
Newly registered vendors (e.g., store_id 17) were unable to create products, receiving `403 Forbidden` errors, or their dashboards would load default seeded data (Store ID 1) instead of their actual store.

**Root Cause:**
- **Strict Table Joins:** The backend endpoint `create_product` required a strict relationship row in the `Vendor` table linking `user_id` to `store_id`. For new users, this row often didn't exist yet, even if they had the correct User Role.
- **Hardcoded Defaults:** The legacy authentication code defaulted `store_id = 1` if a quick lookup failed.

**The Solution:**
1. **Role-Based Fallback:** We updated `backend/app/api/v1/products.py` to allow `UserRole.VENDOR` to bypass the strict table check if they are the verified owner of the store being targeted.
2. **Dynamic Auth Query:** We modified `backend/app/api/v1/auth.py` to explicitly query the `Vendor` table for the user's actual `store_id` at login time and include it in the JWT token payload.

---

### 5. Pydantic V2 Migration Breaking Changes

**The Problem:**
After upgrading to Pydantic V2, our entire test suite failed with various errors:
- `PydanticUserError: Field 'model_fields' defined on a base class was overwritten`
- `ConfigDict not recognized`
- Tests expecting `from_attributes` but getting `orm_mode` errors

**Root Cause:**
Pydantic V2 introduced **breaking changes** from V1:
- `class Config:` was replaced with `model_config = ConfigDict(...)`.
- `orm_mode = True` became `from_attributes = True`.
- Field names like `model_fields` are now reserved by Pydantic's internal metaclass.
- Computed fields require the new `@computed_field` decorator instead of `@validator`.

**The Solution:**
1. **ConfigDict Migration:** Replaced all `class Config:` blocks with `model_config = ConfigDict(from_attributes=True)`.
2. **Computed Field Decorator:** Used `@computed_field` with `@property` for derived fields like `full_name` and `is_active`:
   ```python
   from pydantic import computed_field
   
   @computed_field
   @property
   def full_name(self) -> Optional[str]:
       parts = [self.first_name, self.initial, self.last_name]
       return " ".join(filter(None, parts)) or None
   ```
3. **Reserved Field Avoidance:** Renamed any fields that conflicted with Pydantic's reserved names.

---

### 6. Database Schema Out of Sync (3NF Normalization)

**The Problem:**
After updating the SQLAlchemy models to support 3NF normalization (splitting `full_name` into `FIRST_NAME`, `LAST_NAME`, `INITIAL`), the application crashed with:
```
sqlalchemy.exc.OperationalError: Unknown column 'USER.FIRST_NAME' in 'field list'
```

**Root Cause:**
The Python ORM models were updated, but the **actual MySQL database schema was never migrated**. SQLAlchemy generates SQL queries based on model definitions, and MySQL rejected the queries because the columns didn't exist.

**The Solution:**
1. **Created Migration Script:** Built `backend/update_schema_user_3nf.py` to:
   - Add new columns (`FIRST_NAME`, `LAST_NAME`, `INITIAL`, `PHONE_NUMBER`).
   - Migrate existing `full_name` data by splitting it into the new atomic columns.
   - Add indexes for search performance.
   - Remove redundant columns (`full_name`, `is_active`).
2. **Backward Compatibility:** Implemented `@property` decorators in the SQLAlchemy model:
   ```python
   @property
   def full_name(self):
       parts = [self.first_name, self.initial, self.last_name]
       return " ".join(filter(None, parts)) or None
   
   @property
   def is_active(self):
       return self.status == "active"
   ```
   This ensures the API contract remains unchanged even though the underlying data structure was normalized.

---

### 7. Test Fixtures and Database State Pollution

**The Problem:**
Tests were failing intermittently with errors like:
- `IntegrityError: Duplicate entry 'test@example.com'`
- `AssertionError: Expected 1 user, got 3`
- Tests passing individually but failing when run together.

**Root Cause:**
- **Shared Database State:** Tests were not properly cleaning up after themselves, leaving stale data.
- **Fixture Scope Issues:** Some fixtures were session-scoped when they should have been function-scoped.
- **Missing Rollback:** Database transactions weren't being rolled back between tests.

**The Solution:**
1. **Function-Scoped Fixtures:** Changed critical fixtures like `db_session` to function scope with automatic cleanup:
   ```python
   @pytest.fixture(scope="function")
   def db_session():
       session = TestingSessionLocal()
       try:
           yield session
       finally:
           session.rollback()
           session.close()
   ```
2. **Unique Test Data:** Used UUIDs in test email addresses to avoid collisions:
   ```python
   email = f"test_{uuid.uuid4().hex[:8]}@example.com"
   ```
3. **Explicit Cleanup:** Added teardown logic to delete test records after each test.

---

### 8. Frontend Form Validation Mismatch

**The Problem:**
After adding new fields (`first_name`, `last_name`, `initial`, `phone_number`) to the backend, the registration form would submit but users weren't being created. No error was shown to the user.

**Root Cause:**
- **Silent API Errors:** The frontend wasn't properly handling 422 Validation Error responses.
- **Missing Fields:** The React form was still sending the old `full_name` field instead of the new atomic fields.
- **Schema Mismatch:** Backend expected `first_name` (required) but frontend sent `full_name`.

**The Solution:**
1. **Updated Form Components:** Modified `Register.jsx` and `VendorRegister.jsx` to collect atomic name fields:
   ```jsx
   <Input name="first_name" placeholder="First Name" required />
   <Input name="last_name" placeholder="Last Name" required />
   <Input name="initial" placeholder="Middle Initial" />
   <Input name="phone_number" placeholder="Phone Number" />
   ```
2. **Error Handling:** Added proper error display for validation failures:
   ```jsx
   if (response.status === 422) {
       const data = await response.json();
       setError(data.detail[0]?.msg || "Validation error");
   }
   ```
3. **API Payload Update:** Changed the registration payload to match the new schema.

---

### 9. Message Read Status Synchronization Bug (Database Layer)

**The Problem:**
Users reported that messages were sometimes appearing as "read" significantly before the recipient actually opened them.

**Root Cause:**
- **Missing Database Default:** The `MESSAGE` table's `is_read` column was defined in SQLAlchemy with `default=False`, but the actual MySQL table column had `DEFAULT NULL` and allowed `NULL` values.
- **Inconsistent State:** When messages were inserted, the database didn't enforce `False` (0), leading to indeterminate states that the frontend sometimes interpreted incorrectly.

**The Solution:**
1. **Schema Migration:** We ran a migration script to:
   - Update `NULL` values to `0`.
   - Alter the column to `TINYINT(1) NOT NULL DEFAULT 0`.
2. **Model Update:** Updated `app/models/models.py` to enforce the server default:
   ```python
   is_read = Column(Boolean, default=False, server_default='0', nullable=False)
   ```

---

### 10. Premature Message Read Receipts (Frontend Logic)

**The Problem:**
If a user had the chat window open in a background tab or minimized window, incoming messages were immediately marked as "Read" via WebSocket, giving the sender a false sense that their message was seen.

**Root Cause:**
The `Chat.jsx` component was listening for incoming messages and immediately calling `markMessagesAsRead()` if the sender ID matched the open conversation, regardless of whether the user was actually looking at the page.

**The Solution:**
1. **Visibility Integration:** We added `document.visibilityState` checks to the message handler.
2. **Focus Listeners:** We added event listeners for `focus` and `visibilitychange` to trigger the read receipt only when the user returns to the tab.
   ```jsx
   // Only mark read if visible
   if (document.visibilityState === 'visible') {
       markMessagesAsRead(currentSelected.id);
   }
   
   // Listener for when user returns
   window.addEventListener('focus', () => markMessagesAsRead(selectedId));
   ```

---

### 11. Missing Columns in APPOINTMENT Table (3NF Normalization)

**The Problem:**
The backend started crashing with `sqlalchemy.exc.ProgrammingError: 1054 (42S22): Unknown column 'APPOINTMENT.SLOT_ID'` when fetching appointments.

**Root Cause:**
Similar to the User 3NF issue, the Python models for `Appointment` were updated to include `SLOT_ID` and `PROVIDER_ID` (replacing direct dates and names), but the database schema had not been updated to match. The SQLAlchemy query requested columns that didn't exist in the MySQL table.

**The Solution:**
1. **Created Migration Script:** Built `backend/update_schema_appointment_3nf.py` to:
   - Check for missing columns (`SLOT_ID`, `PROVIDER_ID`).
   - Execute `ALTER TABLE APPOINTMENT ADD COLUMN ...` commands.
   - Add Foreign Key constraints linking to `TIME_SLOT` and `SERVICE_PROVIDER` tables.
2. **Result:** The application can now correctly join appointments with their specific time slots and providers.

---

### 12. Excessive Notification Polling

**The Problem:**
The application was spamming the `/api/notifications/` endpoint every few seconds, even when the user was inactive or the tab was in the background, causing unnecessary server load/logging.

**Root Cause:**
- **Aggressive Polling:** The interval was set to 30s, which is frequent given the current user base.
- **Unstable Dependencies:** The `useEffect` hook depended on the entire `user` object (`[user]`). If any part of the user context changed (creating a new object reference), the polling timer would reset and fire immediately, potentially leading to rapid-fire requests if the context updated frequently.
- **Background Fetching:** It continued to poll even when the tab was hidden.

**The Solution:**
1. **Throttled Polling:** Increased the interval to **60 seconds**.
2. **Visibility Check:** Added `if (document.visibilityState === 'visible')` guard clauses to prevent fetching when the user is away.
3. **Stable Dependencies:** Changed the dependency array to `[user?.userId]` to ensure the effect only re-runs when the actual user identity changes, not just the object reference.

---

### 13. Dashboard Visualization & Aesthetic Overhaul (Frontend)

**The Problem:**
The Customer Dashboard had an inconsistent design with rainbow colors, poor contrast, and legacy CSS that didn't match the modern "Shadcn Dashboard 01" monochrome aesthetic. The graph was a static CSS-div mock that didn't reflect real data.

**Root Cause:**
The dashboard was built using older template code with hardcoded styles (`bg-pink-500`, etc.) and mock arrays for chart data. It lacked a charting library integration.

**The Solution:**
1. **Monochrome Redesign:** Stripped all color classes and enforced a strict White/Black/Gray palette (`bg-white`, `text-gray-900`, `border-gray-200`).
2. **Recharts Integration:** Implemented the `recharts` library to render professional, responsive SVG charts.
3. **Data Binding:** Connected the chart to the `useOrder` context using `useMemo` to aggregate real order totals dynamically.

---

### 14. Multi-Timeframe Data Aggregation (Frontend)

**The Problem:**
Users could only see a monthly breakdown of their spending. They needed to visualize their data by Day (for the current month) and by Year (historical trends).

**Root Cause:**
The chart logic was hardcoded to a statically generated 12-month array. It lacked the logic to filter order dates dynamically based on user selection.

**The Solution:**
1. **Dynamic Aggregation:** Wrote a robust aggregation algorithm inside `useMemo` that parses `order.date` strings.
2. **Timeframe Toggles:** Added a `daily | monthly | yearly` switcher state.
3. **Logic:**
   - **Daily:** Indexes orders by `date.getDate()` for the specific month.
   - **Monthly:** Indexes orders by `date.getMonth()` for the current year.
   - **Yearly:** Indexes orders by `date.getFullYear()` for a 5-year sliding window.

---

## Lessons Learned

1. **Always migrate the database** when changing ORM models. Consider using Alembic for automated migrations.
2. **Pydantic V2 is not backward compatible** - plan migration carefully and test thoroughly.
3. **Test isolation is critical** - use function-scoped fixtures and unique test data.
4. **Backend-Frontend contracts must stay synchronized** - document API changes and update both sides together.
5. **Computed properties provide backward compatibility** - use `@property` decorators to maintain API contracts during schema changes.
