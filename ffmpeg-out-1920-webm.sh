#!usr/bin/sh
EXPORT_NAME=$1

cd /usr/src/app/download
#Output as WEBM video
echo "encoding $EXPORT_NAME-1920.webm started pass 1" >> /usr/src/app/download/bbb-mp4.log
ffmpeg -y \
       -i /usr/src/app/download/$EXPORT_NAME.mp4 \
       -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -f null /dev/null >> /usr/src/app/download/bbb-mp4.log
echo "encoding $EXPORT_NAME-1920.webm started pass 2" >> /usr/src/app/download/bbb-mp4.log
ffmpeg -y \
       -i /usr/src/app/download/$EXPORT_NAME.mp4 \
       -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 2 -c:a libopus \
       /usr/src/app/download/$EXPORT_NAME-1920.webm >> /usr/src/app/download/bbb-mp4.log
echo "encoding $EXPORT_NAME-1920.webm finished" >> /usr/src/app/download/bbb-mp4.log