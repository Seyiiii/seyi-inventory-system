export const orderReceiptTemplate = ({ name, order }) => {
    const itemsHTML = order.orderItems.map(item => `
        <tr>
            <td style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${item.image
                        ? `<img src="${item.image}" alt="${item.name}" 
                               style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; border: 1px solid #e5e7eb;" />`
                        : `<div style="width: 60px; height: 60px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px;">📦</div>`
                    }
                    <div>
                        <p style="margin: 0; font-weight: 600; color: #111827; font-size: 14px;">${item.name}</p>
                        <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Qty: ${item.quantity}</p>
                    </div>
                </div>
            </td>
            <td style="padding: 16px; border-bottom: 1px solid #f0f0f0; text-align: right; vertical-align: middle;">
                <p style="margin: 0; font-weight: 600; color: #059669; font-size: 14px;">
                    NGN ${(item.price * item.quantity).toLocaleString()}
                </p>
                <p style="margin: 4px 0 0; color: #9ca3af; font-size: 12px;">
                    NGN ${item.price.toLocaleString()} each
                </p>
            </td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Order Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 40px 32px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                    SEYI<span style="color: #93c5fd;">INVENTORY</span>
                </h1>
                <div style="margin-top: 20px; width: 64px; height: 64px; background: rgba(255,255,255,0.15); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 32px;">
                    ✅
                </div>
                <h2 style="margin: 12px 0 0; color: #ffffff; font-size: 22px; font-weight: 700;">Order Confirmed!</h2>
                <p style="margin: 8px 0 0; color: #bfdbfe; font-size: 15px;">Thank you for your purchase, ${name}.</p>
            </div>

            <!-- Order Number Banner -->
            <div style="background: #eff6ff; padding: 16px 32px; border-bottom: 1px solid #dbeafe; text-align: center;">
                <p style="margin: 0; color: #6b7280; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em;">Order Number</p>
                <p style="margin: 4px 0 0; color: #1d4ed8; font-size: 22px; font-weight: 800; letter-spacing: 1px;">${order.orderNumber}</p>
            </div>

            <!-- Body -->
            <div style="padding: 32px;">

                <!-- Items -->
                <h3 style="margin: 0 0 16px; color: #111827; font-size: 16px; font-weight: 700;">Items Ordered</h3>
                <table style="width: 100%; border-collapse: collapse; border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden;">
                    <tbody>
                        ${itemsHTML}
                    </tbody>
                </table>

                <!-- Total -->
                <div style="margin-top: 16px; background: #f9fafb; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; border: 1px solid #e5e7eb;">
                    <div style="display: flex; justify-content: space-between; width: 100%;">
                        <div>
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">Payment Method</p>
                            <p style="margin: 4px 0 0; color: #111827; font-weight: 600; font-size: 14px;">${order.paymentMethod}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">Order Total</p>
                            <p style="margin: 4px 0 0; color: #059669; font-weight: 800; font-size: 22px;">NGN ${order.totalPrice.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <!-- Shipping -->
                <div style="margin-top: 24px;">
                    <h3 style="margin: 0 0 12px; color: #111827; font-size: 16px; font-weight: 700;">Shipping To</h3>
                    <div style="background: #f9fafb; border-radius: 12px; padding: 16px 20px; border: 1px solid #e5e7eb;">
                        <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.6;">
                            ${order.shippingAddress.address}<br/>
                            ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br/>
                            ${order.shippingAddress.country}
                        </p>
                    </div>
                </div>

                <!-- Status -->
                <div style="margin-top: 24px; background: #ecfdf5; border-radius: 12px; padding: 16px 20px; border: 1px solid #d1fae5; text-align: center;">
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                        🚚 <strong>Your order is being processed</strong> and will be delivered soon. We'll notify you when it's on its way!
                    </p>
                </div>

            </div>

            <!-- Footer -->
            <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 24px 32px; text-align: center;">
                <p style="margin: 0; color: #9ca3af; font-size: 13px;">
                    Questions about your order? Reply to this email and we'll help you out.
                </p>
                <p style="margin: 12px 0 0; color: #d1d5db; font-size: 12px;">
                    © ${new Date().getFullYear()} Seyi Inventory. All rights reserved.
                </p>
            </div>

        </div>
    </body>
    </html>
    `;
};