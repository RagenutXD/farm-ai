const admin = require('firebase-admin');

const saveNotification = async ({ userId, pest, cropName, barangay, message }) => {
    try {
        const db = admin.firestore();

        await db.collection('notifications').add({
            userId,
            pest,
            cropName,
            barangay,
            message,
            isRead: false,
            createdAt: new Date()
        });

        console.log(`Notification saved for user ${userId}`);
    } catch (error) {
        console.error('Failed to save notification:', error.message);
    }
};

module.exports = { saveNotification };