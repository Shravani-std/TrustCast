import sqlite3
import os

db_path = r'd:/TrustCast/trustcast_auth.db'
print(f"DB path: {db_path}")
print(f"DB exists: {os.path.exists(db_path)}")

conn = sqlite3.connect(db_path)
conn.row_factory = sqlite3.Row

print("\nTables:")
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
print([row['name'] for row in tables])

print("\nUsers data:")
try:
    users = conn.execute("SELECT * FROM users").fetchall()
    if users:
        for user in users:
            print(dict(user))
    else:
        print("No users found")
except sqlite3.OperationalError as e:
    print(f"Table error: {e}")

conn.close()

