import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_TOKEN, RequestLogger } from '@vdtn359/nestjs-bootstrap';
import sgMail from '@sendgrid/mail';
import { EmailResponse } from 'src/modules/domain/responses/email.response';
import { Config } from '../../config';
import { EmailAttachments, EmailRequest } from '../domain/requests/email.request';
import { ResourceService } from './resource.service';

@Injectable()
export class EmailService {
	constructor(
		@Inject(CONFIG_TOKEN) private readonly config: Config,
		private readonly logger: RequestLogger,
		private readonly resourceService: ResourceService
	) {
		sgMail.setApiKey(this.config.get('SENDGRID_API_KEY')!);
	}

	async sendEmail(emailRequest: EmailRequest): Promise<EmailResponse> {
		const htmlContent = await this.getContent(emailRequest);
		this.logger.info(`Sending email`, emailRequest.recipients);
		this.logger.debug('Email request', emailRequest);
		try {
			const result = await sgMail.send({
				from: emailRequest.from ?? this.config.get('EMAIL_SENDER')!,
				to: emailRequest.recipients.to,
				subject: emailRequest.subject,
				substitutions: emailRequest.data,
				cc: emailRequest.recipients.cc,
				bcc: emailRequest.recipients.bcc,
				attachments: await Promise.all(
					(emailRequest.attachments ?? []).map(async (attachment) => ({
						content: await this.getAttachmentContent(attachment),
						filename: attachment.name,
						type: attachment.type,
						disposition: 'attachment',
						content_id: attachment.name,
					}))
				),
				text: emailRequest.body ?? '',
				...(htmlContent && { html: htmlContent }),
			});
			this.logger.info('Email response', result);

			return {
				messageId: result[0].headers['x-message-id'],
			};
		} catch (err) {
			this.logger.error('Failed to send email', { err });
			throw err;
		}
	}

	private getContent(emailRequest: EmailRequest) {
		if (emailRequest.html) {
			return emailRequest.html;
		}
		if (!emailRequest.template) {
			return '';
		}
		return this.resourceService.getTemplate(emailRequest.template, emailRequest.language);
	}

	private getAttachmentContent(attachment: EmailAttachments) {
		if (attachment.content) {
			return attachment.content;
		}
		return this.resourceService.getAttachment(attachment.key!, 'base64');
	}
}
