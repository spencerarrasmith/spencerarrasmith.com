#!/bin/sh
# Checks that the server compresses what it sends and tells browsers how long to keep it.
#
#     tools/check-server.sh                          the live site
#     tools/check-server.sh http://127.0.0.1:8001    a container started from the image
#
# Nothing in a browser shows when compression is off: pages look the same and only arrive
# larger. The release workflow runs this against the new image before it is pushed.
#
# Each request carries the Via header that Caddy puts on what it forwards. That header is what
# made nginx stop compressing, so a check without it would pass on a server that is broken.
#
# Plain sh on purpose (no bash features), so "sh tools/check-server.sh" works on any machine.
set -u
SITE=${1:-https://spencerarrasmith.com}; APP=$SITE/content/lang/telugu
fails=0
ok() { if [ "$1" = 0 ]; then echo "PASS $2"; else echo "FAIL $2"; fails=$((fails + 1)); fi; }
# ask <gzip|plain> <curl options…>: one request, as a browser that accepts gzip or as one that does not
ask() {
  how=$1; shift
  if [ "$how" = gzip ]; then curl -s -H 'Via: 1.1 Caddy' -H 'Accept-Encoding: gzip' "$@"
  else curl -s -H 'Via: 1.1 Caddy' "$@"; fi
}
# header <gzip|plain> <name> <url>: the value of one response header ("" when it is not sent)
header() { ask "$1" -o /dev/null -D - "$3" | tr -d '\r' | awk -v n="$2" -F': ' 'tolower($1) == n { print $2 }' | tail -1; }
# bytes <gzip|plain> <url>: how many bytes the answer takes on the wire
bytes() { ask "$1" -o /dev/null -w '%{size_download}' "$2"; }

curl -s -o /dev/null -f "$APP/index.html"; ok $? "$APP/index.html answers"

for f in index.html base.css game.css telugu-data.js units.js; do
  enc=$(header gzip content-encoding "$APP/$f"); plain=$(bytes plain "$APP/$f"); packed=$(bytes gzip "$APP/$f")
  [ -n "$enc" ] && [ "$packed" -gt 0 ] && [ $((packed * 2)) -lt "$plain" ]
  ok $? "$f is compressed for a browser that accepts it: $plain → $packed bytes (${enc:-not compressed})"
done

[ "$(header gzip vary "$APP/telugu-data.js" | tr 'A-Z' 'a-z')" = accept-encoding ]
ok $? "a compressed answer says Vary: Accept-Encoding"

[ -z "$(header plain content-encoding "$APP/telugu-data.js")" ]
ok $? "a client that does not ask for compression gets the plain file"

# curl --compressed asks for a compressed answer and unpacks it; the result must be the file itself
unpacked=$(ask plain --compressed "$APP/telugu-data.js" | cksum); asis=$(ask plain "$APP/telugu-data.js" | cksum)
[ "$unpacked" = "$asis" ] && [ "$asis" != "$(printf '' | cksum)" ]
ok $? "the compressed answer unpacks to the same file"

font=$(curl -s "$APP/base.css" | grep -o "fonts/[a-z-]*-v[0-9]*\.woff2" | head -1)
[ -n "$font" ] && [ -z "$(header gzip content-encoding "$APP/$font")" ]
ok $? "a font file (${font:-none found in base.css}) is sent as it is: .woff2 is compressed already"
keep=$(header plain cache-control "$APP/$font")
case "$keep" in *max-age=31536000*immutable*) true ;; *) false ;; esac
ok $? "and may be kept for a year: Cache-Control is \"$keep\""
sdk=$(curl -s "$APP/index.html" | grep -o "vendor/pocketbase-[0-9.]*\.umd\.js" | head -1)
[ -n "$sdk" ] && [ -n "$(header gzip content-encoding "$APP/$sdk")" ]
ok $? "the PocketBase client (${sdk:-none found in index.html}) is compressed"
keep=$(header plain cache-control "$APP/$sdk")
case "$keep" in *max-age=31536000*immutable*) true ;; *) false ;; esac
ok $? "and may be kept for a year: Cache-Control is \"$keep\""
page=$(header plain cache-control "$APP/index.html")
[ "$page" = no-cache ]
ok $? "a page is checked with the server each time: Cache-Control is \"$page\""

if [ "$fails" = 0 ]; then echo "ALL PASSED"; else echo "$fails FAILED"; fi
exit $((fails > 0))
