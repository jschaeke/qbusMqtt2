require('dotenv').config();

// verify if all required EQOWEB env variables are set
if (!process.env.EQOWEB_USERNAME) { throw new Error('EQOWEB_USERNAME is undefined'); }
if (!process.env.EQOWEB_PASSWORD) { throw new Error('EQOWEB_PASSWORD is undefined'); }
if (!process.env.EQOWEB_ADDRESS) { throw new Error('EQOWEB_ADDRESS is undefined'); }

// verify if all required MQTT env variables are set
if (!process.env.MQTT_HOST) { throw new Error('MQTT_URL is undefined'); }
if (!process.env.MQTT_PORT) { throw new Error('MQTT_PORT is undefined'); }
if (!process.env.MQTT_TOPIC_CMND) { throw new Error('MQTT_TOPIC_CMND is undefined'); }
if (!process.env.MQTT_TOPIC_STAT) { throw new Error('MQTT_TOPIC_STAT is undefined'); }
if (!process.env.MQTT_TOPIC_CHAN_NAMES) { throw new Error('MQTT_TOPIC_CHAN_NAMES is undefined'); }


// export EQOWEB env variables
module.exports.EQOWEB_USERNAME = process.env.EQOWEB_USERNAME;
module.exports.EQOWEB_PASSWORD = process.env.EQOWEB_PASSWORD;
module.exports.EQOWEB_ADDRESS = process.env.EQOWEB_ADDRESS;
module.exports.EQOWEB_PORT = process.env.EQOWEB_PORT;

module.exports.MQTT_HOST = process.env.MQTT_HOST;
module.exports.MQTT_PORT = process.env.MQTT_PORT;
module.exports.MQTT_TOPIC_CMND = process.env.MQTT_TOPIC_CMND;
module.exports.MQTT_TOPIC_STAT = process.env.MQTT_TOPIC_STAT;
module.exports.MQTT_TOPIC_CHAN_NAMES = process.env.MQTT_TOPIC_CHAN_NAMES;
