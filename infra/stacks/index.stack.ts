import { Bucket, StackContext, Table } from '@serverless-stack/resources';
import { Duration } from 'aws-cdk-lib';
import { getNaming } from '../utils/naming';

export function IndexStack({ stack }: StackContext) {
	const bucket = new Bucket(stack, getNaming('email-bucket'), {
		cdk: {
			bucket: {
				lifecycleRules: [
					{
						prefix: 'queues/',
						enabled: true,
						expiration: Duration.days(30),
					},
				],
			},
		},
	});
	const idempotencyTable = new Table(stack, getNaming('idempotency-table'), {
		timeToLiveAttribute: 'ttl',
		fields: {
			idempotencyKey: 'string',
		},
		primaryIndex: { partitionKey: 'idempotencyKey' },
	});
	const notificationLogsTable = new Table(stack, getNaming('notification-log-table'), {
		fields: {
			messageId: 'string',
			email: 'string',
		},
		primaryIndex: { partitionKey: 'messageId', sortKey: 'email' },
		globalIndexes: {
			email_index: {
				partitionKey: 'email',
				projection: 'all',
			},
		},
	});
	stack.addOutputs({
		EmailBucketArn: bucket.bucketArn,
		EmailBucketName: bucket.bucketName,
		NotificationLogsTableArn: notificationLogsTable.tableArn,
		NotificationLogsTableName: notificationLogsTable.tableName,
		IdempotencyTableArn: idempotencyTable.tableArn,
		IdempotencyTableName: idempotencyTable.tableName,
	});

	return {
		bucket,
		notificationLogsTable,
		idempotencyTable,
	};
}
