// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Add a tile layer (you can use other tile layers as well)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

//Event handler for when the map is clicked 
function onMapClick(e) {
    // Fetch weather data using OpenWeatherMap API
    const apiKey = 'YOUR_OPENWEATHERMAP_API_KEY';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${e.latlng.lat}&lon=${e.latlng.lng}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Extract relevant weather information
            const weatherDescription = data.weather[0].description;
            const temperature = data.main.temp;

            // Create a popup with weather information
            const popupContent = `
                <b>Latitude:</b> ${e.latlng.lat}<br>
                <b>Longitude:</b> ${e.latlng.lng}<br>
                <b>Weather:</b> ${weatherDescription}<br>
                <b>Temperature:</b> ${temperature}°C
            `;

            // Add a marker with the popup to the clicked location
            L.marker(e.latlng).addTo(map)
                .bindPopup(popupContent)
                .openPopup();
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
        });
}

// Attach the click event handler to the map
map.on('click', onMapClick);