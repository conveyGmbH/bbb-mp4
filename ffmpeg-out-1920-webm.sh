#!usr/bin/sh
EXPORT_NAME=$1

#Output as WEBM video
ffmpeg -y\
       -i /usr/src/app/download/$EXPORT_NAME.mp4 \
       -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -f null /dev/null && \
ffmpeg -y \
       -i /usr/src/app/download/$EXPORT_NAME.mp4 \
       -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 2 -c:a libopus \
       /usr/src/app/download/$EXPORT_NAME-1920.webm &
