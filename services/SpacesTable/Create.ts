import { DynamoDB } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { nanoid } from 'nanoid';

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const result: APIGatewayProxyResult = {
        statusCode: 200,
        body: '',
    };

    const item = typeof event.body === 'object' ? event.body : JSON.parse(event.body);
    item.spaceId = nanoid();

    try {
        await dbClient.put({
            TableName: TABLE_NAME!,
            Item: item,
        }).promise();
    } catch (error) {
        result.statusCode = error.statusCode;
        result.body = error.message;
    }
    result.body = JSON.stringify(`Created item with id ${item.spaceId}`);
    return result;
};
