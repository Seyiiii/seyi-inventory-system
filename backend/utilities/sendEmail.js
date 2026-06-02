import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';

dns.getDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sendEmail = async (options) => {
  
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
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