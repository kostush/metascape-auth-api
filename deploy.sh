#!/bin/bash

if [ "$DEPLOYMENT_PATH" == "" ]; then
    echo "ERROR: no path provided"
    exit 1
fi

if [ "$DEPLOYMENT_ENVIRONMENT" == "" ]; then
    echo "ERROR: no env provided"
    exit 1
fi

if [ "$DEPLOYMENT_BRANCH" == "" ]; then
    echo "ERROR: no branch provided"
    exit 1
fi

echo "Jump to app "$DEPLOYMENT_PATH
cd $DEPLOYMENT_PATH || exit

echo environment: $DEPLOYMENT_ENVIRONMENT
echo branch: $DEPLOYMENT_BRANCH

git fetch origin || exit
git reset --hard origin/$DEPLOYMENT_BRANCH || exit

echo "Running docker"
make dockers-rebuild-prod || exit

echo "Remove old images"
docker rmi $(docker images -qa -f 'dangling=true')
