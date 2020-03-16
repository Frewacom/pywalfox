# Copy native app manifest to path read by Firefox
NHPATH="${HOME}/.mozilla/native-messaging-hosts"
MANIFEST_PATH="$NHPATH/pywalfox.json"
CURRENTPATH=$(pwd)

echo "Creating 'native-messaging-hosts' folder in ~/.mozilla"
sudo mkdir -p $NHPATH

if [ -f "$MANIFEST_PATH" ]; then
  sudo rm $MANIFEST_PATH
fi

echo "Copying native application manifest to $MANIFEST_PATH"
sudo cp ./assets/pywalfox-manifest.json $MANIFEST_PATH

echo "Setting path to pywal-fetcher.py in the native app manifest"
sudo sed -i "s+<pwd>+$CURRENTPATH+g" $MANIFEST_PATH

echo "Setting execution permissions on daemon (pywal-fetcher.py)"
chmod +x pywal-fetcher.py

echo "Finished."
