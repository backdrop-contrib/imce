// $Id$

//TODO: removed absolute url setting. implement it on php side.

function imceStartBrowser() {
  var imceOpener = window.opener && window.opener != window.self ? window.opener : null;
  if (imceOpener) {
    imceVar['targetWin'] = imceOpener;
    if (typeof imceOpener[window.name+'ImceFinish'] == 'function') {//function for adding
      imceVar['customCall'] = imceOpener[window.name+'ImceFinish'];
      if(typeof imceOpener[window.name+'ImceUrl'] == 'string') {//url to be highlighted
        imceVar['targetUrl'] = imceOpener[window.name+'ImceUrl'];
      }
    }
  }
  if ($('#resizeform').length) {
    $('#resize-file-span').css('display', 'none');
    $('#resizeform').css('visibility', 'hidden');
    $('#resizeform').submit( function() { return $('#img_w').val()*1>=1 && $('#img_h').val()*1>=1 });
    $('#img_w').focus( function() {
      if ($('#img_h').val()) {
        var file = imceFile(imceVar['activeRow']);
        this.value = Math.round(file.width/file.height*$('#img_h').val());
      }
    });
    $('#img_h').focus( function() {
      if ($('#img_w').val()) {
        var file = imceFile(imceVar['activeRow']);
        this.value = Math.round(file.height/file.width*$('#img_w').val());
      }
    });
  }
  var activepath = imceVar['latestFile'] ? imceVar['latestFile'] : (imceVar['targetUrl'] && !$('#imagepreview').html() ? imceVar['targetUrl'] : null);
  var list = $('#bodytable').get(0).rows;
  if (list.length>0 && list[0].cells.length>1) {
    for (var i=0; row = list[i]; i++) {
      var file = imceFile(row);
      if (activepath == imceFileUrl(file.name)) {
        imceHighlight(row, true);
      }
      row.onclick = function() {
        imceHighlight(this);
      }
      if (imceVar['customCall']) {
        var a = document.createElement('a');
        a.innerHTML = imceVar['addText'];
        a.href = '#';
        a.onclick = function() {
          imceFinitor(file);
          return false;
        }
        row.cells[4].appendChild(a);
      }
      if (imceVar["confirmDel"]) {
        row.cells[4].firstChild.onclick = function() {
          return confirm(imceVar["confirmDel"]);
        }
      }
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
  if (!row) {
    return;
  }
  
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
    $(row).addClass('rsel');
    imceVar['activeRow'] = row;
    var file = imceFile(row);
    var div = document.createElement('div');
    var a = document.createElement('a');
    if (file.width) {
      var img = document.createElement('img');
      img.src = imceFileUrl(file.name);
      img.alt = imceVar['addText'];
      img.width = file.width;
      img.height = file.height;
      a.appendChild(img);
      if (imceVar['customCall']) {
        a.href = '#';
        a.onclick = function() {
          imceFinitor(file);
          return false;
        }
      }
    }
    else {
      a.innerHTML = imceVar['viewText'];
      a.href = imceFileUrl(file.name);
      a.onclick = function() {
        window.open(this.href);
        return false;
      }
    }

    div.appendChild(a);
    $('#imagepreview').append(div);

    if ($('#resizeform').length && file.width) {
      $('#resizeform').css('visibility', 'visible');
      $('#img_name').val(file.name);
    }

  }
}

function imceFinitor(file) {
  if (file && imceVar['customCall']) {
    file.url = imceFileUrl(file.name);
    imceVar['customCall'](file, window.self);
  }
}

function imceFile(row) {
  var wh = row.cells[2].innerHTML.split('x');
  return {
    name: row.cells[0].innerHTML,
    size: row.cells[1].innerHTML,
    width: parseInt(wh[0]),
    height: parseInt(wh[1])
  }
}

function imceFileRow(url) {
  if (url) {
    var row, rows = $('#bodytable').get(0).rows;
    for (var i = 0; row = rows[i]; i++) {
      if (url == imceFileUrl(row.cells[0].innerHTML)) {
        return row;
      }
    }
  }
  return null;
}

function imceFileHighlight(url, append) {
  imceHiglight(imceFileRow(url), append);
}

function imceFileUrl(filename) {
  return imceVar['fileUrl'] +'/'+ filename;
}

$(document).ready(imceStartBrowser);