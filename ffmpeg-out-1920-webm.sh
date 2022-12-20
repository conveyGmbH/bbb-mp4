#!usr/bin/sh

#Output as WEBM video
echo "encoding $1-1920.webm started pass 1"
mkdir /usr/src/app/download/$1
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -crf 25 -pass 1 -an -f null /dev/null
echo "encoding $1-1920.webm started pass 2"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -crf 25 -pass 2 -c:a libopus \
       /usr/src/app/download/$1/VP9-1920.webm
echo "VP9-1920.mp4" >> /usr/src/app/download/$1/files.txt
echo "encoding $1-1920.webm finished"
