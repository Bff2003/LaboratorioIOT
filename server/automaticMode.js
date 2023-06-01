const log4js = require('log4js'); // Logging
const mqtt = require('mqtt'); // MQTT client
const express = require('express'); // Website server
const axios = require('axios'); // do http requests
const env = require('dotenv').config(); // Environment variables
const ip = require("ip"); // Get current ip address

const Tomada = require('./tomada');

class AutomaticMode {
    constructor(tomadas = []){
        this.state = true;
        this.tomadas = tomadas;

        this.temperatura = {
            min: 0,
            max: 0
        };

        this.luz = {
            min: 0,
            max: 0
        }
    }

    setTemperatura(min, max) {
        this.temperatura.min = min;
        this.temperatura.max = max;
    }

    setLuz(min, max) {
        this.luz.min = min;
        this.luz.max = max;
    }

    setLuz(min, max) {
        this.luz.min = min;
        this.luz.max = max;
    }

    addTomada(tomada) {
        this.tomadas.push(tomada);
    }

    turnOnAll() {
        this.tomadas.forEach(tomada => {
            tomada.turnOn();
        });
    }

    turnOffAll() {
        this.tomadas.forEach(tomada => {
            tomada.turnOff();
        });
    }

    onTemperaturaChange(temperatura) {
        if (this.state && temperatura < this.temperatura.min) {
            console.log("Temperatura: " + temperatura + " < " + this.temperatura.min);
            this.turnOnAll();
        } else if (this.state && temperatura > this.temperatura.max) {
            console.log("Temperatura: " + temperatura + " > " + this.temperatura.max);
            this.turnOffAll();
        }
    }

    onLuzChange(luz) {
        if (this.state && luz < this.luz.min) {
            console.log("Luz: " + luz + " < " + this.luz.min);
            this.turnOnAll();
        } else if (this.state && luz > this.luz.max) {
            console.log("Luz: " + luz + " > " + this.luz.max);
            this.turnOffAll();
        }
    }
}

module.exports = AutomaticMode;