import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (options) => {
    await resend.emails.send({
        from: 'Seyi Inventory System <onboarding@resend.com>',
        to: options.email,
        subject: options.subject,
        text: options.text || '',
        html: options.html || ''
    });
};

export default sendEmail;