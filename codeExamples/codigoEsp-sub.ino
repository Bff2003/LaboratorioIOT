// ###########################
// Subscriber MQTT
// ###########################

// Wifi
#include <ESP8266WiFi.h>
const char* ssid = "sensornet";
const char* password = "sensor123";
WiFiClient espClient = WiFiClient();

// MQTT
#include <PubSubClient.h>
const char* mqtt_server = "<<IP DO SERVIDOR MQTT>>";
PubSubClient client = PubSubClient(espClient);

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
      //client.subscribe(mqtt_topic);
    } else {
      // Aguardar 5 segundos antes de tentar novamente
      delay(5000);
    }
  }
}

// onMessage
void callback(char* topic, byte* payload, unsigned int length) {
    // imprime o tópico
    Serial.print("Tópico: ");
    Serial.println(topic);

    // imprime a mensagem
    Serial.print("Mensagem: ");
    for (int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();
}

// ###############################
// # Setup e loop                #
// ###############################

void setup(){
    Serial.begin(9600);

    // setup wifi
    setup_wifi();

    // Inicializa o cliente MQTT
    client.setServer(mqtt_server, 1883);
    client.setCallback(callback);
    client.subscribe("tomadas");
}

void loop(){
    // Verifica se o cliente está conectado ao servidor MQTT
    if (!client.connected()) {
        reconnect();
    }

    // Verifica se há mensagens para serem enviadas
    client.loop();

    // Aguarda 1 segundo
    delay(1000);
}
