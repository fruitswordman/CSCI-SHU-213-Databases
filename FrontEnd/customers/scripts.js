// Modular function to create flight HTML element
function createFlightElement(flight) {
    return `
        <div class="flight">
            <div class="flight-info-container">
                <div class="flight-airline">${flight.Airline}</div>
                <div class="flight-number">${flight.FlightNumber}</div>
                <div class="flight-date">${flight.Date}</div>
            </div>
            <div class="flight-times-airports-container">
                <div class="departing-container">
                    <div class="flight-departing-time">${flight.DepartingTime}</div>
                    <div class="flight-departing-airport">${flight.DepartureAirport}</div>
                </div>
                <div class="flight-arrow-container">→</div>
                <div class="arriving-container">
                    <div class="flight-arriving-time">${flight.ArrivingTime}</div>
                    <div class="flight-arriving-airport">${flight.ArrivalAirport}</div>
                </div>
            </div>
            <div class="flight-price-container">
                <div class="flight-price">￥${flight.Price.slice(0, -3)}</div>
                <div class="flight-status">${flight.Status}</div>
            </div>
        </div>
    `;
}

// Function to fetch and display flights
async function fetchAndDisplayFlights() {
    const flightsContainer = document.getElementById('flightsList');
    flightsContainer.innerHTML = '';

    try {
        const response = await fetch('http://127.0.0.1:5000/api/flights/upcoming');
        const flights = await response.json();

        flights.forEach(flight => {
            const flightElement = createFlightElement(flight);
            flightsContainer.insertAdjacentHTML('beforeend', flightElement);
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        flightsContainer.textContent = 'Failed to load flights.';
    }
}

// Event listener for sidebar
document.querySelectorAll('.sidebar ul li').forEach(li => {
    li.addEventListener('click', e => showPanel(e, li));
});

function showPanel(e, li) {
    document.querySelectorAll('.sidebar ul li').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelectorAll('.content-panel').forEach(panel => {
        panel.classList.remove('active');
    });

    li.classList.add('active');
    const panelId = li.getAttribute('data-panelid');
    const activePanel = document.getElementById(panelId);
    if (activePanel) {
        activePanel.classList.add('active');
    }
}

document.querySelector('[data-panelid="viewFlightsPanel"]').addEventListener('click', function () {
    fetchAndDisplayFlights();
});

const searchFlightsForm = document.getElementById('searchFlightsForm');
searchFlightsForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const FlightNumber = document.getElementById("searchFlightNumber").value;
    const Price = document.getElementById("searchPrice").value;
    const Status = document.getElementById("searchStatus").value;
    const DepartureAirport = document.getElementById("searchDepartureAirport").value;
    const ArrivalAirport = document.getElementById("searchArrivalAirport").value;
    const Airline = document.getElementById("searchAirline").value;
    const Airplane = document.getElementById("searchAirplane").value;
    const Date = document.getElementById("searchDate").value;

    queryAndDisplayFlights(FlightNumber, Price, Status, DepartureAirport, ArrivalAirport, Airline, Airplane, Date);
});

async function queryAndDisplayFlights(FlightNumber, Price, Status, DepartureAirport, ArrivalAirport, Airline, Airplane, Date) {
    const flightsContainer = document.getElementById('searchFlightsResult');
    flightsContainer.innerHTML = '';

    const url = new URL('http://127.0.0.1:5000/api/flights/search');
    const params = { FlightNumber, Price, Status, DepartureAirport, ArrivalAirport, Airline, Airplane, Date };
    url.search = new URLSearchParams(params).toString();

    try {
        const response = await fetch(url);
        const flights = await response.json();

        flights.forEach(flight => {
            const flightElement = createFlightElement(flight);
            flightsContainer.insertAdjacentHTML('beforeend', flightElement);
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        flightsContainer.textContent = 'Failed to load flights.';
    }
}
