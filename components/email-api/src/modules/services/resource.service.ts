import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_TOKEN } from '@vdtn359/nestjs-bootstrap';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import type { Config } from '../../config';

@Injectable()
export class ResourceService {
	private s3: S3Client;

	constructor(@Inject(CONFIG_TOKEN) private readonly config: Config) {
		this.s3 = new S3Client({
			...config.get('AWS_SDK_CONFIG'),
		});
	}

	async getAttachment(attachmentPath: string, encoding?: BufferEncoding) {
		const content = await this.getContent(`attachments/${attachmentPath}`);

		return encoding ? Buffer.from(content).toString(encoding) : content;
	}

	getTemplate(template: string, language = 'en') {
		return this.getContent(`templates/${template}/${language}`);
	}

	private async getContent(key: string) {
		const s3Bucket = this.config.get('EMAIL_BUCKET')!;

		const { Body } = await this.s3.send(
			new GetObjectCommand({
				Bucket: s3Bucket,
				Key: key,
			})
		);

		return (await Body?.transformToString('utf-8')) ?? '';
	}
}
