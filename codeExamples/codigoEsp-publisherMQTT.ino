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



// ###############################
// # Setup e loop                #
// ###############################

void setup(){
    Serial.begin(9600);

    // setup temperatura
    dht.begin();

    // setup luz
    Wire.begin(4, 0); // SDA = GPIO4 (D2), SCL = GPIO0 (D3) 
    lightMeter.begin();

    // setup wifi
    setup_wifi();

    // Inicializa o cliente MQTT
    client.setServer(mqtt_server, 1883);
}

void loop(){
    // Verifica se o cliente está conectado ao servidor MQTT
    if (!client.connected()) {
        reconnect();
    }
    // Verifica se há mensagens para serem enviadas
    client.loop();

    // Envia dados
    client.publish("<<topico/sub-topico>>", "<<Mensagem a enviar>>");

    // Aguarda 1 segundo
    delay(1000);
}
