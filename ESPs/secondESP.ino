#include <RCSwitch.h>
#include <ArduinoJson.h>

RCSwitch mySwitch = RCSwitch(); // Instância o objeto mySwitch

// Wifi
#include <ESP8266WiFi.h>
const char* ssid = "sensornet";
const char* password = "sensor123";
WiFiClient espClient = WiFiClient();

// MQTT
#include <PubSubClient.h>
const char* mqtt_server = "192.168.1.158";
PubSubClient client = PubSubClient(espClient);


// ###############################
// # Funções                      #
// ###############################

// Wifi
void setup_wifi() {
  delay(10);
  // Conexão com a rede WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
}

void reconnect() {
  // Loop até que o cliente esteja conectado ao servidor MQTT
  while (!client.connected()) {
    // Conexão com o servidor MQTT
    if (client.connect("ESP8266Client")) {
      // Assinatura do tópico MQTT
      client.subscribe("sensor/temperatura");
    } else {
      // Aguardar 5 segundos antes de tentar novamente
      delay(1000);
    }
  }
}

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
};

// array de tomadas
Tomada tomadas[3] = {
    Tomada("0FFF0FFFFFFF", "0FFF0FFFFFF0"),
    Tomada("0FFFFF0FFFFF", "0FFFFF0FFFF0"),
    Tomada("0FFFFFFF0FFF", "0FFFFFFF0FF0")
};

// Sensor de temperatura
void callback(char* topic, byte* payload, unsigned int length) {
  
  // Verificar se o tópico é o desejado
  if (strcmp(topic, "tomadas") == 0) {
    // Criar uma string para armazenar o payload
    char mensagem[length + 1]; // +1 para o caractere nulo de terminação da string

    // Copiar os bytes do payload para a string
    memcpy(mensagem, payload, length);
    mensagem[length] = '\0'; // Adicionar o caractere nulo de terminação da string

     // Fazer o parse do JSON
    DynamicJsonDocument jsonDoc(1024); // Tamanho máximo do JSON

    DeserializationError error = deserializeJson(jsonDoc, mensagem);

    // Verificar erros de parse
    if (error) {
      Serial.print("Erro no parse do JSON: ");
      Serial.println(error.c_str());
      return;
    }

    // Extrair os valores do JSON
    int id = jsonDoc["id"];
    int estado = jsonDoc["estado"];

    // Fazer algo com os valores extraídos do JSON
    Serial.print("Tomada recebida ID: ");
    Serial.println(id);
    Serial.print("Estado da tomada: ");
    Serial.println(estado);

    if (estado == 1){
        tomadas[id-1].ligar();
    } else {
        tomadas[id-1].desligar();
    }
  }
}

void setup(){
    Serial.begin(9600); // Inicia a comunicação serial
    mySwitch.enableTransmit(2); // Define o pino D4 (GPIO2) como pino de transmissão
    // setup wifi
    setup_wifi();

    // Inicializa o cliente MQTT
    client.setServer(mqtt_server, 1884);
    client.setCallback(callback);
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
    // Verifica se o cliente está conectado ao servidor MQTT
    if (!client.connected()) {
        reconnect();
    }
    
    // Verifica se há mensagens para serem enviadas
    client.loop();
    client.subscribe("tomadas");
    
    // Aguarda 1 segundo
    delay(1000);
}