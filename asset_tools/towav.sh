# Runs in the directory with the .ogg files
# Converts them to .wav files

mkdir wav
for i in *.ogg; do
  ffmpeg -acodec libvorbis -i "$i" -acodec pcm_s16le "wav/${i%ogg}wav"
done
