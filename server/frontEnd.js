const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables
const ip = require("ip"); // Get current ip address

const Logger = require('./logger.js'); // Logger class

class FrontEnd {
    constructor() {

        this.log = Logger.createLogger("FrontEnd");

        this.lastDataToShow = {
            temperatura: 0,
            luz: 0,
            humidade: 0,
            tomadas: []
        };

        this.ip = process.env.FRONTEND_IP || ip.address();
        this.port = process.env.FRONTEND_PORT || 3001;
        this.frontend = express();
        this.frontend.set('view engine', 'ejs');
        this.frontend.set('views', __dirname + '\\views');

        this.frontend.listen(this.port, () => {
            console.log(`Frontend listening on port ${this.port}`);
            this.log.info(`Frontend listening ${process.env.FRONTEND_IP}:${this.port}`);
        });

        this.createEndpoints();
    }

    onHumidadeChange(humidade) {
        this.lastDataToShow.humidade = humidade;
    }

    onTemperaturaChange(temperatura) {
        this.lastDataToShow.temperatura = temperatura;
    }

    onLuzChange(luz) {
        this.lastDataToShow.luz = luz;
    }

    createEndpoints() {
        this.frontend.get('/', (req, res) => {
            this.log.info("GET / - " + req.ip);
            res.render('index', {
                humidade: this.lastDataToShow.humidade,
                temperatura: this.lastDataToShow.temperatura,
                lux: this.lastDataToShow.luz,
                tomadas: this.lastDataToShow.tomadas, 
                ip: process.env.FRONTEND_IP, 
                backendPort: process.env.BACKEND_PORT 
            });
        });
    }

}

module.exports = FrontEnd;