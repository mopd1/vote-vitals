#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { UKPoliticsStack } from '../lib/uk-politics-stack';

const app = new cdk.App();
new UKPoliticsStack(app, 'UKPoliticsStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: 'eu-west-2'  // London region
  },
  tags: {
    Project: 'UK Politics App',
    Environment: 'Development'
  }
});