import { ApiProperty, ApiPropertyOptional, serialize } from '@vdtn359/nestjs-bootstrap';

export class EmailResponse {
	@ApiProperty({
		type: String,
	})
	messageId!: string;

	@ApiPropertyOptional({
		type: String,
	})
	idempotencyKey?: string;
}

export function toEmailResponse(emailResponse: any) {
	return serialize(EmailResponse, emailResponse);
}
