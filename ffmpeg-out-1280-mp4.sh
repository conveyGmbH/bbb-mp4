#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-1280.mp4 started"
mkdir /usr/src/app/download/$1
nice -n 15 ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx264 -vf 'scale=1280:-1' -crf 24 -maxrate 1.5M -bufsize 3M -preset slow -threads 0 \
	-movflags faststart \
	/usr/src/app/download/$1/H264-1280.mp4
echo "H264-1280.mp4" >> /usr/src/app/download/$1/files.txt
echo "encoding $1-1280.mp4 finished"
