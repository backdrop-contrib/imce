// $Id$

//hookImceFinish
function tinyImceFinish(path, w, h, s, win) {

  imceTiny.field.value = path; // set URL
  
  if (imceTiny.win.document.forms[0].elements['width']) { //set width
    imceTiny.win.document.forms[0].elements['width'].value = w;
  }
  
  if (imceTiny.win.document.forms[0].elements['height']) { //set height
    imceTiny.win.document.forms[0].elements['height'].value = h;
  }

  imceTiny.pop.blur();
  imceTiny.win.focus();
  imceTiny.field.focus();
}

//hookImceUrl
var tinyImceUrl;

//global variable container
var imceTiny = {};

// file browser function of tinyMCE
function imceFileBrowser(field_name, url, type, win) {
  if (typeof imceTiny.pop == 'undefined' || imceTiny.pop.closed) {
    imceTiny.pop = window.open(imceBrowserURL, 'tiny', 'width='+ 640 +', height='+ 480 +', resizable=1');
  }
  imceTiny.pop.focus();
  imceTiny.win = win;
  imceTiny.field = win.document.forms[0].elements[field_name];
  tinyImceUrl = url;
  //TODO: initiate active url highlighting in IMCE window.
}
