// Wifi
#include <ESP8266WiFi.h>
const char* ssid = "sensornet";
const char* password = "sensor123";
WiFiClient espClient = WiFiClient();

// web request
#include <ESP8266HTTPClient.h>
HTTPClient http;

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

void sendHttpGetRequest(String url){
    // do a request to a emoncms
    http.begin(url);

    // start connection and send HTTP header
    int httpCode = http.GET();

    // httpCode will be negative on error
    if(httpCode > 0) {
        // HTTP header has been send and Server response header has been handled
        Serial.printf("[HTTP] GET... code: %d\n", httpCode);

        // file found at server
        if(httpCode == HTTP_CODE_OK) {
            String payload = http.getString();
            Serial.println(payload); // printa o resultado da requisição
        }
    } else {
        Serial.printf("[HTTP] GET... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
}

void loop(){

    // do a request to a emoncms
    sendHttpGetRequest("http://<<IP DO SERVIDOR EMONCMS>>/input/post.json?node=1&json=<<JSON DATA>>");
}