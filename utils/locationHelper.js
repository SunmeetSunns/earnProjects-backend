const geoip = require('geoip-lite');
const requestIp = require('request-ip');

/**
 * Return true if user is from India
 * Based on user.country_code (ISO format) or IP location
 */
function isUserFromIndia(req, user = null) {
  // ✅ If logged-in user has ISO country_code
  if (user?.country_code) {
    console.log("✅ User country_code:", user.country_code);
    return user.country_code === 'IN';
  }

  // ✅ If not logged in, use IP
  const clientIp = requestIp.getClientIp(req);
//   const isLocalhost = clientIp === '::1' || clientIp === '127.0.0.1';

//   if (isLocalhost) {
//     console.log("🌐 Localhost IP detected — assuming India");
//     return true;
//   }

  const geo = geoip.lookup(clientIp);
  console.log("📍 IP:", clientIp, "| Geo:", geo);

  return geo?.country === 'IN';
}

module.exports = {
  isUserFromIndia,
};
