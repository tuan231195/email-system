import { EmailRequest } from 'src/modules/email/domain/requests/email.request';

export interface SendEmailProps {
	idempotencyKey?: string;
	ttlInMillis?: number;
	timeoutInMillis?: number;
	emailRequest: EmailRequest;
}
