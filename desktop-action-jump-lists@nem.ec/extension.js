const Clutter = imports.gi.Clutter;
const Config = imports.misc.config;
const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Shell = imports.gi.Shell;
const Lang = imports.lang;
const Signals = imports.signals;
const St = imports.gi.St;
const Mainloop = imports.mainloop;

const Self = imports.misc.extensionUtils.getCurrentExtension();

const PopupMenu = imports.ui.popupMenu;
const AppDisplay = imports.ui.appDisplay;
const Main = imports.ui.main;
const Util = imports.misc.util;

const Jumplist = Self.imports.jumplist_hack;
let jumplist = new Jumplist.Jumplist();


function setJumplist (appIconMenu) {

  let appPaths = [GLib.get_home_dir() + "/.local/share/applications/", 
              "/usr/local/share/applications/",
              "/usr/share/applications/"];

  function parseCommandLineParams(string){
    string = string.split(" ");
    let command = "";
    let args = [];
    
    for(let i in string){
      global.log(string[i]);
      if(command == "" || command[command.length - 1] == "\\"){
        command = command.substr(0, command.length - 2) + " " + string[i];
      }
      else if(string[i][0] == "-"){
        args.push(string[i]);
      }
      else if(args.length > 0){
        args[args.length - 1] = args[args.length - 1] + " " + string[i];
      }
      else{
        global.log("Error parsing command line: " + string[i]);
      }
    }
    return [command, args];
  }

  function parseDesktopEntry(data){
    // http://standards.freedesktop.org/desktop-entry-spec/desktop-entry-spec-latest.html
    data = data.split("\n");
    
    let groups = {};
    let currentGroupName = null;
    let currentGroup = {};
    
    for(let idx in data){
      let line = data[idx].trim();
      // Comments
      if(line.length == 0 || line[0] == "#"){
        continue;
      }
      // Start of a group
      else if(line.lastIndexOf("[") == 0 && line.indexOf("]") == line.length - 1){
        if(currentGroupName != null){
          groups[currentGroupName] = currentGroup;
        }
        currentGroupName = line.substr(1, line.length - 2).trim();
        currentGroup = {};
      }
      // Key-value
      else if(line.indexOf("=") >= 0 && currentGroupName != null){
        // TODO Deal with locales
        let kv = line.split("=");
        if(kv.length == 2){
          currentGroup[kv[0].trim()] = kv[1].trim();
        }
      }
    }
    
    if(currentGroupName != null){
      groups[currentGroupName] = currentGroup;
    }
    
    return groups;
  }

  function appendJumplistItem (event, default_image) {
    let item = new PopupMenu.PopupImageMenuItem(
      event.Name || "Undefined",
      event.Icon || default_image);
    appIconMenu.addMenuItem(item);
    item.connect('activate', Lang.bind(appIconMenu, function () {
      let app = new Gio.DesktopAppInfo.new(appIconMenu._source.app.get_id());
      let params = parseCommandLineParams(event.Exec)[1];
      global.log(params);
      global.log(params.length);
      if(params){
        appIconMenu._source.app.launch(0, params, -1);
        // Util.spawn([SSHSEARCH_TERMINAL_APP, '-e', 'ssh -p ' + id.port + ' ' + target]);
        Main.overview.hide();
      }
    }));
  }
  
  let data = null;
  
  // Look for existing .desktop file
  for(let idx in appPaths){
    let path = appPaths[idx] + appIconMenu._source.app.get_id();
    if(GLib.file_test(path, GLib.FileTest.EXISTS)){
      let file = Gio.file_new_for_path(path);
      //data = file.load_contents(null)[1]
      data = Shell.get_file_contents_utf8_sync(file.get_path()) // Issues with Unicode??
      break;
    }
  }
  
  if(data != null){
    let groups = parseDesktopEntry(data);
    let needsSeparator = true;
    
    let shortcuts = {};
    // Enables use of Unity's Ayatana shortcuts.
    if(groups["Desktop Entry"]){
      let shortcutStr = groups["Desktop Entry"]["X-Ayatana-Desktop-Shortcuts"];
      if(shortcutStr){
        let entries = shortcutStr.split(';');
        for(var i = 0; i < entries.length; i++){
          shortcuts[entries[i].trim()] = 0;
        }
      }
    }
    
    for(let name in groups){
      let action = name.match(/(?:Desktop Action\s)(\w+)/);
      let shortcut = name.match(/(\w+)(?:\sShortcut Group)/);
      if(action && action[1] ||
          shortcut && shortcuts.hasOwnProperty(shortcut[1])){
        let event = groups[name];
        /*** So that we don't have to modify everything when using Unity's Ayatana shortcuts... */
        /*// Check OnlyShowIn and NotShowIn for us.
        if(event.OnlyShowIn !== undefined && event.OnlyShowIn.indexOf("GNOME") < 0) ||
          (event.NotShowIn !== undefined && event.NotShowIn.indexOf("GNOME") >= 0)){
          continue;
        }*/
        
        if(needsSeparator){
          appIconMenu._appendSeparator();
          needsSeparator = false;
        }
        appendJumplistItem(event, "emblem-favorite");
      }
    }
  }
}

function init(metadata) {
  imports.gettext.bindtextdomain('gnome-shell-extensions', Config.LOCALEDIR);
}

function enable() {
  jumplist.add(setJumplist);
}

function disable() {
  jumplist.remove(setJumplist);
}
