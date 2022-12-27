const env = process.env.ENV ?? 'dev';
const project = process.env.PROJECT ?? 'email-system';

export const getNaming = (name: string) => `${env}-${project}-${name}`;
