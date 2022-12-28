import { EmailResponse } from 'src/modules/email/domain/responses/email.response';
import { EmailAttachments, EmailRequest } from 'src/modules/email/domain/requests/email.request';
import { ResourceService } from 'src/modules/email/services/resource.service';

export abstract class EmailGateway {
	constructor(protected readonly resourceService: ResourceService) {}

	abstract sendEmail(emailRequest: EmailRequest): Promise<EmailResponse>;

	protected getContent(emailRequest: EmailRequest) {
		if (emailRequest.html) {
			return emailRequest.html;
		}
		if (!emailRequest.template) {
			return '';
		}
		return this.resourceService.getTemplate(emailRequest.template, emailRequest.language);
	}

	protected getAttachmentContent(attachment: EmailAttachments) {
		if (attachment.content) {
			return attachment.content;
		}
		return this.resourceService.getAttachment(attachment.key!, 'base64');
	}
}
