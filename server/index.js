const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables
const ip = require("ip"); // Get current ip address

const Tomada = require('./tomada.js'); // Tomada class
const AutomaticMode = require('./automaticMode.js'); // AutomaticMode class
const FrontEnd = require('./frontEnd.js'); // FrontEnd class
const BackEnd = require('./backEnd.js'); // BackEnd class
const EmonCMS = require('./emonCMS.js'); // EmonCMS class


class Server {
    static mqttClient = Server.connectMqtt("localhost", 1884);

    constructor(tomadas = []) {
        this.frontEnd = new FrontEnd();
        this.backEnd = new BackEnd(this);
        this.tomadas = tomadas;
        this.automaticMode = new AutomaticMode(tomadas);
        // this.mqttClient = this.connectMqtt("localhost", 1884);
        this.emonCMS = new EmonCMS();

        Tomada.mqtt = Server.mqttClient;

        // data 
        this.temperatura = 0;
        this.humidade = 0;
        this.lux = 0;

        // Subscreve a todos os tópicos
        Server.mqttClient.subscribe("sensor/temperatura");
        Server.mqttClient.subscribe("sensor/humidade");
        Server.mqttClient.subscribe("sensor/lux");

        Server.mqttClient.on('message', (topic, message) => {
            this.mqttOnMessage(topic, message);
        });
    }

    mqttOnMessage(topic, message) {
        console.log(topic + ": " + message.toString());
        if (topic == "sensor/temperatura") {
            EmonCMS.sendData("sensores", {"temperatura": message.toString()});
            this.temperatura = message.toString();
            this.automaticMode.onTemperaturaChange(message.toString());
            this.frontEnd.onTemperaturaChange(message.toString());
        } else if (topic == "sensor/humidade") {
            EmonCMS.sendData("sensores", {"humidade": message.toString()});
            this.humidade = message.toString();
            this.frontEnd.onHumidadeChange(message.toString());
        } else if (topic == "sensor/lux") {
            EmonCMS.sendData("sensores", {"lux": message.toString()});
            this.lux = message.toString();
            this.automaticMode.onLuzChange(message.toString());
            this.frontEnd.onLuzChange(message.toString());
        }
    }

    static connectMqtt(host, port) {
        let mqttClient = mqtt.connect("mqtt://" + host + ":" + port);
        mqttClient.on('error', (err) => {
            this.mqttClient.end();
        });
        mqttClient.on('connect', () => {
            console.log('MQTT client connected on mqtt://' + host + ':' + port);
        });
        return mqttClient;
    }
}

module.exports = Server;

let tomadas = [new Tomada(1, false), new Tomada(2, false)]
let server = new Server(tomadas);