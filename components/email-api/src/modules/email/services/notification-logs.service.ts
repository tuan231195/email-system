import { Inject, Injectable } from '@nestjs/common';
import { DynamoDbService } from 'src/modules/dynamodb/services';
import { EmailRequest } from 'src/modules/email/domain/requests/email.request';
import { CONFIG_TOKEN } from '@vdtn359/nestjs-bootstrap';
import type { Config } from 'src/config';
import { convertToPlain } from '@vdtn359/nestjs-bootstrap/dist/utils/serialize';
import { keyBy } from 'lodash';

@Injectable()
export class NotificationLogsService {
	constructor(
		private readonly dynamoService: DynamoDbService,
		@Inject(CONFIG_TOKEN) private readonly config: Config
	) {}

	async saveNotificationLogs(messageId: string, emailRequest: EmailRequest) {
		const { recipients, ...request } = emailRequest;
		const allEmails = Object.entries(recipients)
			.map(([type, emails]) =>
				emails.map((email: string) => ({
					type,
					email,
				}))
			)
			.flat();
		const uniqueEmails = Object.values(keyBy(allEmails, 'email'));

		await this.dynamoService.batchPut({
			tableName: this.config.get('NOTIFICATION_LOGS_TABLE')!,
			items: uniqueEmails.map(({ type, email }) =>
				convertToPlain({
					...request,
					type,
					email,
					messageId,
				})
			),
		});
	}
}
