#!usr/bin/sh

#Output as MP4 video
echo "encoding $1-800.mp4 started"
ffmpeg -y \
	-i /usr/src/app/download/$1.mp4 \
	-c:v libx265 -vf 'scale=800:-1' -crf 28 -preset slow -threads 0 \
	-movflags faststart \
	/usr/src/app/download/$1-800.mp4
echo "encoding $1-800.mp4 finished"
