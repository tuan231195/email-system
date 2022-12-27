import { RequestLogger, ApiTags, ApiCreatedResponse } from '@vdtn359/nestjs-bootstrap';
import { Body, Controller, Post } from '@nestjs/common';
import { EmailResponse, toEmailResponse } from 'src/modules/domain/responses/email.response';
import { EmailRequest } from '../domain/requests/email.request';
import { EmailService } from '../services/email.service';

@ApiTags('Simple')
@Controller({
	version: '1',
	path: '/email',
})
export class EmailController {
	constructor(private readonly emailService: EmailService, private readonly logger: RequestLogger) {}

	@Post()
	@ApiCreatedResponse({
		type: EmailResponse,
	})
	async sendEmail(@Body() emailRequest: EmailRequest) {
		return toEmailResponse(await this.emailService.sendEmail(emailRequest));
	}
}
