// services/outbreakDetector.js

/**
 * OUTBREAK DETECTOR
 * Triggered automatically when a new scan is added to Firestore.
 * 
 * FRONTEND: Save scan documents to 'scans' collection with these EXACT fields:
 * {
 *   userId: string        → from Firebase Auth (currentUser.uid)
 *   barangay: string      → from user profile or GPS reverse geocoding
 *   cropName: string      → from farmer's form input
 *   growthStage: string   → from farmer's form input
 *                           accepted values: 'seedling', 'vegetative', 'reproductive', 'flowering', 'maturation'
 *   pest: string          → from AI analysis result
 *   severity: string      → from AI analysis result
 *                           accepted values: 'mild', 'moderate', 'severe'
 *   timestamp: Timestamp  → use firebase.firestore.FieldValue.serverTimestamp()
 * }
 * 
 * AI TEAM: Return these fields after photo analysis:
 * {
 *   pest: string      → identified pest name
 *   severity: string  → 'mild' | 'moderate' | 'severe'
 * }
 */


const admin = require('firebase-admin');
const { checkRateLimit } = require('./rateLimiter');
const { saveNotification } = require('./notificationService');

const GROWTH_STAGE_WEIGHTS = {
    rice: {
        'seedling': 1, 'vegetative': 1, 'reproductive': 1.5, 'flowering': 2, 'maturation': 1.3,
    },
    corn: {
        'seedling': 1, 'vegetative': 1, 'reproductive': 1.5, 'flowering': 2, 'maturation': 1.3,
    },
    coconut: {
        'seedling': 1, 'vegetative': 1, 'flowering': 1.5, 'nut formation': 2, 'maturation': 1.3,
    }
};

const SEVERITY_WEIGHTS = { 'mild': 1, 'moderate': 2, 'severe': 3 };
const OUTBREAK_SCORE_THRESHOLD = 4;
const MIN_UNIQUE_USERS = 3;
const WINDOW_DAYS = 14;
const VALID_SEVERITY = ['mild', 'moderate', 'severe'];
const VALID_STAGES = ['seedling', 'vegetative', 'reproductive', 'flowering', 'maturation', 'nut formation'];

const detectOutbreak = async (scan) => {
    const db = admin.firestore();
    const { pest, barangay, cropName, growthStage, severity, userId } = scan.data();

    if (!pest || !barangay || !cropName) {
        console.warn('Missing required fields in scan, skipping outbreak detection.');
        return;
    }

    // validation inside function
    if (!VALID_SEVERITY.includes(severity) || !VALID_STAGES.includes(growthStage)) {
        console.warn('Invalid field values, skipping.');
        return;
    }

    const allowed = await checkRateLimit(userId);
    if (!allowed) return;

    const windowStart = new Date();
    windowStart.setDate(windowStart.getDate() - WINDOW_DAYS);

    const snapshot = await db.collection('scans')
        .where('pest', '==', pest)
        .where('barangay', '==', barangay)
        .where('cropName', '==', cropName)
        .where('timestamp', '>=', windowStart)
        .get();

    const uniqueUsers = new Set();
    let totalScore = 0;

    snapshot.forEach(doc => {
        const data = doc.data();
        // fixed crop-specific weight lookup
        const stageWeight = GROWTH_STAGE_WEIGHTS[data.cropName?.toLowerCase()]?.[data.growthStage?.toLowerCase()] ?? 1;
        const severityWeight = SEVERITY_WEIGHTS[data.severity?.toLowerCase()] ?? 1;
        const impactScore = stageWeight * severityWeight;

        uniqueUsers.add(data.userId);
        totalScore += impactScore;
    });

    const normalizedScore = uniqueUsers.size > 0 ? totalScore / uniqueUsers.size : 0;
    console.log(`Barangay: ${barangay} | Pest: ${pest} | Users: ${uniqueUsers.size} | Score: ${normalizedScore}`);

    const shouldAlert = uniqueUsers.size >= MIN_UNIQUE_USERS && normalizedScore >= OUTBREAK_SCORE_THRESHOLD;

    if (shouldAlert) {
        await triggerOutbreakAlert({ db, pest, barangay, cropName, normalizedScore, uniqueUsers });
    } else {
        await resolveOutbreakIfExists({ db, pest, barangay });
    }
};

const triggerOutbreakAlert = async ({ db, pest, barangay, cropName, normalizedScore, uniqueUsers }) => {
    const outbreakRef = db.collection('outbreaks').doc(`${barangay}_${pest}`);
    const existing = await outbreakRef.get();
    const alreadyActive = existing.exists && existing.data().status === 'ACTIVE';

    await outbreakRef.set({
        pest, barangay, cropName,
        status: 'ACTIVE',
        normalizedScore,
        affectedUserCount: uniqueUsers.size,
        last_report: new Date(),
        ...(alreadyActive ? {} : { detectedAt: new Date() })
    }, { merge: true });

    if (!alreadyActive) {
        await admin.messaging().sendToTopic(barangay, {
            notification: {
                title: 'Pest Outbreak Alert!',
                body: `${pest} outbreak detected on ${cropName} in your barangay. Check the app for recommendations.`
            },
            data: { pest, barangay, cropName, type: 'OUTBREAK_ALERT' }
        });

        const message = `${pest} outbreak detected on ${cropName} in your barangay. Check the app for recommendations.`;
        const farmerSnapshot = await db.collection('users').where('barangay', '==', barangay).get();

        const savePromises = [];
        farmerSnapshot.forEach(doc => {
            savePromises.push(saveNotification({ userId: doc.id, pest, cropName, barangay, message }));
        });

        await Promise.all(savePromises);
        console.log(`Outbreak alert sent for ${pest} in ${barangay}`);

        farmerSnapshot.forEach(doc => {
            const { phoneNumber } = doc.data();
            if (phoneNumber) {
                sendSMS(phoneNumber, message);
            }
        });

    }
};

const resolveOutbreakIfExists = async ({ db, pest, barangay }) => {
    const outbreakRef = db.collection('outbreaks').doc(`${barangay}_${pest}`);
    const existing = await outbreakRef.get();

    if (existing.exists && existing.data().status === 'ACTIVE') {
        await outbreakRef.update({ status: 'RESOLVED', resolvedAt: new Date() });
        console.log(`Outbreak for ${pest} in ${barangay} auto-resolved.`);
    }
};

module.exports = { detectOutbreak };
