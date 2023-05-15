// sensor de temperatura
#include <DHT.h>

// Sensor de temperatura
#define DHTPIN 5 // D1

// DHT 11
DHT dht(DHTPIN, DHT22);

float lerTemperatura(){
    return dht.readTemperature();
}

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
    
    // Leitura do sensor de temperatura
    float temperatura = lerTemperatura();

    Serial.println(lerTemperatura());
    
    // Aguarda 1 segundo
    delay(1000);
}
