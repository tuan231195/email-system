import 'reflect-metadata';
import { AsyncContext, RequestLogger, TRACE_ID } from '@vdtn359/nestjs-bootstrap';
import { Context, S3CreateEvent } from 'aws-lambda';
import { bootstrap } from 'src/app';
import { INestApplication } from '@nestjs/common';
import { EmailService } from 'src/modules/email/services/email.service';
import { QueueService } from 'src/modules/email/services/queue.service';

let cachedApp: Promise<INestApplication>;

export const handler = async (event: S3CreateEvent, context: Context) => {
	const [record] = event.Records;
	if (!record) {
		return;
	}
	if (!cachedApp) {
		cachedApp = bootstrap().then(async (app) => {
			await app.init();
			return app;
		});
	}

	const app = await cachedApp;
	const asyncContext = app.get(AsyncContext);
	const emailService = app.get(EmailService);
	const queueService = app.get(QueueService);

	const { emailProps, traceId } = await queueService.retrieveEmailQueue(record.s3.object.key);
	await asyncContext.registerCallback(async () => {
		asyncContext.set(TRACE_ID, traceId);

		const logger = app.get(RequestLogger);

		try {
			await emailService.sendEmail({
				...emailProps,
				timeoutInMillis: context.getRemainingTimeInMillis(),
			});
		} catch (err) {
			logger.error('Failed to process email queue', err);
			throw err;
		}
	});
};
