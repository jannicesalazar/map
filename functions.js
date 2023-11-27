// Initialize the map
var map = L.map('map').setView([0, 0], 2);

// Add a tile layer (you can use other tile layers as well)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Event handler for when the map is clicked
function onMapClick(e) {
    alert("You clicked the map at " + e.latlng.toString());
}

// Attach the click event handler to the map
map.on('click', onMapClick);