function queryAndDisplayFlights(departingCity, arrivingCity, date) {
    const flightsContainer = document.getElementById('flightsList');
    flightsContainer.innerHTML = '';

    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/flights/search');
    const params = { departingCity, arrivingCity, date };
    url.search = new URLSearchParams(params).toString();

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




document.addEventListener('DOMContentLoaded', function () {
    // Handle Flight Search Form Submission
    const flightSearchForm = document.getElementById('flightSearchForm');
    flightSearchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const departingAirport = document.getElementById('departingAirport').value;
        const arrivingAirport = document.getElementById('arrivingAirport').value;
        const date = document.getElementById('date').value;
        
        // Implement your search logic here

        queryAndDisplayFlights(departingAirport, arrivingAirport, date);

        console.log(`Searching flights from ${departingAirport} to ${arrivingAirport} on ${date}`);

    });

    // Handle Flight Status Form Submission
    const flightStatusForm = document.getElementById('flightStatusForm');
    flightStatusForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const flightNumber = document.getElementById('flightNumber').value;
        const statusDate = document.getElementById('statusDate').value;

        // Implement your status check logic here
        console.log(`Checking status for flight ${flightNumber} on ${statusDate}`);
    });
});
