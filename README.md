<img align="left" width="48" height="80" src="images/icon-readme.png" alt="Pywalfox icon">

# Pywalfox

[<img src="https://img.shields.io/amo/v/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/stars/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/users/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/dw/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/aur/version/python-pywalfox">](https://aur.archlinux.org/packages/python-pywalfox/)
[<img src="https://img.shields.io/github/license/frewacom/pywalfox">](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)

> Dynamic theming of Firefox (and Thunderbird) using your Pywal colors

- Tired of Firefox and Thunderbird not respecting your gorgeous Pywal colors like the rest of your system?
- Looking to rack up some karma :arrow_up: on [/r/unixporn](https://reddit.com/r/unixporn)?

Introducing **Pywalfox**, an add-on that themes [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/) and [Thunderbird](https://addons.thunderbird.net/sv-SE/thunderbird/addon/pywalfox/) with your [Pywal](https://github.com/dylanaraps/pywal) colors using the official [Theme API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme) from Mozilla!

With Pywalfox you can:
- [x] Customize the colors of almost every UI element
- [x] Automatically theme DuckDuckGo :duck: searches in Firefox *(optional)*
- [x] Have bold text, styled dropdowns and much more *(optional)*
- [x] Easily update the theme using the add-on GUI and/or the command line
- [x] Automatically switch between a dark and a light theme based on the time of day

![](images/demo_v207_ffproton.gif)

## Requirements
- Firefox and/or Thunderbird
- Python (version `2.7.X` or `3.X`)
- [Pywal](https://github.com/dylanaraps/pywal)

Pywalfox is supported on GNU/Linux, MacOS and Windows.

## Installation

1. Install **either** through [PyPi](https://pypi.org/project/pywalfox/) **or** via the [Arch User Repository](https://aur.archlinux.org/packages/python-pywalfox/) (AUR), i.e.
   - `pip install pywalfox` on any operating system that has the [Python Package Installer](https://github.com/pypa/pip) (`pip`)
   - `paru -S python-pywalfox` on Arch Linux-based distributions, if you use [`paru`](https://github.com/morganamilo/paru) as your AUR helper
2. Run `pywalfox install` in your terminal
3. Get the Pywalfox add-on for
   - [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
   - [Thunderbird](https://addons.thunderbird.net/en-US/thunderbird/addon/pywalfox/)
4. Restart Firefox and/or Thunderbird
5. Generate Pywal colors with your preferred method, use e.g. [this guide](https://github.com/dylanaraps/pywal/wiki/Getting-Started)
6. Click the Pywalfox icon in the Firefox/Thunderbird UI to access the theme settings and click "Fetch Pywal colors". This should apply a theme that uses your Pywal colors to the Firefox/Thunderbird GUI!

The Python package that we install in the first step is the [Pywalfox native messaging application](https://github.com/Frewacom/pywalfox-native), which fetches your Pywal colors for the Pywalfox add-on, which in turn feeds them to the [Theme API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme).

*Please review the [Troubleshooting](#troubleshooting) section if something is not working correctly.*

## Usage

### Updating the theme using the terminal
Run `pywalfox update` in your terminal to trigger an update of the browser theme.
This command allows integration of Pywalfox into e.g. system theming scripts and is functionally equivalent to clicking "Fetch Pywal colors" in the add-on settings GUI.

### Customization
Pywalfox comes with extensive customization options divided into the "Palette", "Palette template" and "Theme template" sections in the add-on settings GUI.

#### The palette
The palette in the "Palette" section is used to temporarily customize one or more colors from the Pywal palette.
You can use one of the generated colors, or choose any color from a colorwheel. Changes to the palette will be reset when you click "Fetch Pywal colors" and when you run `pywalfox update`.

#### Palette templates
If you want your palette customizations to be persistent (unlike the regular palette) you must save your current palette as a so-called palette template.

Saving a palette template is quite simple:

1. Click "Fetch Pywal colors" (or run `pywalfox update`) in the add-on settings GUI.
2. Use the regular "Palette" at the top of the page to customize the colors to your liking.
   - *Colors from outside the Pywal palette (i.e. from the colorwheel) cannot be used in a template*.
3. Click "Load from current" in the "Palette template" section below.
   - *The colors can also be set directly in the "Palette template" section using Pywal color indices.*
4. Click "Save palette" to save the palette template.

Your custom palette will now be applied whenever you update the browser theme.

#### Theme templates
The theme template assigns colors (from your palette template) to different browser elements.

Every browser element that is currently supported by the [Theme API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme) can be customized.

To create a palette template, go through the items in the "Theme template" section and assign a color to each item.
The colors are identified by their names as seen in the "Palette template" section.

### Theme modes
There are three different theme modes, Dark, Light and Auto. Selecting Auto will automatically switch between the dark and light modes based on a selected time interval in the "General" section of the extension.

> **Note that the dark and light modes have *separate* theme and palette templates. When modifying a template, you are always modifiying the template for the currently selected mode.**

### Further theming with the included userChrome.css and userContent.css in Firefox
Pywalfox includes custom CSS sheets that you can enable for Firefox.
The custom CSS sheets applies your Pywal colors to the context menus and other elements of the browser that are not available using the [Theme API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme).
The scrollbar can also be hidden for a cleaner look.

To enable the custom CSS sheets:
1. Navigate to `about:config` in Firefox
2. Set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`
3. Under "General" in the Pywalfox settings:
   - Enable "Use included userChrome.css" to theme context menus and other details
   - Enable "Use included userContent.css" to hide the scrollbar

## Uninstall
```bash
pywalfox uninstall      # Removes the manifest from native-messaging-hosts
pip uninstall pywalfox  # Removes the pywalfox executable
```

## Troubleshooting
* If you updated from a `pywalfox-native` version ≤ `2.6`, re-run the installation using `pywalfox install`
* If you updated Pywalfox and have issues, re-run the setup script as described in [Installation](#installation) above.
* Check the log in the Debugging section at the bottom of the Pywalfox settings page

* If you have a permission error when running `pywalfox install`, you can (probably) fix it by doing one of the following:

  - `chown <username> ~/.mozilla/native-messaging-hosts`

     or

  - `rm -r ~/.mozilla/native-messaging-hosts`; the setup script will then recreate it with the correct permissions.

      *Make sure to use the path from the setup output!*

  - If you get `Received unhandled message action: invalidMessage`, you are using an outdated daemon version.
  Install the newest one with `pip` by following the instructions in [Installation](#installation) above.

* Verify that `~/.cache/wal/colors` exists and contains the colors generated by Pywal
* Verify that `path` in `~/<native-messaging-hosts-folder>/pywalfox.json` is a valid path
* Check the Firefox browser console for errors (`Tools > Web developer > Browser console`)

### Errors in the browser console
- `ExtensionError: No such native application pywalfox`:

   The manifest is not installed properly. Try installing the manifest manually by following the instructions [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests.).

   The manifest is located at `<path-to-python-site-packages>/pywalfox/assets/manifest.json`.

   After you have copied over the manifest to the correct path, make sure to also update the `path` property in the copied manifest. The `path` should point to `<path-to-python-site-packages>/pywalfox/bin/main.sh` (or `win.bat` if you are on Windows).

   If it still does not work, you can try to reinstall Firefox, see [#14](https://github.com/Frewacom/pywalfox/issues/14).

- `stderr output from native app pywalfox: <installation-path>/main.sh: line 3: pywalfox: command not found`:
  
  Pywalfox assumes that the `pywalfox` executable is in your `PATH`.

  If you can not run `pywalfox` from the command line (without specifying an absolute path), you must either add the path to the execuatable to your `PATH` variable, or move the executable to a path that already is in your `PATH`.

If you encounter any other errors [this troubleshooting guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#Troubleshooting) from Mozilla may be of use.

*Note that the errors in the `Browser Console` are not limited to just Pywalfox.*

## Development setup
```bash
git clone git@github.com/frewacom/pywalfox.git
cd pywalfox
yarn install # or npm if you do not have yarn installed
yarn run debug
```

To build the extension into a zip:
```bash
yarn run build
```
