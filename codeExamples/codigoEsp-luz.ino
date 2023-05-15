#include <Wire.h>
#include <BH1750.h>

BH1750 lightMeter;

void setup() {
  Serial.begin(9600);
  Wire.begin(4, 0); // SDA = GPIO4 (D2), SCL = GPIO0 (D3) 
  lightMeter.begin();
}

void loop() {
  uint16_t lux = lightMeter.readLightLevel();
  Serial.print("Lux: ");
  Serial.println(lux);
  delay(1000);
}