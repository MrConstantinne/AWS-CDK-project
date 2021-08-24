import { S3 } from 'aws-sdk';

const s3Client = new S3();

export const handler = async () => {
    const buckets = await s3Client.listBuckets().promise();
    return {
        statusCode: 200,
        body: 'Buckets: ' + JSON.stringify(buckets.Buckets),
    };
};
