from flask import Flask, jsonify, request, session
from flask_cors import CORS
from datetime import timedelta, date, time
from datetime import datetime as dt
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
    # List of possible query parameters
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
    ]

    # Retrieve query parameters
    query_params = {attr: request.args.get(attr, type=str) for attr in attribute_list}

    # Construct the base SQL query
    sql = "SELECT * FROM flights WHERE "

    # List to hold SQL conditions
    conditions = []

    # Construct conditions based on provided parameters
    for attr, value in query_params.items():
        if value:
            if attr == "Date":
                conditions.append(f"DATE({attr}) = %s")
            elif attr in ["DepartingTime", "ArrivingTime"]:
                conditions.append(f"TIME({attr}) = %s")
            elif attr == "Price":
                conditions.append(f"CAST({attr} AS DECIMAL(10, 2)) = %s")
            else:
                conditions.append(f"{attr} = %s")

    # If no conditions were added, remove the WHERE clause
    if not conditions:
        sql = "SELECT * FROM flights"
    else:
        sql += " AND ".join(conditions)

    sql += " ORDER BY departingdatetime DESC LIMIT 500;"

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Execute the query with the values of the provided parameters
            cursor.execute(
                sql,
                tuple(
                    query_params[attr] for attr in attribute_list if query_params[attr]
                ),
            )
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
            staff_query = (
                "SELECT * FROM airline_staff WHERE username=%s and password=md5(%s)"
            )
            cursor.execute(staff_query, (username, password))
            if cursor.fetchone():
                print("airline_staff")
                session["username"] = username
                session["type"] = "airline_staff"
                permission_query = (
                    "SELECT permissiontype FROM permissions WHERE username =%s;"
                )
                cursor.execute(permission_query, (username))
                permission = cursor.fetchone()
                permission = permission["permissiontype"]
                print(permission)
                session["permission"] = permission
                return jsonify({"success": True, "type": "airline_staff"})

            # Check booking_agent
            query = "SELECT * FROM booking_agents WHERE email=%s and password=md5(%s)"
            cursor.execute(query, (username, password))
            if cursor.fetchone():
                print("booking_agent")
                session["username"] = username
                session["type"] = "booking_agent"
                return jsonify({"success": True, "type": "booking_agent"})

            # Check customer
            query = "SELECT * FROM customers WHERE email=%s and password=md5(%s)"
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
    ]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)

    # Data type conversions
    value_dict["Price"] = decimal.Decimal(value_dict["Price"])
    value_dict["Date"] = datetime.strptime(value_dict["Date"], "%Y-%m-%d").date()
    value_dict["DepartingTime"] = datetime.strptime(
        value_dict["DepartingTime"], "%H:%M:%S"
    ).time()
    value_dict["ArrivingTime"] = datetime.strptime(
        value_dict["ArrivingTime"], "%H:%M:%S"
    ).time()

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                INSERT INTO flights (FlightNumber, DepartingTime, ArrivingTime, Price, Status, DepartureAirport, ArrivalAirport, Airline, Airplane, Date)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            cursor.execute(sql, tuple(value_dict.values()))

            connection.commit()

            cursor.execute(
                "SELECT * FROM flights WHERE FlightNumber = %s AND Date = %s AND DepartingTime = %s",
                (
                    value_dict["FlightNumber"],
                    value_dict["Date"],
                    value_dict["DepartingTime"],
                ),
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


@app.route("/api/create_airplane", methods=["GET"])
def create_airplane():
    # Retrieve query parameters
    value_dict = {}
    attribute_list = [
        "AirplaneID",
        "SeatingCapacity",
        "Airline"
        # AirplaneID
        # SeatingCapacity
        # Airline
    ]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                INSERT INTO airplanes (AirplaneID,SeatingCapacity,Airline)
                VALUES (%s, %s, %s)
            """
            cursor.execute(sql, tuple(value_dict.values()))

            connection.commit()
            print("insertion commit")
            # Assuming you want to fetch the recently added flight data
            # Query to fetch the flight details using primary key or unique identifier is preferred
            # For demonstration, using the same values
            cursor.execute("SELECT * FROM airplanes")
            airplanes = cursor.fetchall()
            # Fetch all results
            return jsonify(airplanes)
    finally:
        connection.close()


@app.route("/api/update_status", methods=["GET"])
def update_status():
    # Retrieve query parameters
    value_dict = {}

    attribute_list = ["Status", "FlightNumber", "DepartingDateTime"]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)
    # Data type conversions
    print(value_dict)
    value_dict["DepartingDateTime"] = dt.strptime(
        value_dict["DepartingDateTime"], "%Y-%m-%d %H:%M:%S"
    )
    connection = get_db_connection()
    ## print(value_dict)
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                    UPDATE flights SET Status = %s WHERE FlightNumber = %s AND DepartingDateTime = %s
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


if __name__ == "__main__":
    app.run(debug=True)
    # print(get_upcoming_flights())
