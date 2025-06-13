const geoip = require('geoip-lite');
const requestIp = require('request-ip');

/**
 * Determines whether a user is from India:
 * 1. If user.country_code exists → trust that
 * 2. Else → IP-based country detection
 */
function isUserFromIndia(req, user = null) {
  // ✅ If user is logged in and has a country_code → use it directly
  if (user && typeof user.country_code === 'string') {
    console.log("✅ Using user.country_code:", user.country_code);
    return user.country_code.toUpperCase() === 'IN';
  }

  // ✅ Else use IP
  const clientIp = requestIp.getClientIp(req);
  const isLocalhost = clientIp === '::1' || clientIp === '127.0.0.1';

  if (isLocalhost) {
    console.log("🌐 Localhost IP — assuming India");
    return true;
  }

  const geo = geoip.lookup(clientIp);
  console.log("📍 IP:", clientIp, "| Geo:", geo);

  return geo?.country === 'IN';
}

module.exports = {
  isUserFromIndia,
};
