import { Resend } from 'resend';
import { emailHTMLTemplate  } from './emailTemplate.js';

export async function emailSender(reservation) {
        const resend = new Resend(process.env.EMAIL_KEY);
        const {subject,html} =  emailHTMLTemplate(reservation);
        const { data, error } = await resend.emails.send({
        from: 'Acme <onboarding@resend.dev>',
        to: ['mazharuli1999@gmail.com'],
        subject: subject,
        html,
    });

    if (error) {
        return {error:"can't send email"};
    }

    return {id:data.id};
}
