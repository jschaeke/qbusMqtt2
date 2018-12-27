# QbusMQTT
A Qbus EQOweb to MQTT bridge

# Purpose
This script acts a bridge between an MQTT broker and a Qbus home automation system (Eqoweb).
By doing so, Qbus can be integrated into a home automation solution such as Domogik, Hass.io, OpenHab or Domoticz. Also interesting is Node-RED to easily setup flows with other online services like IFTTT, PushOver, Alexa, Telegram...

# How it works
There are three topics:
 - MQTT_TOPIC_CHAN_NAMES : on startup it will show the channel with corresponding device name as configured in EqoWeb. This is helpful to determine how the names are formatted into topic names (lowercase, spaces replaced by _ ).
 e.g.:
 ```bash
 # mosquitto_sub -h 192.168.1.30 -v -t qbus/channames/#
 qbus/channames/1/living_spots (null)
 qbus/channames/2/living_wand (null)
 qbus/channames/3/eetkamer_cen (null)
 qbus/channames/4/eetkamer_spo (null)
 qbus/channames/5/keuken_spots (null)
 qbus/channames/6/keuken_eilan (null)
 qbus/channames/7/keuken_kast (null)
 qbus/channames/8/warme_bergin (null)
 qbus/channames/9/koude_bergin (null)
 qbus/channames/10/wc_onder (null)
 qbus/channames/11/bureau_spots (null)

 ```
 - MQTT_TOPIC_CMND : topic to send a command, name of device is added to the end. Value is typically 0 for OFF, 255 for ON (switch). A dimmer can have any value in between.
```bash
# mosquitto_pub -h 192.168.1.30 -t qbus/cmnd/living_spots -m 10
 ```
 translates to MQTT message
 ```bash
 qbus/cmnd/living_spots 10
 ```
 To retrieve the current state of all devices:
```bash
 # mosquitto_pub -h 192.168.1.30 -t qbus/cmnd/update -m 0
```
 - MQTT_TOPIC_STAT : topic to subscribe for EQOWeb events, e.g turning off living_spots results in following MQTT message
 ```bash
 qbus/stat/living_spots 0
 ```

# Thanks
This wouldn't be possible without the library written by Nico; thanks! https://github.com/nicojanssens/qbus-eqoweb-api

# Installation
MQTT and EQOWeb configuration is set in .env file.

```bash
npm i
npm run start
```
