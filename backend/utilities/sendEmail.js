const sendEmail = async (options) => {
    try {
        const response = await fetch(process.env.GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                email: options.email,
                subject: options.subject,
                html: options.html
            })
        });

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.error);
        }
    } catch (error) {
        throw new Error(`Webhook failed: ${error.message}`);
    }
};

export default sendEmail;