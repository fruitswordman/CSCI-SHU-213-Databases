from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import timedelta, date, time
from datetime import datetime as dt
from utils import *

app = Flask(__name__)
app.secret_key = "your_very_secret_key_here"
app.json_encoder = CustomJSONEncoder
CORS(app)
session = {}


@app.route("/api/logout", methods=["GET"])
def logoutPost():
    try:
        session.clear()
        return jsonify({"success": True, "message": "You have been logged out."})
    except:
        return jsonify({"success": False, "message": "Failed to logout."})


@app.route("/api/flights/my_flight", methods=["GET"])
def my_flight():
    account_type = session["type"]
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            # Execute SQL query
            if account_type == "airline_staff":
                airline = session["Airline"]
                sql = f"SELECT * FROM flights WHERE Airline = '{airline}' ORDER BY departingdatetime DESC;"

            elif account_type == "customer":
                sql = f"""
                SELECT * 
                FROM tickets Natural Join flights Natural Join purchase
                WHERE purchase.CustomerEmail = '{session["username"]}'
                """

            elif account_type == "booking_agent":
                sql = f"""
                SELECT f.* 
                FROM flights f 
                Join booking_agents_work_for bawf ON f.airline = bawf.airline 
                WHERE bawf.email = '{session['username']}' 
                ORDER BY f.departingdatetime DESC;
                """

            else:
                return jsonify("Not authoritized!")

            cursor.execute(sql)
            flights = cursor.fetchall()

            return jsonify(flights)
    finally:
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
            sinfo = cursor.fetchone()

            if sinfo:
                print("airline_staff")
                session["username"] = username
                session["type"] = "airline_staff"
                session["Airline"] = sinfo["Airline"]
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
            cinfo = cursor.fetchone()
            if cinfo:
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


@app.route("/api/add_airport", methods=["GET"])
def add_airport():
    # Retrieve query parameters
    if session["permission"] != "Admin":
        return jsonify("Not authoritized!")
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


@app.route("/api/add_airplane", methods=["GET"])
def create_airplane():
    # Retrieve query parameters
    value_dict = {}
    attribute_list = ["AirplaneID", "SeatingCapacity", "Airline"]
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
            # TODO fetch only one
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
    value_dict = {
        "Status": request.args.get("Status", type=str),
        "FlightNumber": request.args.get("FlightNumber", type=str),
        "Date": request.args.get("Date", type=str),
        "DepartingTime": request.args.get("DepartingTime", type=str),
    }

    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query to update flight status
            # The query converts and combines Date and DepartingTime to match with DepartingDateTime
            sql = """
                UPDATE flights 
                SET Status = %s 
                WHERE FlightNumber = %s 
                AND Date = %s AND DepartingTime = TIME(%s)
            """
            print(value_dict["DepartingTime"])
            cursor.execute(
                sql,
                (
                    value_dict["Status"],
                    value_dict["FlightNumber"],
                    value_dict["Date"],
                    value_dict["DepartingTime"],
                ),
            )
            connection.commit()

            # Construct and execute SQL query to fetch updated flight details
            sql = """
                SELECT * FROM flights 
                WHERE FlightNumber = %s 
                AND Date = %s AND DepartingTime = TIME(%s)
            """
            cursor.execute(
                sql,
                (
                    value_dict["FlightNumber"],
                    value_dict["Date"],
                    value_dict["DepartingTime"],
                ),
            )
            flights = cursor.fetchall()

            return jsonify(flights)
    finally:
        connection.close()


@app.route("/api/flights/purchase", methods=["POST"])
def purchase_flight():
    # Extract data from the request body
    data = request.get_json()

    FlightNumber = data.get("FlightNumber")
    Date = data.get("Date")
    DepartingTime = data.get("DepartingTime")

    success = process_flight_purchase(FlightNumber, Date, DepartingTime)
    if success:
        return jsonify({"success": True, "message": "Flight purchased successfully!"})
    else:
        return jsonify({"success": False, "message": "Failed to purchase flight."}), 400


def process_flight_purchase(FlightNumber, Date, DepartingTime):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """CALL purchaseTicket_NoAgent(%s, Date(%s), Time(%s), %s);"""
            cursor.execute(
                sql, (FlightNumber, Date, DepartingTime, session["username"])
            )
            connection.commit()
            return True
    except Exception as e:
        print(e)
        return False

@app.route("/api/flights/booking_agent_purchase", methods=["POST"])
def booking_agent_purchase_flight():
    # Extract data from the request body
    data = request.get_json()

    FlightNumber = data.get("FlightNumber")
    Date = data.get("Date")
    DepartingTime = data.get("DepartingTime")
    CustomerEmail = data.get("CustomerEmail")

    success = process_flight_bookingagent_purchase(FlightNumber, Date, DepartingTime, CustomerEmail)
    if success:
        return jsonify({"success": True, "message": "Flight purchased successfully!"})
    else:
        return jsonify({"success": False, "message": "Failed to purchase flight."}), 400


def process_flight_bookingagent_purchase(FlightNumber, Date, DepartingTime,CustomerEmail):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            sql = """CALL purchaseTicket(%s, Date(%s), Time(%s), %s, %s);"""
            cursor.execute(sql, (FlightNumber, Date, DepartingTime,CustomerEmail, session['username']))
            connection.commit()
            return True
    except Exception as e:
        print(e)
        return False


