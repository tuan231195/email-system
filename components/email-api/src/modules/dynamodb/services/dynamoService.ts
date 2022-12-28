import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { chunk } from 'lodash';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_TOKEN, RequestLogger } from '@vdtn359/nestjs-bootstrap';
import type { Config } from 'src/config';

@Injectable()
export class DynamoDbService {
	client: DynamoDBClient;

	documentClient: DynamoDBDocument;

	constructor(private readonly logger: RequestLogger, @Inject(CONFIG_TOKEN) private readonly config: Config) {
		this.client = new DynamoDBClient(config.get('DYNAMODB_CONFIG'));
		this.documentClient = DynamoDBDocument.from(this.client, {
			marshallOptions: {
				removeUndefinedValues: true,
			},
		});
	}

	async putItem(tableName: string, item: Record<string, any>) {
		const { Attributes: oldItem } = await this.documentClient.put({
			TableName: tableName,
			Item: item,
			ReturnValues: 'ALL_OLD',
		});
		return {
			...oldItem,
			...item,
		};
	}

	async batchPut({ tableName, items }: { tableName: string; items: any[] }) {
		// dynamodb allows up to 25 updates in bulk
		const batches = chunk(items, 25);

		for (const batch of batches) {
			// eslint-disable-next-line no-await-in-loop
			await this.documentClient.batchWrite({
				RequestItems: {
					[tableName]: batch.map((item) => ({
						PutRequest: {
							Item: item,
						},
					})),
				},
			});
		}
	}
}
