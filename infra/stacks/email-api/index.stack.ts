import { Api, Config, StackContext, use } from '@serverless-stack/resources';
import { config as loadConfig } from 'dotenv-flow';
import { IndexStack as RootStack } from '../index.stack';
import { getNaming } from '../../utils/naming';

export function IndexStack({ stack }: StackContext) {
	loadConfig({
		path: 'components/email-api',
	});
	stack.setDefaultFunctionProps({
		srcPath: 'components/email-api/dist',
	});
	const { bucket } = use(RootStack);

	const emailBucketConfig = new Config.Parameter(stack, 'EMAIL_BUCKET', {
		value: bucket.bucketName,
	});

	const emailSenderConfig = new Config.Parameter(stack, 'EMAIL_SENDER', {
		value: process.env.EMAIL_SENDER!,
	});

	const sendgridApiKeySecret = new Config.Secret(stack, 'SENDGRID_API_KEY');

	const api = new Api(stack, getNaming('email-api'), {
		routes: {
			$default: 'index.handler',
		},
	});

	api.bind([sendgridApiKeySecret, emailSenderConfig, emailBucketConfig, bucket]);

	stack.addOutputs({
		EmailApiUrl: api.url,
	});
	return api;
}
