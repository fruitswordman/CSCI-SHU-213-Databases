// Sidebar click handling
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


// General function for fetching data and updating the UI
async function fetchDataAndUpdateUI(url, containerId, createElement) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    try {
        const response = await fetch(url);
        const data = await response.json();
        data.forEach(item => {
            const element = createElement(item);
            container.insertAdjacentHTML('beforeend', element);
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        container.textContent = 'Failed to load flights.';
    }
}


document.querySelector('[data-panelid="viewFlightsPanel"]').addEventListener('click', function () {
    const url = 'http://127.0.0.1:5000/api/flights/upcoming';
    fetchDataAndUpdateUI(url, 'flightsList', createFlightElement);
});


// create flight

document.getElementById('createFlightForm').addEventListener('submit', function (event) {
    event.preventDefault();
    // Collecting form data
    const formData = {
        FlightNumber: document.getElementById("FlightNumber").value,
        DepartingTime: document.getElementById("DepartingTime").value,
        ArrivingTime: document.getElementById("ArrivingTime").value,
        Price: document.getElementById("Price").value,
        Status: document.getElementById("Status").value,
        DepartureAirport: document.getElementById("DepartureAirport").value,
        ArrivalAirport: document.getElementById("ArrivalAirport").value,
        Airline: document.getElementById("Airline").value,
        Airplane: document.getElementById("Airplane").value,
        Date: document.getElementById("Date").value
    };

    // Constructing the query URL
    const url = new URL('http://127.0.0.1:5000/api/create_flights');
    url.search = new URLSearchParams(formData).toString();

    // Fetching data and updating UI
    fetchDataAndUpdateUI(url, 'createFlightResult', createFlightElement);
});


// update flight status

function updateAndDisplayFlights(Status, FlightNumber, Date, DepartingTime) {
    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/update_status');
    const params = { Status, FlightNumber, Date, DepartingTime };
    url.search = new URLSearchParams(params).toString();

    // Use fetchDataAndUpdateUI to handle the API request and update the UI
    fetchDataAndUpdateUI(url, 'updateStatusResult', createFlightElement);
}

// Event listener for the update status form
const updateStatusForm = document.getElementById('UpdateStatusForm');
updateStatusForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const FlightNumber = document.getElementById("FlightNumberStatus").value;
    const Date = document.getElementById("DateStatus").value;
    const DepartingTime = document.getElementById("DepartingTimeStatus").value;
    const Status = document.getElementById("StatusUpdateStatus").value;

    updateAndDisplayFlights(Status, FlightNumber, Date, DepartingTime);
});


// add airplane

const AddAirplaneForm = document.getElementById('addAirplaneForm');
AddAirplaneForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const AirplaneID = document.getElementById("AirplaneID").value
    const SeatingCapacity = document.getElementById("SeatingCapacity").value
    const Airline = document.getElementById("cAirline").value
    // Implement your search logic here

    AddDisplayAirplane(
        AirplaneID, SeatingCapacity, Airline
    );
});

function AddDisplayAirplane(AirplaneID, SeatingCapacity, Airline) {
    const AirplaneContainer = document.getElementById('addAirplaneResult');
    AirplaneContainer.innerHTML = '';

    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/add_airplane');
    const params = {
        AirplaneID, SeatingCapacity, Airline
    };
    url.search = new URLSearchParams(params).toString();
    // console.log(url)
    console.log(params)
    fetch(url)  // Make sure the port matches the Flask server
        .then(response => response.json())
        .then(Airplanes => {
            //console.log(Airports);
            Airplanes.forEach(airport => {
                const AirplaneDiv = document.createElement('div');
                AirplaneDiv.className = 'Airplane';

                // Airline
                const AirplaneID = document.createElement('div');
                AirplaneID.className = 'AirplaneID';
                AirplaneID.textContent = `${airport.AirplaneID}`;
                AirplaneDiv.appendChild(AirplaneID);

                // Flight Number
                const SeatingCapacity = document.createElement('div');
                SeatingCapacity.className = 'AirportCity';
                SeatingCapacity.textContent = `${airport.SeatingCapacity}`;
                AirplaneDiv.appendChild(SeatingCapacity);

                // Date
                const cAirline = document.createElement('div');
                cAirline.className = 'Airline';
                cAirline.textContent = `${airport.Airline}`;
                AirplaneDiv.appendChild(cAirline);

                // Append containers to the main flight div
                // AirportDiv.appendChild(infoContainer);

                // Append the complete flight info to the container
                AirplaneContainer.appendChild(AirplaneDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching Airplanes:', error);
            flightsContainer.textContent = 'Failed to load Airplanes.';
        });
}


// add airport

const AddAirportForm = document.getElementById('addAirportForm');
AddAirportForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const AirportName = document.getElementById("AirportName").value
    const AirportCity = document.getElementById("AirportCity").value
    const IATA = document.getElementById("IATA").value
    // Implement your search logic here

    AddDisplayAirport(
        AirportName,
        AirportCity,
        IATA
    );

    // console.log(`Searching flights from ${departingAirport} to ${arrivingAirport} on ${date}`);

});

function AddDisplayAirport(AirportName,
    AirportCity,
    IATA) {
    const AirportContainer = document.getElementById('addAirportResult');
    AirportContainer.innerHTML = '';

    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/add_airplane');
    const params = {
        AirportName,
        AirportCity,
        IATA
    };
    url.search = new URLSearchParams(params).toString();
    // console.log(url)
    console.log(params)
    fetch(url)  // Make sure the port matches the Flask server
        .then(response => response.json())
        .then(Airports => {
            //console.log(Airports);
            Airports.forEach(airport => {
                const AirportDiv = document.createElement('div');
                AirportDiv.className = 'Airport';


                // Airline
                const AirportName = document.createElement('div');
                AirportName.className = 'AirportName';
                AirportName.textContent = `${airport.AirportName}`;
                AirportDiv.appendChild(AirportName);

                // Flight Number
                const AirportCity = document.createElement('div');
                AirportCity.className = 'AirportCity';
                AirportCity.textContent = `${airport.AirportCity}`;
                AirportDiv.appendChild(AirportCity);

                // Date
                const IATA = document.createElement('div');
                IATA.className = 'IATA';
                IATA.textContent = `${airport.IATA}`;
                AirportDiv.appendChild(IATA);

                // Append containers to the main flight div
                // AirportDiv.appendChild(infoContainer);

                // Append the complete flight info to the container
                AirportContainer.appendChild(AirportDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching airports:', error);
            flightsContainer.textContent = 'Failed to load airports.';
        });
}