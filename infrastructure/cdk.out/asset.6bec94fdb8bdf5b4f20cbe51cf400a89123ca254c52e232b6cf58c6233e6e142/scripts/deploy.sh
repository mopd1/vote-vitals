#!/bin/bash

# Build the Docker image
docker build -t ukpol-backend .

# Tag the image for ECR
docker tag ukpol-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ukpol-backend:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/ukpol-backend:latest