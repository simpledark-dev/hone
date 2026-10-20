#!/usr/bin/env bash
# Generates one short MP3 per letter (a.mp3 … z.mp3) using the macOS `say`
# voice, trims leading/trailing silence, normalises loudness and writes to
# public/audio/letters. Requires macOS + ffmpeg (brew install ffmpeg).
set -euo pipefail
cd "$(dirname "$0")/.."

VOICE="${VOICE:-Samantha}"
OUT="public/audio/letters"
TMP="$(mktemp -d)"
mkdir -p "$OUT"

for L in A B C D E F G H I J K L M N O P Q R S T U V W X Y Z; do
  lower="$(echo "$L" | tr '[:upper:]' '[:lower:]')"
  # "X." (letter + full stop) makes the voice say the letter name; the
  # [[char LTRL]] mode would prepend "Capital".
  say -v "$VOICE" -o "$TMP/$L.aiff" "$L."
  ffmpeg -hide_banner -loglevel error -y -i "$TMP/$L.aiff" \
    -af "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=0.04" \
    -ar 44100 -ac 1 -codec:a libmp3lame -b:a 96k "$OUT/$lower.mp3"
  printf "%s " "$L"
done
echo
rm -rf "$TMP"
echo "Wrote 26 clips to $OUT"
ls -la "$OUT" | awk '{s+=$5} END {print "total bytes:", s}'
