const functions = require('firebase-functions');
const admin = require('./firebaseAdmin');
const logger = require('firebase-functions/logger');

const handler = async (data, context) => {
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!context.auth || context.auth.token.admin !== true) {
    logger.warn('Unauthorized attempt to grant admin role');
    throw new functions.https.HttpsError('permission-denied', 'Only admins can call this function');
  }

  if (!ADMIN_EMAIL) {
    logger.error('ADMIN_EMAIL not set');
    throw new functions.https.HttpsError('failed-precondition', 'ADMIN_EMAIL not set in env');
  }

  try {
    const user = await admin.auth().getUserByEmail(ADMIN_EMAIL);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    logger.info(`Admin role granted to ${ADMIN_EMAIL}`);
    return { message: `Admin role granted to ${ADMIN_EMAIL}` };
  } catch (err) {
    logger.error('Error granting admin role', err);
    throw new functions.https.HttpsError('internal', 'Error granting admin role');
  }
};

exports.grantAdminRole = functions.https.onCall(handler);
