#!usr/bin/sh

#Output as WEBM video
echo "encoding $1-800.webm started pass 1"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -vf 'scale=800:-1' -crf 30 -preset slow -threads 0 -pass 1 -an -f null /dev/null
echo "encoding $1-800.webm started pass 2"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -vf 'scale=800:-1' -crf 30 -preset slow -threads 0 -pass 2 -c:a libopus \
       /usr/src/app/download/$1-800.webm
echo "encoding $1-800.webm finished"
