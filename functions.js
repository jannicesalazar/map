// initialize the map
var map = L.map('map').setView([0, 0], 2);

// add a tile layer 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'}).addTo(map);

// event handler for when map is clicked 
function onMapClick(e) {
    // fetch weather data with OpenWeatherMap API
    const apiKey = '6dea368c99a053969745d5e110936277';
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${e.latlng.lat}&lon=${e.latlng.lng}&appid=${apiKey}&units=metric`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // extract weather information
            const weatherDescription = data.weather[0].description;
            const temperature = data.main.temp;
            const temperatureF = (temperature *9/5) + 32;

            // creates a popup with weather information
            const popupContent = `
                <b>Latitude:</b> ${e.latlng.lat}<br>
                <b>Longitude:</b> ${e.latlng.lng}<br>
                <b>Weather:</b> ${weatherDescription}<br>
                <b>Temperature:</b> ${temperature}°C / ${temperatureF}°F`;

            // add a marker with the popup to the clicked location
            L.marker(e.latlng).addTo(map)
                .bindPopup(popupContent)
                .openPopup();})
        
        .catch(error => {console.error('Error fetching weather data:', error);}); }

// attach click event handler to the map
map.on('click', onMapClick);