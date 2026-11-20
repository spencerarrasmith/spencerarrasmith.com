#!/usr/bin/env bash
# Builds the font files the Telugu app serves itself (html/content/lang/telugu/fonts/).
#
# Run from the repo root, only when a font needs to change:
#     pip install fonttools brotli
#     tools/build-telugu-fonts.sh
#
# What it does, for each of the five families the app uses:
#   1. downloads the original font from Google's fonts repository, at one fixed commit;
#   2. keeps only the weights the app asks for (and drops the axes it never uses);
#   3. keeps only the characters the app can show, and saves the result as .woff2;
#   4. copies the font's license next to it (the Open Font License asks for that).
#
# The @font-face rules that load these files are in base.css. A browser may keep a font file
# for a year (nginx.conf), so a rebuilt font needs a NEW FILE NAME: raise V below, change the
# same number in the url(...) lines of base.css, and delete the old files:
#     sed -i 's/-v1\.woff2/-v2.woff2/' html/content/lang/telugu/base.css
#     git rm html/content/lang/telugu/fonts/*-v1.woff2
#
# The same fonttools version gives the same files, byte for byte.
set -euo pipefail

V=1                                                    # part of every file name: inter-v1.woff2
APP=html/content/lang/telugu
OUT=$APP/fonts
COMMIT=cc5661d43cd4f9aad5567033a8e15ca28dc35c86        # github.com/google/fonts, November 2026
SRC=https://raw.githubusercontent.com/google/fonts/$COMMIT/ofl

# The characters to keep.
#   LATIN     what Google Fonts calls "latin": English text, punctuation, a few symbols
#   PHONETIC  everything IPA or ISO 15919 can be written with: the accented Latin letters,
#             the IPA letters and click letters, the modifier letters (ʰ ː), the combining
#             marks (◌̪ ◌̩ ◌̥), the three Greek letters IPA borrows (β θ χ), ⱱ, and ꜛ ꜜ.
#             A character a font does not have is skipped.
#   TELUGU    what Google Fonts calls "telugu": the Telugu block, the joiners, and the dotted circle
LATIN='U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
PHONETIC='U+0100-017F,U+01C0-01C3,U+0250-02AF,U+02B0-02FF,U+0300-036F,U+03B2,U+03B8,U+03C7,U+1E00-1E9F,U+2C71,U+A71B-A71C'
TELUGU='U+0951-0952,U+0964-0965,U+0C00-0C7F,U+1CDA,U+1CF2,U+200C-200D,U+25CC'

[ -f "$APP/base.css" ] || { echo "Run this from the repo root (cannot see $APP/base.css)" >&2; exit 1; }
command -v pyftsubset >/dev/null || { echo "pyftsubset not found: pip install fonttools brotli" >&2; exit 1; }
python3 -c 'import brotli' 2>/dev/null || { echo "brotli not found (woff2 needs it): pip install fonttools brotli" >&2; exit 1; }

TMP=$(mktemp -d); trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

# build <name> <folder in google/fonts> <file there> <characters> <features> [axis settings…]
#   axis settings   wght=400:700 keeps that range of weights in one file; wdth=100 or opsz=14 fixes
#                   an axis the app never changes. None at all: the font has one weight already.
#   features        the OpenType features to keep. '*' is all of them (Telugu shaping needs its own);
#                   '+tnum' is the usual set plus tabular figures, the only extra one the CSS asks for.
build() {
  local name=$1 folder=$2 file=$3 chars=$4 features=$5; shift 5
  echo "$name"
  curl -fsSL "$SRC/$folder/$file" -o "$TMP/$name.ttf"
  curl -fsSL "$SRC/$folder/OFL.txt" -o "$OUT/OFL-$name.txt"
  if [ $# -gt 0 ]; then
    fonttools varLib.instancer -q --no-recalc-timestamp "$TMP/$name.ttf" "$@" -o "$TMP/$name-cut.ttf"
  else
    cp "$TMP/$name.ttf" "$TMP/$name-cut.ttf"
  fi
  local keep="--layout-features=*"; [ "$features" = '*' ] || keep="--layout-features+=${features#+}"
  pyftsubset "$TMP/$name-cut.ttf" --unicodes="$chars" "$keep" --flavor=woff2 --output-file="$OUT/$name-v$V.woff2"
}

build inter             inter           'Inter%5Bopsz%2Cwght%5D.ttf'          "$LATIN,$PHONETIC" +tnum opsz=14 wght=400:700
build noto-sans         notosans        'NotoSans%5Bwdth%2Cwght%5D.ttf'       "$LATIN,$PHONETIC" +tnum wdth=100 wght=400:500
build noto-sans-telugu  notosanstelugu  'NotoSansTelugu%5Bwdth%2Cwght%5D.ttf' "$TELUGU,$LATIN"   '*'   wdth=100 wght=400:700
build noto-serif-telugu notoseriftelugu 'NotoSerifTelugu%5Bwght%5D.ttf'       "$TELUGU,$LATIN"   '*'   wght=400:600
build tiro-telugu       tirotelugu      'TiroTelugu-Regular.ttf'              "$TELUGU,$LATIN"   '*'

echo; ls -l "$OUT"
