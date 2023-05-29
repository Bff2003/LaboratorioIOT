const mqtt = require('mqtt'); // MQTT client
mqttClient = mqtt.connect("mqtt://localhost:1884");
mqttClient.on('connect', () => {
    console.log('MQTT client connected');
});
mqttClient.on('error', (err) => {
    console.log(err);
    mqttClient.end();
});

async function sendLuz() {
    let luzTopic = "sensor/lux"
    let minDataToSend = 0;
    let maxDataToSend = 1000;
    let dataToSend = Math.floor(Math.random() * (maxDataToSend - minDataToSend + 1) + minDataToSend);
    mqttClient.publish(luzTopic, dataToSend.toString());
    console.log("Luz sent: " + dataToSend.toString());
}

async function sendTemperatura(){
    let temperaturaTopic = "sensor/temperatura"
    let minDataToSend = 15;
    let maxDataToSend = 50;
    let dataToSend = Math.floor(Math.random() * (maxDataToSend - minDataToSend + 1) + minDataToSend);
    mqttClient.publish(temperaturaTopic, dataToSend.toString());
    console.log("Temperatura sent: " + dataToSend.toString());
}

async function sendHumidade(){
    let humidadeTopic = "sensor/humidade"
    let minDataToSend = 0;
    let maxDataToSend = 100;
    let dataToSend = Math.floor(Math.random() * (maxDataToSend - minDataToSend + 1) + minDataToSend);
    mqttClient.publish(humidadeTopic, dataToSend.toString());
    console.log("Humidade sent: " + dataToSend.toString());
}

async function sendAll(){
    sendLuz();
    sendTemperatura();
    sendHumidade();
}

setInterval(sendAll, 5000); // send data every 1 second