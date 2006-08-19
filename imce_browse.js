// $Id$
addLoadEvent(imceStartBrowser);

var selectedrow = null;

function imceStartBrowser() {
  var rows = $('bodytable').getElementsByTagName('tr');
  var row;
  for (var i=0; row = rows[i]; i++) {
    if (!row.getAttribute('ipath')) continue;
    row.onmouseover = function() {addClass(this, 'rover')};
    row.onmouseout = function() {removeClass(this, 'rover')};
    row.onclick = function() {
      if (selectedrow) {
        removeClass(selectedrow, 'rsel');
      }
      if (selectedrow==this) {
        selectedrow =null;
        $('imagepreview').innerHTML = '';
      }
      else {
        $('imagepreview').innerHTML = '<a href="javascript: imceFinitor(\'' + this.getAttribute('ipath') + '\', ' + this.getAttribute('iw') + ', ' + this.getAttribute('ih') + ')"><img src="'+this.getAttribute('ipath')+'"></a>';
        addClass(this, 'rsel');
        selectedrow = this;
      }
    }
  }
}

function imceFinitor(path, w, h) {
  if (!window.opener) return;
  if (window.opener.imceRefererType=='image' && !(w&&h)) {
    if (!confirm($('confirm-msg').value)) return;
  }
  if (window.opener.imceRefererWin) {
    window.opener.imceRefererField.value = path;
    if (window.opener.imceRefererWin.document.forms[0].width) {
      window.opener.imceRefererWin.document.forms[0].width.value = w;
    }
    if (window.opener.imceRefererWin.document.forms[0].height) {
      window.opener.imceRefererWin.document.forms[0].height.value = h;
    }
    window.opener.imceRefererWin.focus();
  }
  window.close();
}
