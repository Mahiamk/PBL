# AIU Microstore Backend

## Development Record

### January 27, 2026
- **Order Processing Logic**:
  - **Aggregated Stock Validation**: Refactored `create_order` endpoint in `orders.py`. Instead of failing on the first out-of-stock item, it now collects *all* unavailable items and raises a single 400 error with a comprehensive list.
- **Authentication & User Data**:
  - Updated `auth.py` login response schema to return `email`, `full_name`, and `profile_image` alongside the access token. This supports immediate data availability for frontend features like Invoices.
- **Database Seeding**:
  - Executed `seed_stores.py` to restore foundational Store records (specifically ID 2 for Barber Shop), resolving Foreign Key integrity issues that were blocking service creation.

### January 26, 2026
- **Vendor Management**:
  - **Cascading Deletion Implementation**:
    - Implemented a rigorous "Hard Delete" protocol for `DELETE /api/v1/admin/users/{id}`.
    - Cascading order: Order Items -> Order History -> Orders -> Product Images -> Products -> Services (Slots/Providers/Appts) -> Reviews -> Vendor Profile -> Store -> User.
    - **Safety Checks**: Blocks deletion if the vendor has "active" or "pending" orders to prevent fulfillment issues.
    - **Data Integrity**: Uses `db.flush()` to resolve Foreign Key constraints between Vendor and Store tables during deletion.
- **Admin Analytics API**:
  - **Enhanced Dashboard Endpoint**: Updated `GET /api/v1/users/admin/dashboard`.
  - **Multi-Period Reporting**: Now calculates Daily (30d), Weekly (12w), and Monthly (12m) stats for Orders and Vendor Growth.
  - **MySQL Compatibility**: Replaced SQLite `strftime` with MySQL `DATE_FORMAT` for consistent date grouping in production.
- **Authentication**:
  - **Vendor Registration**: New vendor accounts default to `PENDING` status.
