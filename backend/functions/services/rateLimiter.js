const admin = require('firebase-admin');

const MAX_SCANS = 3;        // max scans allowed
const WINDOW_MINUTES = 60;  // per hour

const checkRateLimit = async (userId) => {
    const db = admin.firestore();

    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - WINDOW_MINUTES);

    const snapshot = await db.collection('scans')
        .where('userId', '==', userId)
        .where('timestamp', '>=', windowStart)
        .get();

    if (snapshot.size >= MAX_SCANS) {
        console.warn(`Rate limit exceeded for user ${userId}`);
        return false; // blocked
    }

    return true; // allowed
};

module.exports = { checkRateLimit };