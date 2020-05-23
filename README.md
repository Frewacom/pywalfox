# Pywalfox

[<img src="https://img.shields.io/amo/v/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/stars/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/users/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)
[<img src="https://img.shields.io/amo/dw/pywalfox">](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/)

> Dynamic theming of Firefox using your Pywal colors

- Tired of Firefox not respecting your gorgeous Pywal colors like the rest of your system?
- Looking to rack up some karma :arrow_up: on [/r/unixporn](https://reddit.com/r/unixporn)?

Introducing **Pywalfox**, an [add-on for Firefox](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/) that themes the browser using your Pywal colors through the official Firefox Theme API!

With Pywalfox you can:
- [x] Customize the colors of almost every UI element
- [x] Automatically theme DuckDuckGo :duck: (optional)
- [x] Have bold text, styled dropdowns and much more (optional)
- [x] Easily update the browser theme using the add-on and/or your terminal

![](images/demo.gif)

## Requirements
- Python (both 2.7.x and 3.x versions are supported)
- Pywal
- Firefox
- Linux/MacOS/Windows

## Installation

First, install the [Firefox add-on](https://addons.mozilla.org/en-US/firefox/addon/pywalfox/).

**To use the add-on you must also install the script that fetches the Pywal colors:**
1. `pip install pywalfox`
2. `pywalfox setup`
2. Restart Firefox
3. Click the Pywalfox icon to access the settings and click "Fetch Pywal colors"

*If the Pywal colors could not be fetched, take a look in the [Troubleshooting](#troubleshooting) section below.*

## Usage

### Updating the theme using the terminal
If you are using some script for theming your system and do not want to manually refetch your Pywal colors using the Pywalfox settings page, you can trigger an update of the browser theme by running `pywalfox update` in your terminal.

### Customization
Pywalfox comes with extensive customization options.

#### Palette templates
The palette template allows you to create a custom palette based on colors from your Pywal colors using indexes. Pywalfox will use your palette when creating themes.

The best way to modify and create your own custom palette templates is to first fetch your Pywal colors using the "Fetch Pywal colors" button and then choose the colors that you want using the colorpicker in the "Palette" section. You open the colorpicker by clicking on the color preview. The colorpicker also allow you to select a custom color, however, you can **not** use a custom color in your palette template.

When you have modified the colors to your liking, open the "Palette template" section and click "Load from current". This will automatically take the indexes of your selected colors and update the inputs. You must then save the template by clicking on the "Save palette" button. A notification should pop up, telling you it was saved successfully.

#### Theme templates
Theme templates define the look of your browser theme. You can modify every element of the browser that is currently supported by the [Firefox Theme API](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/theme).

Modifying the theme is very straightforward; find the element that you want to change and select a palette color from the dropdown. When you are done, click "Save template".

#### Theme modes
There are three different theme modes, Dark, Light and Auto. Selecting Auto will automatically switch between dark- and light mode based on a selected time interval in the "General" section of the extension.

Note that dark- and light mode have **separate** theme- and palette templates. When modifying a template, you are always modifiying the template for the currently selected mode (dark/light).

### Further theming with the included userChrome.css and userContent.css
Pywalfox includes custom CSS sheets that you can enable.
The custom CSS sheets applies your Pywal colors to the context menus and other elements of the browser that are not available using the Firefox Theme API.
The scrollbar can also be hidden for a cleaner look.

To enable the custom CSS sheets:
1. Navigate to `about:config` in Firefox
2. Set `toolkit.legacyUserProfileCustomizations.stylesheets` to `true`
3. For further theming of context menus etc., enable the "Use included userChrome.css" option under General settings in the Pywalfox settings page.

To hide the scrollbar, enable the "Use included userContent.css" option.

## Uninstall
```bash
pywalfox uninstall      # Removes the manifest from native-messaging-hosts
pip uninstall pywalfox  # Removes the pywalfox executable
```

## Troubleshooting
* If you updated Pywalfox and have issues, try re-running the setup script as described in [Installation](#installation) above.
* If you have a permission error when running `pywalfox setup`, you can (probably) fix it by doing one of the following. Make sure to use the path from the setup output.

  - `chown <username> ~/.mozilla/native-messaging-hosts`

     or

  - `rm -r ~/.mozilla/native-messaging-hosts`; the setup script will then recreate it with the correct permissions.

* Take a look at the Debugging output in the Pywalfox settings page
* Make sure that `~/.cache/wal/colors` exists and contains the colors generated by Pywal
* Make sure that `path` in `~/<native-messaging-hosts-folder>/pywalfox.json` is correct and is a valid path
* Take a look in the Browser console for errors, i.e. `Tools > Web developer > Browser console` in Firefox

### Errors in browser console
- `ExtensionError: No such native application pywalfox`:

   The manifest is not installed properly. Try installing the manifest manually by following the instructions [here](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_manifests.).

   The manifest is located at `<path-to-python-site-packages>/pywalfox/assets/manifest.json`.

   After you have copied over the manifest to the correct path, make sure to also update the `path` property in the copied manifest. The `path` should point to `<path-to-python-site-packages>/pywalfox/bin/main.sh` (or `win.bat` if you are on Windows).

   If it is still not working, you could try reinstalling Firefox, see [#14](https://github.com/Frewacom/pywalfox/issues/14).

If you encounter any other errors [this troubleshooting guide](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging#Troubleshooting
) from Mozilla may be of use.

Note that the errors in the `Browser Console` is not limited to just Pywalfox.

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
