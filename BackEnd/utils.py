import decimal
import json
import pymysql.cursors
from datetime import timedelta, date, time, datetime


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, timedelta):
            return str(obj)  # or however you wish to serialize it
        elif isinstance(obj, date):
            return obj.isoformat()
        elif isinstance(obj, time):
            return obj.isoformat()
        elif isinstance(obj, decimal.Decimal):
            return str(obj)
        return super(CustomJSONEncoder, self).default(obj)
    

# Database connection settings
DB_SETTINGS = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "db": "Final project",
    "cursorclass": pymysql.cursors.DictCursor,
}


# Function to connect to the database
def get_db_connection():
    return pymysql.connect(**DB_SETTINGS)

