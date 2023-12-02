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
    const url = 'http://127.0.0.1:5000/api/flights/my_flight';
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
    const Airline = document.getElementById("AirplaneAirline").value
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
    const url = new URL('http://127.0.0.1:5000/api/add_airport');
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
            if (Airports == "Not authoritized!") {
                alert(Airports)
                return
            }
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

// grant permission

const GrantPermissionForm = document.getElementById('GrantPermissionForm');
GrantPermissionForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const Username = document.getElementById("Username").value
    const Permission = document.getElementById("Permission").value
    // Implement your search logic here

    GrantPermission(
        Username,
        Permission
    );

    // console.log(`Searching flights from ${departingAirport} to ${arrivingAirport} on ${date}`);

});


function GrantPermission(
    Username,
    Permission) {
    const PermissionContainer = document.getElementById('Permission_Result');
    PermissionContainer.innerHTML = '';

    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/grant_permission');
    const params = {
        Username,
        Permission
    };
    url.search = new URLSearchParams(params).toString();
    // console.log(url)

    fetch(url)  // Make sure the port matches the Flask server
        .then(response => response.json())
        .then(message => {
            console.log(message);

            // if (type(message) != String) {
            if (message == "Not authoritized.") {
                alert(message)
                return
            } else if (message == "Not in this company!") {
                alert(message)
                return
            }

            message.forEach(user => {


                const permissionDiv = document.createElement('div');
                permissionDiv.className = 'PermissionDiv';

                // Username
                const usernameElement = document.createElement('div');
                usernameElement.className = 'Username';
                usernameElement.textContent = `${user.Username}`;
                permissionDiv.appendChild(usernameElement);

                // Permission
                const permissionElement = document.createElement('div');
                permissionElement.className = 'Permission';
                permissionElement.textContent = `${user.PermissionType}`;
                permissionDiv.appendChild(permissionElement);

                // Append containers to the main flight div
                // AirportDiv.appendChild(infoContainer);

                // Append the complete flight info to the container
                PermissionContainer.appendChild(permissionDiv);

            });
            // }else{
            //     alert(message)
            // }
        })
        .catch(error => {
            console.error('Error granting permission:', error);
            flightsContainer.textContent = 'Failed to load permission.';
        });
}



// view customers

const TopCustomerplotForm = document.getElementById('TopCustomerplotForm');
TopCustomerplotForm.addEventListener('submit', function (event) {
    event.preventDefault();
    Customer_ploting()
});


function Customer_ploting() {
    // Sample data for the bar plot
    const TopCustomerplotdiv = document.getElementById("TopCustomerplot")
    TopCustomerplotdiv.innerHTML = '';
    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/Top5_customer');
    const params = {};
    url.search = new URLSearchParams(params).toString();
    // console.log(url)
    var frequency = []
    var emails = []

    fetch(url)  // Make sure the port matches the Flask server
        .then(response => response.json())
        .then(customer_frequency => {
            // console.log(customer_frequency);
            customer_frequency.forEach(customer => {
                emails.push(customer.CustomerEmail)
                frequency.push(customer.Frequency)
            });
            const data = frequency

            // Get the canvas element and its context
            var canvas_frame = document.createElement("canvas");

            // Set attributes such as width and height
            canvas_frame.width = 200;
            canvas_frame.height = 100;


            const canvas = canvas_frame.getContext('2d');

            // Create a bar plot using Chart.js
            const barPlot = new Chart(canvas, {
                type: 'bar',
                data: {
                    labels: emails,
                    datasets: [{
                        label: 'Frequency',
                        data: data,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)', // Bar color
                        borderColor: 'rgba(75, 192, 192, 1)', // Border color
                        borderWidth: 1
                    }]
                },
                options: {
                    scales: {
                        x: {
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Category'
                            }
                        },
                        y: {
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: 'Value'
                            }
                        }
                    }
                }
            });
            TopCustomerplotdiv.appendChild(canvas_frame);
        })
        .catch(error => {
            console.error('Error fetching Customers:', error);
            flightsContainer.textContent = 'Failed to load Customers.';
        });
}


// view booking agents

document.querySelector('[data-panelid="viewAgentsPanel"]').addEventListener('click', function () {
    loadAgents();
});


function loadAgents() {
    fetch('http://127.0.0.1:5000/api/show_agents')  // Replace with your actual API endpoint
        .then(response => response.json())
        .then(agents => {
            displayAgents(agents);
        })
        .catch(error => console.error('Error fetching agents:', error));
}

function displayAgents(agents) {
    const agentsList = document.getElementById('agentsList');
    agentsList.innerHTML = ''; // Clear existing agents

    agents.forEach(agent => {
        // Create the main container for each agent
        const agentDiv = document.createElement('div');
        agentDiv.className = 'agent-item';

        // Create and append name element
        const nameDiv = document.createElement('div');
        nameDiv.className = 'agent-name';
        nameDiv.textContent = `Name: ${agent.Name}`;
        agentDiv.appendChild(nameDiv);

        // Create and append email element
        const emailDiv = document.createElement('div');
        emailDiv.className = 'agent-email';
        emailDiv.textContent = `Email: ${agent.Email}`;
        agentDiv.appendChild(emailDiv);

        // Create and append airline element
        const airlineDiv = document.createElement('div');
        airlineDiv.className = 'agent-airline';
        airlineDiv.textContent = `Airline: ${agent.Airline}`;
        agentDiv.appendChild(airlineDiv);

        // Append the agent div to the list
        agentsList.appendChild(agentDiv);
    });
}


// view reports

const reportForm = document.getElementById('reportSelectionForm');

reportForm.addEventListener('submit', function (event) {
    event.preventDefault();
    generateReport();
});

function generateReport() {
    const reportType = document.getElementById('reportType').value;

    // Placeholder for fetching data. This should be replaced with an actual API call or data fetching logic.
    if (reportType === 'monthly') {
        fetchMonthlyReportData();
    } else if (reportType === 'annual') {
        fetchAnnualReportData();
    } else {
        // Handle other report types or show an error
    }
}


function fetchMonthlyReportData() {
    // Example API call (replace with your actual API endpoint and logic)
    fetch('/api/monthly-report')
        .then(response => response.json())
        .then(data => updateReportResults(data))
        .catch(error => console.error('Error fetching monthly data:', error));
}

function fetchAnnualReportData() {
    // Similar to fetchMonthlyReportData, but for annual data
}

function updateReportResults(data) {
    const resultDiv = document.getElementById('reportsResult');
    resultDiv.innerHTML = ''; // Clear existing content

    // Constructing a table (or other elements) based on the data
    const table = document.createElement('table');
    // ... build your table or other UI elements with the data
    // Example: table.innerHTML = '<tr><td>' + data.someField + '</td></tr>';

    resultDiv.appendChild(table);
}


// add agent

const addAgentForm = document.getElementById('addAgentForm');
addAgentForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const agentEmail = document.getElementById("AgentEmail").value;

    // Implement your add agent logic here
    addDisplayAgent(agentEmail);
});

function addDisplayAgent(agentEmail) {
    const agentContainer = document.getElementById('addAgentResult');

    // Assuming the URL and params for adding a booking agent
    const url = new URL('http://127.0.0.1:5000/api/add_agent');
    const params = { agentEmail };
    url.search = new URLSearchParams(params).toString();

    fetch(url)
        .then(response => response.json())
        .then(result => {
            alert(result.message); // Display the result message
            if (result.success) {
                document.querySelector('[data-panelid="viewAgentsPanel"]').click();
                loadAgents();
            }
        })
}



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