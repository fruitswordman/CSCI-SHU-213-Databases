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

document.querySelector('[data-panelid="viewFlightsPanel"]').addEventListener('click', function () {
    fetchAndDisplayFlights();
});


// display purchased flights

const searchFlightsForm = document.getElementById('searchFlightsForm');
searchFlightsForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const FlightNumber = document.getElementById("searchFlightNumber").value;
    const Price = document.getElementById("searchPrice").value;
    const DepartureAirport = document.getElementById("searchDepartureAirport").value;
    const ArrivalAirport = document.getElementById("searchArrivalAirport").value;
    const Airline = document.getElementById("searchAirline").value;
    const Airplane = document.getElementById("searchAirplane").value;
    const Date = document.getElementById("searchDate").value;

    queryAndPurchaseFlights(FlightNumber, Price, DepartureAirport, ArrivalAirport, Airline, Airplane, Date);
});

async function queryAndPurchaseFlights(FlightNumber, Price, DepartureAirport, ArrivalAirport, Airline, Airplane, Date) {
    const flightsContainer = document.getElementById('searchFlightsResult');
    flightsContainer.innerHTML = '';

    const url = new URL('http://127.0.0.1:5000/api/flights/search');
    const params = { FlightNumber, Price, DepartureAirport, ArrivalAirport, Airline, Airplane, Date };
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
        const CustomerEmail = document.getElementById("buyForCustomerEmail").value;


        const data = {
            FlightNumber,
            Date,
            DepartingTime,
            CustomerEmail
        };

        console.log(data);
        try {
            const response = await fetch('http://127.0.0.1:5000/api/flights/booking_agent_purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            alert(result.message);
        }
        catch (error) {
            console.error('Error:', error);
        }
    }
});


const TopCustomerplotForm = document.getElementById('TopCustomerplotForm');
TopCustomerplotForm.addEventListener('submit', function (event) {
    event.preventDefault();
    // Implement your search logic here

    Customer_ploting()
    // console.log(`Searching flights from ${departingAirport} to ${arrivingAirport} on ${date}`);

});


function Customer_ploting() {
    // Sample data for the bar plot
    const TopCustomerplotdiv = document.getElementById("TopCustomerplot")
    TopCustomerplotdiv.innerHTML = '';
    // Construct the URL with query parameters
    const url = new URL('http://127.0.0.1:5000/api/Top5_customer_bookingAgent');
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



            // console.log(frequency)
            // console.log(emails)
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