import {
  CfnParameter,
  RemovalPolicy,
  Stack,
  StackProps,
  aws_codebuild,
  aws_iam,
  aws_s3,
} from 'aws-cdk-lib';
import { FilterGroup } from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';

export class BuildStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // TODO This should ref to AWS Secret Manager
    const gitHubTokenParameter = new CfnParameter(this, 'GitHubToken', {
      noEcho: true,
    });

    const artifactBucket = new aws_s3.Bucket(this, 'CodeBuildArtifactBucket', {
      bucketName: 'code-build-artifacts-c3af9d9574',
      versioned: true,
      objectLockEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const sourceCredentials = new aws_codebuild.CfnSourceCredential(this, 'GitHubSourceCredential', {
      authType: 'PERSONAL_ACCESS_TOKEN',
      serverType: 'GITHUB',
      token: gitHubTokenParameter.valueAsString,
    });

    const role = new aws_iam.Role(this, 'CodeBuildProjectRole', {
      assumedBy: new aws_iam.ServicePrincipal('codebuild.amazonaws.com'),
      path: '/build-role/',
    });

    const masterProject = new aws_codebuild.Project(this, 'CodeBuildProject', {
      projectName: 'multi-env-stack-with-cicd',
      role: role,
      environment: {
        buildImage: aws_codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
      },
      buildSpec: aws_codebuild.BuildSpec.fromAsset('buildspec.master.yaml'),
      source: aws_codebuild.Source.gitHub({
        cloneDepth: 1,
        repo: 'aws-cdk-examples',
        owner: 'nrsandholm',
        webhookFilters: [
          FilterGroup
            .inEventOf(aws_codebuild.EventAction.PUSH)
            .andBranchIs('master'),
        ],
      }),
      artifacts: aws_codebuild.Artifacts.s3({
        bucket: artifactBucket,
        path: 'master',
        packageZip: true,
        includeBuildId: false,
      }),
    });

    masterProject.node.addDependency(sourceCredentials);
  }
}
