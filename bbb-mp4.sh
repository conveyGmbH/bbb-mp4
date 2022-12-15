#!/bin/bash

# Load .env variables

echo "converting $1 to mp4" |  systemd-cat -p warning -t bbb-mp4

sudo docker run --rm -d \
                --name $MEETING_ID \
                -v $COPY_TO_LOCATION:/usr/src/app/download \
                --env MEETING_ID=$1 \
                --env REC_URL=$2 \
                manishkatyan/bbb-mp4