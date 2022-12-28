import { Inject, Injectable } from '@nestjs/common';
import { AsyncContext, CONFIG_TOKEN, TRACE_ID } from '@vdtn359/nestjs-bootstrap';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import type { Config } from 'src/config';
import { SendEmailProps } from 'src/modules/email/domain/interfaces/send-email';

@Injectable()
export class QueueService {
	private s3: S3Client;

	constructor(@Inject(CONFIG_TOKEN) private readonly config: Config, private readonly ac: AsyncContext<string, any>) {
		this.s3 = new S3Client({
			...config.get('AWS_SDK_CONFIG'),
		});
	}

	async saveEmailRequest({ idempotencyKey, ttlInMillis, emailRequest }: SendEmailProps) {
		const s3Bucket = this.config.get('EMAIL_BUCKET')!;
		const traceId = this.ac.get(TRACE_ID);

		await this.s3.send(
			new PutObjectCommand({
				Bucket: s3Bucket,
				Key: `queues/${uuidv4()}`,
				Metadata: {
					[TRACE_ID]: traceId,
				},
				Body: JSON.stringify({
					emailRequest,
					idempotencyKey,
					ttlInMillis,
				}),
			})
		);
	}

	async retrieveEmailQueue(key: string) {
		const s3Bucket = this.config.get('EMAIL_BUCKET')!;

		const { Body, Metadata } = await this.s3.send(
			new GetObjectCommand({
				Bucket: s3Bucket,
				Key: key,
			})
		);

		return {
			emailProps: JSON.parse((await Body?.transformToString('utf-8')) ?? '{}') as SendEmailProps,
			traceId: Metadata?.[TRACE_ID] ?? uuidv4(),
		};
	}
}
