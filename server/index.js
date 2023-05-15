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
                default: { appenders: ['console', 'file'], level: 'debug' }
            }
        });
        this.log = log4js.getLogger("Server log");
        this.log.level = 'debug';
        this.log.info('Server started');


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
    sbuscribeMqtt(topicToSubscribe, onMessage = async (topic, message) => { console.log(topic + " - " + message); this.log.info(topic + " - " + message); }) {
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

    // Start the server
    async start() {
        // this.sendDataToEmoncms(1, { "tomada1": 1, "tomada2": 0 });
        // console.log((await this.getDataFromInputInEmoncms("tomada1")).value);
        console.log((await this.getDataFromAllInputsInEmoncms()));
    }
}

let server = new Server();
server.start();

