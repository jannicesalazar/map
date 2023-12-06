'use strict';

const apiKey = '6dea368c99a053969745d5e110936277'; //API key for accessing OpenWeather Map
const map = L.map('map').setView([0, 0], 2); //leaflet map centered at [0,0] with 2 level zoom 
let currentMarker;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: 'Map' }).addTo(map); //OpenStreetMap tile layer on map 

//shows welcome popup only when visiting site for the first time 
const welcomePopup = () => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
        Swal.fire({
            title: 'Welcome!',
            html: 'Hi, my name is Jannice and I made this website. You can look up any country or press anywhere to check out some real-time data about that region.',
            iconHtml: '<img src="sun.png" style="width: 100%; height: 100%;">',
            confirmButtonText: 'Have Fun!',
            confirmButtonColor: '#00a5ff',
        });
        //flags user when they have visited 
        localStorage.setItem('hasVisited', 'true'); } };

//gets data from OpenWeaterMap API
const weatherData = (lat, lng) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    return fetch(apiUrl)
        .then(response => response.json())
        .catch(error => {
            console.error('Error fetching weather data:', error);
            throw error; }); };

//creates a popup with data from the weather data
const dataPopup = (data, lat, lng) => {
    const weatherDescription = data.weather[0].description;
    const temperature = data.main.temp;
    const temperatureF = (temperature * 9/5) + 32;
    const iconCode = data.weather[0].icon;
    const weatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    return `<div class="popup-container">
            ${weatherDescription.toUpperCase()}<br>
            <img src="${weatherIconUrl}" alt="Weather Icon" class="weather-icon"><br>
            ${temperature.toFixed(2)}°C / ${temperatureF.toFixed(2)}°F <br>
            <b>Latitude:</b> ${lat.toFixed(2)}<br>
            <b>Longitude:</b> ${lng.toFixed(2)}<br></div>`; };

//adds marker and popup to map 
const marker = (latlng, popupContent) => {
    //removes a marker if it already exists 
    if (currentMarker) {
        map.removeLayer(currentMarker); }
    
    //adds marker and binds popup with content 
    currentMarker = L.marker(latlng).addTo(map)
        .bindPopup(popupContent)
        .openPopup();

    //removes marker when popup is closed 
    currentMarker.on('popupclose', () => {
        map.removeLayer(currentMarker);
        currentMarker = null; }); };

// map clicks
const onMapClick = (e) => {
    weatherData(e.latlng.lat, e.latlng.lng)
        .then(data => {
            //creates popup with marker on map
            const popupContent = dataPopup(data, e.latlng.lat, e.latlng.lng);
            marker (e.latlng, popupContent); })
        .catch(() => {
            //error if not able to get data 
            const errorPopupContent = '<b>Error:</b> Unable to fetch weather data';
            marker (e.latlng, errorPopupContent); }); };

//adds onMapClick to maps click event 
map.on('click', onMapClick);

//triggered when you press enter in the search bar 
document.getElementById('input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const searchTerm = this.value;
        if (searchTerm) {
            
            //geocoding API for countries 
            const geocodeApiUrl = `https://nominatim.openstreetmap.org/search?country=${searchTerm}&format=json&limit=1`;

            fetch(geocodeApiUrl)
                .then(response => response.json())
                .then(data => {
                    
                    //fits country to its coordinates when found 
                    if (data.length > 0) {
                        const countryCoords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
                        map.fitBounds([
                            [countryCoords[0] - 1, countryCoords[1] - 1],
                            [countryCoords[0] + 1, countryCoords[1] + 1]
                        ]); } 
                    else {
                        //displays error if country not found 
                        const errorPopupContent = '<b>Error:</b> Country not found';
                        marker (map.getCenter(), errorPopupContent); } })
                
                .catch(() => {
                    //handles errors when getting data
                    const errorPopupContent = '<b>Error:</b> Unable to fetch data';
                    marker (map.getCenter(), errorPopupContent); });
                //clear input value in input box 
                this.value = ''; } 
        } });

//show welcome popup for first time visitors 
welcomePopup();