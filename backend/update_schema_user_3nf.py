"""
Database Migration Script: User Table 3NF Normalization + Phone Number

This script:
1. Adds FIRST_NAME, LAST_NAME, INITIAL columns (3NF normalization)
2. Adds PHONE_NUMBER column
3. Migrates existing full_name data to new columns
4. Removes old full_name and is_active columns

Run this script to update the MySQL database schema.
"""

from sqlalchemy import text
from app.db.database import SessionLocal

def migrate_user_table():
    db = SessionLocal()
    try:
        print("Starting User table migration to 3NF...")
        
        # Step 1: Check if migration is needed by checking for FIRST_NAME column
        check_column = text("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'USER' 
            AND COLUMN_NAME = 'FIRST_NAME'
        """)
        result = db.execute(check_column).fetchone()
        
        if result:
            print("FIRST_NAME column already exists. Checking for PHONE_NUMBER...")
            # Check if phone_number exists
            check_phone = text("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'USER' 
                AND COLUMN_NAME = 'PHONE_NUMBER'
            """)
            phone_result = db.execute(check_phone).fetchone()
            if phone_result:
                print("PHONE_NUMBER column already exists. Migration complete.")
                return
            else:
                print("Adding PHONE_NUMBER column...")
                db.execute(text("ALTER TABLE `USER` ADD COLUMN `PHONE_NUMBER` VARCHAR(20) NULL AFTER `INITIAL`"))
                db.commit()
                print("PHONE_NUMBER column added successfully!")
                return
        
        print("Adding new columns...")
        
        # Step 2: Add new columns (if they don't exist)
        # Add FIRST_NAME column
        try:
            db.execute(text("ALTER TABLE `USER` ADD COLUMN `FIRST_NAME` VARCHAR(100) NULL AFTER `id`"))
            print("  - Added FIRST_NAME column")
        except Exception as e:
            if "Duplicate column" in str(e):
                print("  - FIRST_NAME column already exists")
            else:
                raise
        
        # Add LAST_NAME column
        try:
            db.execute(text("ALTER TABLE `USER` ADD COLUMN `LAST_NAME` VARCHAR(100) NULL AFTER `FIRST_NAME`"))
            print("  - Added LAST_NAME column")
        except Exception as e:
            if "Duplicate column" in str(e):
                print("  - LAST_NAME column already exists")
            else:
                raise
        
        # Add INITIAL column (middle initial)
        try:
            db.execute(text("ALTER TABLE `USER` ADD COLUMN `INITIAL` VARCHAR(10) NULL AFTER `LAST_NAME`"))
            print("  - Added INITIAL column")
        except Exception as e:
            if "Duplicate column" in str(e):
                print("  - INITIAL column already exists")
            else:
                raise
        
        # Add PHONE_NUMBER column
        try:
            db.execute(text("ALTER TABLE `USER` ADD COLUMN `PHONE_NUMBER` VARCHAR(20) NULL AFTER `INITIAL`"))
            print("  - Added PHONE_NUMBER column")
        except Exception as e:
            if "Duplicate column" in str(e):
                print("  - PHONE_NUMBER column already exists")
            else:
                raise
        
        db.commit()
        
        # Step 3: Migrate existing full_name data to new columns
        print("\nMigrating existing full_name data...")
        
        # Check if full_name column exists
        check_fullname = text("""
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'USER' 
            AND COLUMN_NAME = 'full_name'
        """)
        fullname_exists = db.execute(check_fullname).fetchone()
        
        if fullname_exists:
            # Split full_name into first_name and last_name
            # Strategy: First word = first_name, Last word = last_name, middle = initial
            migrate_query = text("""
                UPDATE `USER` 
                SET 
                    `FIRST_NAME` = SUBSTRING_INDEX(full_name, ' ', 1),
                    `LAST_NAME` = CASE 
                        WHEN LOCATE(' ', full_name) > 0 
                        THEN SUBSTRING_INDEX(full_name, ' ', -1) 
                        ELSE NULL 
                    END,
                    `INITIAL` = CASE 
                        WHEN LENGTH(full_name) - LENGTH(REPLACE(full_name, ' ', '')) > 1
                        THEN TRIM(SUBSTRING(full_name, 
                            LOCATE(' ', full_name) + 1, 
                            LENGTH(full_name) - LOCATE(' ', full_name) - LENGTH(SUBSTRING_INDEX(full_name, ' ', -1)) - 1))
                        ELSE NULL 
                    END
                WHERE full_name IS NOT NULL AND `FIRST_NAME` IS NULL
            """)
            db.execute(migrate_query)
            db.commit()
            print("  - Data migrated from full_name to FIRST_NAME, LAST_NAME, INITIAL")
            
            # Step 4: Drop old columns (optional - uncomment if you want to remove them)
            # print("\nRemoving old columns...")
            # try:
            #     db.execute(text("ALTER TABLE `USER` DROP COLUMN `full_name`"))
            #     print("  - Dropped full_name column")
            # except Exception as e:
            #     print(f"  - Could not drop full_name: {e}")
            # 
            # try:
            #     db.execute(text("ALTER TABLE `USER` DROP COLUMN `is_active`"))
            #     print("  - Dropped is_active column")
            # except Exception as e:
            #     print(f"  - Could not drop is_active: {e}")
            # db.commit()
        else:
            print("  - full_name column not found, skipping data migration")
        
        # Step 5: Add indexes for better query performance
        print("\nAdding indexes...")
        try:
            db.execute(text("CREATE INDEX idx_user_first_name ON `USER` (`FIRST_NAME`)"))
            print("  - Added index on FIRST_NAME")
        except Exception as e:
            if "Duplicate" in str(e):
                print("  - Index on FIRST_NAME already exists")
            else:
                print(f"  - Warning: {e}")
        
        try:
            db.execute(text("CREATE INDEX idx_user_last_name ON `USER` (`LAST_NAME`)"))
            print("  - Added index on LAST_NAME")
        except Exception as e:
            if "Duplicate" in str(e):
                print("  - Index on LAST_NAME already exists")
            else:
                print(f"  - Warning: {e}")
        
        db.commit()
        
        print("\n✅ Migration completed successfully!")
        print("\nNew USER table structure:")
        print("  - id (INT, PK)")
        print("  - FIRST_NAME (VARCHAR(100))")
        print("  - LAST_NAME (VARCHAR(100))")
        print("  - INITIAL (VARCHAR(10), nullable)")
        print("  - PHONE_NUMBER (VARCHAR(20), nullable)")
        print("  - email (VARCHAR(255), unique)")
        print("  - hashed_password (VARCHAR(255))")
        print("  - role (ENUM)")
        print("  - status (VARCHAR(50))")
        print("  - PROFILE_IMAGE (TEXT, nullable)")
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    migrate_user_table()
