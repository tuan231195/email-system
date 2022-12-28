import { Api, Config, StackContext, Function, use, Queue, Bucket } from '@serverless-stack/resources';
import { config as loadConfig } from 'dotenv-flow';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { IndexStack as RootStack } from '../index.stack';
import { getNaming } from '../../utils/naming';

export function IndexStack({ stack }: StackContext) {
	loadConfig({
		path: 'components/email-api',
	});
	stack.setDefaultFunctionProps({
		srcPath: 'components/email-api/dist',
	});
	const { bucket, idempotencyTable, notificationLogsTable } = use(RootStack);

	const emailBucketConfig = new Config.Parameter(stack, 'EMAIL_BUCKET', {
		value: bucket.bucketName,
	});

	const notificationLogsTableConfig = new Config.Parameter(stack, 'NOTIFICATION_LOGS_TABLE', {
		value: notificationLogsTable.tableName,
	});

	const idempotencyTableConfig = new Config.Parameter(stack, 'IDEMPOTENCY_TABLE', {
		value: idempotencyTable.tableName,
	});

	const emailSenderConfig = new Config.Parameter(stack, 'EMAIL_SENDER', {
		value: process.env.EMAIL_SENDER!,
	});

	const sendgridApiKeySecret = new Config.Secret(stack, 'SENDGRID_API_KEY');

	const deadLetterQueue = new Queue(stack, getNaming('email-dlq'));

	const bindingConstructs = [
		sendgridApiKeySecret,
		notificationLogsTableConfig,
		idempotencyTableConfig,
		emailSenderConfig,
		emailBucketConfig,
		bucket,
		idempotencyTable,
		notificationLogsTable,
	];

	const queueProcessingFunction = new Function(stack, getNaming('queue-processing'), {
		handler: 'queue-processing.handler',
		deadLetterQueueEnabled: true,
		deadLetterQueue: deadLetterQueue.cdk.queue,
		retryAttempts: 2,
	});
	queueProcessingFunction.bind(bindingConstructs);

	const importedBucket = new Bucket(stack, getNaming('root-email-bucket'), {
		cdk: {
			bucket: s3.Bucket.fromBucketArn(stack, bucket.id, bucket.bucketArn),
		},
	});
	importedBucket.addNotifications(stack, {
		queueNotification: {
			events: ['object_created'],
			function: queueProcessingFunction,
		},
	});

	const api = new Api(stack, getNaming('email-api'), {
		routes: {
			$default: 'index.handler',
		},
	});
	api.bind(bindingConstructs);

	stack.addOutputs({
		EmailApiUrl: api.url,
	});
	return api;
}
