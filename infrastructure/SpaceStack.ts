import { join } from 'path';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/lib/aws-apigateway';
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/lib/aws-lambda';

import { GenericTable } from './GenericTable';

export class SpaceStack extends Stack {
    private api = new RestApi(this, 'SpaceApi');
    private spacesTable = new GenericTable(this, {
        tableName: 'SpacesTable',
        primaryKey: 'spaceId',
        createLambdaPath: 'Create',
        readLambdaPath: 'Read',
        updateLambdaPath: 'Update',
        deleteLambdaPath: 'Delete',
        secondaryIndexes: ['location'],
    });

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        // ESModules bundles
        const helloLambdaNodeJS = new NodejsFunction(this, 'helloLambdaNodeJS', {
            entry: join(__dirname, '..', 'services', 'node-lambda', 'hello.ts'),
            handler: 'handler',
        });
        const s3ListPolicy = new PolicyStatement();
        s3ListPolicy.addActions('s3:ListAllMyBuckets');
        s3ListPolicy.addResources('*');
        helloLambdaNodeJS.addToRolePolicy(s3ListPolicy);

        const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJS);
        const helloLambdaResource = this.api.root.addResource('hello');
        helloLambdaResource.addMethod('GET', helloLambdaIntegration);

        const spaceResources = this.api.root.addResource('spaces');
        spaceResources.addMethod('POST', this.spacesTable.createLambdaIntegration);
        spaceResources.addMethod('GET', this.spacesTable.readLambdaIntegration);
        spaceResources.addMethod('PUT', this.spacesTable.updateLambdaIntegration);
        spaceResources.addMethod('DELETE', this.spacesTable.deleteLambdaIntegration);

        // JS
        const helloLambda = new LambdaFunction(this, 'helloLambda', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset(join(__dirname, '..', 'services', 'hello')),
            handler: 'hello.main',
        });

        // Webpack bundles
        const helloLambdaWebpack = new LambdaFunction(this, 'helloLambdaWebpack', {
            runtime: Runtime.NODEJS_14_X,
            code: Code.fromAsset(join(__dirname, '..', 'build', 'nodeHelloLambda')),
            handler: 'nodeHelloLambda.handler',
        });
    }
}

