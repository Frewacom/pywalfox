<h1 align="center" - click me!>
  <a name="logo"><img src="images/logo.svg" alt="Pywalfox icon" width="150"></a>
  <br>
  Pywalfox
</h1>
<h4 align="center">🎨 Dynamic theming of Firefox 🦊 (and Thunderbird 🐦) using your Pywal colors</h4>

<div align="center">
     <a href="https://addons.mozilla.org/en-US/firefox/addon/pywalfox"><img src="https://img.shields.io/amo/v/pywalfox"/></a>
     <a href="https://addons.mozilla.org/en-US/firefox/addon/pywalfox"><img src="https://img.shields.io/amo/stars/pywalfox"/></a>
     <a href="https://addons.mozilla.org/en-US/firefox/addon/pywalfox"><img src="https://img.shields.io/amo/users/pywalfox"/></a>
     <a href="https://addons.mozilla.org/en-US/firefox/addon/pywalfox"><img src="https://img.shields.io/amo/dw/pywalfox"/></a>
     <a href="https://pypi.org/project/pywalfox/"><img src="https://img.shields.io/pypi/v/pywalfox"/></a>
     <a href="https://www.mozilla.org/en-US/MPL/2.0/FAQ"><img src="https://img.shields.io/github/license/frewacom/pywalfox"/></a>
</div>

<br>

