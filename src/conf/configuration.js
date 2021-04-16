const env = process.env.NODE_ENV // environment parameter

let MQTT_CONF, baseURL, uploadURL, defaultUser, defaultPwd

if (env === 'development') {
  MQTT_CONF = 'mqtt:192.168.5.1:9001'
  baseURL = 'http://192.168.5.1:3000/api/'
  uploadURL = 'http://192.168.5.1:3000/api/upload/'
  defaultUser = 'admin'
  defaultPwd = '123456'
}

if (env === 'production') {
  MQTT_CONF = 'mqtt:192.168.5.1:9001'
  baseURL = 'http://192.168.5.1:3000/api/'
  uploadURL = 'http://192.168.5.1:3000/api/upload/'
  defaultUser = ''
  defaultPwd = ''
}

module.exports = {
  baseURL,
  uploadURL,
  MQTT_CONF,
  defaultPwd,
  defaultUser
}
