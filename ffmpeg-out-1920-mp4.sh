#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-1920.mp4 started"
ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx264 \
	-preset slow \
	-crf 30 \
	-movflags faststart \
	/usr/src/app/download/$1-1920.mp4
echo "encoding $1-1920.mp4 finished"
