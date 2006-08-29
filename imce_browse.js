// $Id$
addLoadEvent(imceStartBrowser);

var imceSelectedRow = null;

function imceStartBrowser() {
  var row, rows = $('bodytable').getElementsByTagName('tr');
  var path = $('latest-file').value ? $('latest-file').value : (window.opener&&!$('imagepreview').innerHTML ? window.opener.imceRefererURL : null);
  for (var i=0; row = rows[i]; i++) {
    if (path && path==row.getAttribute('ipath')) {
      imceHighlight(row, 1);
    }
    row.onmouseover = function() {addClass(this, 'rover')};
    row.onmouseout = function() {removeClass(this, 'rover')};
    row.onclick = function() {imceHighlight(this);};
  }
}

function imceHighlight(row, append) {
  if (imceSelectedRow) {
    removeClass(imceSelectedRow, 'rsel');
  }
  if (imceSelectedRow==row) {
    imceSelectedRow =null;
    $('imagepreview').innerHTML = '';
  }
  else {
    var w = parseInt(row.getAttribute('iw'));
    var h = parseInt(row.getAttribute('ih'));
    var path = row.getAttribute('ipath');
    addClass(row, 'rsel');
    imceSelectedRow = row;
    $('imagepreview').innerHTML = (append ? $('imagepreview').innerHTML : '') + (w&&h ? '<a href="javascript: imceFinitor(\'' + path + '\', ' + w + ', ' + h + ')"><img src="'+ path +'" width="'+ w +'" height="'+ h +'" /></a>' : '');
  }
}

function imceFinitor(path, w, h) {
  if (!window.opener || !window.opener.imceRefererWin || (window.opener.imceRefererType=='image' && !(w&&h) && !confirm($('confirm-msg').value))) return;
  window.opener.imceRefererField.value = path;
  if (window.opener.imceRefererWin.document.forms[0].width) {
    window.opener.imceRefererWin.document.forms[0].width.value = w;
  }
  if (window.opener.imceRefererWin.document.forms[0].height) {
    window.opener.imceRefererWin.document.forms[0].height.value = h;
  }
  window.opener.imceRefererWin.focus();
  window.close();
}
