const axios = require('axios');

const sendSMS = async (phoneNumber, message) => {
    try {
        await axios.post('https://api.semaphore.co/api/v4/messages', {
            apikey: process.env.SEMAPHORE_API_KEY,
            number: phoneNumber,
            message,
            sendername: 'FARMAI'
        });
        console.log(`SMS sent to ${phoneNumber}`);
    } catch (error) {
        console.error('SMS failed:', error.message);
    }
};

module.exports = { sendSMS };