- Tired of Firefox and Thunderbird not respecting your gorgeous Pywal colors like the rest of your system?
- Looking to rack up some karma :arrow_up: on [/r/unixporn](https://reddit.com/r/unixporn)?

Introducing **Pywalfox**, an add-on that themes [Firefox](https://addons.mozilla.org/firefox/addon/pywalfox/) and [Thunderbird](https://addons.thunderbird.net/thunderbird/addon/pywalfox/) with your [Pywal](https://github.com/dylanaraps/pywal) colors using the official [Theme API](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme) from Mozilla!

With Pywalfox you can:
- [x] Customize the colors of almost every UI element
- [x] Easily update the theme using the add-on GUI and/or the command line
- [x] Automatically theme DuckDuckGo :duck: searches in Firefox *(optional)*
- [x] Have bold text, styled dropdowns and much more *(optional)*
- [x] Automatically switch between a dark and a light theme based on the time of day

![](images/demo_v207_ffproton.gif)

## 👨‍💻 Installation

1. Get the add-on for
   - [Firefox](https://addons.mozilla.org/firefox/addon/pywalfox/)
   - [Thunderbird](https://addons.thunderbird.net/thunderbird/addon/pywalfox/)
1. Install the [native messaging application](https://github.com/Frewacom/pywalfox-native) ([PyPI](https://pypi.org/project/pywalfox/)) using your preferred method, with e.g. `pip` or `pipx`:
   ```sh
   pipx install pywalfox
   ```
   > [!TIP]
   > Don't have `pipx`? Install it first, then re-run the command above:
   > - **Arch Linux:** `pacman -S python-pipx` 
   > - **Ubuntu:** `apt install pipx`
   > - **macOS:** `brew install pipx`
   > - **Windows:** `winget install Python.Python.3.14`, then `pip install pywalfox` instead
1. Run `pywalfox install` in your terminal.
   - Firefox forks (e.g. LibreWolf) require [extra arguments](#firefox-forks). Flatpaks require [extra steps](#flatpaks).
1. Restart Firefox and/or Thunderbird.
1. Generate a theme with [Pywal](https://github.com/dylanaraps/pywal) or equivalent (e.g., `wal --theme gruvbox`). You may refer to [this guide](https://github.com/dylanaraps/pywal/wiki/Getting-Started).
1. Click the Pywalfox icon in the Firefox/Thunderbird UI and then "Fetch Pywal colors". 
<!--(or use the [AUR package](https://aur.archlinux.org/packages/python-pywalfox/))-->

This should apply a theme with your Pywal colors!

> **Note** <br>
> If you have problems: please review the Troubleshooting section below before opening a Github issue.

## 🎨 Usage

### Update the theme through your terminal
Run `pywalfox update` in your terminal to trigger an update of the browser theme.
This command can integrate Pywalfox into e.g. system theming scripts, and is functionally equivalent to clicking "Fetch Pywal colors" in the add-on settings GUI (accessible from your toolbar).

### Customization
The add-on settings GUI comes with extensive customization options divided into the following sections:

<details>
<summary>
<b>
💧 Palette (click for details)
</b>
</summary>

<table><tr><td>

The palette in the "Palette" section is used to temporarily customize one or more colors from the Pywal palette.
You can use one of the generated colors, or choose any color from a colorwheel.

> **Warning** <br>
> Changes to the palette will be reset when you click "Fetch Pywal colors" and when you run `pywalfox update`.

</td></tr></table>

</details>

<details>
<summary>
<b>
📝 Palette template (click for details)
</b>
</summary>

<table><tr><td>

If you want your palette customizations to be persistent (unlike the regular palette) you must save your current palette as a *palette template*:

1. Click "Fetch Pywal colors" in the add-on settings GUI or run `pywalfox update`
2. Customize the colors to your liking in the "Palette" section
   - ❗ *Colors from outside the Pywal palette (i.e. from the colorwheel) cannot be used in a template*.
3. Click "Load from current" in the "Palette template" section below.
   - ❗ *The colors can also be set directly in the "Palette template" section using Pywal color indices.*
4. Click "Save palette"

Your custom palette will now be applied whenever you update the browser theme.

</td></tr></table>

</details>

<details>
<summary>
<b>
🗂 ️Theme template (click for details)
</b>
</summary>

<table><tr><td>

The theme template assigns colors (from your palette template) to different browser elements.

To create a palette template, go through the items in the "Theme template" section and assign a color to each item.
The colors are identified by their names as seen in the "Palette template" section.

</td></tr></table>

</details>


### Theme modes
There are three different theme modes: "Dark" (🌙), "Light" (☀) and "Auto" (👁)️. Selecting "Auto" will automatically switch between the other two modes based on a time interval found in the "General" section of the add-on settings GUI.

> **Note** <br>
> The dark and light modes have *separate* theme and palette templates. You will always modifiy the template for the currently selected mode.

### Further theming with the included userChrome.css and userContent.css in Firefox

Some browser elements (e.g. the context menus) are not available through the [Theme API](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme). Pywalfox includes two custom CSS stylesheets (for Firefox) which apply your theme to some of these browser elements.

<table><tr><td>
Before you enable the custom CSS sheets in the add-on settings GUI you must navigate to <code>about:config</code> and set <code>toolkit.legacyUserProfileCustomizations.stylesheets</code> to <code>true</code>.
</td></tr></table>

## ❎ Uninstall
To uninstall Pywalfox from your system, run
```bash
pywalfox uninstall # Removes the manifest from native-messaging-hosts
```
and then
```bash
pipx uninstall pywalfox # if you installed with pipx
```
or
```bash
paru -R python-pywalfox # if you installed with paru (only Arch Linux)
```
depending on your chosen installation method.

## 🔧 Troubleshooting
This section lists some common problems and how to (hopefully) fix them.
This [troubleshooting guide from Mozilla](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#Troubleshooting) may be of use if you encounter an error that is not listed here.
First of all:
- Check the log in the Debugging section at the bottom of the Pywalfox settings page for any errors.
- Verify that `~/.cache/wal/colors` exists and contains colors generated by Pywal.
- Verify that `path` in `~/<native-messaging-hosts-folder>/pywalfox.json` is a valid path.

### Firefox forks

Forks may require custom paths to the manifest and profile directory during installation:
```sh
pywalfox install --manifest-path ~/.mozilla/native-messaging-hosts \
                 --profile-path  ~/.config/librewolf/librewolf
```
The above example is for LibreWolf (non-Flatpak version). Paths vary across forks.

### Flatpaks

Flatpak sandboxing prevents direct access to host binaries, so a wrapper script is needed. 
The steps below use the LibreWolf Flatpak as an example. 
You may need to adapt the instructions for your particular browser.

1. Create a wrapper script at `~/.var/app/io.gitlab.librewolf-community/pywalfox-wrapper.sh`:
   ```sh
   #!/bin/sh
   flatpak-spawn --host ~/.local/bin/pywalfox "$@"
   ```
1. Make the wrapper script executable: 
   ```sh
   chmod +x ~/.var/app/io.gitlab.librewolf-community/pywalfox-wrapper.sh
   ```
1. Install the native messaging host with additional arguments for your particular paths, e.g. 
   ```sh
   pywalfox install \
   --manifest-path ~/.var/app/io.gitlab.librewolf-community/.librewolf/native-messaging-hosts \
   --profile-path  ~/.var/app/io.gitlab.librewolf-community/.librewolf/
   ```
1. Edit the manifest in `~/.var/app/io.gitlab.librewolf-community/.librewolf/native-messaging-hosts/pywalfox.json`) and point its `path` to the wrapper script. Use an absolute path as below, replacing `<USER>` with your username.
   ```sh
   {
     "name": "pywalfox",
     "description": "Automatically theme your browser using the colors generated by Pywal",
     "path": "/home/<USER>/.var/app/io.gitlab.librewolf-community/pywalfox-wrapper.sh",
     "type": "stdio",
     "allowed_extensions": [ "pywalfox@frewacom.org" ]
   }
   ```
1. Grant Talk permissions:
   ```sh
   flatpak override --user \
     --talk-name=org.freedesktop.Flatpak \
     --talk-name=org.freedesktop.portal.Flatpak \
     --system-talk-name=org.freedesktop.Flatpak \
     io.gitlab.librewolf-community
   ```
   Verify that the correct permission have been granted, i.e.
   ```sh
   flatpak override --user --talk-name=org.freedesktop.Flatpak io.gitlab.librewolf-community
   ```
   should output
   ```sh
   [Session Bus Policy]
   org.freedesktop.Flatpak=talk
   org.freedesktop.portal.Flatpak=talk
   
   [System Bus Policy]
   org.freedesktop.Flatpak=talk
   ```
1. Restart the browser. Fetching Pywal colors should now work.

### Common errors in the browser console
It is a good idea to check the Firefox browser console (`Tools > Web developer > Browser console`) for errors.
Common errors include:

<details><summary>
<b><code>ExtensionError: No such native application pywalfox</code></b>
</summary>

<table><tr><td>

   The manifest is not installed properly. Try installing the manifest manually by following the instructions [here](https://developer.mozilla.org/docs/Mozilla/Add-ons/WebExtensions/Native_manifests.).

   The manifest is located at `<path-to-python-site-packages>/pywalfox/assets/manifest.json`.

   After you have copied over the manifest to the correct path, make sure to also update the `path` property in the copied manifest. The `path` should point to `<path-to-python-site-packages>/pywalfox/bin/main.sh` (or `win.bat` if you are on Windows).

   If it still does not work, you can try to reinstall Firefox, see [#14](https://github.com/Frewacom/pywalfox/issues/14).

</td></tr></table>
</details>

<details><summary>
<b><code>stderr output from native app pywalfox: <installation-path>/main.sh: line 3: pywalfox: command not found</code></b>
</summary>

<table><tr><td>

  Pywalfox assumes that the `pywalfox` executable is in your `PATH`.

  If you can not run `pywalfox` from the command line (without specifying an absolute path), you must either add the path to the execuatable to your `PATH` variable, or move the executable to a path that already is in your `PATH`.

</td></tr></table>
</details>

<br>
> [!IMPORTANT]
> The errors in the browser console are not limited to just Pywalfox!

## 🚧 Development setup
Do you want to hack on the Pywalfox add-on? Start here:
```bash
git clone git@github.com:Frewacom/pywalfox.git # or use your own fork
cd pywalfox
yarn install # or npm if you do not have yarn installed
yarn run debug
```

To build the extension into a zip:
```bash
yarn run build
```
