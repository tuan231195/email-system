import { Module } from '@nestjs/common';
import { ResourceService } from './services/resource.service';
import { EmailService } from './services/email.service';
import { EmailController } from './controllers/email.controller';

@Module({
	controllers: [EmailController],
	providers: [EmailService, ResourceService],
})
export class EmailModule {}
