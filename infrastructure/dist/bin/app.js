#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const uk_politics_stack_1 = require("../lib/uk-politics-stack");
const app = new cdk.App();
new uk_politics_stack_1.UKPoliticsStack(app, 'UKPoliticsStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: 'eu-west-2' // London region
    },
    tags: {
        Project: 'UK Politics App',
        Environment: 'Development'
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmluL2FwcC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1Q0FBcUM7QUFDckMsbUNBQW1DO0FBQ25DLGdFQUEyRDtBQUUzRCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixJQUFJLG1DQUFlLENBQUMsR0FBRyxFQUFFLGlCQUFpQixFQUFFO0lBQzFDLEdBQUcsRUFBRTtRQUNILE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQjtRQUN4QyxNQUFNLEVBQUUsV0FBVyxDQUFFLGdCQUFnQjtLQUN0QztJQUNELElBQUksRUFBRTtRQUNKLE9BQU8sRUFBRSxpQkFBaUI7UUFDMUIsV0FBVyxFQUFFLGFBQWE7S0FDM0I7Q0FDRixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIS91c3IvYmluL2VudiBub2RlXG5pbXBvcnQgJ3NvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3Rlcic7XG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgVUtQb2xpdGljc1N0YWNrIH0gZnJvbSAnLi4vbGliL3VrLXBvbGl0aWNzLXN0YWNrJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbm5ldyBVS1BvbGl0aWNzU3RhY2soYXBwLCAnVUtQb2xpdGljc1N0YWNrJywge1xuICBlbnY6IHsgXG4gICAgYWNjb3VudDogcHJvY2Vzcy5lbnYuQ0RLX0RFRkFVTFRfQUNDT1VOVCwgXG4gICAgcmVnaW9uOiAnZXUtd2VzdC0yJyAgLy8gTG9uZG9uIHJlZ2lvblxuICB9LFxuICB0YWdzOiB7XG4gICAgUHJvamVjdDogJ1VLIFBvbGl0aWNzIEFwcCcsXG4gICAgRW52aXJvbm1lbnQ6ICdEZXZlbG9wbWVudCdcbiAgfVxufSk7Il19