const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables
const ip = require("ip"); // Get current ip address

const Logger = require('./logger.js'); // Logger class

class EmonCMS {

    static log = Logger.createLogger("EmonCMS");

    constructor() {
    }

    // Send some data to a node in emoncms
    static sendData(node, data) {
        EmonCMS.log.info(`Sending data to Emoncms - Node: ${node} - Data: ${JSON.stringify(data)}`); 
        // data = {"temperatura": message.toString()}
        axios.post(process.env.EMONCMS_URL + "/input/post?node=" + node + "&fulljson=" + JSON.stringify(data) + "&apikey=" + process.env.EMONCMS_APIKEY)
            .then((response) => {
                // this.log.info("Data sent to Emoncms - Status code: " + response.status);
                // console.log("Data sent to Emoncms - Status code: " + response.status);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // Get data
    static getData(node, inputName) {
        EmonCMS.log.info(`Getting data from Emoncms - Node: ${node} - Input: ${inputName}`);
        // let response = await axios.get(process.env.EMONCMS_URL + "/feed/list.json?apikey=" +     process.env.EMONCMS_APIKEY);
        let response = axios.get(process.env.EMONCMS_URL + "/input/get/" + node + "/" + inputName + "?apikey=" + process.env.EMONCMS_APIKEY);
        if (response.status != 200) { // If the status code is not 200, there was an error
            // this.log.error("Error getting data from Emoncms - Status code: " + response.status + " - " + response.statusText);
            return;
        }
        // this.log.info("Data received from Emoncms");
        return response.data;
    }

    // Get data from a node
    static getData(node) {
        EmonCMS.log.info(`Getting data from Emoncms - Node: ${node}`);
        let response = axios.get(process.env.EMONCMS_URL + "/input/list.json?node=" + node + "&apikey=" + process.env.EMONCMS_APIKEY);
        if (response.status != 200) { // If the status code is not 200, there was an error
            // this.log.error("Error getting data from Emoncms - Status code: " + response.status + " - " + response.statusText);
            return;
        }
        // this.log.info("Data received from Emoncms");
        return response.data;
    }
}

module.exports = EmonCMS;