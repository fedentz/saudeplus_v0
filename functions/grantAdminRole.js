const functions = require('firebase-functions');
const admin = require('firebase-admin');
const logger = require('firebase-functions/logger');

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.grantAdminRole = functions.https.onRequest(async (req, res) => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!ADMIN_EMAIL) {
    logger.error('ADMIN_EMAIL not set');
    return res.status(500).send('ADMIN_EMAIL not set in env');
  }

  try {
    const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    logger.info(`Admin role granted to ${ADMIN_EMAIL}`);
    res.status(200).send(`Admin role granted to ${ADMIN_EMAIL}`);
  } catch (err) {
    logger.error('Error granting admin role', err);
    res.status(500).send('Error granting admin role');
  }
});
