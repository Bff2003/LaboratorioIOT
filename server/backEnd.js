const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables
const ip = require("ip"); // Get current ip address
const Server = require('./index.js');
const Tomada = require('./tomada.js');
const cors = require('cors');

const Logger = require('./logger.js'); // Logger class

class BackEnd {
    constructor(server) {
        this.log = Logger.createLogger("BackEnd");
        this.ip = process.env.BACKEND_IP || ip.address();
        this.port = process.env.BACKEND_PORT || 3000;
        this.backend = express();
        this.backend.use(cors());
        this.backend.use(express.json());
        this.backend.use(express.urlencoded({ extended: true }));
        
        this.server = server;

        this.backend.listen(this.port, () => {
            console.log(`Backend listening on port ${this.port}`);
            this.log.info(`Backend listening ${process.env.BACKEND_IP}:${this.port}`);
        });

        this.createEndpoints();
    }

    createEndpoints() {
        this.backend.get('/api/tomada/:id', (req, res) => {
            this.log.info("GET /api/tomada/:id - " + req.ip);
            let found = false;
            this.server.tomadas.forEach(tomada => {
                if (tomada.id == req.params.id) {
                    found = true;
                    res.status(200).send(tomada.state);
                    return; // Add this line to exit the loop
                }
            });
            if (!found) {
                res.status(404).send('Tomada não encontrada');
            }
        });

        this.backend.get('/api/tomada/:id/ligar', (req, res) => {
            if (this.server.automaticMode.state == true){ res.status(400).send("Automatic Mode Active!"); return;};
            this.log.info("GET /api/tomada/:id/ligar - " + req.ip);
            let found = false;
            this.server.tomadas.forEach(tomada => {
                if (tomada.id == req.params.id) {
                    tomada.turnOn();
                    found = true;
                    res.status(200).send('Tomada ligada');
                }
            });
            if (!found) res.status(404).send('Tomada não encontrada');
        });

        this.backend.get('/api/tomada/:id/desligar', (req, res) => {
            if (this.server.automaticMode.state == true){ res.status(400).send("Automatic Mode Active!"); return;};
            this.log.info("GET /api/tomada/:id/desligar - " + req.ip);
            let found = false;
            this.server.tomadas.forEach(tomada => {
                if (tomada.id == req.params.id) {
                    tomada.turnOff();
                    found = true;
                    res.status(200).send('Tomada desligada');
                }
            });
            if (!found) res.status(404).send('Tomada não encontrada');
        });

        // ligar automatic Mode
        this.backend.get('/api/automaticMode/ligar', (req, res) => {
            this.log.info("GET /api/automaticMode/ligar - " + req.ip);
            this.server.automaticMode.state = true;
            res.status(200).send('Automatic Mode ligado');
        });

        // desligar automatic Mode
        this.backend.get('/api/automaticMode/desligar', (req, res) => {
            this.log.info("GET /api/automaticMode/desligar - " + req.ip);
            this.server.automaticMode.state = false;
            res.status(200).send('Automatic Mode desligado');
        });

        // automatic mode get min and max values temperatura
        this.backend.get('/api/automaticMode/temperatura/getMinMax', (req, res) => {
            this.log.info("GET /api/automaticMode/temperatura/getMinMax - " + req.ip);
            res.send({
                min: this.server.automaticMode.temperatura.min,
                max: this.server.automaticMode.temperatura.max
            });
        });

        // automatic mode get min and max values lux
        this.backend.get('/api/automaticMode/luz/getMinMax', (req, res) => {
            this.log.info("GET /api/automaticMode/luz/getMinMax - " + req.ip);
            res.send({
                min: this.server.automaticMode.luz.min,
                max: this.server.automaticMode.luz.max
            });
        });

        // automatic mode set min and max values temperatura
        this.backend.post('/api/automaticMode/temperatura/setMinMax', (req, res) => {
            this.log.info("POST /api/automaticMode/temperatura/setMinMax - " + req.ip);
            this.server.automaticMode.temperatura.min = req.body.min;
            this.server.automaticMode.temperatura.max = req.body.max;
            res.status(200).send('Automatic Mode temperatura min and max values set');
        });

        // automatic mode set min and max values lux
        this.backend.post('/api/automaticMode/luz/setMinMax', (req, res) => {
            this.log.info("POST /api/automaticMode/luz/setMinMax - " + req.ip);
            this.server.automaticMode.luz.min = req.body.min;
            this.server.automaticMode.luz.max = req.body.max;
            res.status(200).send('Automatic Mode lux min and max values set');
        });

        // get automatic Mode state
        this.backend.get('/api/automaticMode', (req, res) => {
            this.log.info("GET /api/automaticMode - " + req.ip);
            res.send(this.server.automaticMode);
        });

        this.backend.get('/api/sensors', (req, res) => {
            this.log.info("GET /api/sensors - " + req.ip);
            res.send({
                temperatura: this.server.temperatura,
                humidade: this.server.humidade,
                lux: this.server.lux
            });
        });
    }
}

module.exports = BackEnd;