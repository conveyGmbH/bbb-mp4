#!usr/bin/sh

#Output as WEBM video
echo "encoding $1-1280.webm started pass 1"
mkdir $1
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -vf 'scale=1280:-1' -crf 28 -maxrate 1.5M -preset slow -threads 0 -pass 1 -an -f null /dev/null
echo "encoding $1-1280.webm started pass 2"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -vf 'scale=1280:-1' -crf 28 -maxrate 1.5M -preset slow -threads 0 -pass 2 -c:a libopus \
       /usr/src/app/download/$1/VP9-1280.webm
echo "VP9-1280.mp4" >> /usr/src/app/download/$1/files.txt
echo "encoding $1-1280.webm finished"
