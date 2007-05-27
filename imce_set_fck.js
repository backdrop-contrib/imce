// $Id$

//TODO: need to check opener.opener.hookImceFinish in imce_browse.js

//fck's file browser window name is FCKBrowseWindow

//hookImceFinish.
function FCKBrowseWindowImceFinish(path, w, h, s, win) {
  win.blur();
  win.opener.focus();
  win.opener.setUrl(path, w, h);
}

//hookImceUrl. TODO: how to set this on IMCE open? cant control browser opening since there is no custom opening function.
var FCKBrowseWindowImceUrl;

//variable container. not needed now.
var imceFck = {};

// to control browser opening we need a custom file browser callback function like in tinyMCE.
