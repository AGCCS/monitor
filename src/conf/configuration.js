const env = process.env.NODE_ENV // environment parameter

let MQTT_CONF, baseURL, uploadURL

if (env === 'development') {
  MQTT_CONF = 'mqtt:192.168.5.1:9001'
  baseURL = 'http://192.168.5.1:3000/api/'
  uploadURL = 'http://192.168.5.1:3000/api/upload/'
}

if (env === 'production') {
  MQTT_CONF = 'mqtt:192.168.5.1:9001'
  baseURL = 'http://localhost:3000/api/'
  uploadURL = 'http://localhost:3000/api/upload/'
}

module.exports = {
  baseURL,
  uploadURL,
  MQTT_CONF
}
