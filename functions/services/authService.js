/**
 * AUTH SERVICE
 * Triggered when a new user registers via Firebase Auth.
 * 
 * FRONTEND: After registration, update the user's barangay:
 * db.collection('users').doc(currentUser.uid).update({ barangay: 'Mapula' })
 * 
 * Firestore user document structure:
 * {
 *   name: string
 *   phoneNumber: string
 *   barangay: string    ← update this after onboarding
 *   createdAt: Timestamp
 * }
 */


const admin = require('firebase-admin');

const onUserCreated = async (user) => {
    try {
        const db = admin.firestore();
        const { uid, phoneNumber, displayName } = user;

        await db.collection('users').doc(uid).set({
            name: displayName ?? 'Farmer',
            phoneNumber: phoneNumber ?? null,
            barangay: null,
            createdAt: new Date()
        });

        console.log(`User document created for ${uid}`);
    } catch (error) {
        console.error('Failed to create user document:', error.message);
    }
};

module.exports = { onUserCreated };