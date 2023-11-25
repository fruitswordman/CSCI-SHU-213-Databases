document.querySelectorAll('.sidebar ul li').forEach(function (li) {
    li.addEventListener('click', function (e) {
        showPanel(e, li);
    });
});

function showPanel(e, li) {
    // Remove active class from all list items
    document.querySelectorAll('.sidebar ul li').forEach(function (item) {
        item.classList.remove('active');
    });

    // Hide all content panels
    document.querySelectorAll('.content-panel').forEach(function (panel) {
        panel.classList.remove('active');
    });

    // Add active class to clicked list item
    li.classList.add('active');

    // Get the ID of the panel to show
    const panelId = li.getAttribute('data-panelid');
    const activePanel = document.getElementById(panelId);

    // Show the selected panel
    if (activePanel) {
        activePanel.classList.add('active');
    }
}


// 
// 
// 
// 
// 
// 
const mockFlightsData = [
    {
        number: "AB123",
        departureTime: "2023-07-21T10:00:00Z",
        arrivalTime: "2023-07-21T12:00:00Z",
        origin: "New York",
        destination: "London",
        // ... other flight details
    },
    {
        number: "CD456",
        departureTime: "2023-07-22T11:00:00Z",
        arrivalTime: "2023-07-22T15:00:00Z",
        origin: "Berlin",
        destination: "Paris",
        // ... other flight details
    },
    // ... more flights
];


function fakeFetch(url) {
    return new Promise((resolve, reject) => {
        // Simulate a network request with a delay
        setTimeout(() => {
            if (url === "/api/flights/upcoming") {
                resolve({ json: () => Promise.resolve(mockFlightsData) });
            } else {
                reject(new Error('Not found'));
            }
        }, 1000);
    });
}
// 
// 
// 
// 
// 
// 


function fetchAndDisplayFlights() {
    const flightsContainer = document.getElementById('flightsList');
    flightsContainer.innerHTML = '';

    fetch('http://127.0.0.1:5000/api/flights/upcoming')  // Make sure the port matches the Flask server
        .then(response => response.json())
        .then(flights => {
            console.log(flights);
            flights.forEach(flight => {
                const flightDiv = document.createElement('div');
                flightDiv.className = 'flight';

                // Price container
                const priceContainer = document.createElement('div');
                priceContainer.className = 'flight-price-container';

                // Price
                const flightPrice = document.createElement('div');
                flightPrice.className = 'flight-price';
                flightPrice.textContent = `￥${flight.Price.slice(0, -3)}`;
                priceContainer.appendChild(flightPrice);

                // Times and airports container
                const timesAirportsContainer = document.createElement('div');
                timesAirportsContainer.className = 'flight-times-airports-container';

                // Departing container within times-airports container
                const departingContainer = document.createElement('div');
                departingContainer.className = 'departing-container';

                // Departing Time
                const flightDepartingTime = document.createElement('div');
                flightDepartingTime.className = 'flight-departing-time';
                flightDepartingTime.textContent = `${flight.DepartingTime}`;
                departingContainer.appendChild(flightDepartingTime);

                // Departing Airport
                const flightDepartingAirport = document.createElement('div');
                flightDepartingAirport.className = 'flight-departing-airport';
                flightDepartingAirport.textContent = `${flight.DepartureAirport}`;
                departingContainer.appendChild(flightDepartingAirport);

                // Arrow container
                const arrowContainer = document.createElement('div');
                arrowContainer.className = 'flight-arrow-container';
                arrowContainer.textContent = '→'; // Using a simple right arrow unicode character

                // Arriving container within times-airports container
                const arrivingContainer = document.createElement('div');
                arrivingContainer.className = 'arriving-container';

                // Arriving Time
                const flightArrivingTime = document.createElement('div');
                flightArrivingTime.className = 'flight-arriving-time';
                flightArrivingTime.textContent = `${flight.ArrivingTime}`;
                arrivingContainer.appendChild(flightArrivingTime);

                // Arriving Airport
                const flightArrivingAirport = document.createElement('div');
                flightArrivingAirport.className = 'flight-arriving-airport';
                flightArrivingAirport.textContent = `${flight.ArrivalAirport}`;
                arrivingContainer.appendChild(flightArrivingAirport);

                // Append departing container, arrow, and arriving container to times-airports container
                timesAirportsContainer.appendChild(departingContainer);
                timesAirportsContainer.appendChild(arrowContainer);
                timesAirportsContainer.appendChild(arrivingContainer);

                // Info container
                const infoContainer = document.createElement('div');
                infoContainer.className = 'flight-info-container';

                // Airline
                const flightAirline = document.createElement('div');
                flightAirline.className = 'flight-airline';
                flightAirline.textContent = `${flight.Airline}`;
                infoContainer.appendChild(flightAirline);

                // Flight Number
                const flightNumber = document.createElement('div');
                flightNumber.className = 'flight-number';
                flightNumber.textContent = `${flight.FlightNumber}`;
                infoContainer.appendChild(flightNumber);

                // Date
                const flightDate = document.createElement('div');
                flightDate.className = 'flight-date';
                flightDate.textContent = `${flight.Date}`;
                infoContainer.appendChild(flightDate);

                // Append containers to the main flight div
                flightDiv.appendChild(infoContainer);
                flightDiv.appendChild(timesAirportsContainer);
                flightDiv.appendChild(priceContainer);

                // Append the complete flight info to the container
                flightsContainer.appendChild(flightDiv);
            });
        })
    // .catch(error => {
    //     console.error('Error fetching flights:', error);
    //     flightsContainer.textContent = 'Failed to load flights.';
    // });
}



document.querySelector('[data-panelid="viewFlightsPanel"]').addEventListener('click', function () {
    // This assumes your sidebar click handling makes the panel active as shown earlier
    fetchAndDisplayFlights(); // Call the function to fetch and display flights
});