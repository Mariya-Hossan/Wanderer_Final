function show() {
    window.location = './dhaka.html';
}

function getalert() {
    alert("The option called see more will be activated later. Thank you"); 
}

function getredirect() {
    window.location = './booking.html';  
}

function handleMenuSelection() {
    const menu = document.getElementById("menu");
    const selectedOption = menu.value;

    if (selectedOption === "application") {
        window.open("Applicatin Agreement.pdf", "_blank");  
    } else if (selectedOption === "srs") {
        window.open("SRS.pdf", "_blank");  
    }
}

let selectedBookingId = null;

async function fetchBookings() {
    const response = await fetch('http://localhost:3000/api/bookings');
    if (!response.ok) {
        console.error(`Error: ${response.statusText}`);
        return;
    }
    const bookings = await response.json();
    displayBookings(bookings);
} 

function displayBookings(bookings) {
    const bookingList = document.getElementById('bookingList');
    bookingList.innerHTML = '';
    bookings.forEach(booking => {
        bookingList.innerHTML += `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.email}</td>
                <td>${booking.name}</td>
                <td>${booking.destination}</td>
                <td>${booking.category}</td>
                <td>
                    <button onclick="editBooking(${booking.id})">Update</button>
                    <button onclick="deleteBooking(${booking.id})">Delete</button>
                </td>
            </tr>
        `;
    });
}

async function createBooking() {
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('name').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const category = document.getElementById('category').value.trim();

    const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, destination, category }),
    });

    if (response.ok) {
        alert('Booking created successfully!');
        fetchBookings();
        resetForm();
    } else {
        const errorData = await response.json();
        alert(`Failed to create booking: ${errorData.error}`);
    }
}

async function editBooking(id) {
    selectedBookingId = id;
    const response = await fetch(`http://localhost:3000/api/bookings/${id}`);
    const booking = await response.json();

    document.getElementById('email').value = booking.email;
    document.getElementById('name').value = booking.name;
    document.getElementById('destination').value = booking.destination;
    document.getElementById('category').value = booking.category;

    document.querySelector('button[onclick="createBooking()"]').style.display = 'none';
    document.querySelector('button[onclick="updateBooking()"]').style.display = 'inline';
}

async function updateBooking() {
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('name').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const category = document.getElementById('category').value.trim();

    const response = await fetch(`http://localhost:3000/api/bookings/${selectedBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, destination, category }),
    });

    if (response.ok) {
        alert('Booking updated successfully!');
        fetchBookings();
        resetForm();
    } else {
        const errorData = await response.json();
        alert(`Failed to update booking: ${errorData.error}`);
    }
}

async function deleteBooking(id) {
    await fetch(`http://localhost:3000/api/bookings/${id}`, {
        method: 'DELETE',
    });

    fetchBookings();
}

function resetForm() {
    document.getElementById('bookForm').reset();
    document.querySelector('button[onclick="createBooking()"]').style.display = 'inline';
    document.querySelector('button[onclick="updateBooking()"]').style.display = 'none';
    selectedBookingId = null;
}

fetchBookings();

document.getElementById('searchButton').addEventListener('click', function() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const items = document.querySelectorAll('.item');
    let matchFound = false;
    let redirectUrl = ''; 

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(query)) {
            item.style.display = ''; 
            matchFound = true; 
            if (query === 'dhaka') {
                redirectUrl = './dhaka.html'; 
            }
        } else {
            item.style.display = 'none'; 
        }
    });
    if (matchFound && redirectUrl) {
        window.location.href = redirectUrl;
    }

    const noMatchMessage = document.getElementById('noMatch');
    if (!matchFound || query !== 'dhaka') {
        noMatchMessage.style.display = 'block'; 
    } else {
        noMatchMessage.style.display = 'none'; 
    }
});
