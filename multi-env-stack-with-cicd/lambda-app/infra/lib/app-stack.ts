import {
  Stack,
  StackProps,
  aws_lambda,
  aws_iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const executionRole = new aws_iam.Role(this, 'AppLambdaExecutionRole', {
      assumedBy: new aws_iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    const lambda = new aws_lambda.Function(this, 'AppLambdaFunction', {
      role: executionRole,
      runtime: aws_lambda.Runtime.NODEJS_20_X,
      code: aws_lambda.Code.fromAsset('../app'),
      handler: 'index.handler',
    });
  }
}
