const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables

class Server {
    constructor() {
        this.app = express();
        this.mqttClient = null;
        log4js.configure({
            appenders: {
                console: { type: 'console' },
                file: { type: 'file', filename: 'logs/app.log' }
            },
            categories: {
                default: { appenders: [
                    // 'console', 
                    'file'
                ], level: 'debug' }
            }
        });
        this.log = log4js.getLogger("Server log");
        this.log.level = 'debug';
        this.log.info('Server started');
        
        this.tomadas = [{"id": 1, "estado": 0}, {"id": 2, "estado": 0}, {"id": 3, "estado": 0}]
        
        this.automaticMode = {
            "state": true,
            "temperatura": {
                "min": 20,
                "max": 25
            },
            "lux": {
                "min": 100,
                "max": 200
            }
        }

        // logger.trace('Trace message');
        // logger.debug('Debug message');
        // logger.info('Info message');
        // logger.warn('Warn message');
        // logger.error('Error message');
        // logger.fatal('Fatal message');
    }

    connectMqtt(website, port) {
        this.mqttClient = mqtt.connect("mqtt://" + website + ":" + port);
        this.mqttClient.on('error', (err) => {
            this.log.error(err);
            this.mqttClient.end();
        });
        this.mqttClient.on('connect', () => {
            this.log.info('MQTT client connected');
        });
    }

    // Subscribe to a topic MQTT
    async subscribeMqtt(topicToSubscribe, onMessage = async (topic, message) => { console.log(topic + " - " + message); this.log.info(topic + " - " + message); }) {
        this.mqttClient.subscribe(topicToSubscribe, { qos: 0 });
        this.log.info('Subscribed to topic: ' + topicToSubscribe);
        this.mqttClient.on('message', onMessage);
    }

    // Publish a message to a topic MQTT
    publishMqtt(topic, message) {
        this.mqttClient.publish(topic, message);
        this.log.info('Message sent to topic: ' + topic + " - " + message);
    }

    // Send some data to a node in emoncms
    sendDataToEmoncms(node, data) {
        axios.post(process.env.EMONCMS_URL + "/input/post?node=" + process.env.EMONCMS_NODE + "&fulljson=" + JSON.stringify(data) + "&apikey=" + process.env.EMONCMS_APIKEY)
            .then((response) => {
                this.log.info("Data sent to Emoncms");
            })
            .catch((error) => {
                this.log.error(error);
            });
    }

    // Get data from emoncms
    async getDataFromInputInEmoncms(inputName) {
        // let response = await axios.get(process.env.EMONCMS_URL + "/feed/list.json?apikey=" +     process.env.EMONCMS_APIKEY);
        let response = await axios.get(process.env.EMONCMS_URL + "/input/get/"+ process.env.EMONCMS_NODE +"/"+inputName+"?apikey=" + process.env.EMONCMS_APIKEY);
        if (response.status != 200) { // If the status code is not 200, there was an error
            this.log.error("Error getting data from Emoncms - Status code: " + response.status + " - " + response.statusText);
            return;
        }
        this.log.info("Data received from Emoncms");
        return response.data;
    }

    async getDataFromAllInputsInEmoncms() {
        let response = await axios.get(process.env.EMONCMS_URL + "/input/list.json?apikey=" + process.env.EMONCMS_APIKEY);	
        if (response.status != 200) { // If the status code is not 200, there was an error
            this.log.error("Error getting data from Emoncms - Status code: " + response.status + " - " + response.statusText);
            return;
        }
        this.log.info("Data received from Emoncms");
        return response.data;
    }

    turnOnTomada(id) {
        this.tomadas[id-1].estado = 1;
        this.publishMqtt("tomadas", JSON.stringify({"id": id, "estado": 1}));
        const obj = { ["tomada" + id]: '1' };
        this.sendDataToEmoncms(1, obj);
        this.log.info("Tomada " + id + " ligada!");
    }

    turnOffTomada(id) {
        this.tomadas[id-1].estado = 0;
        this.publishMqtt("tomadas", JSON.stringify({"id": id, "estado": 0}));
        const obj = { ["tomada" + id]: '0' };
        this.sendDataToEmoncms(1, obj);
        this.log.info("Tomada " + id + " desligada!");
    }

