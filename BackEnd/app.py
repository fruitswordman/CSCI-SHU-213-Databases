from flask import Flask, jsonify, request, session
from flask_cors import CORS

from utils import *

app = Flask(__name__)
app.secret_key = 'your_very_secret_key_here'
app.json_encoder = CustomJSONEncoder
CORS(app)


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


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]

    # Connection to your database
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            print(username, password)
            # Check airline_staff
            query = "SELECT * FROM airline_staff WHERE username=%s and password=%s"
            cursor.execute(query, (username, password))
            if cursor.fetchone():
                print("airline_staff")
                session['username'] = username
                session['type'] = 'airline_staff'
                return jsonify({"success": True, "type": "airline_staff"})

            # Check booking_agent
            query = "SELECT * FROM booking_agents WHERE email=%s and password=%s"
            cursor.execute(query, (username, password))
            if cursor.fetchone():
                print("booking_agent")
                session['username'] = username
                session['type'] = 'booking_agent'
                return jsonify({"success": True, "type": "booking_agent"})

            # Check customer
            query = "SELECT * FROM customers WHERE email=%s and password=%s"
            cursor.execute(query, (username, password))
            if cursor.fetchone():
                print("customer")
                session['username'] = username
                session['type'] = 'customer'
                return jsonify({"success": True, "type": "customer"})

            return jsonify({"success": False, "message": "Invalid credentials"})
    finally:
        connection.close()


if __name__ == "__main__":
    app.run(debug=True)
    # print(get_upcoming_flights())
