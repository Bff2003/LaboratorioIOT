const EmonCMS = require('./emonCMS.js');
const Server = require('./index.js');
const Logger = require('./logger.js');

class Tomada {
    static mqtt; // MQTT client | this is set in server\index.js

    constructor(id, state) {
        this.log = Logger.createLogger("Tomada " + id);
        this.log.info = this.log.info.bind(this.log);
        this.log.info("Tomada " + id + " created");
        this.id = id;
        this.state = state;
        console.log("Mqtt client: " + this.mqtt)
    }

    turnOn() {
        if (this.state) return;

        this.log.info("Ligada");

        this.state = true;
        console.log("Tomada " + this.id + " ligada");

        // MQTT
        Tomada.mqtt.publish("tomadas", JSON.stringify({ "id": this.id, "estado": 1 }));

        // EmonCMS
        const obj = { ["tomada" + this.id]: '1' };
        EmonCMS.sendData("tomadas", obj); // Send data to emoncms
    }

    turnOff() {
        if (!this.state) return;

        this.log.info("Desligada");

        this.state = false;
        console.log("Tomada " + this.id + " desligada");

        // MQTT
        Tomada.mqtt.publish("tomadas", JSON.stringify({ "id": this.id, "estado": 0 }));

        // EmonCMS
        const obj = { ["tomada" + this.id]: '0' };
        EmonCMS.sendData("tomadas", obj); // Send data to emoncms
    }
}

module.exports = Tomada;