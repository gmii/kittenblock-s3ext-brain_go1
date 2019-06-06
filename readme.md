# kittenblock extension - BrainGO

mblock                        | KittenBlock                   | js | Arduino |
----------------------------- | ----------------------------- | -- | ------- |
runArduino                    | x                             |    |         |
runMotor                      | setMotor                      | V |         |
runBuzzer                     | setBuzzer                     | △ |         |
runDigitalt                   | getLightSensor                | V |         |
runLED                        | setLED                        | △ |         |
IO                            | setLight                      | △ |         |
runADC                        | setpin                        | △ |         |
runServo                      | setServo                      | △ |         |
getTemp                       | getTemperatureSensor          |    |         |
getUltrasonicArduino          | getUltrasonicSensor           | V |         |
isAvailable                   | isBluetoothAvailable          |    |         |
readLine                      | readBluetoothLine             |    |         |
writeLine                     | writeBluetoothLine            |    |         |
bluetoothpag                  | isBluetoothReadLine           |    |         |
getGyro                       | get3AxisGyro                  |    |         |
getDigital                    | getDigitalPin                 | V |         |
getAnalog                     | getAnalogPin                  | △ |         |
CO_ppm                        | getCarbonMonoxideSensor       |    |         |
RGBDetector                   | getRGBSensor                  |    |         |
PM_Detector                   | getAirPMSensor                |    |         |
Compass_initial               | x                             |    |         |
heading                       | getCompass                    |    |         |
LCD_initial                   | x                             |    |         |
LCD_show                      | setLCD                        |    |         |
LCD_clear                     | clearLCD                      |    |         |
setupWifi                     | connectWiFi                   |    |         |
setWifiFields                 | uploadWiFiField               |    |         |
sendFieldData                 | ↑                             |    |         |
fingerPrint                   | getFingerPrint                |    |         |
DHT11_Init                    | x                             |    |         |
DHT11_Temp                    | getDHT11                      |    |         |
DHT11_Humi                    | ↑                             |    |         |
GPS_senser                    | x                             |    |         |
Longtitude                    | getGPS                        |    |         |
Latitude                      | ↑                             |    |         |
Altitude Feet                 | ↑                             |    |         |
Owncloud                      | setupCloud                    |    |         |
updata                        | uploadCloud                   |    |         |
backdata                      | getCloudReturnValues          |    |         |
val                           | ↑                             |    |         |
----------------------------- | ----------------------------- | -- | ------- |

## bug
### servo
```
#include <Servo.h>
```