#!usr/bin/sh
EXPORT_NAME=$1

#Output as MP4 video
echo "encoding $EXPORT_NAME-1920.mp4 started" >> /usr/src/app/download/bbb-mp4.log
mkdir /usr/src/app/download/$EXPORT_NAME;
cd /usr/src/app/download/$EXPORT_NAME
ffmpeg -y \
	-i /usr/src/app/download/$EXPORT_NAME.mp4 \
	-c:v libx264 \
	-preset slow \
	-crf 30 \
	-movflags faststart \
	/usr/src/app/download/$EXPORT_NAME/$EXPORT_NAME-1920.mp4 >> /usr/src/app/download/bbb-mp4.log
echo "encoding $EXPORT_NAME-1920.mp4 finished" >> /usr/src/app/download/bbb-mp4.log
