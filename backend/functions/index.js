/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */





const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { onRequest } = require('firebase-functions/v2/https');

const { beforeUserCreated } = require('firebase-functions/v2/identity');
//scan 
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const {detectOutbreak} = require('./services/outbreakDetector');

//user authentication
const { onUserCreated } = require('./services/authService');

//app initialization
admin.initializeApp();

exports.onNewScan = onDocumentCreated('scans/{scanId}', async (event) => {
    await detectOutbreak(event.snapshot ?? event.data); // pass snapshot, not raw data
})

exports.onNewUser = beforeUserCreated(async (event) => {
    await onUserCreated(event.data);
});

const setCors = (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
};

exports.registerWithPhone = onRequest(async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { phoneNumber, fullName, location, pincode } = req.body ?? {};
        if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber is required' });

        const db = admin.firestore();
        const existing = await db.collection('users').where('phoneNumber', '==', phoneNumber).limit(1).get();
        if (!existing.empty) return res.status(409).json({ error: 'Phone already registered' });

        const created = await db.collection('users').add({
            phoneNumber,
            name: fullName ?? 'Farmer',
            location: location ?? null,
            pincode: pincode ?? null,
            createdAt: new Date(),
        });

        return res.status(201).json({
            user: {
                id: created.id,
                phoneNumber,
                name: fullName ?? 'Farmer',
                location: location ?? null,
            },
        });
    } catch (error) {
        console.error('registerWithPhone failed:', error.message);
        return res.status(500).json({ error: 'Registration failed' });
    }
});

exports.loginWithPhone = onRequest(async (req, res) => {
    setCors(res);
    if (req.method === 'OPTIONS') return res.status(204).send('');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { phoneNumber } = req.body ?? {};
        if (!phoneNumber) return res.status(400).json({ error: 'phoneNumber is required' });

        const db = admin.firestore();
        const snap = await db.collection('users').where('phoneNumber', '==', phoneNumber).limit(1).get();
        if (snap.empty) return res.status(404).json({ error: 'User not found' });

        const userDoc = snap.docs[0];
        const data = userDoc.data();
        return res.status(200).json({
            user: {
                id: userDoc.id,
                phoneNumber: data.phoneNumber,
                name: data.name ?? 'Farmer',
                location: data.location ?? null,
            },
        });
    } catch (error) {
        console.error('loginWithPhone failed:', error.message);
        return res.status(500).json({ error: 'Login failed' });
    }
});
// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
