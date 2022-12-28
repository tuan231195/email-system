import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_TOKEN, RequestLogger } from '@vdtn359/nestjs-bootstrap';
import { DynamoDbStore, handleIdempotency, IdempotencyHandlers } from '@vdtn359/idempotency';
import type { Config } from 'src/config';
import { EmailGateway } from 'src/modules/email/services/gateways/email.gateway';
import { SendEmailProps } from 'src/modules/email/domain/interfaces/send-email';
import { NotificationLogsService } from './notification-logs.service';
import { EmailResponse } from '../domain/responses/email.response';

@Injectable()
export class EmailService {
	private idempotencyHandler: IdempotencyHandlers<Promise<EmailResponse>>;

	constructor(
		@Inject(CONFIG_TOKEN) private readonly config: Config,
		private readonly logger: RequestLogger,
		private readonly emailGateway: EmailGateway,
		private readonly notificationLogsService: NotificationLogsService
	) {
		this.idempotencyHandler = handleIdempotency(
			new DynamoDbStore(this.config.get('DYNAMODB_CONFIG')!, config.get('IDEMPOTENCY_TABLE')!, logger),
			logger
		);
	}

	async sendEmail({
		idempotencyKey,
		ttlInMillis,
		timeoutInMillis,
		emailRequest,
	}: SendEmailProps): Promise<EmailResponse> {
		return this.idempotencyHandler({
			idempotencyKey,
			ttlInMillis,
			timeoutInMillis,
			handler: async () => {
				this.logger.info(`Sending email`, { recipients: emailRequest.recipients });
				this.logger.debug('Email request', emailRequest);
				try {
					throw new Error('bad');
					const emailResponse = await this.emailGateway.sendEmail(emailRequest);
					const { messageId } = emailResponse;
					if (messageId) {
						await this.notificationLogsService
							.saveNotificationLogs(messageId, emailRequest)
							.catch((err) => {
								this.logger.error('Failed to save notification logs', { err });
							});
					}
					return emailResponse;
				} catch (err) {
					this.logger.error('Failed to send email', { err });
					throw err;
				}
			},
		});
	}
}
