import 'reflect-metadata';
import { CONFIG_TOKEN, RootLogger } from '@vdtn359/nestjs-bootstrap';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import awsLambdaFastify, { PromiseHandler } from '@fastify/aws-lambda';
import { isLambda } from 'src/utils/environment';
import { bootstrap } from 'src/app';
import type { Config } from './config';

let cachedHandler: Promise<PromiseHandler>;

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
	let logger = console;
	try {
		if (!cachedHandler) {
			cachedHandler = bootstrap().then(async (app) => {
				const fastify = app.getHttpAdapter().getInstance();
				await app.init();
				logger = app.get(RootLogger);
				const handlerInstance = awsLambdaFastify(fastify, {
					decorateRequest: true,
				});
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

if (!isLambda()) {
	bootstrap().then(async (app) => {
		const config: Config = app.get(CONFIG_TOKEN);
		await app.listen(config.get('PORT'), config.get('APP_HOST'));
	});
}
