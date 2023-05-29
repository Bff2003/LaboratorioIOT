// ###############################
// # Bibliotecas e configurações #
// ###############################

#include <ArduinoJson.h>

// sensor de temperatura
#include <DHT.h>
#define DHTPIN 5 // D1
DHT dht(DHTPIN, DHT22);

// luz
#include <Wire.h>
#include <BH1750.h>
BH1750 lightMeter;

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

// Sensor de temperatura
void callback(char* topic, byte* payload, unsigned int length) {
  // Verificar se o tópico é o desejado
  if (strcmp(topic, "tomadas") == 0) {
    // Criar uma string para armazenar o payload
    char mensagem[length + 1]; // +1 para o caractere nulo de terminação da string

    // Copiar os bytes do payload para a string
    memcpy(mensagem, payload, length);
    mensagem[length] = '\0'; // Adicionar o caractere nulo de terminação da string

    // Processar a mensagem recebida
    Serial.print("Mensagem recebida: ");
    Serial.println(mensagem);
  }
}

float lerTemperatura(){
    Serial.print("Temperatura: ");
    Serial.println(dht.readTemperature());
    return dht.readTemperature();
}

float lerUmidade(){
    Serial.print("Umidade: ");
    Serial.println(dht.readHumidity());
    return dht.readHumidity();
}

// Sensor de luminosidade
uint16_t lerLux(){
    Serial.print("Luminuisidade: ");
    Serial.println(lightMeter.readLightLevel());
    return lightMeter.readLightLevel();
}

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

// ###############################
// # Setup e loop                #
// ###############################

void setup(){
    Serial.begin(9600);
    Serial.println("Ola1");

    // setup temperatura
    dht.begin();

    // setup luz
    Wire.begin(4, 0); // SDA = GPIO4 (D2), SCL = GPIO0 (D3) 
    lightMeter.begin();

    // setup wifi
    setup_wifi();

    // Inicializa o cliente MQTT
    client.setServer(mqtt_server, 1884);
    client.setCallback(callback);
}

void loop(){
    // Verifica se o cliente está conectado ao servidor MQTT
    if (!client.connected()) {
        reconnect();
    }
    // Verifica se há mensagens para serem enviadas
    client.loop();
    // Envia dados
    client.publish("sensor/temperatura", String(lerTemperatura()).c_str());
    client.publish("sensor/lux", String(lerLux()).c_str());
    client.publish("sensor/humidade", String(lerUmidade()).c_str());
    client.subscribe("tomadas");

    // Aguarda 1 segundo
    delay(1000);
}
