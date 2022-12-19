#!usr/bin/sh

#Output as WEBM video
echo "encoding $1-1280.webm started pass 1"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -minrate 1M -b:v 1828K -vf 'scale=1280:-1' -r 24 -preset slow -threads 0 -pass 1 -an -f null /dev/null
echo "encoding $1-1280.webm started pass 2"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx-vp9 -minrate 1M -b:v 1828K -vf 'scale=1280:-1' -r 24 -preset slow -threads 0 -pass 2 -c:a libopus \
       /usr/src/app/download/$1-1280.webm
echo "encoding $1-1280.webm finished"
