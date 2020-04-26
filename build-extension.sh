mkdir -p dist
cd ./extension
zip -r -FS ../dist/pywalfox.zip * --exclude *.git*
