import { S3 } from 'aws-sdk';

const s3Client = new S3();

export const handler = async (event: any, context: any) => {
    const buckets = await s3Client.listBuckets().promise();

    return {
        statusCode: 200,
        body: 'Buckets: ' + JSON.stringify(buckets.Buckets),
    };
};
