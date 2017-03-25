# homekit

Homekit HAP-NodeJS - Integration of HAP-NodeJS with WS2812(NeoPixel) ,DHT11 Temperature/Humidity Sensor,SONOFF S20(ESP8266 based outlet)and PIR sensor.

This project uses existing HAP-NodeJS from https://github.com/KhaosT/HAP-NodeJS on Raspberry Pi.Changes are done for the following accessories :

Motion Sensor
Temperature Sensor
Humidity Sensor
Light (WS2812 Sensor)
Camera
Outlet Sensor

These accessories are added as different file name with MRz added to the file/accessory.

RPi Setup :
------------
MQTT Server using Mosca.
forever installed for executing scripts in start up.
MotionEye for RPi Camera .
duckDNS used to access RPi remotely through port forwading.


Accessory Information :
---------------------
Motion Sensor:
PIR sensor is tied to PIN 27 . The interrupt is captured using the npm library pigpio. When motion is detected for a duration of 2 secs the image is captured from the motioneye and is stored . This image is sent to the iOS notifiction if it is subscribed .

Temperature/Humidity Sensor :
DHT11 is used to read using the ESP8266 and is transmitted using the MQTT . The message is published and the MQTT server running in the RPi reads and trigger/sets the temp and humidity sensors properties . This is done at every 1 hr interval.

Light - WS2812 RGB NeoPixel :
ESP8266 is connected to WS2812 RGB .The HSV details are transmitted from the RPi through MQTT to ESP8266. The HSV from the iOS Home app is changed when color/brightness/hue/saturation is changed.Neopixel library is used in ESP8266 for controlling the WS2812.PubClient for the MQTT server/client. The same ESP8266 is connected with the WS2812 and the DHT11 and comminucates to the HAP through MQTT protocals.

Camera :
Raspi Cam used to capture the image once motion detection happens.The camera is also configured for the motionEye for live streaming.The PIR sensor once detects any motion captures an image using task (thanks to legotheboss for the task to capture the image ). The notification once selected, the app is opened and the live streaming starts.


Extra Changes :
----------------

--Configured the RPi for remote access:

Edit : sudo nano /etc/dhcpcd.conf
Add the following code to the last. This will set the IP of the pi as 192.168.1.99

interface wlan0
static ip_address=192.168.1.99/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8

interface eth0
static ip_address=192.168.1.199/24
static routers=192.168.1.1
static domain_name_servers=192.168.1.1 8.8.8.8

--Set the RPi camera for the motion eye
Edit:sudo nano /etc/modules
Add bcm2835-v4l2 to the end 
and reboot. 

--Camera led off 
Edit : sudo nano /boot/config.txt
Add 
disable_camera_led=1 
to the last line 

--Configure forever for startup script.

Edit :sudo nano /etc/rc.local 
Add 
sudo forever start /home/pi/rmrz/HAP-NodeJS/CameraCore.js 
sudo forever start /home/pi/rmrz/duckdns.js
before exit 0

