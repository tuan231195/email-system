import { Module } from '@nestjs/common';
import { EmailGateway } from 'src/modules/email/services/gateways/email.gateway';
import { SendgridGateway } from 'src/modules/email/services/gateways/sendgrid.gateway';
import { QueueService } from 'src/modules/email/services/queue.service';
import { CoreModule } from '@vdtn359/nestjs-bootstrap';
import { DynamoModule } from '../dynamodb/dynamo.module';
import { NotificationLogsService } from './services/notification-logs.service';
import { ResourceService } from './services/resource.service';
import { EmailService } from './services/email.service';
import { EmailController } from './controllers/email.controller';

@Module({
	imports: [DynamoModule, CoreModule],
	controllers: [EmailController],
	exports: [QueueService, EmailService],
	providers: [
		QueueService,
		EmailService,
		ResourceService,
		NotificationLogsService,
		{
			provide: EmailGateway,
			useClass: SendgridGateway,
		},
	],
})
export class EmailModule {}
