#!usr/bin/sh
EXPORT_NAME=$1

#Output as MP4 video
echo "encoding $EXPORT_NAME-1920.mp4 started"
ffmpeg -y \
	-i /usr/src/app/download/$EXPORT_NAME.mp4 \
	-c:v libx264 \
	-preset slow \
	-crf 30 \
	-movflags faststart \
	/usr/src/app/download/$EXPORT_NAME-1920.mp4
echo "encoding $EXPORT_NAME-1920.mp4 finished"
