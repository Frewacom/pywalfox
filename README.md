![Theme preview](https://i.imgur.com/Gw7lp2u.png "Theme preview Black")
![Theme preview](https://i.imgur.com/lFaQAve.png "Theme preview Pink")
![Theme preview](https://i.imgur.com/GQKzDff.png "Theme preview Blue")

# Pywalfox
### Warning
The layout presented in the screenshots with the bookmarks to the right of the URL-bar is simply my preferred layout. You are free to use whatever you like.

There are some bugs and not everything is styled. Dropdown- and context menus are not quite finished yet and it is definitely not "polished". It looks much better than the default, though. Also, during development we used the default theme in Firefox and it probably looks like absolute shit when using a different one.


### Description
Custom userChrome.css and userContent.css with support for Pywal. Because of limitations in the way firefox loads and inserts the userContent.css file, 
we can not import external files into userContent.css (as far as I know) using the normal `@import` command. It does work in userChrome.css, however. 

Because of this, we have chosen to use a script for "compiling" these files and insert the correct pywal values whenever we change the theme. You can find an example of a script like this in [our dotfiles repository for Arch](https://github.com/Frewacom/FARBS-Dotfiles/blob/master/.local/bin/ftools/make-firefox-config). 

To make things look a bit prettier I wrote a script in python to generate additional hues of your pywal colors, but you are free to use whatever values you find fit. All my scripts can be found in the ftools directory in the dotfiles repo if you want to use them yourself. 



