const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables
const ip = require("ip"); // Get current ip address
const Server = require('./index.js');
const Tomada = require('./tomada.js');
const cors = require('cors');

class BackEnd {
    constructor(server) {
        this.ip = ip.address();
        this.port = process.env.BACKEND_PORT || 3000;
        this.backend = express();
        this.backend.use(cors());
        this.backend.use(express.json());
        this.backend.use(express.urlencoded({ extended: true }));
        
        this.server = server;

        this.backend.listen(this.port, () => {
            console.log(`Backend listening on port ${this.port}`);
        });

        this.createEndpoints();
    }

    createEndpoints() {
        this.backend.get('/api/tomada/:id', (req, res) => {
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
            this.server.automaticMode.state = true;
            res.status(200).send('Automatic Mode ligado');
        });

        // desligar automatic Mode
        this.backend.get('/api/automaticMode/desligar', (req, res) => {
            this.server.automaticMode.state = false;
            res.status(200).send('Automatic Mode desligado');
        });

        // get automatic Mode state
        this.backend.get('/api/automaticMode', (req, res) => {
            res.send(this.server.automaticMode);
        });
    }
}

module.exports = BackEnd;