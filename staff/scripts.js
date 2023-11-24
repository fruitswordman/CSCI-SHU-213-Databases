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


function fetchAndDisplayFlights() {
    const flightsContainer = document.getElementById('flightsList');
    flightsContainer.innerHTML = '';

    // Use fakeFetch here
    fakeFetch('/api/flights/upcoming')
        .then(response => response.json())
        .then(flights => {
            flights.forEach(flight => {
                const flightDiv = document.createElement('div');
                flightDiv.className = 'flight';

                const flightNumber = document.createElement('div');
                flightNumber.textContent = `Flight Number: ${flight.number}`;
                flightDiv.appendChild(flightNumber);

                const departureTime = document.createElement('div');
                departureTime.textContent = `Departure Time: ${new Date(flight.departureTime).toLocaleString()}`;
                flightDiv.appendChild(departureTime);

                // Add other flight details here

                flightsContainer.appendChild(flightDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching flights:', error);
            flightsContainer.textContent = 'Failed to load flights.';
        });
}


document.querySelector('[data-panelid="viewFlightsPanel"]').addEventListener('click', function () {
    // This assumes your sidebar click handling makes the panel active as shown earlier
    fetchAndDisplayFlights(); // Call the function to fetch and display flights
});