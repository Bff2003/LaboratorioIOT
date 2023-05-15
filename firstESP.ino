// Sensor de luminosidade0
#include <BH1750.h>
// int pinBH1750 = 0;


// sensor de temperatura
#include <DHT.h>
// int pinDHT11 = 2;

// Wifi
#include <ESP8266Wifi.h>

// MQTT
#include <PubSubClient.h>

// função para ler o sensor de temperatura
float lerTemperatura(){
    return dht.readTemperature();
}

const char* ssid = "sensornet";
const char* password = 'sensor123';

// Servidor MQTT
const char* mqtt_server = ""
const char* mqtt_topic_temperatura = "sensor/temperatura";
const char* mqtt_topic_lux = "sensor/lux";

// Cliente MQTT
WiFiClient espClient = WiFiClient();
PubSubClient client = PubSubClient(espClient);

// Sensor de luminosidade
BH1750 lightMeter(0x23);

// Sensor de temperatura
#define DHTPIN 2

// DHT 11
DHT dht(DHTPIN, DHT11);

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
      client.subscribe(mqtt_topic);
    } else {
      // Aguardar 5 segundos antes de tentar novamente
      delay(5000);
    }
  }
}

void setup() {

  // pinos
  // pinMode(pinBH1750, INPUT);
  // pinMode(pinDHT11, INPUT);

  // Inicializa o sensor de luminosidade
  lightMeter.begin();

  // Inicializa o sensor de temperatura
  dht.begin();

  // Inicializa o Wifi
  setup_wifi();

  // Inicializa o cliente MQTT
  client.setServer(mqtt_server, 1883);
}

void loop() {
    // Verifica se o cliente está conectado ao servidor MQTT
    if (!client.connected()) {
        reconnect();
    }
    // Verifica se há mensagens para serem enviadas
    client.loop();
    
    // Leitura do sensor de luminosidade
    float lux = lightMeter.readLightLevel();
    
    // Leitura do sensor de temperatura
    float temperatura = lerTemperatura();
    
    // Publica a mensagem de temperatura no servidor MQTT
    client.publish(mqtt_topic_temperatura, String(temperatura).c_str());

    // Publica a mensagem de luz no servidor MQTT
    client.publish(mqtt_topic_lux, String(lux).c_str());
    
    // Aguarda 1 segundo
    delay(1000);
}