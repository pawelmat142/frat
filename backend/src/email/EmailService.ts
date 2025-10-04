/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmailConfig } from './EmailConfig';
import axios from 'axios';
import { Util } from '@shared/utils/util';

export interface SendEmailParams {
    to_email: string;
    to_name?: string;
    subject?: string;
    message?: string;
    [key: string]: any; // Dodatkowe parametry dla template
}

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly EMAILJS_API_URL = 'https://api.emailjs.com/api/v1.0/email/send';

    constructor(private readonly emailConfig: EmailConfig) { }

    async sendEmail(params: SendEmailParams): Promise<boolean> {
        if (!this.emailConfig.isConfigured) {
            this.logger.warn('EmailJS is not configured. Skipping email send.');
            return false;
        }

        const payload = {
            service_id: this.emailConfig.serviceId,
            template_id: this.emailConfig.templateId,
            user_id: this.emailConfig.publicKey,
            accessToken: this.emailConfig.privateKey,
            template_params: params,
        };

        this.logger.debug('Sending email with EmailJS...');

        const response = await axios.post(this.EMAILJS_API_URL, payload, {
            headers: {
                'Content-Type': 'application/json',
            },  
        });

        if (response.status === 200) {
            this.logger.log(`Email sent successfully to ${params.to_email}`);
            return true;
        }
        throw new Error(response.statusText || 'Email send failed');
    }

    async sendVerificationEmail(
        email: string,
        verificationLink: string,
    ): Promise<boolean> {
        const replyToEmail = process.env.EMAILJS_REPLY_TO_EMAIL;
        console.log('Reply-To Email:', replyToEmail);
        return this.sendEmail({
            to_email: email,
            email: replyToEmail,
            name: 'FRAT Support',
            time: Util.displayDateWithTime(new Date()),
            subject: 'Email Verification',
            message: `Please verify your email by clicking the link:`,
            verification_link: verificationLink,
        });
    }

    // TODO
    async sendPasswordResetEmail(
        email: string,
        resetLink: string,
    ): Promise<boolean> {
        return this.sendEmail({
            name: email,
            to_email: email,
            email: email,
            subject: 'Password Reset',
            message: `Reset your password by clicking the link: ${resetLink}`,
            reset_link: resetLink,
        });
    }
}
