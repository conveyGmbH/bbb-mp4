#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-1280.mp4 started"
ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx264 -minrate 1M -b:v 1828K -vf 'scale=1280:-1' -r 24 -preset slow -threads 0 \
	-movflags faststart \
	/usr/src/app/download/$1-1280.mp4
echo "encoding $1-1280.mp4 finished"
