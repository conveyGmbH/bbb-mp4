#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-640.mp4 started"
ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx264 -minrate 500k -b:v 900K -vf 'scale=64:-1' -r 15 -preset slow -threads 0 \
	-movflags faststart \
	/usr/src/app/download/$1-640.mp4
echo "encoding $1-640.mp4 finished"
