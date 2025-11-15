# This script deletes the existing SQLite database file (app.db).
# (For production we will use alembic migrations)

# To reset the database:
# 1) close server if running

# 2) use the command:
# python backend/scripts/reset_database.py

# 3) if this doesnt work, try
# Remove-Item app.db -Force

import os


def reset_database():
    db_file = "app.db"

    if os.path.exists(db_file):
        print(f"Found database file: {db_file}")
        response = input("Delete this database and recreate it? (y/n): ")

        if response.lower() == "y":
            os.remove(db_file)
            print(f"✓ Deleted {db_file}")
            print("The database will be recreated when you restart the server")
        else:
            print("Database reset cancelled")
    else:
        print(f"No database file found at {db_file}")


if __name__ == "__main__":
    reset_database()
