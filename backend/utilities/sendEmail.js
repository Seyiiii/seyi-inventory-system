import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,        // 👈 changed from 465 to 587
        secure: false,    // 👈 changed from true to false (587 uses STARTTLS not SSL)
        family: 4,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false  // 👈 add this — prevents TLS cert issues on Render
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