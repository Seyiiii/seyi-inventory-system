const dashboardUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// ─── 1. WELCOME TEMPLATE ─────────────────────────────────────────────
export const welcomeTemplate = ({ name, role }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to Seyi Inventory</title></head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 40px 20px; text-align: center;">
                                <img src="https://seyi-inventory-system.vercel.app/logo.png" alt="Logo" width="64" height="64" style="display: block; width: 64px; height: 64px; border-radius: 50%; border: 3px solid #2f81f7; background-color: #ffffff; margin: 0 auto 16px auto;" />
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">SEYI<span style="color: #2f81f7;">INVENTORY</span></h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px;">
                                <h2 style="margin: 0 0 20px 0; color: #111827; font-size: 24px; font-weight: 700;">Welcome aboard, ${name.split(' ')[0]}! 👋</h2>
                                <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">Your account has been successfully created. We are thrilled to have you onboard the Seyi Inventory System.</p>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f6ff; border: 1px solid #bfdbfe; border-radius: 8px; margin-bottom: 32px;">
                                    <tr>
                                        <td style="padding: 16px 20px; text-align: center;">
                                            <p style="margin: 0; color: #1e3a8a; font-size: 14px;">Assigned System Role: <strong style="text-transform: uppercase; letter-spacing: 1px; color: #2f81f7;">${role.replace('_', ' ')}</strong></p>
                                        </td>
                                    </tr>
                                </table>
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <td align="center">
                                            <a href="${dashboardUrl}" style="display: inline-block; background-color: #2f81f7; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">Access Dashboard</a>
                                        </td>
                                    </tr>
                                </table>
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

// ─── 2. ORDER RECEIPT TEMPLATE ────────────────────────────────────────
export const orderReceiptTemplate = ({ name, order }) => {
    const itemsHTML = order.orderItems.map(item => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
                <p style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">${item.name}</p>
                <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Qty: ${item.quantity}</p>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f0f0f0; text-align: right;">
                <p style="margin: 0; font-weight: 600; color: #059669; font-size: 14px;">NGN ${(item.price * item.quantity).toLocaleString('en-NG')}</p>
            </td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Order Confirmed</title></head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 40px 20px;">
                                <img src="https://seyi-inventory-system.vercel.app/logo.png" alt="Logo" width="64" height="64" style="display: block; border-radius: 50%; border: 3px solid #2f81f7; background-color: #ffffff; margin: 0 auto 16px auto;" />
                                <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800;">Order Confirmed! ✅</h1>
                                <p style="margin: 8px 0 0; color: #7d8590; font-size: 15px;">Thank you for your purchase, ${name.split(' ')[0]}.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background: #f0f6ff; padding: 16px; text-align: center; border-bottom: 1px solid #dbeafe;">
                                <p style="margin: 0; color: #6b7280; font-size: 12px; text-transform: uppercase;">Order Number</p>
                                <p style="margin: 4px 0 0; color: #2f81f7; font-size: 20px; font-weight: 800;">${order.orderNumber}</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 32px;">
                                <h3 style="margin: 0 0 16px; color: #111827;">Items Ordered</h3>
                                <table style="width: 100%; border-collapse: collapse; border: 1px solid #f0f0f0; border-radius: 8px;">
                                    ${itemsHTML}
                                </table>
                                <div style="margin-top: 16px; background: #f9fafb; border-radius: 8px; padding: 16px; border: 1px solid #e5e7eb; text-align: right;">
                                    <p style="margin: 0; color: #6b7280; font-size: 13px;">Order Total</p>
                                    <p style="margin: 4px 0 0; color: #059669; font-weight: 800; font-size: 22px;">NGN ${order.totalPrice.toLocaleString('en-NG')}</p>
                                </div>
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

// ─── 3. ROLE UPDATE TEMPLATE ─────────────────────────────────────────
export const roleUpdateTemplate = ({ name, role }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Role Updated</title></head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
                        <tr>
                            <td align="center" style="background: linear-gradient(135deg, #0d1117 0%, #161b22 100%); padding: 30px 20px;">
                                <img src="https://seyi-inventory-system.vercel.app/logo.png" alt="Logo" width="48" height="48" style="display: block; border-radius: 50%; border: 2px solid #2f81f7; background-color: #ffffff; margin: 0 auto 12px auto;" />
                                <h1 style="margin: 0; color: #ffffff; font-size: 22px;">Account Permissions Updated</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px;">
                                <p style="margin: 0 0 24px; color: #4b5563; font-size: 15px; line-height: 1.6;">Hello ${name.split(' ')[0]}, an administrator has recently updated your system access privileges.</p>
                                <div style="background: #fdfae8; border: 1px solid #fde047; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
                                    <p style="margin: 0; color: #854d0e; font-size: 12px; text-transform: uppercase; font-weight: 700;">New Role Assigned</p>
                                    <p style="margin: 4px 0 0; color: #713f12; font-size: 20px; font-weight: 800; text-transform: uppercase;">${role.replace('_', ' ')}</p>
                                </div>
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">Please log out and log back in to ensure your new permissions take effect.</p>
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

// ─── 4. LOW STOCK ALERT TEMPLATE ──────────────────────────────────────
export const lowStockAlertTemplate = ({ productName, sku, currentStock }) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"><title>Low Stock Alert</title></head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fee2e2;">
                        <tr>
                            <td style="background: #fef2f2; border-bottom: 1px solid #fecaca; padding: 24px; text-align: center;">
                                <h2 style="margin: 0; color: #991b1b; font-size: 20px;">⚠️ Critical Low Stock Alert</h2>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 32px;">
                                <p style="margin: 0 0 20px; color: #374151; font-size: 15px;">Automated system warning: The following inventory asset requires immediate attention.</p>
                                <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
                                    <p style="margin: 0 0 8px; color: #111827; font-weight: 600; font-size: 16px;">${productName}</p>
                                    <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px; font-family: monospace;">SKU: ${sku}</p>
                                    <p style="margin: 0; color: #dc2626; font-weight: 800; font-size: 16px;">Current Stock: ${currentStock} units</p>
                                </div>
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