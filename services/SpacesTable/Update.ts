import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getEventBody } from '../Shared/Utils';

const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;
const dbClient = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: '',
    };
    const requestBody = getEventBody(event);
    const spaceId = event.queryStringParameters?.[PRIMARY_KEY];

    try {
        const requestBodyKey = Object.keys(requestBody)[0];
        const requestBodyValue = requestBody[requestBodyKey];
        if (requestBody && spaceId) {
            const updateResult = await dbClient.update({
                TableName: TABLE_NAME,
                Key: {
                    [PRIMARY_KEY]: spaceId,
                },
                UpdateExpression: 'set #zzzNew = :new',
                ExpressionAttributeValues: {
                    ':new': requestBodyValue,
                },
                ExpressionAttributeNames: {
                    '#zzzNew': requestBodyKey,
                },
                ReturnValues: 'UPDATED_NEW',
            }).promise();
            result.body = JSON.stringify(updateResult);
        }
    } catch (error) {
        result.body = error.message;
    }
    return result;
};
