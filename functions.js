// checks if the user has visited the website before
const hasVisited = localStorage.getItem('hasVisited');

// if not visited, show the introduction popup and set the flag in localStorage
if (hasVisited) {
    Swal.fire({
        title: 'Welcome!',
        html: 'Hi, my name is Jannice and I made this website. You can look up any country or press anywhere to check out some data about that region.',
        iconHtml: '<img src="sun.png" style="width: 50px; height: 50px;">',
        confirmButtonText: 'Got it!'
    });

    // Set the flag to indicate that the user has visited
    localStorage.setItem('hasVisited', 'true');
}

// initialize the map
var map = L.map('map').setView([0, 0], 2);

//store marker 
var currentMarker;

// add a tile layer 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: 'Map'}).addTo(map);

// event handler for when map is clicked 
function onMapClick(e) {
    // remove any existing markers 
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
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
       
        // Weather icon code from OpenWeatherMap response
        const iconCode = data.weather[0].icon;

        // Constructing the weather icon URL
        const weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // creates a popup with weather information
        const popupContent = `
            <div class="popup-container">
                ${weatherDescription.toUpperCase()}<br>
                <img src="${weatherIconUrl}" alt="Weather Icon" class="weather-icon"><br>
                ${temperature.toFixed(2)}°C / ${temperatureF.toFixed(2)}°F <br>
                <b>Latitude:</b> ${e.latlng.lat.toFixed(2)}<br>
                <b>Longitude:</b> ${e.latlng.lng.toFixed(2)}<br></div>`;

        // add a marker with the popup to the clicked location
        currentMarker = L.marker(e.latlng).addTo(map)
            .bindPopup(popupContent)
            .openPopup();

        currentMarker.on('popupclose', function () {
            map.removeLayer(currentMarker);
            currentMarker = null; })})
        // ... Your existing code ...

        .catch(error => {
            // error message in the popup
            const errorPopupContent = '<b>Error:</b> Unable to fetch data';
            currentMarker = L.marker(e.latlng).addTo(map)
            .bindPopup(errorPopupContent)
            .openPopup();
            
            // remove the marker when the popup is closed
            currentMarker.on('popupclose', function () {
                map.removeLayer(currentMarker);
                currentMarker = null;
            });
        });
    }

// attach click event handler to the map
map.on('click', onMapClick);

// event handler for input box
document.getElementById('input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const searchTerm = this.value;
        if (searchTerm) {
            // gets coordinates for the country
            const geocodeApiUrl = `https://nominatim.openstreetmap.org/search?country=${searchTerm}&format=json&limit=1`;
            
            fetch(geocodeApiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const countryCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                    
                    // fits the country on the screen
                    map.fitBounds([
                        [countryCoords[0] - 1, countryCoords[1] - 1],
                        [countryCoords[0] + 1, countryCoords[1] + 1] ]);}         
        else {
            // error message in the popup
            const errorPopupContent = '<b>Error:</b> Country not found';
            currentMarker = L.marker(map.getCenter()).addTo(map)
            .bindPopup(errorPopupContent)
            .openPopup();
            
            // remove the marker when the popup is closed
            currentMarker.on('popupclose', function () {
                map.removeLayer(currentMarker);
                currentMarker = null; }); } })
            .catch(error => {
                // error message in the popup
                const errorPopupContent = '<b>Error:</b> Unable to fetch data';
                currentMarker = L.marker(map.getCenter()).addTo(map)
                .bindPopup(errorPopupContent)
                .openPopup();
                
                // removes the marker when the popup is closed
                currentMarker.on('popupclose', function () {
                    map.removeLayer(currentMarker);
                    currentMarker = null;});
                
                console.error('Error fetching data:', error);
            });
            this.value = '';
        }
    }
});