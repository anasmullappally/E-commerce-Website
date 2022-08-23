/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
/* eslint-disable no-async-promise-executor */
/* eslint-disable linebreak-style */
require('dotenv').config();

const accountSID = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;
const client = require('twilio')(accountSID, authToken);

module.exports = {
  make: (phone_number) => new Promise(async (resolve) => {
    await client.verify
      .services(serviceId)
      .verifications.create({
        to: `+91${phone_number}`,
        channel: 'sms',
      }).then((verifications) => {
        resolve(verifications);
      });
  }),

  verifyOtp: (otp, phone_number) => new Promise(async (resolve) => {
    await client.verify
      .services(serviceId)
      .verificationChecks.create({
        to: `+91${phone_number}`,
        code: otp,
      }).then((verification_check) => {
        resolve(verification_check);
        console.log(verification_check);
      });
  }),
};