@app.route("/api/register_customer", methods=["GET"])
def register_customer():
    value_dict = {}

    attribute_list = [
        "Name",
        "Email",
        "Password",
        "BuildingNumber",
        "Street",
        "City",
        "State",
        "PhoneNumber",
        "PassportNumber",
        "PassportExpiration",
        "PassportCountry",
        "DateOfBirth",
    ]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)
    # Data type conversions
    print(value_dict)
    value_dict["PhoneNumber"] = int(value_dict["PhoneNumber"])
    value_dict["DateOfBirth"] = dt.strptime(value_dict["DateOfBirth"], "%Y-%m-%d")
    value_dict["PassportExpiration"] = dt.strptime(
        value_dict["PassportExpiration"], "%Y-%m-%d"
    )

    connection = get_db_connection()
    ## print(value_dict)
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                INSERT INTO customers (Name, Email, Password,BuildingNumber, Street, City, State, PhoneNumber, PassportNumber, PassportExpiration, PassportCountry, DateOfBirth)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);

            """
            cursor.execute(sql, tuple(value_dict.values()))
            connection.commit()

            # Assuming you want to fetch the recently added flight data
            # Query to fetch the flight details using primary key or unique identifier is preferred
            # For demonstration, using the same values

            # Fetch all results
            return jsonify("Successfully registered")
    finally:
        connection.close()


@app.route("/api/register_staff", methods=["GET"])
def register_staff():
    value_dict = {}

    attribute_list = [
        "username",
        "password",
        "firstname",
        "lastname",
        "airline",
        "dateOfBirth",
    ]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)

    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                INSERT INTO airline_staff (username, password, firstname, lastname, airline, DateOfBirth)
                VALUES (%s, %s, %s, %s, %s, Date(%s));
            """
            cursor.execute(sql, tuple(value_dict.values()))
            connection.commit()

            # Fetch all results
            return jsonify("Successfully registered")
    finally:
        connection.close()


@app.route("/api/register_booking_agent", methods=["GET"])
def register_booking_agent():
    value_dict = {}

    attribute_list = ["name", "email", "password"]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)

    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                INSERT INTO booking_agents (Name, Email, Password)
                VALUES (%s, %s, %s);
            """
            cursor.execute(sql, tuple(value_dict.values()))
            connection.commit()

            # Fetch all results
            return jsonify("Successfully registered")
    finally:
        connection.close()


@app.route("/api/Top5_customer", methods=["GET"])
def Top5_customer():
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = """
                

                SELECT CustomerEmail, COUNT(TicketID) AS Frequency
                FROM purchase
                GROUP BY CustomerEmail
                ORDER BY Frequency DESC
                LIMIT 5;

            """
            cursor.execute(sql)
            connection.commit()

            customers_frequency = cursor.fetchall()

            # Fetch all results
            return jsonify(customers_frequency)
    finally:
        connection.close()



@app.route("/api/Top5_customer_bookingAgent", methods=["GET"])
def Top5_customer_bookingAgent():
    connection = get_db_connection()

    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = f"""
                

                SELECT CustomerEmail, COUNT(TicketID) AS Frequency
                FROM purchase
                Where BookingAgentEmail  = '{session["username"]}'
                GROUP BY CustomerEmail
                ORDER BY Frequency DESC
                LIMIT 5;

            """
            cursor.execute(sql)
            connection.commit()

            customers_frequency = cursor.fetchall()

            # Fetch all results
            return jsonify(customers_frequency)
    finally:
        connection.close()







@app.route("/api/grant_permission", methods=["GET"])
def grant_permission():
    value_dict = {}

    attribute_list = ["Username", "Permission"]
    for attribute in attribute_list:
        value_dict[attribute] = request.args.get(attribute, type=str)

    connection = get_db_connection()

    if session["permission"] != "Admin":
        return jsonify("Not authoritized.")
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            sql = f"""
            select *
            from airline_staff
            where Username = '{value_dict["Username"]}' and Airline ='{session["Airline"]}'
            """
            cursor.execute(sql)
            same_company = cursor.fetchall()
            if same_company:
                grant = """
                    INSERT INTO `permissions` 
                    VALUES (%s,%s);
                """
                cursor.execute(grant, tuple(value_dict.values()))
                connection.commit()
                check = """
                Select *
                from permissions
                """
                cursor.execute(check)
                Permissions = cursor.fetchall()

                # Fetch all results
                return jsonify(Permissions)
            else:
                return jsonify("Not in this company!")
    finally:
        connection.close()


@app.route("/api/Commision", methods=["GET"])
def Commision():
    connection = get_db_connection()
    Type = request.args.get("Commision_type", type=str)
    print("***********"*10)
    try:
        with connection.cursor() as cursor:
            # Construct and execute SQL query with parameterized queries
            if Type == "total_ticket":
                sql = f"""
                    
	SELECT COUNT(t.TicketID) AS result
	FROM purchase AS p
	NATURAL JOIN tickets AS t
	NATURAL JOIN flights AS f
	WHERE p.PurchaseDate >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) and p.BookingAgentEmail = '{session["username"]}'


                """
            elif Type == "Average_Commision":
                sql = f"""
    SELECT 0.1*AVG(f.Price) AS result
	FROM purchase AS p
	NATURAL JOIN tickets AS t
	NATURAL JOIN flights AS f
	WHERE p.PurchaseDate >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) and p.BookingAgentEmail = '{session["username"]}'
                
                
                """
            elif Type =="Total_Commision":
                sql =f"""
	SELECT 0.1*SUM(f.Price) AS result
	FROM purchase AS p
	NATURAL JOIN tickets AS t
	NATURAL JOIN flights AS f
	WHERE p.PurchaseDate >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH) and p.BookingAgentEmail = '{session["username"]}'
                """
            else:
                return jsonify("Failed")
            cursor.execute(sql)
            connection.commit()

            Commision = cursor.fetchall()
            
            # Fetch all results
            return jsonify(Commision)
    finally:
        connection.close()




if __name__ == "__main__":
    app.run(debug=True)
    # print(get_upcoming_flights())
