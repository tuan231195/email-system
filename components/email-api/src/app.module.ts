import 'reflect-metadata';
import { NestjsBootstrapModule } from '@vdtn359/nestjs-bootstrap';
import { EmailModule } from './modules/email.module';
import { config } from './config';

const { version } = require('../package.json');

@NestjsBootstrapModule({
	bootstrapOptions: {
		swagger: {
			title: 'Email API',
		},
		version,
		name: 'email-api',
		config,
	},
	imports: [EmailModule],
})
export class AppModule {}
