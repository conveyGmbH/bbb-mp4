#!usr/bin/sh
EXPORT_NAME=$1
WIDTH=1280

#Output as MP4 video
echo "encoding $EXPORT_NAME-$WIDTH.mp4 started"
ffmpeg -y \
	-i /usr/src/app/download/$EXPORT_NAME.mp4 \
	-c:v libx264 -minrate 1M -b:v 1828K -vf 'scale=$WIDTH:-1' -r 24 -preset slow \
	-movflags faststart \
	/usr/src/app/download/$EXPORT_NAME-$WIDTH.mp4
echo "encoding $EXPORT_NAME-$WIDTH.mp4 finished"
