require('dotenv').config();

function val(name, fallback) {
  return process.env[name] ?? fallback;
}

module.exports = {
  port: Number(val('PORT', 5000)),
  nodeEnv: val('NODE_ENV', 'development'),
  clientUrl: val('CLIENT_URL', 'http://localhost:5173'),
  publicClientUrl: val('PUBLIC_CLIENT_URL', val('CLIENT_URL', 'http://localhost:5173')),
  mongoUri: val('MONGO_URI', 'mongodb://127.0.0.1:27017/qr_cafeteria'),
  jwtSecret: val('JWT_SECRET', 'dev_secret_change_me'),
  jwtExpiresIn: val('JWT_EXPIRES_IN', '12h'),
  tableCount: Number(val('TABLE_COUNT', 10)),
  cafeteriaName: val('CAFETERIA_NAME', 'Cafeteria'),
  blink: {
    baseUrl: val('BLINK_BASE_URL', 'https://api.blinkco.io'),
    username: val('BLINK_USERNAME', ''),
    password: val('BLINK_PASSWORD', ''),
  },
};
