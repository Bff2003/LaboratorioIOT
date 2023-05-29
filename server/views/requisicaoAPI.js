function showStatus(switchId) {
    const switchElement = document.getElementById(switchId);
    const statusElement = document.getElementById(`status${switchId.slice(-1)}`);

    if (switchElement.checked) {
        // Make a request to an endpoint
        fetch('https://example.com/api/endpoint')
            .then(response => response.json())
            .then(data => {
                // Update the status element with the received data
                statusElement.textContent = data.status;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        statusElement.textContent = 'OFF';
    }
}
