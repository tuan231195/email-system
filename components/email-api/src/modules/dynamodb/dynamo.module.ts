import { Module } from '@nestjs/common';
import { DynamoDbService } from './services';

@Module({
	providers: [DynamoDbService],
	exports: [DynamoDbService],
})
export class DynamoModule {}
