require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Create Nodemailer transporter
let transporter;

async function createTransporter() {
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use provided SMTP credentials
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
        console.log('📧 Using configured SMTP credentials');
    } else {
        // Create an Ethereal test account for development
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
        console.log('📧 Using Ethereal test account for email (dev mode)');
        console.log(`   Ethereal user: ${testAccount.user}`);
    }
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// API: Vendor Registration
app.post('/api/vendor-register', async (req, res) => {
    try {
        const { businessName, email, ownerName, description, stallPrice } = req.body;

        // Validation
        const errors = [];
        if (!businessName || !businessName.trim()) {
            errors.push('Business name is required.');
        }
        if (!email || !email.trim()) {
            errors.push('Email is required.');
        } else if (!isValidEmail(email)) {
            errors.push('Please enter a valid email address.');
        }
        if (!ownerName || !ownerName.trim()) {
            errors.push('Owner name is required.');
        }
        if (!description || !description.trim()) {
            errors.push('Business description is required.');
        }
        if (!stallPrice) {
            errors.push('Please select a stall price.');
        }

        if (errors.length > 0) {
            return res.status(400).json({ success: false, errors });
        }

        // Determine stall tier name
        const stallTier = stallPrice === '300' ? 'Premium Booth ($300)' : 'Standard Booth ($250)';

        // Send confirmation email to the vendor
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Ensemble Beyond Borders'}" <${process.env.FROM_EMAIL || 'hello@ensembleevent.com'}>`,
            to: email,
            subject: 'Thank You for Your Interest in Ensemble Beyond Borders!',
            html: `
        <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background-color: #FAF3E6; border: 1px solid #C9A44A; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #6B1D2A; padding: 30px; text-align: center;">
            <h1 style="color: #C9A44A; margin: 0; font-size: 28px; letter-spacing: 2px;">ENSEMBLE</h1>
            <p style="color: #F5EDE0; margin: 5px 0 0; font-size: 14px; letter-spacing: 1px;">Beyond Borders</p>
          </div>
          <div style="padding: 30px;">
            <h2 style="color: #6B1D2A; margin-top: 0;">Thank You, ${ownerName}!</h2>
            <p style="color: #2C2C2C; line-height: 1.6;">
              Thank you for your interest in exhibiting at <strong>Ensemble Beyond Borders</strong>. We're excited to have 
              <strong>${businessName}</strong> as a potential exhibitor at the Bay Area's premier festive fashion & lifestyle exhibition.
            </p>
            <div style="background-color: #F5EDE0; border-left: 4px solid #C9A44A; padding: 15px; margin: 20px 0; border-radius: 0 4px 4px 0;">
              <p style="margin: 0; color: #2C2C2C;"><strong>Your Selected Booth:</strong> ${stallTier}</p>
            </div>
            <p style="color: #2C2C2C; line-height: 1.6;">
              Our team will review your application and get back to you within the <strong>next 24 hours</strong>.
            </p>
            <hr style="border: none; border-top: 1px solid #C9A44A; margin: 25px 0;">
            <p style="color: #888; font-size: 13px; text-align: center;">
              <strong>Ensemble Beyond Borders</strong><br>
              August 16, 2026 · Fremont, California<br>
              <a href="mailto:hello@ensembleevent.com" style="color: #6B1D2A;">hello@ensembleevent.com</a> · (510) 123-4567
            </p>
          </div>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📩 VENDOR REGISTRATION RECEIVED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`   Business: ${businessName}`);
        console.log(`   Owner:    ${ownerName}`);
        console.log(`   Email:    ${email}`);
        console.log(`   Booth:    ${stallTier}`);
        console.log(`   Description: ${description}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // If using Ethereal, log the preview URL
        if (info.messageId) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                console.log(`📧 Preview email: ${previewUrl}`);
            }
        }

        res.json({
            success: true,
            message: 'Thank you for your interest! Our team will review your application and get back to you within the next 24 hours.',
        });
    } catch (error) {
        console.error('Error processing registration:', error);
        res.status(500).json({
            success: false,
            errors: ['Something went wrong. Please try again later.'],
        });
    }
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
async function start() {
    await createTransporter();
    app.listen(PORT, () => {
        console.log(`\n🎪 Ensemble Beyond Borders is running at http://localhost:${PORT}\n`);
    });
}

start();
