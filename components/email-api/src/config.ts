import 'dotenv-flow/config';
import { createConfig, logger } from '@vdtn359/nestjs-bootstrap';

export const config = async () => {
	let fetchedConfig: Record<string, string>;
	const configProxy = (wrapper: any) =>
		new Proxy(wrapper, {
			get(obj: any, prop: string) {
				try {
					return obj[prop] ?? process.env[prop] ?? null;
				} catch (err) {
					return null;
				}
			},
		});
	try {
		fetchedConfig = await import('@serverless-stack/node/config').then(({ Config }) => configProxy(Config));
	} catch (err) {
		logger.error('Failed to load config', { err });
		fetchedConfig = configProxy(process.env);
	}
	return createConfig(
		{
			APP_HOST: {
				format: String,
				nullable: false,
				default: '0.0.0.0',
			},
			PORT: {
				format: 'port',
				default: 8080,
			},
			EMAIL_BUCKET: {
				format: String,
				nullable: false,
				default: null,
			},
			EMAIL_SENDER: {
				format: String,
				nullable: false,
				default: null,
			},
			SENDGRID_API_KEY: {
				format: String,
				nullable: false,
				sensitive: true,
				default: null,
			},
			NOTIFICATION_LOGS_TABLE: {
				format: String,
				nullable: false,
				default: null,
			},
			IDEMPOTENCY_TABLE: {
				format: String,
				nullable: false,
				default: null,
			},
			DYNAMODB_CONFIG: {
				format: Object,
				nullable: false,
				default: { region: 'ap-southeast-2' },
			},
			AWS_SDK_CONFIG: {
				format: Object,
				nullable: false,
				default: { region: 'ap-southeast-2' },
			},
		},
		fetchedConfig
	);
};

export type Config = Awaited<ReturnType<typeof config>>;
