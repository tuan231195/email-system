import 'reflect-metadata';
import { CONFIG_TOKEN, createApp, logger } from '@vdtn359/nestjs-bootstrap';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import awsLambdaFastify, { PromiseHandler } from '@fastify/aws-lambda';
import { isLambda } from 'src/utils/environment';
import { Config, Config as ConfigType } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await createApp(AppModule);
	const config: ConfigType = app.get(CONFIG_TOKEN);
	logger.info(`Config: ${config.toString()}`);

	return app;
}

let cachedHandler: Promise<PromiseHandler>;

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
	try {
		if (!cachedHandler) {
			cachedHandler = bootstrap().then(async (app) => {
				const fastify = app.getHttpAdapter().getInstance();
				await app.init();
				const handlerInstance = awsLambdaFastify(fastify);
				await fastify.ready();
				return handlerInstance;
			});
		}
		const handlerInstance = await cachedHandler;
		return await handlerInstance(event, context);
	} catch (err) {
		logger.error('Failed to handle request', err);
		throw err;
	}
};

if (isLambda()) {
	bootstrap().then(async (app) => {
		const config: Config = app.get(CONFIG_TOKEN);
		await app.listen(config.get('PORT'), config.get('APP_HOST'));
	});
}
