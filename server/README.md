# Servidor
## Endpoints
### GET /api/automaticMode
Retorna o estado do modo automático
#### Response
1 se o modo automático estiver ativo, 0 caso contrário
### POST /api/automaticMode
Ativa ou desativa o modo automático
#### Request
1 para ativar, 0 para desativar
#### Response
1 se o modo automático estiver ativo, 0 caso contrário
### GET /api/automaticMode/temperatura
Retorna o mínimo e o máximo de temperatura para o modo automático
#### Response
```json
{
    "min": 0,
    "max": 0
}
```
### POST /api/automaticMode/temperatura
Define o mínimo e o máximo de temperatura para o modo automático
#### Request
```json
{
    "min": 0,
    "max": 0
}
```
#### Response
```json
{
    "min": 0,
    "max": 0
}
```
### GET /api/automaticMode/lux
Retorna o mínimo e o máximo de luminosidade para o modo automático
#### Response
```json
{
    "min": 0,
    "max": 0
}
```
### POST /api/automaticMode/lux
Define o mínimo e o máximo de luminosidade para o modo automático
#### Request
```json
{
    "min": 0,
    "max": 0
}
```
#### Response
```json
{
    "min": 0,
    "max": 0
}
```

