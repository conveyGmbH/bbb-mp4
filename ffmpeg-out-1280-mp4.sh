#!usr/bin/sh
EXPORT_NAME=$1
WIDTH=1280

#Output as MP4 video
echo "encoding $EXPORT_NAME-$WIDTH.mp4 started" >> /usr/src/app/download/bbb-mp4.log
ffmpeg -y \
	-i /usr/src/app/download/$EXPORT_NAME.mp4 \
	-c:v libx264 -minrate 1M -b:v 1828K -vf 'scale=$WIDTH:-1' -r 24 \
	-movflags faststart \
	/usr/src/app/download/$EXPORT_NAME-$WIDTH.mp4 >> /usr/src/app/download/bbb-mp4.log
echo "encoding $EXPORT_NAME-$WIDTH.mp4 finished" >> /usr/src/app/download/bbb-mp4.log
