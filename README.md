# Desktop Entry Jump Lists

An extension for Gnome Shell that parses the given Desktop Entry file in the
  application dock/tray and adds any additional actions
  (http://standards.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html#extra-actions)
  to the jumplist. See _To-Do_ for current limitations

## Requirements

Gnome Shell 3.4 (see `gnome-shell --version`)

## Installation

You have multiple options.

1. Install via [Gnome Tweak Tool][]
2. Place the inner folder inside `~/.local/share/gnome-shell/extensions` and
  restart the shell (log out/in). Then enable via [Gnome Tweak Tool][].

Extra jump lists (if present) will be available upon right-click of an
  application.

## To-Do

Implement support for `X-Ayatana-Desktop-Shortcuts` settings, so that
  current Unity jump lists can be used in Gnome Shell (although they are
  supposed to be porting those to the standard soon).
  
Currently application launching reuses the base application, so additional
  jump lists must use that application when launching (ie. for Chromium
  `chromium-browser --incognito` works as an Exec, but something like
  `chromium-help-tool --open` would open chromium with the `--open` flag).

Parsing ignores lots of edge cases (such as newline escaping), but works in
  a general sense.

[Gnome Tweak Tool]: https://live.gnome.org/GnomeTweakTool

