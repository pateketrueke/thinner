#!/bin/bash

RSVP="http://rsvpjs-builds.s3.amazonaws.com/rsvp-latest.js"
ROUTERJS="http://routerjs.builds.emberjs.com.s3.amazonaws.com/router.cjs-latest.js"
ROUTE_RECOGNIZER="https://raw.github.com/tildeio/route-recognizer/master/dist/route-recognizer.cjs.js"

LIBDIR="$PWD/node_modules"

if [ ! -d "$LIBDIR"  ]; then
  mkdir -p $LIBDIR
fi

# transforms RSVP
printf "\rFetching rsvp ... "
echo "(function(){var window={};$(curl -sL $RSVP);exports['default']=window.RSVP;})();" > $LIBDIR/rsvp.js
echo "OK"

printf "\rFetching router.js ... "
curl -sL $ROUTERJS > $LIBDIR/router.js
echo "OK"

printf "\rFetching route-recognizer ... "
curl -sL $ROUTE_RECOGNIZER > $LIBDIR/route-recognizer.js
echo "OK"
