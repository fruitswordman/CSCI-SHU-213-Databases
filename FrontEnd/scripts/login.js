const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const data = {
        username,
        password
    };

    fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => response.json())
        .then(data => {
            if (data.success) {
                if (data.type === 'customer') {
                    window.location.href = 'customers/customer_home.html';
                } else if (data.type === 'airline_staff') {
                    console.log('staff');
                    window.location.href = 'staff/staff_home.html';
                } else if (data.type === 'booking_agent') {
                    window.location.href = 'agents/agent_home.html';
                }
            } else {
                alert(data.message);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
});