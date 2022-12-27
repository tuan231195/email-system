import { StackContext, Bucket } from '@serverless-stack/resources';
import { getNaming } from '../utils/naming';

export function IndexStack({ stack }: StackContext) {
	const bucket = new Bucket(stack, getNaming('email-bucket'));
	stack.addOutputs({
		EmailBucketArn: bucket.bucketArn,
		EmailBucketName: bucket.bucketName,
	});

	return {
		bucket,
	};
}
