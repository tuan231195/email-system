import 'dotenv-flow/config';
import { createConfig, logger } from '@vdtn359/nestjs-bootstrap';

export const config = async () => {
	let fetchedConfig: Record<string, any>;
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
		fetchedConfig = configProxy({});
	}
	return createConfig({
		APP_HOST: {
			format: String,
			nullable: false,
			default: fetchedConfig.APP_HOST ?? '0.0.0.0',
		},
		PORT: {
			format: 'port',
			default: fetchedConfig.PORT ?? 8080,
		},
		EMAIL_BUCKET: {
			format: String,
			nullable: false,
			default: fetchedConfig.EMAIL_BUCKET,
		},
		EMAIL_SENDER: {
			format: String,
			nullable: false,
			default: fetchedConfig.EMAIL_SENDER,
		},
		SENDGRID_API_KEY: {
			format: String,
			nullable: false,
			sensitive: true,
			default: fetchedConfig.SENDGRID_API_KEY,
		},
		AWS_SDK_CONFIG: {
			format: Object,
			nullable: false,
			default: fetchedConfig.AWS_SDK_CONFIG ?? { region: 'ap-southeast-2' },
		},
	});
};

export type Config = Awaited<ReturnType<typeof config>>;
