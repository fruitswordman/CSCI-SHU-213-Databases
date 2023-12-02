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


// Modular function to create flight HTML element
function createFlightElement(flight, showPurchaseButton = false) {
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
            ${showPurchaseButton ? `<button class="purchase-button" data-flightid="${flight.FlightNumber}">Purchase</button>` : ''}
        </div>
    `;
}


// display upcoming flightes

async function fetchAndDisplayFlights() {
    const flightsContainer = document.getElementById('flightsList');
    flightsContainer.innerHTML = '';

    try {
        const response = await fetch('http://127.0.0.1:5000/api/flights/my_flight');
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

document.querySelector('[data-panelid="viewFlightsPanel"]').addEventListener('click', function () {
    fetchAndDisplayFlights();
});


// display purchased flights

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

    queryAndPurchaseFlights(FlightNumber, Price, Status, DepartureAirport, ArrivalAirport, Airline, Airplane, Date);
});

async function queryAndPurchaseFlights(FlightNumber, Price, Status, DepartureAirport, ArrivalAirport, Airline, Airplane, Date) {
    const flightsContainer = document.getElementById('searchFlightsResult');
    flightsContainer.innerHTML = '';

    const url = new URL('http://127.0.0.1:5000/api/flights/search');
    const params = { FlightNumber, Price, Status, DepartureAirport, ArrivalAirport, Airline, Airplane, Date };
    url.search = new URLSearchParams(params).toString();

    try {
        const response = await fetch(url);
        const flights = await response.json();

        flights.forEach(flight => {
            const flightElement = createFlightElement(flight, true);
            flightsContainer.insertAdjacentHTML('beforeend', flightElement);
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        flightsContainer.textContent = 'Failed to load flights.';
    }
}

// purchase button listener

document.getElementById('searchFlightsResult').addEventListener('click', async function (event) {
    if (event.target.classList.contains('purchase-button')) {
        const FlightNumber = event.target.getAttribute('data-flightid');
        const Date = event.target.parentElement.querySelector('.flight-date').textContent;
        const DepartingTime = event.target.parentElement.querySelector('.flight-departing-time').textContent;

        const data = {
            FlightNumber,
            Date,
            DepartingTime,
        };

        console.log(data);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/flights/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                alert(result.message);
            } else {
                alert(result.message);
            }
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
});


function logoutAndPost() {
    // Define the URL to which you want to post data
    const url = 'http://localhost:5000/api/logout';

    fetch(url)
        .then(response => response.json())
        .then(result => {
            alert(result.message); // Display the result message
        })
        .finally(() => {
            // Redirect to login.html after the POST request
            window.location.href = '../login.html';
        });
}