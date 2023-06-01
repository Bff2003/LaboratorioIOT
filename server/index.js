const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables

class Server {
    constructor() {
        this.frontend = express(); // Create the website server
        this.backend = express(); // Create the backend server
        this.mqttClient = this.connectMqtt("localhost", 1884);
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
        
        this.tomadas = [{"id": 1, "estado": 0}, {"id": 2, "estado": 0}]
        
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

        this.lastData = {
            "temperatura": 0,
            "humidade": 0,
            "lux": 0
        }
        // this.getInitialDataFromEmocms();

        // for forntend
        this.frontend.set('view engine', 'ejs');
        console.log(__dirname+'\\views');
        this.frontend.set('views', __dirname + '\\views');
    }

    async getInitialDataFromEmocms() {
        this.lastData = {
            "temperatura": (await this.getDataFromInputInEmoncms("1", "temperatura")).value,
            "humidade": (await this.getDataFromInputInEmoncms("1", "humidade")).value,
            "lux": (await this.getDataFromInputInEmoncms("1", "lux")).value
        }

        this.tomadas.forEach(async (tomada) => {
            tomada.estado = (await this.getDataFromInputInEmoncms("1", "tomada" + tomada.id)).value;
        });
        console.log(this.tomadas);
        console.log(this.lastData);
    }

    connectMqtt(website, port) {
        let mqttClient = mqtt.connect("mqtt://" + website + ":" + port);
        mqttClient.on('error', (err) => {
            this.log.error(err);
            this.mqttClient.end();
        });
        mqttClient.on('connect', () => {
            this.log.info('MQTT client connected');
        });
        return mqttClient;
    }

    // Publish a message to a topic MQTT
    publishMqtt(topic, message) {
        this.mqttClient.publish(topic, message);
        this.log.info('Message sent to topic: ' + topic + " - " + message);
    }

    // Send some data to a node in emoncms
    sendDataToEmoncms(node, data) {
        axios.post(process.env.EMONCMS_URL + "/input/post?node=" + node + "&fulljson=" + JSON.stringify(data) + "&apikey=" + process.env.EMONCMS_APIKEY)
            .then((response) => {
                this.log.info("Data sent to Emoncms");
            })
            .catch((error) => {
                this.log.error(error);
            });
    }

    // Get data from emoncms
    async getDataFromInputInEmoncms(node, inputName) {
        // let response = await axios.get(process.env.EMONCMS_URL + "/feed/list.json?apikey=" +     process.env.EMONCMS_APIKEY);
        let response = await axios.get(process.env.EMONCMS_URL + "/input/get/"+ node +"/"+inputName+"?apikey=" + process.env.EMONCMS_APIKEY);
        if (response.status != 200) { // If the status code is not 200, there was an error
            this.log.error("Error getting data from Emoncms - Status code: " + response.status + " - " + response.statusText);
            return;
        }
        this.log.info("Data received from Emoncms");
        return response.data;
    }

    // Get all inputs from node in  emoncms
    async getInputsFromNodeEmoncms(node) {
        // let response = await axios.get(process.env.EMONCMS_URL + "/feed/list.json?apikey=" +     process.env.EMONCMS_APIKEY);
        let response = await axios.get(process.env.EMONCMS_URL + "/input/get/"+ node +"?apikey=" + process.env.EMONCMS_APIKEY);
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
        this.sendDataToEmoncms("tomadas", obj);
        this.log.info("Tomada " + id + " ligada!");
    }

