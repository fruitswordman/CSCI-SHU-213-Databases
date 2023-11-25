from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Mock data to simulate database records.
mock_flights_data = [
    {
        "number": "AB123",
        "departureTime": "2023-07-21T10:00:00Z",
        "arrivalTime": "2023-07-21T12:00:00Z",
        "origin": "New York",
        "destination": "London",
    },
    {
        "number": "CD456",
        "departureTime": "2023-07-22T11:00:00Z",
        "arrivalTime": "2023-07-22T15:00:00Z",
        "origin": "Berlin",
        "destination": "Paris",
    },
]


@app.route("/api/flights/upcoming", methods=["GET"])
def get_upcoming_flights():
    # In a real app, you would retrieve this data from your database.
    return jsonify(mock_flights_data)


# Add more routes as needed for your application

if __name__ == "__main__":
    app.run(debug=True)
