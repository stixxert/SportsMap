#!/bin/bash

FILENAME=$1

if [ -z "${FILENAME}" ]; then
  FILENAME="openapi-3-strava.yml"
fi

npx openapi-typescript "${FILENAME}" -o ./strava-api/api.d.ts

echo "done"