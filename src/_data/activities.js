const strava = require('./strava.json')

module.exports = () => {
  return Object.values(strava);
}
