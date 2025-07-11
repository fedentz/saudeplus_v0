import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// This function assigns the custom claim { admin: true } to a user identified by email.
// TODO: add proper authentication/authorization checks before granting admin rights.
export const grantAdminRole = functions.https.onCall(async (data, context) => {
  // Example security check placeholder
  // if (!context.auth?.token.superAdmin) {
  //   throw new functions.https.HttpsError('permission-denied', 'Not authorized');
  // }

  const { email } = data;
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
    return { message: `Admin role granted to ${email}` };
  } catch (err: any) {
    console.error('grantAdminRole error:', err);
    throw new functions.https.HttpsError('internal', err.message);
  }
});
