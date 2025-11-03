export function resetPasswordHTMLTemplate(fullName,resetLink) {
    if (!fullName || !resetLink) throw new Error('fullName and resetLink is a must');
    return `
        <!DOCTYPE html>
            <html lang="en" style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0;">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Reset Your Password</title>
            </head>
            <body style="background-color: #f8f9fa; margin: 0; padding: 0;">
                <table
                align="center"
                cellpadding="0"
                cellspacing="0"
                width="100%"
                style="max-width: 600px; background-color: #ffffff; border-radius: 10px; margin: 40px auto; box-shadow: 0 4px 8px rgba(0,0,0,0.05);"
                >
                <tr>
                    <td style="padding: 30px; text-align: center;">
                    <h2 style="color: #333333; margin-bottom: 10px;">Hello ${fullName},</h2>
                    <p style="color: #555555; font-size: 16px; line-height: 24px; margin-bottom: 30px;">
                        We received a request to reset your password for your account at <strong>Your Restaurant</strong>.
                        Click the button below to reset it. This link will expire after 1 hour for security reasons.
                    </p>

                    <a
                        href="${resetLink}"
                        target="_blank"
                        style="background-color: #e63946; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;"
                    >
                        Reset Password
                    </a>

                    <p style="color: #777777; font-size: 14px; margin-top: 30px;">
                        If you didn’t request a password reset, please ignore this email. Your account will remain secure.
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />

                    <p style="color: #aaaaaa; font-size: 12px;">
                        © ${new Date().getFullYear()} Your Restaurant. All rights reserved.<br />
                        123 Main Street, Hertfordshire, UK
                    </p>
                    </td>
                </tr>
                </table>
            </body>
            </html>
    `
}