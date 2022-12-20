#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-800.mp4 started"
mkdir $1
ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx264 -vf 'scale=800:-1' -crf 25 -preset slow -threads 0 \
	-movflags faststart \
	/usr/src/app/download/$1/H264-800.mp4
echo "H264-800.mp4" >> /usr/src/app/download/$1/files.txt
echo "encoding $1-800.mp4 finished"
