const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.saveActivity = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { userId, date, distance, duration } = req.body;

  if (!userId || !date || distance == null || duration == null) {
    return res.status(400).send('Missing fields');
  }

  try {
    await db.collection('activities').add({
      userId,
      date,
      distance,
      duration,
    });
    return res.status(200).send('Activity saved successfully');
  } catch (err) {
    console.error('Error saving activity:', err);
    return res.status(500).send('Internal Server Error');
  }
});
