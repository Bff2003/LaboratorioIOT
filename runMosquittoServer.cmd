cd "C:\Program Files\mosquitto"
if "%1"=="" (
  set port=1883
) else (
  set port=%1
)
mosquitto -c mosquitto.conf -v -p %port%