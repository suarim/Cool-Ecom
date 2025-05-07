const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function sendOtpSMS(phone, email,otp) {
  await client.messages.create({
    body: `Your Cool-Ecom OTP is ${email}: ${otp}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone
  });
}

module.exports = { generateOTP, sendOtpSMS };
