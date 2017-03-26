# homekit

Homekit HAP-NodeJS - Integration of HAP-NodeJS with WS2812(NeoPixel) ,DHT11 Temperature/Humidity Sensor,SONOFF S20(ESP8266 based outlet)and PIR sensor.

This project uses existing HAP-NodeJS from https://github.com/KhaosT/HAP-NodeJS on Raspberry Pi.Changes are done for the following accessories :

- Motion Sensor
- Temperature Sensor
- Humidity Sensor
- Light (WS2812 Sensor)
- Camera
- Outlet Sensor


These accessories are added as different file name with MRz added to the file/accessory.

**RPi Setup :**
------------
MQTT Server using Mosca.
forever installed for executing scripts in start up.
MotionEye for RPi Camera .
duckDNS used to access RPi remotely through port forwading.


**Accessory Information :**
---------------------
- Motion Sensor:  [PIR ](https://www.aliexpress.com/item/Free-Shipping-HC-SR501-Adjust-Infrared-IR-Pyroelectric-Infrared-PIR-module-Motion-Sensor-Detector-Module-We/1564561530.html?spm=2114.01010208.3.1.fw8lUJ&ws_ab_test=searchweb0_0,searchweb201602_6_10065_10068_433_434_10136_10137_10138_10060_10062_10141_10056_126_10055_10054_10059_201_10531_10099_10530_10103_10102_10096_10052_10144_10053_10050_10107_10142_10051_10106_10143_10526_10529_10084_10083_10080_10082_10081_10110_10111_10112_10113_10114_10078_10079_10073_10070_10122_10123_10124,searchweb201603_7,afswitch_1,ppcSwitch_5,single_sort_0_default&btsid=22f1d41e-f8c1-4ebc-905d-674cf9cd61df&algo_expid=5bdb3aea-6f98-4a18-b021-21d7399bc9fc-0&algo_pvid=5bdb3aea-6f98-4a18-b021-21d7399bc9fc "PIR")

	PIR sensor is tied to PIN 27 . The interrupt is captured using the npm library pigpio. When motion is detected for a duration of 2 secs the image is captured from the motioneye and is stored . This image is sent to the iOS notifiction if it is subscribed .

- Temperature/Humidity Sensor :[DHT 11](https://www.aliexpress.com/item/New-DHT11-Temperature-and-Relative-Humidity-Sensor-Module-for-arduino/1873305905.html?spm=2114.01010208.3.1.UYYlF0&ws_ab_test=searchweb0_0,searchweb201602_6_10065_10068_433_434_10136_10137_10138_10060_10062_10141_10056_126_10055_10054_10059_201_10531_10099_10530_10103_10102_10096_10052_10144_10053_10050_10107_10142_10051_10106_10143_10526_10529_10084_10083_10080_10082_10081_10110_10111_10112_10113_10114_10078_10079_10073_10070_10122_10123_10124,searchweb201603_7,afswitch_1,ppcSwitch_5,single_sort_0_default&btsid=81de70fd-4b96-438e-a3f3-905a1678a619&algo_expid=4c343c5c-f9ec-410c-b281-fcc752c34535-0&algo_pvid=4c343c5c-f9ec-410c-b281-fcc752c34535)

	DHT11 is used to read using the ESP8266 and is transmitted using the MQTT . The message is published and the MQTT server running in the RPi reads and trigger/sets the temp and humidity sensors properties . This is done at every 1 hr interval.

- Light - WS2812 RGB NeoPixel :
[WS2812 - NexPixel](https://www.aliexpress.com/item/1pcs-RGB-LED-Ring-24Bit-WS2812-5050-RGB-LED-Integrated-Drivers/32787336145.html?spm=2114.01010208.3.63.upTssX&ws_ab_test=searchweb0_0,searchweb201602_6_10065_10068_433_434_10136_10137_10138_10060_10062_10141_10056_126_10055_10054_10059_201_10531_10099_10530_10103_10102_10096_10052_10144_10053_10050_10107_10142_10051_10106_10143_10526_10529_10084_10083_10080_10082_10081_10110_10111_10112_10113_10114_10078_10079_10073_10070_10122_10123_10124,searchweb201603_7,afswitch_1,ppcSwitch_5,single_sort_0_default&btsid=f754c8b2-0913-4684-847c-9fd93dafff57&algo_expid=db077eb5-dd01-4f75-8dd9-69b0b711c656-7&algo_pvid=db077eb5-dd01-4f75-8dd9-69b0b711c656)

	ESP8266 is connected to WS2812 RGB .The HSV details are transmitted from the RPi through MQTT to ESP8266. The HSV from the iOS Home app is changed when color/brightness/hue/saturation is changed.Neopixel library is used in ESP8266 for controlling the WS2812.PubClient for the MQTT server/client. The same ESP8266 is connected with the WS2812 and the DHT11 and comminucates to the HAP through MQTT protocals.

- Camera :
[RaspiCameraz](https://www.aliexpress.com/item/Free-Shipping-Raspberry-Pi-CSI-Camera-Module-5MP-Webcam-Video-1080p-720p/32414048534.html?spm=2114.40010208.4.9.j5VPEm)

	Raspi Cam used to capture the image once motion detection happens.The camera is also configured for the motionEye for live streaming.The PIR sensor once detects any motion captures an image using task (thanks to legotheboss for the task to capture the image ). The notification once selected, the app is opened and the live streaming starts.

- Outlet :
The Outlet uses [S20 Sonoff](http://sonoff.itead.cc/en/products/residential/s20-socket)

  Sonoff S20 outlet an ESP8266 integrated outlet .The stock firmware is replaced with [Tasmota](https://github.com/arendst/Sonoff-Tasmota). This is a customized one which has an MQTT server integrated.Also this emulates the Belkin hub and can be controller by Alexa as well .This can be configured in multiple ways and the button can perform multiple actions.


**Extra Changes :**
----------------
-
**Configure the RPi for remote access:**_

>_sudo nano /etc/dhcpcd.conf_

Add the following code to the last. This will set the IP of the pi as 192.168.1.99

```
interface wlan0
static ipaddress=192.168.1.99/24
static routers=192.168.1.1
static domainnameservers=192.168.1.1 8.8.8.8


interface eth0
static ipaddress=192.168.1.199/24
static routers=192.168.1.1
static domainnameservers=192.168.1.1 8.8.8.8
```

-**Set the RPi camera for the motion eye**_
>_sudo nano /etc/modules_

Add _bcm2835-v4l2_ to the end 
and reboot. 

-**Camera led off** _
Edit : sudo nano /boot/config.txt
Add 
disable_camera_led=1 
to the last line 

-**Configure forever for startup script**_

Edit :sudo nano /etc/rc.local 
Add 

> sudo forever start /home/pi/rmrz/HAP-NodeJS/CameraCore.js 

> sudo forever start /home/pi/rmrz/duckdns.js

before exit 0
