const socket = io();

// Initialize the map and set its view
const map = L.map('map').setView([0, 0], 16);

// Add the tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Pankaj',
}).addTo(map);

const markers = {}; // Object to keep track of markers
let markerCounter = 1; // Counter for labeling markers

socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    if (markers[id]) {
        // If the marker already exists, update its position
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Otherwise, create a new marker with a unique ID and label
        const markerLabel = markerCounter; // Use the current counter value
        const marker = new L.marker([latitude, longitude]).addTo(map);

        // Add a tooltip with the marker number
        marker.bindTooltip(`Marker ${markerLabel}`, { permanent: true, direction: 'top' }).openTooltip();

        // Store the marker and increment the counter
        markers[id] = marker;
        markerCounter++;
    }
});

socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        // If a user disconnects, remove their marker from the map
        map.removeLayer(markers[id]);
        delete markers[id];
    }
});

// Emit location periodically
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error(error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}
