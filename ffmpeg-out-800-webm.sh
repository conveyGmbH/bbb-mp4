#!usr/bin/sh

#Output as WEBM video
echo "encoding $1-800.webm started pass 1"
mkdir /usr/src/app/download/$1
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx -vf 'scale=800:-1' -crf 28 -preset slow -threads 1 -pass 1 -an -f null /dev/null
echo "encoding $1-800.webm started pass 2"
ffmpeg -y \
       -i /usr/src/app/download/$1.mp4 \
       -c:v libvpx -vf 'scale=800:-1' -crf 28 -preset slow -threads 1 -pass 2 -c:a libopus \
       /usr/src/app/download/$1/VP8-800.webm
echo "VP8-800.webm" >> /usr/src/app/download/$1/files.txt
echo "encoding $1-800.webm finished"
