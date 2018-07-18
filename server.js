require('dotenv').config();
var mqtt = require('mqtt')

const constants = require('./constants');
const connectP = require('qbus-eqoweb-api').connectP;
const EventListener = require('qbus-eqoweb-api').EventListener;
const getGroupsP = require('qbus-eqoweb-api').getGroupsP;
const getChannelStatusP = require('qbus-eqoweb-api').getChannelStatusP;
const updateChannelStatusP = require('qbus-eqoweb-api').updateChannelStatusP;

const eqoWebArgs = {
    username: constants.EQOWEB_USERNAME,
    password: constants.EQOWEB_PASSWORD,
    address: constants.EQOWEB_ADDRESS,
    port: constants.EQOWEB_PORT,
};

const retryTimeout = 30;

var client = mqtt.connect({
    port: constants.MQTT_PORT,
    host: constants.MQTT_HOST
});
var groups;

client.on('connect', function() {
    client.subscribe(constants.MQTT_TOPIC_CMND)
});

const findChannelId = (groups, name) => {
    let channelId;
    groups.forEach((group) => {
        const channelItem = group.Itms.find(item => (
            item.Nme.toLowerCase() === name.toLowerCase()
        ));
        if (channelItem) {
            channelId = channelItem.Chnl;
        }
    });
    return channelId;
};


const mqttFormat = (deviceName) => {
    return deviceName.toLowerCase().replace(/ /g, "_");
}

const eqowebFormat = (deviceName) => {
    return deviceName.toLowerCase().replace(/_/g, " ");
}

const runStat = () => {
    let sessionId;
    let channelId;
    let args;

    connectP(eqoWebArgs)
        .then((newSessionId) => {
            console.log(`created session ${newSessionId}`);
            sessionId = newSessionId;
            args = Object.assign({}, eqoWebArgs, {
                sessionId
            });

            // retrieving an overview of all channels
            return getGroupsP(args);
        })
        .then((newGroups) => {
            groups = newGroups;
            console.log(`received groups ${JSON.stringify(groups)}`);
            groups.forEach((group) => {
                group.Itms.forEach((item) => {
                    client.publish(constants.MQTT_TOPIC_CHAN_NAMES + item.Chnl + "/" + mqttFormat(item.Nme));
                    client.publish(constants.MQTT_TOPIC_STAT + mqttFormat(item.Nme), item.Val.toString());
                });
            });

            // EQOWEB to MQTT using listener for updates on EQOWEB
            let listener = new EventListener(args);
            listener.on('update', (update) => {
                console.log(update);
                client.publish(constants.MQTT_TOPIC_STAT + mqttFormat(update.name), update.newVal.toString());
            });
            listener.on('error', (error) => {
                let errorMsg = "Error during EventListener watch, retry in " + retryTimeout  + " sec";
                console.log(errorMsg);
                client.publish(constants.MQTT_TOPIC_STAT + "error", errorMsg);
                setTimeout(() => { listener.run(); }, retryTimeout * 1000);

            });
            listener.activate();
        })
        .catch((error) => {
            console.log("runStat ", error);
        });
};

const runCmd = () => {
    let sessionId;
    let channelId;
    let deviceName;
    let args;
    // MQTT to EQOWEB
    client.on('message', function(topic, message) {
        args = Object.assign({}, eqoWebArgs, {
            sessionId
        });
        connectP(args)
            .then((newSessionId) => {
                console.log(`created session ${newSessionId}`);
                sessionId = newSessionId;
                args = Object.assign({}, eqoWebArgs, {
                    sessionId
                });

                // message is Buffer
                deviceName = topic.split("/").pop();
                let deviceNameForEQOWEB = eqowebFormat(deviceName);
                let value = parseInt(message.toString());
                channelId = findChannelId(groups, deviceNameForEQOWEB);
                console.log("Set " + deviceNameForEQOWEB + " to " + value + " with channeldId " + channelId);
                let updateArgs = Object.assign({}, args, {
                    sessionId: sessionId,
                    channelId: channelId,
                    newStatus: [value]
                });
                // update the status of a specific channel
                updateChannelStatusP(updateArgs)
                    .then((channelStatus) => {
                        console.log(`received channel status ${JSON.stringify(channelStatus)}`);
                        client.publish(constants.MQTT_TOPIC_STAT + deviceName, (channelStatus.Val[0]).toString());
                    });
            })
            .catch((error) => {
                console.log("runCmd ", error);
            })
    })
};

runStat();
runCmd();
