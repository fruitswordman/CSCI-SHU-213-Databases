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
            // console.log(flights);
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


const flightSearchForm = document.getElementById('createFlightForm');
flightSearchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    // const FlightNumber = document.getElementById("FlightNumber").value
    // const DepartingTime = document.getElementById("DepartingTime").value
    // const ArrivingTime = document.getElementById("ArrivingTime").value
    // const Price = document.getElementById("Price").value
    // const Status = document.getElementById("Status").value
    // const DepartureAirport = document.getElementById("DepartureAirport").value
    // const ArrivalAirport = document.getElementById("ArrivalAirport").value
    // const Airline = document.getElementById("Airline").value
    // const Airplane = document.getElementById("Airplane").value
    // const Date = document.getElementById("Date").value
    // const DepartingDateTime = document.getElementById("DepartingDateTime").value

    const FlightNumber = '3U2395';
    const DepartingTime = '21:30:00';
    const ArrivingTime = '23:50:00';
    const Price = '1080';
    const Status = 'Scheduled'; // Assuming the flight is scheduled
    const DepartureAirport = '萧山国际机场T3'; // Hangzhou Xiaoshan International Airport Terminal 3
    const ArrivalAirport = '江北国际机场T3'; // Chongqing Jiangbei International Airport Terminal 3
    const Airline = '四川航空'; // Sichuan Airlines
    const Airplane = '1'; // Airplane model is not provided
    const Date = '2024-08-09';
    const DepartingDateTime = '2024-08-09 21:30:00';

    // Implement your search logic here

    queryAndDisplayFlights(FlightNumber,
        DepartingTime,
        ArrivingTime,
        Price,
        Status,
        DepartureAirport,
        ArrivalAirport,
        Airline,
        Airplane,
        Date,
        DepartingDateTime);

    // console.log(`Searching flights from ${departingAirport} to ${arrivingAirport} on ${date}`);

});




function queryAndDisplayFlights(FlightNumber,
    DepartingTime,
    ArrivingTime,
    Price,
    Status,
    DepartureAirport,
    ArrivalAirport,
    Airline,
    Airplane,
    Date,
    DepartingDateTime) {
    const flightsContainer = document.getElementById('createFlightResult');
    flightsContainer.innerHTML = '';

    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/create_flights');
    const params = {
        FlightNumber,
        DepartingTime,
        ArrivingTime,
        Price,
        Status,
        DepartureAirport,
        ArrivalAirport,
        Airline,
        Airplane,
        Date,
        DepartingDateTime
    };
    url.search = new URLSearchParams(params).toString();
    // console.log(url)
    fetch(url)  // Make sure the port matches the Flask server
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
        .catch(error => {
            console.error('Error fetching flights:', error);
            flightsContainer.textContent = 'Failed to load flights.';
        });
}


const CreateAirportForm = document.getElementById('createAirportForm');
CreateAirportForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const AirportName = document.getElementById("AirportName").value
    const AirportCity = document.getElementById("AirportCity").value
    const IATA = document.getElementById("IATA").value
    // Implement your search logic here

    CreateDisplayAirport(
        AirportName,
        AirportCity,
        IATA
    );

    // console.log(`Searching flights from ${departingAirport} to ${arrivingAirport} on ${date}`);

});


function CreateDisplayAirport(AirportName,
    AirportCity,
    IATA) {
    const AirportContainer = document.getElementById('addAirportResult');
    AirportContainer.innerHTML = '';

    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/create_airplane');
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


const CreateAirplaneForm = document.getElementById('createAirplaneForm');
CreateAirplaneForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const  AirplaneID = document.getElementById("AirplaneID").value
    const  SeatingCapacity = document.getElementById("SeatingCapacity").value
    const Airline = document.getElementById("cAirline").value
    // Implement your search logic here

    CreateDisplayAirplane(
        AirplaneID,SeatingCapacity,Airline
    );

    // console.log(`Searching flights from ${departingAirport} to ${arrivingAirport} on ${date}`);

});

function CreateDisplayAirplane(AirplaneID,SeatingCapacity,Airline) {
    const AirplaneContainer = document.getElementById('addAirplaneResult');
    AirplaneContainer.innerHTML = '';

    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/create_airplane');
    const params = {
        AirplaneID,SeatingCapacity,Airline
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
                SeatingCapacity.textContent = `${airport.SeatingCapacity }`;
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