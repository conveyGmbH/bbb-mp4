#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-1920.mp4 started"
mkdir /usr/src/app/download/$1
ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx264 -crf 21 -maxrate 2.5M -bufsize 5M -preset slow -threads 1 \
	-movflags faststart \
	/usr/src/app/download/$1/H264-1920.mp4
echo "H264-1920.mp4" >> /usr/src/app/download/$1/files.txt
echo "encoding $1-1920.mp4 finished"
