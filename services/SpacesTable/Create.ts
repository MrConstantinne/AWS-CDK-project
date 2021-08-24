import { nanoid } from 'nanoid';
import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { getEventBody } from '../Shared/Utils';
import { MissingFieldError, validateAsSpaceEntry } from '../Shared/InputValidator';

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: '',
    };

    try {
        const item = getEventBody(event);
        item.spaceId = nanoid();
        validateAsSpaceEntry(item);
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item,
        }).promise();
        result.body = JSON.stringify(`Created item with id:  ${item.spaceId}`);
    } catch (error) {
        if (error instanceof MissingFieldError) {
            result.statusCode = 403;
        } else {
            result.statusCode = 500;
        }
        result.body = error.message;
    }
    return result;
};
