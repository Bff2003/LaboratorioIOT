// Wifi
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
const char* ssid = "sensornet";
const char* password = "sensor123";
WiFiClient espClient = WiFiClient();

#include <RCSwitch.h>
RCSwitch mySwitch = RCSwitch(); // Instância o objeto mySwitch


// web request
#include <ESP8266HTTPClient.h>
HTTPClient http;


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
};

void enviarFrequencia(String tomada){
    mySwitch.sendTriState(tomada.c_str());
}

// array de tomadas
Tomada tomadas[3] = {
    Tomada("0FFF0FFFFFFF", "0FFF0FFFFFF0"),
    Tomada("0FFFFF0FFFFF", "0FFFFF0FFFF0"),
    Tomada("0FFFFFFF0FFF", "0FFFFFFF0FF0")
};

void setup_wifi() {
  delay(10);
  // Conexão com a rede WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void setup(){
    Serial.begin(9600);

    // setup wifi
    setup_wifi();
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

int getTomadaValue(int tomadaID) {
  // URL da requisição
  String url = "http://emoncms.org/input/get/tomadas/tomada" + String(tomadaID) + "?apikey=edaca87fdb9489eaf36b69a2ac42b36d";

  // Inicializa o objeto HTTPClient
  HTTPClient http;

  http.begin(espClient, url);

  // Faz a requisição GET
  int httpCode = http.GET();

  if (httpCode == HTTP_CODE_OK) {
    // Obtém a resposta da requisição
    String response = http.getString();

    // Faz o parse do JSON da resposta
    DynamicJsonDocument jsonDoc(1024); // Tamanho máximo do JSON

    DeserializationError error = deserializeJson(jsonDoc, response);

    if (error) {
      Serial.print("Erro no parse do JSON: ");
      Serial.println(error.c_str());
      return -1; // Retorna um valor inválido para indicar erro
    }

    // Extrai o valor da tomada do JSON
    int tomadaValue = jsonDoc["value"];
    
    return tomadaValue;
  } else {
    Serial.print("Erro na requisição HTTP: ");
    Serial.println(httpCode);
    return -1; // Retorna um valor inválido para indicar erro
  }

  // Libera os recursos do objeto HTTPClient
  http.end();
}


void loop(){
    Serial.print("Tomada 1: ");
    int tomada1_estado = getTomadaValue(1);
    Serial.println(tomada1_estado);
    if(tomada1_estado == 1){
        tomadas[0].ligar();
    }else if(tomada1_estado == 0){
        tomadas[0].desligar();
    } else if(tomada1_estado == -1){
        Serial.println("Erro ao obter estado da tomada 1");
    }

    Serial.println("-----");
    Serial.print("Tomada 2: ");
    int tomada2_estado = getTomadaValue(2);
    Serial.println(tomada2_estado);
    if(tomada2_estado == 1){
        tomadas[1].ligar();
    }else if(tomada2_estado == 0){
        tomadas[1].desligar();
    } else if(tomada2_estado == -1){
        Serial.println("Erro ao obter estado da tomada 2");
    }
    delay(1000);
}