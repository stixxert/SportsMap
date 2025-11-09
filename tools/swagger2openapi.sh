#!/bin/bash

curl "https://converter.swagger.io/api/convert?url=https://developers.strava.com/swagger/swagger.json" > openapi-3-strava.yml

echo "done"