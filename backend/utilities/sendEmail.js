import nodemailer from 'nodemailer';
import dns from 'dns';

// Force all DNS resolution to IPv4 globally — affects entire Node process
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        family: 4,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"Seyi Inventory System" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.text || '',
        html: options.html || ''
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;