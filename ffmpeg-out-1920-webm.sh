#!usr/bin/sh

#Output as WEBM video
echo "encoding $1-1920.webm started pass 1"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 1 -an -f null /dev/null
echo "encoding $1-1920.webm started pass 2"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -b:v 0 -crf 30 -pass 2 -c:a libopus \
       /usr/src/app/download/$1-1920.webm
echo "encoding $1-1920.webm finished"
