# Copy native app manifest to path read by Firefox
NHPATH=~/.mozilla/native-messaging-hosts

echo "Creating 'native-messaging-hosts' folder in ~/.mozilla"
sudo mkdir -p $NHPATH

echo "Copying native application manifest to ~/.mozilla/native-messaging-hostst/pywalfox.json"
sudo cp ./assets/pywalfox-manifest.json $NHPATH/pywalfox.json

echo "Setting execution permissions on daemon (pywal-daemon.py)"
chmox +x pywal-daemon.py

echo "Finished."
