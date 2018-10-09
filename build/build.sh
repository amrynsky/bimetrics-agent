#!/usr/bin/env bash

set -e

DEPLOY=false
USER_BRANCH=

# Resolve args
if [ $# -eq 1 ]; then
    if [ $1 == "deploy" ]; then
        DEPLOY=true
    elif [ $1 != "deploy" ]; then
        USER_BRANCH=$1
    fi
elif [ $# -gt 1 ]; then
    USER_BRANCH=$1
    if [ $2 == "deploy" ]; then
        DEPLOY=true
    fi
fi

# Cleanup
rm -rf ./dist

VERSION=$(cat ./package.json | jq '.version' | sed 's/"//g')
BRANCH=$(git branch | sed -n -e 's/^\* \(.*\)/\1/p')

REPO="mobichord/bimetric-agent"
BUILD_TAG="build"
LATEST_TAG="latest"

echo BRANCH: $BRANCH
echo VERSION: $VERSION

VARSION_TAG=$VERSION

if [ "$USER_BRANCH" ]; then
    LATEST_TAG=$LATEST_TAG"-"$USER_BRANCH
else
    LATEST_TAG=$LATEST_TAG"-"$BRANCH
fi

echo "Target tag:"$LATEST_TAG

mkdir -p ./dist/content

cp ./build/Dockerfile  ./dist/

# Copy contents
cp ./index.js ./package.json ./dist/content/
cp -r ./core ./dist/content/
cp -r ./config ./dist/content/
cp -r ./catalog ./dist/content/

#echo 'Building docker image'
docker build -t $REPO:$BUILD_TAG ./dist

if $DEPLOY; then
    docker tag $REPO:$BUILD_TAG $REPO:$LATEST_TAG
    docker push $REPO:$LATEST_TAG

    if [ $BRANCH == "master" ]; then
        docker tag $REPO:$BUILD_TAG $REPO:$VERSION
        docker push $REPO:$VERSION
    fi
fi
