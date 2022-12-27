import 'reflect-metadata';
import { CONFIG_TOKEN, RootLogger, createApp } from '@vdtn359/nestjs-bootstrap';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { proxy } from 'aws-serverless-fastify';
import { Config } from './config';
import { AppModule } from './app.module';

async function bootstrap() {
	const app = await createApp(AppModule);
	const config: Config = app.get(CONFIG_TOKEN);
	const rootLogger = app.get(RootLogger);
	rootLogger.info(`Config: ${config.toString()}`);

	return app;
}

let fastifyServer: Promise<any>;

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
	if (!fastifyServer) {
		fastifyServer = bootstrap().then((app) => app.getHttpAdapter().getInstance());
	}
	return proxy(await fastifyServer, event, context);
};

if (process.env.LAMBDA_TASK_ROOT === undefined) {
	bootstrap().then(async (app) => {
		const config: Config = app.get(CONFIG_TOKEN);
		await app.listen(config.get('PORT'), config.get('APP_HOST'));
	});
}
