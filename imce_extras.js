// $Id$
$(imceExtrasInit);

function imceExtrasInit() {
  imceVar['activeCol'] = parseInt(imceReadCookie('activecolumn')||0);
  imceVar['activeFilter'] = imceReadCookie('activefilter')||'all';
  imceVar['hiddenRows'] = [];
  // initiate filtering
  var list = $('#bodytable').get(0).rows;
  if (list.length>1) {
    var extensions = [];
    var tempext = [];
    var selectbox = imceVar['filterText'][0] +': <select onchange="imceFilter(this.value); this.blur();" id="filter-box">';
    var row, j = 0;
    extensions['all'] = imceVar['filterText'][1];
    extensions['image'] = imceVar['filterText'][2];
    extensions['nonimage'] = imceVar['filterText'][3];
    for (var i=0; row=list[i]; i++) {
      var ext = row.cells[0].innerHTML.substr(row.cells[0].innerHTML.lastIndexOf('.'));
      if (!extensions[ext]) {
        extensions[ext] = ext;
        tempext[j++] = ext;
      }
    }
    imceVar['activeFilter'] = extensions[imceVar['activeFilter']] ? imceVar['activeFilter'] : 'all';
    if (imceVar['activeRow'] && imceVar['activeFilter'] != 'all') {
      var actext = imceVar['activeRow'].cells[0].innerHTML.substr(imceVar['activeRow'].cells[0].innerHTML.lastIndexOf('.'));
      if (actext != imceVar['activeFilter']) {
        imceVar['activeFilter'] = parseInt(imceVar['activeRow'].cells[2].innerHTML.split('x')[0]) ? 'image' : 'nonimage';
      }
    }
    tempext.sort();
    tempext = (['all', 'image', 'nonimage']).concat(tempext);
    for (var i=0; ext=tempext[i]; i++) {
      selectbox += '<option value="'+ ext +'"'+ (ext==imceVar['activeFilter']?' selected="selected"':'') +'>'+ extensions[ext] +'</option>';
    }
    selectbox += '</select><span id="file-num"></span>';
    var filterspan = document.createElement('span');
    filterspan.setAttribute('id', 'filterspan');
    filterspan.innerHTML = selectbox;
    document.body.appendChild(filterspan);
    imceFilter(imceVar['activeFilter']);
  }
  //initiate sorting
  var header = $('#headertable tr').get(0);
  for (var i=0; i<header.cells.length-1; i++) {
    header.cells[i].innerHTML = '<a href="javascript:imceSortRows('+ i +')" id="sortlink'+i +'" class="sortheader">' + header.cells[i].innerHTML + '<span id="sortspan'+i +'" class="sortarrow"'+ (imceVar['activeCol'] == i ? ' sortdir="'+imceReadCookie('sortdir')+'"' : '') +'></span></a>';
  }
  imceSortRows(imceVar['activeCol']);  
  //initiate area resizing
  $('#resize-bar').css('cursor', 's-resize');
  $('#resize-bar-in').css('display', 'block');
  $('#resize-bar').mousedown( function (e) {
    function doDrag(e) {
      var hNew = Math.max(0, Math.min(hTotal, sOff + e.clientY + document.documentElement.scrollTop));
      $('#bodydiv').height(hNew + 'px');
      $('#imagepreview').height(hTotal-hNew + 'px');
      return false;
    }
    function endDrag(e) {
      $(document).unmousemove(doDrag).unmouseup(endDrag);
    }
    if (e.srcElement && e.srcElement.id == 'dirname') return;
    var hTotal = $('#bodydiv').height() + $('#imagepreview').height();
    var sOff = $('#bodydiv').height() - e.clientY + document.documentElement.scrollTop;
    $(document).mousemove(doDrag).mouseup(endDrag);
    return false;
  });
  $(window).resize( function() {//window onresize
    var Height = window.innerHeight ? window.innerHeight : (document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight);
    if (Height>120) {
      var ratio = $('#bodydiv').height()/($('#imagepreview').height()||1);
      var unit = (Height-100)/(ratio+1);
      $('#bodydiv').css('height', parseInt(unit*ratio) + 'px');
      $('#imagepreview').css('height', parseInt(unit) + 'px');
    }
  });
  //initiate other features
  document.onkeydown = imceShortCut;
}

