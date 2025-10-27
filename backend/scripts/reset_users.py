from app.core.db import SessionLocal, engine, Base
from app.models.user import User

# Option 1: delete only users - WARNING: deletes all rows
def delete_all_users():
    db = SessionLocal()
    try:
        db.query(User).delete()
        db.commit()
        print("Deleted all users.")
    finally:
        db.close()

# Option 2: full drop/create (nukes ALL tables)
def drop_and_recreate():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Dropped and recreated all tables.")

if __name__ == "__main__":
    delete_all_users()
    # drop_and_recreate()

# Execute `python -m scripts.reset_users`