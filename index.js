const axios = require('axios');
const fs = require('fs').promises;
const Handlebars = require('handlebars');
const functions = require('@google-cloud/functions-framework');


const auth = { username: process.env.user, password: process.env.password };


const loadTemplate = async () => {
  try {
    const template = await fs.readFile('verification_email.hbs', 'utf8');
    return Handlebars.compile(template);
  } catch (error) {
    console.error('Error loading template:', error);
    throw error;
  }
}

// send mail
const sendMail = async (params) => {
  try {
    const { from, to, verificationLink, domain } = params;
    const template = await loadTemplate();
    const emailContent = template({ verificationLink });

    const formData = {
      from: `Excited User <${from}>`,
      to: to,
      subject: 'Verification Email',
      html: emailContent,
    };
    
    console.log(formData);
    const response = await axios.post(`https://api.mailgun.net/v3/${domain}/messages`, formData, {
      auth,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('Email sent:', response.status);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

functions.cloudEvent('helloPubSub', cloudEvent => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const base64name = cloudEvent.data.message.data;
  const buffer = Buffer.from(base64name, 'base64').toString();
  const jsonObject = JSON.parse(buffer);
  sendMail(jsonObject);
});


