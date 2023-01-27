#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-800.mp4 started"
mkdir /usr/src/app/download/$1
ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx264 -vf 'scale=800:-1' -crf 24 -maxrate 800k -bufsize 1.6M -preset slow -threads 1 \
	-movflags faststart \
	/usr/src/app/download/$1/H264-800.mp4
echo "H264-800.mp4" >> /usr/src/app/download/$1/files.txt
echo "encoding $1-800.mp4 finished"
