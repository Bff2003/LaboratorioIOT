# Laboratório IOT

## Ideia do Projeto 
Casa Inteligente

## Requisitos
- 2x ESP8266
- 1x Sensor de Temperatura
- 1x Sensor de Luminosidade
- 1x Transmissor de radiofrequência
- 1x Raspberry Pi
    - 1x Servidor MQTT (Mosquitto)
    - 1x NodeJS
    - 1x Servidor Web (NodeJS) 
- 1x Android APP
- 1x EmonCMS
- 2x Tomadas
- 2x Relés

## Estrutura do Projeto
- 1x ESP8266
    - 1x Sensor de Temperatura
    - 1x Sensor de Luminosidade
- 1x ESP8266
    - 1x Transmissor de radiofrequência
    - 2x Tomadas
    
## Conexões
### First ESP
- DHT22
    - GDOUT -> D1 (GPIO5)
    - VCC -> 3V3
    - GND -> GND
- GY-30
    - GND -> GND
    - ADO -> nenhum
    - SDA -> D2 (GPIO4)
    - SCL -> D3 (GPIO0)
    - VCC -> 3V3

### Second ESP
- 3x Tomada (RSL-3660R)
- 1x Sensor de RF: (XD-FST)
    - VCC -> 3.3V
    - GND -> GND
    - DATA -> D4 (GPIO2)

## APP 

- [Android APP](./APP/README.md)