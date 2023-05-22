/*
    1 Sensor de Radio Frequência (RF)

    1x Sensor de RF: (XD-FST)
        - VCC -> 3.3V
        - GND -> GND
        - DATA -> D4 (GPIO2)
    
    3x Tomada (RSL-3660R)
*/
#include <RCSwitch.h>

RCSwitch mySwitch = RCSwitch(); // Instância o objeto mySwitch

void enviarFrequencia(String tomada){
    mySwitch.sendTriState(tomada.c_str());
}

class Tomada {
    private:
        char* codigoOn;
        char* codigoOff;
        bool ligada;
    public:
        Tomada(char* codigoOn, char* codigoOff){
            this->codigoOn = codigoOn;
            this->codigoOff = codigoOff;
            this->ligada = false;
        }
        void ligar(){
            enviarFrequencia(this->codigoOn);
            this->ligada = true;
        }
        void desligar(){
            enviarFrequencia(this->codigoOff);
            this->ligada = false;
        }
        bool estaLigada(){
            return this->ligada;
        }
}

// array de tomadas
Tomada tomadas[3] = {
    Tomada("0FFF0FFFFFFF", "0FFF0FFFFFF0"),
    Tomada("0FFFFF0FFFFF", "0FFFFF0FFFF0"),
    Tomada("0FFFFFFF0FFF", "0FFFFFFF0FF0")
};

void setup(){
    Serial.begin(9600); // Inicia a comunicação serial
    mySwitch.enableTransmit(2); // Define o pino D4 (GPIO2) como pino de transmissão
}

void ligarTodas(){
    Serial.println("Ligando todas as tomadas");
    for(int i = 0; i < 3; i++){
        tomadas[i].ligar();
    }
}

void desligarTodas(){
    Serial.println("Desligando todas as tomadas");
    for(int i = 0; i < 3; i++){
        tomadas[i].desligar();
    }
}

void loop(){
    ligarTodas();
    delay(5000);
    desligarTodas();
}