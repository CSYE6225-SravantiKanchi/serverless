const axios = require('axios');
const fs = require('fs').promises;
const Handlebars = require('handlebars');
const functions = require('@google-cloud/functions-framework');
const mysql = require('mysql2/promise');

const auth = { username: process.env.MAILGUN_USER, password: process.env.MAILGUN_PASSWORD };



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

functions.cloudEvent('helloPubSub', async cloudEvent => {
  // The Pub/Sub message is passed as the CloudEvent's data payload.
  const base64name = cloudEvent.data.message.data;
  const buffer = Buffer.from(base64name, 'base64').toString();
  const jsonObject = JSON.parse(buffer);
  await sendMail(jsonObject);

  try {
    console.log(process.env.SQL_HOST, process.env.SQL_USER, process.env.SQL_PASSWORD, process.env.SQL_DB )
    const pool = mysql.createPool({
      host: process.env.SQL_HOST,
      user:  process.env.SQL_USER, 
      password:  process.env.SQL_PASSWORD,
      database: process.env.SQL_DB
    });

    // Get a connection from the pool
    const connection = await pool.getConnection();

    // Execute the update query
    const updateQuery = 'INSERT INTO MailTrackings (email, mail_sent) VALUES (?, CURRENT_TIMESTAMP()) ON DUPLICATE KEY UPDATE mail_sent = CURRENT_TIMESTAMP();';
    await connection.execute(updateQuery, [jsonObject.to]);
    await connection.release();
    console.log('Mail sent field updated successfully for user:', jsonObject.to);  
    console.log('Database connected successfully!');

  } catch(err) {
    console.error('Error connecting to the database:', err);

  }

});