    turnOffTomada(id) {
        this.tomadas[id-1].estado = 0;
        this.publishMqtt("tomadas", JSON.stringify({"id": id, "estado": 0}));
        const obj = { ["tomada" + id]: '0' };
        this.sendDataToEmoncms("tomadas", obj);
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
    async createEndpointsBack() {
        this.backend.get('/api/automaticMode', (req, res) => {
            res.send(this.automaticMode.state);
        });

        this.backend.post('/api/automaticMode', (req, res) => {
            this.automaticMode.state = req.body.automaticMode;
            // expect 1 or 0
            if (req.body.automaticMode == undefined || (req.body.automaticMode != 1 && req.body.automaticMode != 0)) {
                res.status(400).send("Bad request");
                return;
            }
            res.send(this.automaticMode.state);
        });

        this.backend.get('/api/automaticMode/temperatura', (req, res) => {
            res.send(this.automaticMode.temperatura);
        });

        this.backend.post('/api/automaticMode/temperatura', (req, res) => {
            // excepcted {"min": 15, "max": 25}
            if (req.body.min == undefined || req.body.max == undefined || req.body.min > req.body.max || req.body.min < 0 || req.body.max > 100) {
                res.status(400).send("Bad request");
                return;
            }
            this.automaticMode.temperatura = req.body;
        });

        this.backend.get('/api/automaticMode/lux', (req, res) => {
            res.send(this.automaticMode.lux);
        });

        this.backend.post('/api/automaticMode/lux', (req, res) => {
            // excepcted {"min": 15, "max": 25}
            if (req.body.min == undefined || req.body.max == undefined || req.body.min > req.body.max || req.body.min < 0 || req.body.max > 100) {
                res.status(400).send("Bad request");
                return;
            }
            this.automaticMode.lux = req.body;
        });
    }

    async createEndpointsFront() {
        this.frontend.get('/', async (req, res) => {
            console.log(this.lastData);

            res.render('index', {
                humidade: this.lastData.humidade,
                temperatura: this.lastData.temperatura,
                lux: this.lastData.lux,
                automatico: this.automaticMode.state,
                tomada1: this.tomadas[0].estado,
                tomada2: this.tomadas[1].estado,
            });
        });
    }

    // Start the server
    async start() {
        console.log("Starting server...");
        console.log("EmonCMS URL: " + process.env.EMONCMS_URL+ "/input/view");
        this.frontend.listen(process.env.FRONTEND_PORT, () => {
            console.log("Front-end running on port " + process.env.FRONTEND_PORT);
            this.log.info('Front-end running on port ' + process.env.FRONTEND_PORT);
        });
        this.backend.listen(process.env.BACKEND_PORT, () => {
            console.log("Back-end running on port " + process.env.BACKEND_PORT);
            this.log.info('Back-end running on port ' + process.env.BACKEND_PORT);
        });

        this.createEndpointsBack(); // create endpoints for the API
        this.createEndpointsFront(); // create endpoints for the front-end

        // subscribe to the topic "sensor/temperatura" and "sensor/humidade" and "sensor/lux" in the MQTT broker and send the data to emoncms
        this.connectMqtt("localhost", 1884); // connect to the MQTT broker
        this.mqttClient.subscribe("sensor/temperatura");
        this.log.info("Subscribed to topic: sensor/temperatura");
        this.mqttClient.subscribe("sensor/humidade");
        this.log.info("Subscribed to topic: sensor/humidade");
        this.mqttClient.subscribe("sensor/lux");
        this.log.info("Subscribed to topic: sensor/lux");

        this.mqttClient.on('message', async (topic, message) => {
            if (topic == "sensor/temperatura") {
                console.log("Temperatura: " + message.toString());
                this.lastData.temperatura = message.toString();
                this.sendDataToEmoncms("sensores", {"temperatura": message.toString()});

                if (this.automaticMode.state && parseFloat(message.toString()) < this.automaticMode.temperatura.min) {
                    this.turnOnAllTomadas();
                } else if (this.automaticMode.state && parseFloat(message.toString()) > this.automaticMode.temperatura.max) {
                    this.turnOffAllTomadas();
                }
            } else if (topic == "sensor/humidade") {
                console.log("Humidade: " + message.toString());
                this.lastData.humidade = message.toString();
                this.sendDataToEmoncms("sensores", {"humidade": message.toString()});
            } else if (topic == "sensor/lux") {
                console.log("Lux: " + message.toString());
                this.lastData.lux = message.toString();
                this.sendDataToEmoncms("sensores", {"lux": message.toString()});

                if (this.automaticMode.state && parseFloat(message.toString()) < this.automaticMode.lux.min) {
                    this.turnOnAllTomadas();
                } else if (this.automaticMode.state && parseFloat(message.toString()) > this.automaticMode.lux.max) {
                    this.turnOffAllTomadas();
                }
            }
        });
    }
}

let server = new Server();
server.start();