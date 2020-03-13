const request = require('request');
/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const fetchMyIP = function (callback) {
  request('https://api.ipify.org?format=json', (error, response, body) => {

    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);


  });
};

const fetchCoordByIP = function (ip, callback) {
  request(`https://ipvigilante.com/${ip}`, (error, response, body) => {
    // if error is true, then return error message. null is set because there are no coordinates in this case
    if (error) return callback(error, null);

    // check for a statusCode that is not 200 and return the status code error.
    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    // parse the data from body and access it using dot notation, then store it in latitude and longitude key
    const {
      latitude,
      longitude
    } = JSON.parse(body).data;
    // null is set for the first parameter because there is no error, the second parameter accesses the object
    callback(null, {
      latitude,
      longitude
    });

  });
};

const fetchISSFlyOverTimes = function (coords, callback) {
  // request data from open-notify
  // QUERY STRING:
  //  ***latitude and longitude are REQUIRED and accessed with coords from the function in index.js
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) return callback(error, null);

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }


    const ISSPass = JSON.parse(body).response;

    callback(null, ISSPass);

  });
};


/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results. 
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function (callback) {

  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordByIP(ip, (error, coord) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(coord, (error, passes) => {
        if (error) {
          return callback(error, null);
        }


        callback(null, passes)
      });
    });
  });
}

module.exports = {
  // fetchMyIP,
  // fetchCoordByIP,
  // fetchISSFlyOverTimes,
  nextISSTimesForMyLocation
};