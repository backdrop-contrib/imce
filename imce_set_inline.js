// $Id$
if (Drupal.jsEnabled) {
  $(document).ready(imceInline.initiate);
}

//hookImceFinish
function imceInlineImceFinish(file, imceWin) {
  var type = imceInline.activeType == 'link' ? 'link' : (file.width ? 'image' : 'link');
  var html = type=='image' ? ('<img src="'+ file.url +'" width="'+ file.width +'" height="'+ file.height +'" alt="'+ file.name +'" />') : ('<a href="'+ file.url +'">'+ file.name +' ('+ file.size +')</a>');
  imceInline.activeType = null;
  imceWin.blur();
  imceInline.insertAtCursor(imceInline.activeTextarea, html, type);
}

var imceInline = {};

imceInline.initiate = function() {
  $('a.imce-insert-inline').each( function () {
    $(this.parentNode).css('display', 'block');
    $(this).unclick().click(function() {
      imceInline.activeTextarea = $('#'+this.name.split('-IMCE-')[0]).get(0);
      imceInline.activeType = this.name.split('-IMCE-')[1];
      if (typeof imceInline.pop == 'undefined' || imceInline.pop.closed) {
        imceInline.pop = window.open(this.href, 'imceInline', 'width='+ 640 +', height='+ 480 +', resizable=1');
      }
      imceInline.pop.focus();
      return false;
    });
  });
}

//insert html at cursor position
imceInline.insertAtCursor(field, txt, type) {
  field.focus();
  if ('undefined' != typeof(field.selectionStart)) {
    if (type == 'link' && (field.selectionEnd-field.selectionStart)) {
      txt = txt.split('">')[0] +'">'+ field.value.substring(field.selectionStart, field.selectionEnd) +'</a>';
    }
    field.value = field.value.substring(0, field.selectionStart) + txt + field.value.substring(field.selectionEnd, field.value.length);
  }
  else if (document.selection) {
    if (type == 'link' && document.selection.createRange().text.length) {
      txt = txt.split('">')[0] +'">'+ document.selection.createRange().text +'</a>';
    }
    document.selection.createRange().text = txt;
  }
  else {
    field.value += txt;
  }
}
