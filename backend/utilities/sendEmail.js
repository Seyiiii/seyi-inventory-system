import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1. Create the transporter using Google's SMTP settings
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465, // True for 465, false for other ports
        secure: true, // Use SSL
        auth: {
            user: process.env.EMAIL_USER, // Your actual Gmail address
            pass: process.env.EMAIL_PASS  // The 16-character App Password (NO SPACES)
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: '"Seyi Inventory" ainaseyim@gmail.com', // Replace with your Gmail
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // 3. Send the email
    await transporter.sendMail(mailOptions);
};

export default sendEmail;