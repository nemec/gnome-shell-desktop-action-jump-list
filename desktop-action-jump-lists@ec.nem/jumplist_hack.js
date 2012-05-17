const AppDisplay = imports.ui.appDisplay;

function Jumplist(){
  //this._init();
}

Jumplist.prototype = {
  add: function(jumplist_callback){
    // Back up _redisplay if it isn't already.
    if(AppDisplay.AppIconMenu.prototype._redisplay_bak === undefined){
      AppDisplay.AppIconMenu.prototype._redisplay_bak = AppDisplay.AppIconMenu.prototype._redisplay;
    }
    // Create a list of "jumplist functions"
    if(AppDisplay.AppIconMenu.prototype._redisplay_jumplists === undefined){
      AppDisplay.AppIconMenu.prototype._redisplay_jumplists = [];
    }
    
    AppDisplay.AppIconMenu.prototype._redisplay_jumplists.push(jumplist_callback);

    // Make _redisplay iterate through extra jumplists
    AppDisplay.AppIconMenu.prototype._redisplay = function () {
      AppDisplay.AppIconMenu.prototype._redisplay_bak.call(this);
      try{
        for(let i in AppDisplay.AppIconMenu.prototype._redisplay_jumplists){
          AppDisplay.AppIconMenu.prototype._redisplay_jumplists[i](this);
        }
      }
      catch(e){
        global.log("Jumplist Error::" + e);
      }
    };
  },

  remove: function(jumplist_callback){
    if(AppDisplay.AppIconMenu.prototype._redisplay_jumplists !== undefined){
      for(let i in AppDisplay.AppIconMenu.prototype._redisplay_jumplists){
        global.log(AppDisplay.AppIconMenu.prototype._redisplay_jumplists[i]);
        if(AppDisplay.AppIconMenu.prototype._redisplay_jumplists[i] == jumplist_callback){
          AppDisplay.AppIconMenu.prototype._redisplay_jumplists.splice(i, 1);
          break;
        }
      }
      if(AppDisplay.AppIconMenu.prototype._redisplay_jumplists.length == 0){
        delete AppDisplay.AppIconMenu.prototype._redisplay_jumplists;
        AppDisplay.AppIconMenu.prototype._redisplay = AppDisplay.AppIconMenu.prototype._redisplay_bak;
        delete AppDisplay.AppIconMenu.prototype._redisplay_bak;
      }
    }
  }
}
