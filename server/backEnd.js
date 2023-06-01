const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables
const ip = require("ip"); // Get current ip address

class BackEnd {
    constructor() {
        this.ip = ip.address();
        this.port = process.env.BACKEND_PORT || 3000;
        this.backend = express();
        this.backend.use(express.json());
        this.backend.use(express.urlencoded({ extended: true }));

        this.backend.listen(this.port, () => {
            console.log(`Backend listening on port ${this.port}`);
        });

        this.createEndpoints();
    }

    createEndpoints() {
    }

}

module.exports = BackEnd;