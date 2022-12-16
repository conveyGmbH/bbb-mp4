#!usr/bin/sh
EXPORT_NAME=$1
DISPLAY_NUMBER=$2

#Record the BBB playback, playing in Google browser in xvfb virtual screen, as MP4 video
ffmpeg -y -nostats -draw_mouse 0 -s 1920x1080 \
	-framerate 30 \
	-f x11grab -thread_queue_size 1024 \
	-i :$DISPLAY_NUMBER \
	-f alsa -thread_queue_size 1024 \
	-itsoffset 1.25 \
	-i pulse -ac 2 \
	-c:v libx264 -c:a aac  \
	-crf 22  \
	-pix_fmt yuv420p \
	-preset fast \
	-movflags frag_keyframe+separate_moof+omit_tfhd_offset+empty_moov \
	/usr/src/app/download/$EXPORT_NAME.mp4
