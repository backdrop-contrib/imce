// $Id$
$(imceStartBrowser);

imceVar['absURL'] = 0;//absolute URLs

function imceStartBrowser() {
  var imceOpener = window.opener&&window.opener!=window.self ? window.opener : null;
  if (imceOpener) {
    if (eval("'undefined'!=typeof(imceOpener."+window.name+"ImceFinish)")) {//custom function for adding
      imceVar['targetWin'] = imceOpener;
      imceVar['customCall'] = window.name+"ImceFinish";
      if(eval("'undefined'!=typeof(imceOpener."+window.name+"ImceUrl)")) {//custom url to be highlighted.
        imceVar['targetUrl'] = eval("imceOpener."+window.name+"ImceUrl");
      }
    }
    else if (imceOpener.imceTinyWin) {//tinymce
      imceVar['targetWin'] = imceOpener.imceTinyWin;
      imceVar['targetField'] = imceOpener.imceTinyField;
      imceVar['targetUrl'] = imceOpener.imceTinyURL;
      imceVar['targetType'] = imceOpener.imceTinyType;
      imceVar['targetWidth'] = imceOpener.imceTinyWin.document.forms[0].width||null;
      imceVar['targetHeight'] = imceOpener.imceTinyWin.document.forms[0].height||null;
    }
    else if (imceOpener.FCK) {//fckeditor
      var fieldId = imceOpener.sActualBrowser && imceOpener.sActualBrowser=='Link' ? 'txtLnkUrl' : 'txtUrl';
      imceVar['targetWin'] = imceOpener;
      imceVar['targetField'] = imceOpener.document.getElementById(fieldId);
      imceVar['targetUrl'] = imceVar['targetField'].value;
      imceVar['targetType'] = fieldId=='txtLnkUrl' ? 'link' : imceOpener.location.pathname.split('.')[0].split('_')[1];
      if (imceVar['targetType'] == 'image') {
        imceVar['targetWidth'] = imceOpener.document.getElementById('txtWidth')||null;
        imceVar['targetHeight'] = imceOpener.document.getElementById('txtHeight')||null;
      }
    }
  }
  if ($('#resizeform').length) {
    $('#resize-file-span').css('display', 'none');
    $('#resizeform').css('visibility', 'hidden');
    $('#resizeform').submit( function() { return $('#img_w').val()*1>=1 && $('#img_h').val()*1>=1 });
    $('#img_w').focus( function() {
      if ($('#img_h').val()) {
        var info = imceInfo(imceVar['activeRow']);
        this.value = Math.round(info['w']/info['h']*$('#img_h').val());
      }
    });
    $('#img_h').focus( function() {
      if ($('#img_w').val()) {
        var info = imceInfo(imceVar['activeRow']);
        this.value = Math.round(info['h']/info['w']*$('#img_w').val());
      }
    });
  }
  var activepath = imceVar['latestFile'] ? imceVar['latestFile'] : (imceVar['targetUrl'] && !$('#imagepreview').html() ? imceVar['targetUrl'] : null);
  var list = $('#bodytable').get(0).rows;
  if (list.length>0 && list[0].cells.length>1) {
    for (var i=0; row=list[i]; i++) {
      var info = imceInfo(row);
      var fURL = imceVar['fileUrl']+'/'+info['f'];
      activepath==fURL ? imceHighlight(row, 'append') : 0;
      row.onmouseover = function() {$(this).addClass('rover')};
      row.onmouseout = function() {$(this).removeClass('rover')};
      row.onclick = function() {imceHighlight(this);};
      row.cells[4].innerHTML += imceVar['targetWin'] ? ' &nbsp; <a href="javascript: imceFinitor(\''+fURL+'\', '+info['w']+', '+info['h']+', \''+info['s']+'\')">'+ imceVar['addText'] +'</a>' : '';
      imceVar["confirmDel"] ? row.cells[4].firstChild.onclick = function() {return confirm(imceVar["confirmDel"])} : 0;
    }
  }
  if ($('#dirname').length) {
    $('#dirop').css('display', 'none');
    $('#dirname').change( function() {
      if (this.value != '/') {
        this.form.submit();
      }
    });
  }
}

function imceHighlight(row, append) {
  if (imceVar['activeRow']) {
    $(imceVar['activeRow']).removeClass('rsel');
    if ($('#resizeform').length) {
      $('#resizeform').css('visibility', 'hidden');
      $('#img_name').val('');
    }
  }
  if (imceVar['activeRow']==row) {
    imceVar['activeRow'] =null;
    $('#imagepreview div:last').remove();
  }
  else {
    var info = imceInfo(row);
    var path = imceVar['fileUrl']+'/'+info['f'];
    $(row).addClass('rsel');
    imceVar['activeRow'] = row;
    $('#imagepreview').html((append ? $('#imagepreview').html() : '') +'<div><a'+ (imceVar['targetWin'] ? (' href="javascript: imceFinitor(\''+ path +'\', '+ info['w'] +', '+ info['h'] +', \''+info['s']+'\')"') : '') +'>'+ (info['w']&&info['h'] ? ('<img src="'+ path +'" width="'+ info['w'] +'" height="'+ info['h'] + '" />') : info['f']) +'</a>'+ (info['w']&&info['h'] ? '' : ' (<a href="'+ path +'" target="_blank">'+ imceVar['viewText'] +'</a>)') +'</div>');
    if ($('#resizeform').length && info['w'] && info['h']) {
      $('#resizeform').css('visibility', 'visible');
      $('#img_name').val(info['f']);
    }
  }
}

function imceFinitor(path, w, h, s) {
  path = imceVar['absURL'] ? ('http://'+ location.host + path) : path;
  if (imceVar['customCall']) {// if there is a custom function, call it
    eval("imceVar['targetWin']."+imceVar['customCall']+"(path, w, h, s, window.self)");
    return;
  }
  imceVar['targetField'].value = path;
  if (imceVar['targetWidth']) {
    imceVar['targetWidth'].value = w;
  }
  if (imceVar['targetHeight']) {
    imceVar['targetHeight'].value = h;
  }
  imceVar['targetWin'].focus();
  imceVar['targetField'].focus();
  window.close();
}

function imceInfo(row) {
  var info = [];
  var wh = row.cells[2].innerHTML.split('x');
  info['w'] = parseInt(wh[0]);
  info['h'] = parseInt(wh[1]);
  info['f'] = row.cells[0].innerHTML;
  info['s'] = row.cells[1].innerHTML;
  return info;
}