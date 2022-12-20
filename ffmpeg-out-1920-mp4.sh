#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-1920.mp4 started"
ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx265 -crf 25 -preset slow \
	-movflags faststart \
	/usr/src/app/download/$1-1920.mp4
echo "encoding $1-1920.mp4 finished"
