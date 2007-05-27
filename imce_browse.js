// $Id$

//TODO: removed absolute url setting. implement it on php side.
//check opener.opener.hookImceFinish

//Variable container.
var imce = {};

/**
 * Initiate browsing.
 */
imce.initiate = function() {
  imce.opener = window.opener && window.opener != window.self ? window.opener : null;
  if (imce.opener) {
    if (typeof imce.opener[window.name+'ImceFinish'] == 'function') {//function for adding
      imce.hookFinish = imce.opener[window.name+'ImceFinish'];
      if(typeof imce.opener[window.name+'ImceUrl'] == 'string') {//url to be highlighted
        imce.hookUrl = imce.opener[window.name+'ImceUrl'];
      }
    }
  }
  if ($('#resizeform').length) {
    $('#resize-file-span').css('display', 'none');
    $('#resizeform').css('visibility', 'hidden');
    $('#resizeform').submit( function() { return $('#img_w').val()*1>=1 && $('#img_h').val()*1>=1 });
    $('#img_w').focus( function() {
      if ($('#img_h').val()) {
        var file = imce.file(imce.activeRow);
        this.value = Math.round(file.width/file.height*$('#img_h').val());
      }
    });
    $('#img_h').focus( function() {
      if ($('#img_w').val()) {
        var file = imce.file(imce.activeRow);
        this.value = Math.round(file.height/file.width*$('#img_w').val());
      }
    });
  }
  var activeUrl = imce.lastUrl ? imce.lastUrl : (imce.hookUrl && !$('#imagepreview').html() ? imce.hookUrl : null);
  var list = $('#bodytable').get(0).rows;
  if (list.length>0 && list[0].cells.length>1) {
    for (var i=0; row = list[i]; i++) {
      var file = imce.file(row);
      if (activeUrl == imce.fileUrl(file.name)) {
        imce.highlightRow(row, true);
      }
      row.onclick = function() {
        imce.highlightRow(this);
      }
      if (imce.hookFinish) {
        var a = document.createElement('a');
        a.innerHTML = imce.textAdd;
        a.href = '#';
        a.onclick = function() {
          imce.finitor(file);
          return false;
        }
        row.cells[4].appendChild(a);
      }
      if (imce.textConfirmDel) {
        row.cells[4].firstChild.onclick = function() {
          return confirm(imce.textConfirmDel);
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

/**
 * Highlight the specified row. Append the file preview to the preview area or show it alone.
 */
imce.highlightRow = function(row, append) {
  if (!row) {
    return;
  }
  
  if (imce.activeRow) {
    $(imce.activeRow).removeClass('rsel');
    if ($('#resizeform').length) {
      $('#resizeform').css('visibility', 'hidden');
      $('#img_name').val('');
    }
  }
  
  if (imce.activeRow == row) {
    imce.activeRow =null;
    $('#imagepreview div:last').remove();
  }
  else {
    $(row).addClass('rsel');
    imce.activeRow = row;
    var file = imce.file(row);
    var div = document.createElement('div');
    var a = document.createElement('a');
    if (file.width) {
      var img = document.createElement('img');
      img.src = imce.fileUrl(file.name);
      img.alt = imce.textAdd;
      img.width = file.width;
      img.height = file.height;
      a.appendChild(img);
      if (imce.hookFinish) {
        a.href = '#';
        a.onclick = function() {
          imce.finitor(file);
          return false;
        }
      }
    }
    else {
      a.innerHTML = imce.textView;
      a.href = imce.fileUrl(file.name);
      a.onclick = function() {
        window.open(this.href);
        return false;
      }
    }

    div.appendChild(a);
    if (append) {
      $('#imagepreview').append(div);
    }
    else {
      $('#imagepreview').empty().append(div);
    }

    if ($('#resizeform').length && file.width) {
      $('#resizeform').css('visibility', 'visible');
      $('#img_name').val(file.name);
    }

  }
}

/**
 * Finalize file selection.
 */
imce.finitor = function(file) {
  if (file && imce.hookFinish) {
    file.url = imce.fileUrl(file.name);
    imce.hookFinish(file, window.self);
  }
}

/**
 * Return the file in the row as an object.
 */
imce.file = function(row) {
  var wh = row.cells[2].innerHTML.split('x');
  return {
    name: row.cells[0].innerHTML,
    size: row.cells[1].innerHTML,
    width: parseInt(wh[0]),
    height: parseInt(wh[1])
  }
}

/**
 * Get the row of the file specified by the url.
 */
imce.fileRow = function(url) {
  if (url) {
    var row, rows = $('#bodytable').get(0).rows;
    var basename = path.substr(path.lastIndexOf('/')+1);
    for (var i = 0; row = rows[i]; i++) {
      if (basename == row.cells[0].innerHTML) {
        return row;
      }
    }
  }
  return null;
}

/**
 * Highlight the row of the file specified by the url.
 */
imce.fileHighlight = function(url, append) {
  imce.highlightRow(imce.fileRow(url), append);
}

/**
 * Return the url of the file
 */
imce.fileUrl = function(filename) {
  return imce.dirUrl +'/'+ filename;
}

//initiate
$(document).ready(imce.initiate);