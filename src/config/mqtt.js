const mqtt = require("mqtt");
const client = mqtt.connect("ws://localhost:9001");

exports.publish = (topic, message) => {
  client.publish(topic, message);
};