//Sorting Functions
function imceSortRows(columnIndex) {
  var table = $('#bodytable').get(0);
  var list = table.rows;
  if (list.length<2) {
    return;
  }
  var lnk = $('#sortlink'+columnIndex);
  var span = $('#sortspan'+columnIndex).get(0);
  var oldColumn = imceVar['activeCol'];
  imceVar['activeCol'] = columnIndex;
  var sortFunc;
  switch (imceVar['activeCol']) {
    case 1: sortFunc = imceCompareSize; break;//size
    case 2: sortFunc = imceCompareNumeric; break;//dimensions
    case 3: sortFunc = imceCompareDate; break;//date
    default: sortFunc = imceCompareString;//filename
  }
  var row, newRows = [];
  for (var i=0; row=list[i]; i++) {
    newRows[i] = row;
  }
  newRows.sort(sortFunc);
  $('#sortspan'+oldColumn).html('');
  if (span.getAttribute("sortdir") == 'down') {
    newRows.reverse();
    span.innerHTML = '&uarr;';
    span.setAttribute('sortdir','up');
    imceCreateCookie('sortdir', 'down', 7);
  }
  else {
    span.innerHTML = '&darr;';
    span.setAttribute('sortdir','down');
    imceCreateCookie('sortdir', 'up', 7);
  }
  for (var i=0; row=newRows[i]; i++) {
    table.tBodies[0].appendChild(row);
  }
  $('#sortlink'+oldColumn).removeClass('sorted');
  lnk.addClass('sorted');
  imceCreateCookie('activecolumn', imceVar['activeCol'], 7);
}
function imceCompareNumeric(r1, r2) {
  var a = parseInt(r1.cells[imceVar['activeCol']].innerHTML);
  var b = parseInt(r2.cells[imceVar['activeCol']].innerHTML);
  return a-b;
}
function imceCompareDate(r1, r2) {
  var a = parseInt(r1.cells[imceVar['activeCol']].id);
  var b = parseInt(r2.cells[imceVar['activeCol']].id);
  return a-b;
}
function imceCompareSize(r1, r2) {
  var a = parseInt(r1.cells[imceVar['activeCol']].id);
  var b = parseInt(r2.cells[imceVar['activeCol']].id);
  return a-b;
}
function imceCompareString(r1, r2) {
  var a = r1.cells[imceVar['activeCol']].innerHTML.toLowerCase();
  var b = r2.cells[imceVar['activeCol']].innerHTML.toLowerCase();
  return a>b ? 1 : (a<b ? -1 : 0);
}

//filter files by type and extension
function imceFilter(filter) {
  var i, row, j=0;
  for(i=0; row=imceVar['hiddenRows'][i]; i++) {
    $('#bodytable').get(0).tBodies[0].appendChild(row);
    if (!imceVar['activeRow'] && i==imceVar['hiddenSel']) {
      imceVar['hiddenSel'] = null;
      imceHighlight(row);
    }
  }
  imceVar['hiddenRows'] = [];
  var list = $('#bodytable').get(0).rows;
  var len = list.length;
  if (filter=='image') {
    for(i=0; row=list[i]; i++) {
      if (!parseInt(row.cells[2].innerHTML.split('x')[0])) {
        imceVar['hiddenRows'][j++] = row;
      }
    }
  }
  else if (filter=='nonimage') {
    for(i=0; row=list[i]; i++) {
      parseInt(row.cells[2].innerHTML.split('x')[0]) ? imceVar['hiddenRows'][j++] = row : 0;
    }
  }
  else if (filter.substr(0, 1)=='.') {
    for(i=0; row=list[i]; i++) {
      filter!=row.cells[0].innerHTML.substr(row.cells[0].innerHTML.lastIndexOf('.')) ? imceVar['hiddenRows'][j++] = row : 0;
    }
  }
  for(i=0; row=imceVar['hiddenRows'][i]; i++) {
    if (imceVar['activeRow'] && imceVar['activeRow']==row) {
      imceVar['hiddenSel'] = i;
      imceHighlight(imceVar['activeRow']);
    }
    $('#bodytable').get(0).tBodies[0].removeChild(row);
  }
  imceVar['activeFilter'] = filter;
  imceCreateCookie('activefilter', imceVar['activeFilter'], 7);
  $('#file-num').html(' ('+(len-imceVar['hiddenRows'].length)+')');
  $('#bodytable').focus();
}

//Enable shurtcuts. Up-Down for browsing. Delete for deleting. Insert for adding.
function imceShortCut(e) {
  var e = e||window.event;
  var list = $('#bodytable').get(0).rows;
  if (!list.length) return;
  if (!imceVar['activeRow']) {//down arrow initiates browsing if there is no selected row.
    return e.keyCode==40 && list[0].cells.length>1 ? imceHighlight(list[0]) : 0;
  }
  var index = imceVar['activeRow'].rowIndex;
  switch (e.keyCode) {
    case 38://up
      index&&list[index-1] ? imceHighlight(list[index-1]) : 0;
      break;
    case 40://down
      list[index+1] ? imceHighlight(list[index+1]) : 0;
      break;
    case 45://insert(add)
      if (imceVar['targetWin']) {
        var info = imceInfo(imceVar['activeRow']);
        imceFinitor(imceVar['fileUrl'] + '/' + info['f'], info['w'], info['h'], info['s']);
        imceVar['activeRow'] = null;
      }
      break;
    case 46://delete
      if(imceVar['confirmDel'] && confirm(imceVar['confirmDel'])) {
        window.location.replace(imceVar['activeRow'].cells[4].firstChild.href);
        imceVar['activeRow'] = null;//block subsequent delete commands.
      }
      break;
  }
}

//quirksmode.org cookie functions
function imceCreateCookie(name, value, days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else {
    var expires = "";
  }
	document.cookie = name+"="+value+expires+"; path=/";
}
function imceReadCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') {
      c = c.substring(1,c.length);
    }
		if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length,c.length);
    }
	}
	return null;
}