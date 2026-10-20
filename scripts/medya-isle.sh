#!/bin/bash
# 7FX — medya işleme: video sıkıştırma (1080p/720p MP4 + WebM), ses çıkarma, Türkçe altyazı (whisper)
set -u
cd /Users/byte/Desktop/7FX-Landing-Page || exit 1
SRC=_src/video.mp4; OUT=assets/video
mkdir -p "$OUT" _src/models
AUD_WEBM="libopus"; ffmpeg -hide_banner -encoders 2>/dev/null | grep -q " libopus " || AUD_WEBM="libvorbis"

echo "[$(date +%T)] encode başlıyor"
ffmpeg -y -hide_banner -loglevel error -i "$SRC" -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k "$OUT/7fx-1080.mp4" &
ffmpeg -y -hide_banner -loglevel error -i "$SRC" -vf scale=-2:720 -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k "$OUT/7fx-720.mp4" &
ffmpeg -y -hide_banner -loglevel error -i "$SRC" -c:v libvpx-vp9 -crf 33 -b:v 0 -row-mt 1 -cpu-used 2 -deadline good -c:a "$AUD_WEBM" -b:a 96k "$OUT/7fx-1080.webm" &
ffmpeg -y -hide_banner -loglevel error -i "$SRC" -vn -ac 1 -ar 16000 _src/audio16k.wav

if [ ! -s _src/models/ggml-small.bin ]; then
  echo "[$(date +%T)] whisper small modeli indiriliyor"
  curl -sSL --retry 3 -o _src/models/ggml-small.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-small.bin
fi
echo "[$(date +%T)] model: $(stat -f%z _src/models/ggml-small.bin 2>/dev/null) bytes — transkripsiyon"
whisper-cli -m _src/models/ggml-small.bin -f _src/audio16k.wav -l tr -ovtt -of "$OUT/7fx-tr" -nt 2>&1 | tail -3
wait
echo "[$(date +%T)] bitti"
ls -la "$OUT"
