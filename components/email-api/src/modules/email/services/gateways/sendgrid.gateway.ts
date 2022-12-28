import { Inject, Injectable } from '@nestjs/common';
import { EmailRequest } from 'src/modules/email/domain/requests/email.request';
import { EmailResponse } from 'src/modules/email/domain/responses/email.response';
import sgMail from '@sendgrid/mail';
import { CONFIG_TOKEN, RequestLogger } from '@vdtn359/nestjs-bootstrap';
import type { Config } from 'src/config';
import { ResourceService } from 'src/modules/email/services/resource.service';
import { EmailGateway } from 'src/modules/email/services/gateways/email.gateway';

@Injectable()
export class SendgridGateway extends EmailGateway {
	constructor(
		@Inject(CONFIG_TOKEN) private readonly config: Config,
		private readonly logger: RequestLogger,
		readonly resourceService: ResourceService
	) {
		super(resourceService);
		sgMail.setApiKey(this.config.get('SENDGRID_API_KEY')!);
	}

	async sendEmail(emailRequest: EmailRequest): Promise<EmailResponse> {
		this.logger.info('Sending email with sendgrid');

		const htmlContent = await this.getContent(emailRequest);

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
			...(htmlContent && { html: htmlContent }),
			...(emailRequest.body && { text: emailRequest.body }),
		} as any);
		this.logger.info('Email response', result);

		const messageId = result[0].headers['x-message-id'];

		return {
			messageId,
		};
	}
}
