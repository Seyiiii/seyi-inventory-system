export const welcomeTemplate = ({ name, role }) => {
    const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Seyi Inventory</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
                <td align="center">
                    
                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                        
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 40px 20px; text-align: center;">
                                <img src="cid:seyilogo" alt="Seyi Inventory Logo" width="64" height="64" style="display: block; width: 64px; height: 64px; border-radius: 50%; border: 3px solid #2f81f7; background-color: #ffffff; margin: 0 auto 16px auto;" />
                                
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                                    SEYI<span style="color: #2f81f7;">INVENTORY</span>
                                </h1>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 40px 40px 30px 40px;">
                                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 700;">Welcome aboard, ${name.split(' ')[0]}! 👋</h2>
                                
                                <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                    Your account has been successfully created. We are thrilled to have you onboard the Seyi Inventory System. Our platform gives you real-time insights and complete control over your assets.
                                </p>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 32px;">
                                    <tr>
                                        <td style="padding: 16px 20px; text-align: center;">
                                            <p style="margin: 0; color: #1e3a8a; font-size: 14px;">
                                                Assigned System Role: <strong style="text-transform: uppercase; letter-spacing: 1px; margin-left: 8px; color: #2f81f7;">${role.replace('_', ' ')}</strong>
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td align="center">
                                            <a href="${dashboardUrl}" style="display: inline-block; background-color: #2f81f7; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; text-align: center; box-shadow: 0 4px 6px rgba(47, 129, 247, 0.2);">
                                                Access Your Dashboard
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 0 40px;">
                                <div style="height: 1px; background-color: #e5e7eb; width: 100%;"></div>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 30px 40px 40px 40px; text-align: center;">
                                <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                                    Need help getting started? Check out our <a href="${dashboardUrl}" style="color: #2f81f7; text-decoration: none;">documentation</a> or reply to this email.
                                </p>
                                <p style="margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
                                    &copy; ${new Date().getFullYear()} Seyi Inventory System
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};