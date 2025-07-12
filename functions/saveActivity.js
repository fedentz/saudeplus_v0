const functions = require('firebase-functions');
const admin = require('./firebase');
const db = admin.firestore();

function log(file, method, tag, message) {
  console.log(`\n-------------------- (${file} > ${method}) --------------------\n[${tag}] ${message}\n-----------------------------------------------------------------------\n`);
}

exports.saveActivity = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const {
    id,
    userId,
    date,
    distance,
    duration,
    status,
    invalidReason,
    metodoGuardado,
    velocidadPromedio,
    conexion,
    aceleracionPromedio
  } = req.body;

  if (!userId || !date || distance == null || duration == null) {
    return res.status(400).send('Missing required fields');
  }

  const docData = {
    id: id ?? '',
    userId,
    date: new Date(date),
    distance,
    duration,
    status: status ?? 'invalida',
    invalidReason: invalidReason ?? null,
    metodoGuardado: metodoGuardado ?? 'online',
    velocidadPromedio: velocidadPromedio ?? 0,
    conexion: conexion ?? 'desconocida',
    aceleracionPromedio: aceleracionPromedio ?? 0,
  };

  log('saveActivity.js', 'saveActivity', 'FIREBASE', JSON.stringify(docData));

  try {
    await db.collection('activities').add(docData);
    return res.status(200).send('Activity saved successfully');
  } catch (err) {
    log('saveActivity.js', 'saveActivity', 'ERROR', `Error saving activity: ${err}`);
    return res.status(500).send('Internal Server Error');
  }
});
