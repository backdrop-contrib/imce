// $Id$
if (Drupal.jsEnabled) {
  $(window).load(imceInitiateTinyMCE);
}
function imceInitiateTinyMCE() {
  if ("undefined" != typeof(window.tinyMCE)) {
    for (var i=0; i<tinyMCE.configs.length; i++) {
      tinyMCE.configs[i]['file_browser_callback'] = 'imceImageBrowser';
    }
  }
}
var imceTinyWin, imceTinyField, imceTinyType, imceTinyURL;
function imceImageBrowser(field_name, url, type, win) {
  //if (type!='image') return;//work for only images
  var width = 640;
  var height = 480;
  var imcePopup = window.open(imceBrowserURL, '', 'width='+ width +', height='+ height +', resizable=1');
  imcePopup.focus();
  imceTinyWin = win;
  imceTinyField = win.document.forms[0].elements[field_name];
  imceTinyType = type;
  imceTinyURL = url;
}
