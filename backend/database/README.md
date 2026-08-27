# Database Documentation

This directory contains database schemas, seed data, and migration records for the AIU MicroStore project.

## Recent Updates (January 2026)

### 1. 3NF Normalization: User Table
We normalized the `USER` table to Third Normal Form (3NF) to eliminate redundancy and improve data integrity.

*   **Decomposed `full_name` Column**:
    *   Split into atomic fields: `FIRST_NAME`, `LAST_NAME`, `INITIAL` (middle initial).
    *   This follows 1NF principle: each column should contain atomic (indivisible) values.
*   **Removed Redundant `is_active` Column**:
    *   The `is_active` boolean was redundant with the `status` string field.
    *   `status` values: 'active', 'inactive', 'pending', 'suspended', 'deleted'.
    *   `is_active` can be derived: `is_active = (status == 'active')`.
*   **Added `PHONE_NUMBER` Column**:
    *   New VARCHAR(20) field for user contact information.
*   **New USER Table Structure**:
    | Column | Type | Notes |
    |--------|------|-------|
    | id | INT | Primary Key, Auto-increment |
    | FIRST_NAME | VARCHAR(100) | Indexed |
    | LAST_NAME | VARCHAR(100) | Indexed |
    | INITIAL | VARCHAR(10) | Nullable (middle initial) |
    | PHONE_NUMBER | VARCHAR(20) | Nullable |
    | email | VARCHAR(255) | Unique, Not Null |
    | hashed_password | VARCHAR(255) | Not Null |
    | role | ENUM | 'customer', 'vendor', 'admin' |
    | status | VARCHAR(50) | Default: 'active' |
    | PROFILE_IMAGE | TEXT | Nullable |
*   **Backward Compatibility**: The SQLAlchemy model uses `@property` decorators:
    ```python
    @property
    def full_name(self):
        """Computed full name from first_name, initial, and last_name"""
        parts = [self.first_name, self.initial, self.last_name]
        return " ".join(filter(None, parts)) or None
    
    @property
    def is_active(self):
        """Computed from status for backward compatibility"""
        return self.status == "active"
    ```

### January 27, 2026
- **Data Integrity Repair**:
  - **Store Reference Restoration**: Identified and fixed missing rows in the `STORES` table (specifically `store_id=2`).
  - Resolved `IntegrityError` in `SERVICE_PROVIDER` insertions caused by orphaned provider records attempting to reference non-existent stores.
  - Verified Foreign Key consistency between `SERVICE_PROVIDER`, `SERVICES`, and `STORES`.

### January 26, 2026
- **Schema Updates**:
  - **Vendor Applications**: Converted `status` column in `VENDOR_APPLICATION` table from `ENUM` to `VARCHAR(50)` to prevent insertion errors with varying case/values.
  - **User Status**: Aligned `USER` table status field to support `PENDING` state for new vendor registrations.
- **Data Maintenance**:
  - **Cleanup**: Executed `DELETE` operations to remove test store entires (Barber Shop, Tailor Shop, etc.) and their associated products/orders to prepare for production/demo environment.

### 2. 3NF Normalization: Orders Table
We normalized the `ORDERS` table to Third Normal Form (3NF) to improve data integrity and reduce redundancy.

*   **New Table: `PAYMENT_METHOD`**
    *   Stores valid payment types (e.g., 'Online Payment', 'COD').
    *   Columns: `payment_method_id` (PK), `method_name`, `description`.
*   **New Table: `ORDER_HISTORY`**
    *   Tracks status changes for orders (e.g., Processing -> Shipped).
    *   Columns: `history_id` (PK), `order_id` (FK), `status`, `comment`, `created_at`.
*   **Changes to `ORDERS` Table**:
    *   Replaced the string column `payment_method` with a Foreign Key `payment_method_id`.
    *   **Backward Compatibility**: The SQLAlchemy model (`Order`) includes a property `payment_method` that automatically fetches the string name from the relationship, ensuring Frontend APIs remain unbroken.

### 3. System Logging
We introduced a logging mechanism to track critical security and system events.

*   **New Table: `system_logs`**
    *   Purpose: Audit trail for user actions (specifically Login Success/Failure).
    *   Columns:
        *   `LOG_ID` (PK)
        *   `ACTION` (Text, e.g., "Login Failure")
        *   `TIMESTAMP` (DateTime)
        *   `CUSTOMER_ID` (FK, nullable)
        *   `VENDOR_ID` (FK, nullable)

### 4. Normalization: Appointments & Services
We refactored the scheduling system to decouple Service Providers and Time Slots from the main Appointment record.

*   **New Table: `SERVICE_PROVIDER`**
    *   Represents the employee or barber performing the service.
    *   Columns: `PROVIDER_ID` (PK), `NAME`, `CONTACT`, `STORE_ID` (FK).
*   **New Table: `TIME_SLOT`**
    *   Represents the specific time block allocated for a service.
    *   Columns: `SLOT_ID` (PK), `START_TIME`, `END_TIME`, `SERVICE_ID` (FK).
*   **Changes to `APPOINTMENT` Table**:
    *   Replaced raw `barber_name` and `booking_date` columns with foreign keys.
    *   New FKs: `PROVIDER_ID` references `SERVICE_PROVIDER`, `SLOT_ID` references `TIME_SLOT`.
    *   **Backward Compatibility**: Similar to Orders, the Python model uses `@property` decorators to maintain the API interface expected by the Frontend.

## Schema Migration Scripts
Due to the lack of an automated migration tool (like Alembic) in the early stages, specific Python scripts were used to apply these schema changes safely:

1.  `backend/update_schema_user_3nf.py`: Migrated USER table to 3NF (split full_name, add phone_number, remove redundant columns).
2.  `backend/convert_orders_3nf.py`: Migrated existing orders to the new 3NF structure.
3.  `backend/create_logs_table.py`: Created the `system_logs` table.
4.  `backend/convert_appts_norm.py`: Normalized existing appointments into Providers and TimeSlots.

## 3NF Normalization Summary

| Table | Before | After | Benefit |
|-------|--------|-------|---------|
| USER | `full_name` (composite) | `FIRST_NAME`, `LAST_NAME`, `INITIAL` | Atomic values, searchable |
| USER | `is_active` + `status` (redundant) | `status` only | No data redundancy |
| USER | No phone field | `PHONE_NUMBER` added | Complete contact info |
| ORDERS | `payment_method` (string) | `payment_method_id` (FK) | Referential integrity |
| APPOINTMENT | `barber_name`, `booking_date` (raw) | `PROVIDER_ID`, `SLOT_ID` (FKs) | Normalized relationships |
