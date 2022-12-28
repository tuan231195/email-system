import { ApiAcceptedResponse, ApiCreatedResponse, ApiTags, RequestLogger } from '@vdtn359/nestjs-bootstrap';
import { Body, Controller, Headers, Post, Request } from '@nestjs/common';
import { QueueService } from 'src/modules/email/services/queue.service';
import { EmailResponse, toEmailResponse } from '../domain/responses/email.response';
import { EmailRequest } from '../domain/requests/email.request';
import { EmailService } from '../services/email.service';

@ApiTags('Simple')
@Controller({
	version: '1',
	path: '/email',
})
export class EmailController {
	constructor(
		private readonly emailService: EmailService,
		private readonly queueService: QueueService,
		private readonly logger: RequestLogger
	) {}

	@Post()
	@ApiCreatedResponse({
		type: EmailResponse,
	})
	async sendEmail(
		@Body() emailRequest: EmailRequest,
		@Request() request: any,
		@Headers('x-time-to-live') ttlInMillis?: string,
		@Headers('x-idempotency-key') idempotencyKey?: string
	) {
		const timeoutInMillis = request.awsLambda?.context?.getRemainingTimeInMillis();
		return toEmailResponse(
			await this.emailService.sendEmail({
				emailRequest,
				ttlInMillis: ttlInMillis !== undefined ? +ttlInMillis : undefined,
				timeoutInMillis: timeoutInMillis !== undefined ? timeoutInMillis : undefined,
				idempotencyKey: idempotencyKey !== undefined ? idempotencyKey : undefined,
			})
		);
	}

	@Post('/queue')
	@ApiAcceptedResponse()
	async queueEmail(
		@Body() emailRequest: EmailRequest,
		@Headers('x-time-to-live') ttlInMillis?: string,
		@Headers('x-idempotency-key') idempotencyKey?: string
	) {
		await this.queueService.saveEmailRequest({
			emailRequest,
			ttlInMillis: ttlInMillis !== undefined ? +ttlInMillis : undefined,
			idempotencyKey: idempotencyKey !== undefined ? idempotencyKey : undefined,
		});
	}
}
