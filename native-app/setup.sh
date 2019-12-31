# Copy native app manifest to path read by Firefox
NHPATH=~/.mozilla/native-messaging-hosts
CURRENTPATH=$(pwd)

echo "Creating 'native-messaging-hosts' folder in ~/.mozilla"
sudo mkdir -p $NHPATH

echo "Setting path to pywal-fetcher.py in the native app manifest"
sed -i "s+<pwd>+$CURRENTPATH+g" assets/pywalfox-manifest.json

echo "Copying native application manifest to ~/.mozilla/native-messaging-hostst/pywalfox.json"
sudo cp ./assets/pywalfox-manifest.json $NHPATH/pywalfox.json

echo "Setting execution permissions on daemon (pywal-fetcher.py)"
chmod +x pywal-fetcher.py

echo "Finished."
