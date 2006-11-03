// $Id$
if (Drupal.jsEnabled) {
  $(imceInitiateFCK);
}
function imceInitiateFCK() {
  if ("undefined" != typeof(window.FCKeditorAPI)) {
    var path;
    var width = 640;
    var height = 480;
    var types = ['Image', 'Link', 'Flash'];
    for (var i in FCKeditorAPI.__Instances) {
      var fck = FCKeditorAPI.__Instances[i];
      path = path ? path : fck.Config.BasePath.substring(0, fck.Config.BasePath.indexOf('modules')) + 'index.php?q=imce/browse';
      for (var t in types) {
        eval('fck.Config.'+types[t]+'BrowserURL = path; fck.Config.'+types[t]+'BrowserWindowWidth = width; fck.Config.'+types[t]+'BrowserWindowHeight = height;');
      }
    }
  }
}
