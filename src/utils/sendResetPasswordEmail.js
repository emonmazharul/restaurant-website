import { Resend } from 'resend';
import { resetPasswordHTMLTemplate } from './resetPasswordTemplate.js';

export async function sendResetPasswordEmail(fullName,resetLink,userEmail=process.env.ADMIN_EMAIL) {
        const resend = new Resend(process.env.EMAIL_KEY);
        const subject = `Password reset request for your Anwar's Restaurant account`
        const html = resetPasswordHTMLTemplate(fullName,resetLink);
        const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: userEmail,
        subject: subject,
        html,
    });

    if (error) {
        return {error:"can't send email"};
    }

    return {id:data.id};
}