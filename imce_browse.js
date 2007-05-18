// $Id$
$(imceStartBrowser);

imceVar['absURL'] = 0;//absolute URLs

function imceStartBrowser() {
  var imceOpener = window.opener && window.opener != window.self ? window.opener : null;
  if (imceOpener) {
    if (typeof imceOpener[window.name+'ImceFinish'] == 'function') {
      imceVar['customCall'] = imceOpener[window.name+'ImceFinish'];//function for adding
      if(typeof imceOpener[window.name+'ImceUrl'] == 'string') {.
        imceVar['targetUrl'] = imceOpener[window.name+'ImceUrl'];//url to be highlighted
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
      row.cells[4].innerHTML += imceVar['customCall'] ? ' &nbsp; <a href="javascript: imceFinitor(\''+fURL+'\', '+info['w']+', '+info['h']+', \''+info['s']+'\')">'+ imceVar['addText'] +'</a>' : '';
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
    $('#imagepreview').html((append ? $('#imagepreview').html() : '') +'<div><a'+ (imceVar['customCall'] ? (' href="javascript: imceFinitor(\''+ path +'\', '+ info['w'] +', '+ info['h'] +', \''+info['s']+'\')"') : '') +'>'+ (info['w']&&info['h'] ? ('<img src="'+ path +'" width="'+ info['w'] +'" height="'+ info['h'] + '" />') : info['f']) +'</a>'+ (info['w']&&info['h'] ? '' : ' (<a href="'+ path +'" target="_blank">'+ imceVar['viewText'] +'</a>)') +'</div>');
    if ($('#resizeform').length && info['w'] && info['h']) {
      $('#resizeform').css('visibility', 'visible');
      $('#img_name').val(info['f']);
    }
  }
}

function imceFinitor(path, w, h, s) {
  path = imceVar['absURL'] ? ('http://'+ location.host + path) : path;
  imceVar['customCall'](path, w, h, s, window.self);
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