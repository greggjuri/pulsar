#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { PulsarStack } from '../lib/pulsar-stack';
import { config } from '../lib/config';

const app = new cdk.App();

new PulsarStack(app, 'PulsarStack', {
  env: {
    account: config.accountId,
    region: config.region,
  },
  description: 'Pulsar - 3D AWS Architecture Diagram Tool',
});
