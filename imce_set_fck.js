// $Id$
if (Drupal.jsEnabled) {
  $(window).load(imceInitiateFCK);
}
function imceInitiateFCK() {
  if ("undefined" != typeof(window.FCKeditorAPI)) {
    $.each(FCKeditorAPI.__Instances, function(){imceSetFCK(this);});
  }
  else if ("undefined" != typeof(window.FCKeditor_OpenPopup)) {
    $('textarea').each(function () {
      if (eval('"undefined" != typeof(oFCKeditor_' + this.id.replace(/\-/g, '_') +')')) {
        imceSetFCK(eval('oFCKeditor_' + this.id.replace(/\-/g, '_')));
      }
    });
  }
}
function imceSetFCK(fck) {
  var width = 640;
  var height = 480;
  var types = ['Image', 'Link', 'Flash'];
  for (var t in types) {
    eval('fck.Config.'+types[t]+'Browser = true; fck.Config.'+types[t]+'BrowserURL = imceBrowserURL; fck.Config.'+types[t]+'BrowserWindowWidth = width; fck.Config.'+types[t]+'BrowserWindowHeight = height;');
  }
}
