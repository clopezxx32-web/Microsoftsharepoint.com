const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config(); // If using .env for credentials

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname,"public"))); // Serve static files like HTML

// Serve the landing page at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,"public","index.html"));
});

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_PASS  // App password, not regular password
  }
});

// API endpoint
app.post('/api/submit', async (req, res) => {
  const { favouritefood, company, ip: clientIp } = req.body;
  
  // Use the IP from the frontend (which gets it from ipify API)
  // Fall back to server-side extraction if not provided
  const ip = clientIp || req.headers["x-forwarded-for"]?.split(",")[0] || req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

  // Prepare email content
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.ADMIN_EMAIL || process.env.GMAIL_USER, // Send to admin or yourself
    subject: 'New Training Access Submission',
    text: `
Favourite Food: ${favouritefood}
Company Name: ${company}
IP Address: ${ip}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    res.status(200).send('Submission received and email sent');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
