import 'dotenv-flow/config';
import { createConfig } from '@vdtn359/nestjs-bootstrap';

export const config = createConfig({
	APP_HOST: {
		format: String,
		nullable: false,
		default: '0.0.0.0',
		env: 'APP_HOST',
	},
	PORT: {
		format: 'port',
		default: 8080,
		env: 'PORT',
	},
	EMAIL_BUCKET: {
		format: String,
		nullable: false,
		default: null,
		env: 'EMAIL_BUCKET',
	},
	EMAIL_SENDER: {
		format: String,
		nullable: false,
		default: null,
		env: 'EMAIL_SENDER',
	},
	SENDGRID_API_KEY: {
		format: String,
		nullable: false,
		default: null,
		sensitive: true,
		env: 'SENDGRID_API_KEY',
	},
	AWS_SDK_CONFIG: {
		format: Object,
		nullable: false,
		default: { region: 'ap-southeast-2' },
		env: 'AWS_SDK_CONFIG',
	},
});

export type Config = typeof config;
