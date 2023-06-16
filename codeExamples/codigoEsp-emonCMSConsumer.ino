// Wifi
#include <ESP8266WiFi.h>
#include <ArduinoJson.h>
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

int getTomadaValue(int tomadaID) {
  // URL da requisição
  String url = "http://emoncms.org/input/get/tomadas/tomada" + String(tomadaID) + "?apikey=your_api_key";

  // Inicializa o objeto HTTPClient
  HTTPClient http;

  // Faz a requisição GET
  int httpCode = http.GET(url);

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
    Serial.println(getTomadaValue(1));
    Serial.println("-----");
    Serial.print("Tomada 2: ");
    Serial.println(getTomadaValue(2));
    delay(1000);
}