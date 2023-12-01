from flask import Flask, jsonify, request, session
from flask_cors import CORS

from utils import *

app = Flask(__name__)
app.secret_key = "your_very_secret_key_here"
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
            sql = """
                SELECT * FROM flights
                WHERE departureairport = %s AND arrivalairport = %s AND DATE(departingdatetime) = %s
                ORDER BY departingdatetime DESC;
            """
            cursor.execute(sql, (departing_city, arriving_city, date))
            flights = cursor.fetchall()

            return jsonify(flights)
    finally:
        connection.close()


@app.route("/api/flights/status", methods=["GET"])
def check_flights_status():
    # Retrieve query parameters
    flightNumber = request.args.get("flightNumber", type=str)
    statusDate = request.args.get("statusDate", type=str)

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """
                SELECT *  FROM flights
                WHERE flightNumber = %s AND date = %s
                ORDER BY departingdatetime DESC;
            """
            cursor.execute(sql, (flightNumber, statusDate))
            flights = cursor.fetchall()

            return jsonify(flights)
    finally:
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
                session["username"] = username
                session["type"] = "airline_staff"
                return jsonify({"success": True, "type": "airline_staff"})

            # Check booking_agent
            query = "SELECT * FROM booking_agents WHERE email=%s and password=%s"
            cursor.execute(query, (username, password))
            if cursor.fetchone():
                print("booking_agent")
                session["username"] = username
                session["type"] = "booking_agent"
                return jsonify({"success": True, "type": "booking_agent"})

            # Check customer
            query = "SELECT * FROM customers WHERE email=%s and password=%s"
            cursor.execute(query, (username, password))
            if cursor.fetchone():
                print("customer")
                session["username"] = username
                session["type"] = "customer"
                return jsonify({"success": True, "type": "customer"})

            return jsonify({"success": False, "message": "Invalid credentials"})
    finally:
        connection.close()


@app.route("/api/create_flights", methods=["GET"])
def create_flight():
    # Retrieve query parameters
    value_dict = {}
    attribute_list = [
        "FlightNumber",
        "DepartingTime",
        "ArrivingTime",
        "Price",
        "Status",
        "DepartureAirport",
        "ArrivalAirport",
        "Airline",
        "Airplane",
        "Date",
        "DepartingDateTime",
    ]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)

    # Data type conversions
    value_dict["Price"] = decimal.Decimal(value_dict["Price"])
    value_dict["Date"] = dt.strptime(value_dict["Date"], "%Y-%m-%d").date()
    value_dict["DepartingDateTime"] = dt.strptime(
        value_dict["DepartingDateTime"], "%Y-%m-%d %H:%M:%S"
    )

    # Assuming DepartingTime and ArrivingTime are in 'HH:MM:SS' format
    departing_time_obj = dt.strptime(value_dict["DepartingTime"], "%H:%M:%S")
    arriving_time_obj = dt.strptime(value_dict["ArrivingTime"], "%H:%M:%S")
    value_dict["DepartingTime"] = departing_time_obj.time()
    value_dict["ArrivingTime"] = arriving_time_obj.time()

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                INSERT INTO flights (FlightNumber, DepartingTime, ArrivingTime, Price, Status, DepartureAirport, ArrivalAirport, Airline, Airplane, Date, DepartingDateTime)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, tuple(value_dict.values()))

            connection.commit()

            # Assuming you want to fetch the recently added flight data
            # Query to fetch the flight details using primary key or unique identifier is preferred
            # For demonstration, using the same values
            cursor.execute(
                "SELECT * FROM flights WHERE FlightNumber = %s AND DepartingDateTime = %s",
                (value_dict["FlightNumber"], value_dict["DepartingDateTime"]),
            )
            flights = cursor.fetchall()
            # Fetch all results
            return jsonify(flights)
    finally:
        connection.close()


@app.route("/api/create_airport", methods=["GET"])
def create_airport():
    # Retrieve query parameters
    value_dict = {}
    attribute_list = ["AirportName", "AirportCity", "IATA"]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                INSERT INTO airports (AirportName,AirportCity,IATA)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, tuple(value_dict.values()))

            connection.commit()
            print("insertion commit")
            # Assuming you want to fetch the recently added flight data
            # Query to fetch the flight details using primary key or unique identifier is preferred
            # For demonstration, using the same values
            cursor.execute("SELECT * FROM airports")
            airports = cursor.fetchall()
            # Fetch all results
            return jsonify(airports)
    finally:
        connection.close()


if __name__ == "__main__":
    app.run(debug=True)
    # print(get_upcoming_flights())
