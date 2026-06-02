import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (options) => {
    console.log("📧 Attempting to send email to:", options.email);
    console.log("👤 Using Gmail Account:", process.env.EMAIL_USER);
    console.log("🔑 Password Length:", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'MISSING!');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const mailOptions = {
        from: `"Seyi Inventory System" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: [
            {
                filename: 'logo.png',
                path: path.join(__dirname, '../assets/logo.png'),
                cid: 'seyilogo'
            }
        ]
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;