import nodemailer from 'nodemailer';

const sendEmail  = async (options) => {
    const transporter = nodemailer.createTransport ({
          host: 'smtp.gmail.com',  // explicit host instead of service: 'gmail'
        port: 465,
        secure: true,            // true for port 465
        family: 4, 
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        family: 4
    });

    const mailOptions ={
        from: `"Inventory System" <${process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.text || '',
        html: options.html || ''
    };

    await  transporter.sendMail(mailOptions);
};


export default sendEmail;