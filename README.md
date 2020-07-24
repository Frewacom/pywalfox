# Pywalfox

[<img src="https://img.shields.io/amo/v/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/stars/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/users/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/dw/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/github/license/frewacom/pywalfox">](https://www.mozilla.org/en-US/MPL/2.0/FAQ/)

> Dynamic theming of Firefox (and Thunderbird) using your Pywal colors

- Tired of Firefox and Thunderbird not respecting your gorgeous Pywal colors like the rest of your system?
- Looking to rack up some karma :arrow_up: on [/r/unixporn](https://reddit.com/r/unixporn)?

Introducing **Pywalfox**, an add-on that themes [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/) and [Thunderbird](https://addons.thunderbird.net/sv-SE/thunderbird/addon/pywalfox/) with your [Pywal](https://github.com/dylanaraps/pywal) colors using the official [Theme API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme) from Mozilla!

With Pywalfox you can:
- [x] Customize the colors of almost every UI element
- [x] Automatically theme DuckDuckGo :duck: searches in Firefox (optional)
- [x] Have bold text, styled dropdowns and much more (optional)
- [x] Easily update the theme using the add-on and/or the command line
- [x] Automatically switch between a dark and a light theme based on the time of day

![](images/neon_demo.gif)

## Requirements
- Firefox and/or Thunderbird
- Python (version 2.7.x or 3.x)
- [Pywal](https://github.com/dylanaraps/pywal)
- [Pywalfox native messaging application](https://github.com/Frewacom/pywalfox-native)

Pywalfox is supported on GNU/Linux, MacOS and Windows.

## Installation

First, install the Pywalfox add-on for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/) and/or for [Thunderbird](https://addons.thunderbird.net/sv-SE/thunderbird/addon/pywalfox/).

**To use the add-on you must also install the companion native messaging application that fetches the Pywal colors:**

1. `pip install pywalfox`
2. `pywalfox setup`
2. Restart Firefox and/or Thunderbird
3. Click the Pywalfox icon in the UI to access the settings and click "Fetch Pywal colors"

If the Pywal colors could not be fetched, take a look in the [Troubleshooting](#troubleshooting) section below.

> **Some users have had issues with getting the addon and the native messaging application to communicate, despite everything seemingly being setup correctly. You can currently fix this by installing from pip with super user privileges, i.e. `sudo pip install pywalfox`, see [#31](https://github.com/Frewacom/pywalfox/issues/31).**

## Usage

### Updating the theme using the terminal
Run `pywalfox update` in your terminal to trigger an update of the browser theme.
This allows you to update the browser theme without having to press "Fetch Pywal colors" in the add-on GUI.
The command can be used to integrate Pywalfox into e.g. system theming scripts.

> **If Pywalfox has been installed for both Firefox and Thunderbird and the two are running at the same time, currently only one of them will update when issuing `pywalfox update` in the terminal, see [#38](https://github.com/Frewacom/pywalfox/issues/38).**

### Customization
Pywalfox comes with extensive customization options.

#### Palette templates
The palette template allows you to create a custom palette using Pywal color indices.
Pywalfox will use your palette when creating themes.

The best way to modify and create your own custom palette templates is to first fetch your Pywal colors using the "Fetch Pywal colors" button and then choose the colors that you want using the colorpicker in the "Palette" section.
You open the colorpicker by clicking on the color preview.
The colorpicker also allows you to select a custom color.
You can however **not** use a custom color in your palette template.

When you have modified the colors to your liking, open the "Palette template" section and click "Load from current".
This will automatically take the indices of your selected colors and update the inputs.
You must then save the template by clicking on the "Save palette" button.
A notification should pop up, telling you it was saved successfully.

#### Theme templates
Theme templates define the look of your browser theme.
You can modify every element of the browser that is currently supported by the [Theme API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme).

Modifying the theme is very straightforward; find the element that you want to change and select a palette color from the dropdown.
When you are done, click "Save template".

#### Theme modes
There are three different theme modes, Dark, Light and Auto. Selecting Auto will automatically switch between the dark and light modes based on a selected time interval in the "General" section of the extension.

> **Note that the dark and light modes have *separate* theme and palette templates. When modifying a template, you are always modifiying the template for the currently selected mode (dark/light).**

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
* If you updated Pywalfox and have issues, try re-running the setup script as described in [Installation](#installation) above.
* Check the log in the Debugging section at the bottom of the Pywalfox settings page

* If you have a permission error when running `pywalfox setup`, you can (probably) fix it by doing one of the following:

  - `chown <username> ~/.mozilla/native-messaging-hosts`

     or

  - `rm -r ~/.mozilla/native-messaging-hosts`; the setup script will then recreate it with the correct permissions.

      *Make sure to use the path from the setup output!*

  - If you get `Received unhandled message action: invalidMessage`, you are using an outdated daemon version.
  Install the newest one using `pip` by following the instructions in the [Installation](#installation).

* Verify that `~/.cache/wal/colors` exists and contains the colors generated by Pywal
* Verify that `path` in `~/<native-messaging-hosts-folder>/pywalfox.json` is a valid path
* Check the Firefox browser console for errors (`Tools > Web developer > Browser console`)

### Errors in the browser console
- `ExtensionError: No such native application pywalfox`:

   The manifest is not installed properly. Try installing the manifest manually by following the instructions [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests.).

   The manifest is located at `<path-to-python-site-packages>/pywalfox/assets/manifest.json`.

   After you have copied over the manifest to the correct path, make sure to also update the `path` property in the copied manifest. The `path` should point to `<path-to-python-site-packages>/pywalfox/bin/main.sh` (or `win.bat` if you are on Windows).

   If it still does not work, try reinstalling Firefox, see [#14](https://github.com/Frewacom/pywalfox/issues/14).

- `stderr output from native app pywalfox: <installation-path>/main.sh: line 3: pywalfox: command not found`
  Pywalfox assumes that the `pywalfox` executable is in your `PATH`.

  If you can not run `pywalfox` from the command line (without specifying an absolute path), you must either add the path to the execuatable to your `PATH` variable, or move the executable to a path that already is in your `PATH`.

If you encounter any other errors [this troubleshooting guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#Troubleshooting
) from Mozilla may be of use.

*Note that the errors in the `Browser Console` is not limited to just Pywalfox.*

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
## Contributors
[![](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/images/0)](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/links/0)[![](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/images/1)](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/links/1)[![](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/images/2)](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/links/2)[![](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/images/3)](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/links/3)[![](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/images/4)](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/links/4)[![](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/images/5)](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/links/5)[![](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/images/6)](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/links/6)[![](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/images/7)](https://sourcerer.io/fame/Frewacom/Frewacom/Pywalfox/links/7)
