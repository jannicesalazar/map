'use strict';

const apiKey = '6dea368c99a053969745d5e110936277';
const map = L.map('map').setView([0, 0], 2);
let currentMarker;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map' }).addTo(map);

const showWelcomePopup = () => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        Swal.fire({
            title: 'Welcome!',
            html: 'Hi, my name is Jannice and I made this website. You can look up any country or press anywhere to check out some real-time data about that region.',
            iconHtml: '<img src="sun.png" style="width: 100%; height: 100%;">',
            confirmButtonText: 'Have Fun!',
            confirmButtonColor: '#00a5ff',
        });
        localStorage.setItem('hasVisited', 'true');
    }
};

const fetchWeatherData = (lat, lng) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    return fetch(apiUrl)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching weather data:', error);
            throw error;
        });
};

const createPopupContent = (data, lat, lng) => {
    const weatherDescription = data.weather[0].description;
    const temperature = data.main.temp;
    const temperatureF = (temperature * 9/5) + 32;
    const iconCode = data.weather[0].icon;
    const weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    return `
        <div class="popup-container">
            ${weatherDescription.toUpperCase()}<br>
            <img src="${weatherIconUrl}" alt="Weather Icon" class="weather-icon"><br>
            ${temperature.toFixed(2)}°C / ${temperatureF.toFixed(2)}°F <br>
            <b>Latitude:</b> ${lat.toFixed(2)}<br>
            <b>Longitude:</b> ${lng.toFixed(2)}<br>
        </div>`;
};

const addMarkerToMap = (latlng, popupContent) => {
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }
    currentMarker = L.marker(latlng).addTo(map)
        .bindPopup(popupContent)
        .openPopup();

    currentMarker.on('popupclose', () => {
        map.removeLayer(currentMarker);
        currentMarker = null;
    });
};

const onMapClick = (e) => {
    fetchWeatherData(e.latlng.lat, e.latlng.lng)
        .then(data => {
            const popupContent = createPopupContent(data, e.latlng.lat, e.latlng.lng);
            addMarkerToMap(e.latlng, popupContent);
        })
        .catch(() => {
            const errorPopupContent = '<b>Error:</b> Unable to fetch weather data';
            addMarkerToMap(e.latlng, errorPopupContent);
        });
};

map.on('click', onMapClick);

document.getElementById('input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const searchTerm = this.value;
        if (searchTerm) {
            const geocodeApiUrl = `https://nominatim.openstreetmap.org/search?country=${searchTerm}&format=json&limit=1`;

            fetch(geocodeApiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        const countryCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                        map.fitBounds([
                            [countryCoords[0] - 1, countryCoords[1] - 1],
                            [countryCoords[0] + 1, countryCoords[1] + 1]
                        ]);
                    } else {
                        const errorPopupContent = '<b>Error:</b> Country not found';
                        addMarkerToMap(map.getCenter(), errorPopupContent);
                    }
                })
                .catch(() => {
                    const errorPopupContent = '<b>Error:</b> Unable to fetch data';
                    addMarkerToMap(map.getCenter(), errorPopupContent);
                });

            this.value = '';
        }
    }
});

showWelcomePopup();