# # from flask import Flask, jsonify, request
# # from flask_cors import CORS

# # app = Flask(__name__)
# # CORS(app)

# # # Mock data to simulate database records.
# # mock_flights_data = [
# #     {
# #         "number": "AB123",
# #         "departureTime": "2023-07-21T10:00:00Z",
# #         "arrivalTime": "2023-07-21T12:00:00Z",
# #         "origin": "New York",
# #         "destination": "London",
# #     },
# #     {
# #         "number": "CD456",
# #         "departureTime": "2023-07-22T11:00:00Z",
# #         "arrivalTime": "2023-07-22T15:00:00Z",
# #         "origin": "Berlin",
# #         "destination": "Paris",
# #     },
# # ]


# # @app.route("/api/flights/upcoming", methods=["GET"])
# # def get_upcoming_flights():
# #     # In a real app, you would retrieve this data from your database.
# #     return jsonify(mock_flights_data)


# # # Add more routes as needed for your application

# # if __name__ == "__main__":
# #     app.run(debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql.cursors
from datetime import timedelta, date, time
import decimal
import json


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


app = Flask(__name__)
app.json_encoder = CustomJSONEncoder
CORS(app)


# Database connection settings
DB_SETTINGS = {
    "host": "localhost",
    "user": "root",
    "password": "123456",
    "db": "databases_project",
    "cursorclass": pymysql.cursors.DictCursor,
}


# Function to connect to the database
def get_db_connection():
    return pymysql.connect(**DB_SETTINGS)


@app.route("/api/flights/upcoming", methods=["GET"])
def get_upcoming_flights():
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Execute SQL query
            sql = "SELECT * from flights ORDER BY departingdatetime DESC LIMIT 10;"
            cursor.execute(sql)

            # Fetch all results
            flights = cursor.fetchall()

            # Return the results as JSON
            return jsonify(flights)
            # return flights
    finally:
        # Close the connection
        connection.close()


@app.route("/api/flights/search", methods=["GET"])
def search_flights():
    # Retrieve query parameters
    departing_city = request.args.get("departingCity", type=str)
    arriving_city = request.args.get("arrivingCity", type=str)
    date = request.args.get("date", type=str)  # Assuming date is in 'YYYY-MM-DD' format

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Construct SQL query with parameters
            # Make sure to use parameterized queries to prevent SQL injection
            sql = """
                SELECT * FROM flights
                WHERE departureairport = %s AND arrivalairport = %s AND DATE(departingdatetime) = %s
                ORDER BY departingdatetime DESC;
            """
            cursor.execute(sql, (departing_city, arriving_city, date))

            # Fetch all results
            flights = cursor.fetchall()

            # Return the results as JSON
            return jsonify(flights)
    finally:
        # Close the connection
        connection.close()


if __name__ == "__main__":
    app.run(debug=True)
    # print(get_upcoming_flights())
