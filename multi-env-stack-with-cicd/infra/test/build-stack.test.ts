import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BuildStack } from '../lib/build-stack';

test('Stack contains expected resources', () => {
  const get = (() => {
    let total = 0;
    return (count?: number) => {
      switch (typeof count) {
        case 'number':
          total += count;
          return count;
        case 'undefined':
          return total;
      }
    }
  })();

  const app = new cdk.App();
  // WHEN
  const stack = new BuildStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);

  template.resourceCountIs('AWS::CodeBuild::Project', get(1));
  template.resourceCountIs('AWS::CodeBuild::SourceCredential', get(1));

  template.resourceCountIs('AWS::IAM::Role', get(1));
  template.resourceCountIs('AWS::IAM::Policy', get(1));

  template.resourceCountIs('AWS::S3::Bucket', get(1));

  expect(Object.keys(template.toJSON().Resources).length).toBe(get());
});
