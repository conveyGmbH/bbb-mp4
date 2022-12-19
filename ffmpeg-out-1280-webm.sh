#!usr/bin/sh
EXPORT_NAME=$1
WIDTH=1280

#Output as WEBM video
echo "encoding $EXPORT_NAME-$WIDTH.webm started pass 1"
ffmpeg -y \
       -i /usr/src/app/download/$EXPORT_NAME.mp4 \
       -c:v libvpx-vp9 -minrate 1M -b:v 1828K -vf 'scale=$WIDTH:-1' -r 24 -pass 1 -an -f null /dev/null
echo "encoding $EXPORT_NAME-$WIDTH.webm started pass 2"
ffmpeg -y \
       -i /usr/src/app/download/$EXPORT_NAME.mp4 \
       -c:v libvpx-vp9 -minrate 1M -b:v 1828K -vf 'scale=$WIDTH:-1' -r 24 -pass 2 -c:a libopus \
       /usr/src/app/download/$EXPORT_NAME-$WIDTH.webm
echo "encoding $EXPORT_NAME-$WIDTH.webm finished"