    turnOnAllTomadas() {
        this.tomadas.forEach(tomada => {
            this.turnOnTomada(tomada.id);
        });
    }

    turnOffAllTomadas() {
        this.tomadas.forEach(tomada => {
            this.turnOffTomada(tomada.id);
        });
    }

    // create endpoints for the API 'api/automaticMode'
    async createEndpoints() {
        this.app.get('/api/automaticMode', (req, res) => {
            res.send(this.automaticMode.state);
        });

        this.app.post('/api/automaticMode', (req, res) => {
            this.automaticMode.state = req.body.automaticMode;
            // expect 1 or 0
            if (req.body.automaticMode == undefined || (req.body.automaticMode != 1 && req.body.automaticMode != 0)) {
                res.status(400).send("Bad request");
                return;
            }
            res.send(this.automaticMode.state);
        });

        this.app.get('/api/automaticMode/temperatura', (req, res) => {
            res.send(this.automaticMode.temperatura);
        });

        this.app.post('/api/automaticMode/temperatura', (req, res) => {
            // excepcted {"min": 15, "max": 25}
            if (req.body.min == undefined || req.body.max == undefined || req.body.min > req.body.max || req.body.min < 0 || req.body.max > 100) {
                res.status(400).send("Bad request");
                return;
            }
            this.automaticMode.temperatura = req.body;
        });

        this.app.get('/api/automaticMode/lux', (req, res) => {
            res.send(this.automaticMode.lux);
        });

        this.app.post('/api/automaticMode/lux', (req, res) => {
            // excepcted {"min": 15, "max": 25}
            if (req.body.min == undefined || req.body.max == undefined || req.body.min > req.body.max || req.body.min < 0 || req.body.max > 100) {
                res.status(400).send("Bad request");
                return;
            }
            this.automaticMode.lux = req.body;
        });

    }

    // Start the server
    async start() {
        this.app.listen(this.port, () => {
            this.log.info('Server running on port ' + this.port);
        });

        this.createEndpoints();

        // subscribe to the topic "sensor/temperatura" and "sensor/humidade" and "sensor/lux" in the MQTT broker and send the data to emoncms
        this.connectMqtt("localhost", 1884); // connect to the MQTT broker
        this.subscribeMqtt("sensor/temperatura", async (topic, message) => {
            this.sendDataToEmoncms(1, { "temperatura": parseFloat(message) });
            console.log("temperatura: " + message);

            // if temperature is below 15ºC, turn off all tomadas
            if (this.automaticMode.state && parseFloat(message) < this.automaticMode.temperatura.min) {
                this.log.info(`Ligar tomadas! Temperatura abaixo de ${this.automaticMode.temperatura.min}ºC`);
                console.log(`Ligar tomadas! Temperatura abaixo de ${this.automaticMode.temperatura.min}ºC`);
                this.turnOnAllTomadas();
            } else if (this.automaticMode.state && parseFloat(message) > this.automaticMode.temperatura.max) {
                this.log.info(`Desligar tomadas! Temperatura acima de ${this.automaticMode.temperatura.max}ºC`);
                console.log(`Desligar tomadas! Temperatura acima de ${this.automaticMode.temperatura.max}ºC`);
                this.turnOffAllTomadas();
            }
        });
        this.subscribeMqtt("sensor/humidade", async (topic, message) => {
            this.sendDataToEmoncms(1, { "humidade": parseFloat(message) });
            console.log("humidade: " + message);
        });
        this.subscribeMqtt("sensor/lux", async (topic, message) => {
            this.sendDataToEmoncms(1, { "lux": parseFloat(message) });
            console.log("lux: " + message);
            if (this.automaticMode.state && parseFloat(message) < this.automaticMode.lux.min) {
                console.log(`Ligar luzes! Lux abaixo de ${this.automaticMode.lux.min}`);
                this.log.info(`Ligar luzes! Lux abaixo de ${this.automaticMode.lux.min}`);
            } else if (this.automaticMode.state && parseFloat(message) > this.automaticMode.lux.max) {
                console.log(`Desligar luzes! Lux acima de ${this.automaticMode.lux.max}`);
                this.log.info(`Desligar luzes! Lux acima de ${this.automaticMode.lux.max}`);
            }
        });
    }
}

let server = new Server();
server.start();

