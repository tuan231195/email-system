import { ApiProperty, ApiPropertyOptional } from '@vdtn359/nestjs-bootstrap';
import { IsEmail, IsEnum, IsNotEmpty, IsObject, ValidateIf } from 'class-validator';

export enum EmailLanguage {
	EN = 'en',
	FR = 'fr',
	IT = 'it',
}

export class EmailRecipients {
	@ApiProperty({
		type: String,
		isArray: true,
	})
	@IsNotEmpty({
		each: true,
	})
	@IsEmail(undefined, { each: true })
	to!: string[];

	@ApiPropertyOptional({
		type: String,
		isArray: true,
	})
	@IsNotEmpty({
		each: true,
	})
	@IsEmail(undefined, { each: true })
	cc?: string[];

	@ApiPropertyOptional({
		type: String,
		isArray: true,
	})
	@IsNotEmpty({
		each: true,
	})
	@IsEmail(undefined, { each: true })
	bcc?: string[];
}

export class EmailAttachments {
	@ApiProperty({
		type: String,
		nullable: false,
	})
	@ValidateIf((o) => o.content === undefined)
	@IsNotEmpty()
	key?: string;

	@ApiPropertyOptional({
		type: String,
		nullable: false,
		disableDefaultValidation: true,
	})
	@ValidateIf((o) => o.key === undefined)
	@IsNotEmpty()
	content?: string;

	@ApiProperty({
		type: String,
	})
	@IsNotEmpty()
	name!: string;

	@ApiPropertyOptional({
		type: String,
		nullable: false,
	})
	@IsNotEmpty()
	type?: string;
}

export class EmailRequest {
	@ApiPropertyOptional({
		type: String,
	})
	@IsEmail()
	@IsNotEmpty()
	from?: string;

	@ApiProperty({
		type: String,
	})
	@IsNotEmpty()
	subject!: string;

	@ApiPropertyOptional()
	@IsObject()
	data?: Record<string, any>;

	@ApiProperty({
		type: EmailRecipients,
	})
	recipients!: EmailRecipients;

	@ApiPropertyOptional({
		type: String,
		nullable: false,
		disableDefaultValidation: true,
	})
	@IsNotEmpty()
	@ValidateIf((o) => (o.html || o.template) === undefined)
	body?: string;

	@ApiPropertyOptional({
		type: String,
		nullable: false,
		disableDefaultValidation: true,
	})
	@ValidateIf((o) => (o.body || o.template) === undefined)
	@IsNotEmpty()
	html?: string;

	@ApiPropertyOptional({
		type: String,
		nullable: false,
		disableDefaultValidation: true,
	})
	@ValidateIf((o) => (o.html || o.body) === undefined)
	@IsNotEmpty()
	template?: string;

	@ApiPropertyOptional({
		type: String,
		nullable: false,
		enum: EmailLanguage,
	})
	@IsEnum(EmailLanguage)
	language?: string;

	@ApiPropertyOptional({
		type: EmailAttachments,
		isArray: true,
		nullable: false,
	})
	attachments?: EmailAttachments[];
}
