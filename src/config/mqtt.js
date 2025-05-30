const mqtt = require("mqtt");
//for locale

const client = mqtt.connect("ws://localhost:9001");
// for production
//   const client = mqtt.connect("ws://13.61.1.168:9001");



exports.publish = (topic, message) => {
  client.publish(topic, message);
};
