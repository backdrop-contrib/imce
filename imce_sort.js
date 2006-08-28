// $Id$

/* SORTTABLE
  based on http://webfx.eae.net/dhtml/sortabletable/sortabletable.html
  added/removed some functionality.
*/

addLoadEvent(sortables_init);

var COL_INDEX = parseInt(readCookie('column')||0);

function sortables_init() {
  var header = $('headertable').rows[0];
  var sortable = 'bodytable';
  for (var i=0;i<header.cells.length-1;i++) {
    var sortdir = COL_INDEX == i ? ' sortdir="'+readCookie('sortdir')+'"' : '';
    header.cells[i].innerHTML = '<a href="javascript:ts_resortTable('+ i +', \''+ sortable +'\');" id="sortlink'+i +'" class="sortheader">' + ts_getInnerText(header.cells[i]) + '<span id="sortspan'+i +'" class="sortarrow"'+ sortdir +'></span></a>';
  }
  ts_resortTable(COL_INDEX, sortable);
}

function ts_resortTable(column, tid) {
  var table = $(tid);
  if (table.rows.length <= 1) return;
  var lnk = $('sortlink'+column);
  var span = $('sortspan'+column);
  var old_index = COL_INDEX;
  COL_INDEX = column;
  var sortfn;
  switch (column*1) {
    case 1: sortfn = ts_sort_size; break;//size
    case 2: sortfn = ts_sort_numeric; break;//dimensions
    case 3: sortfn = ts_sort_date; break;//date
    default: sortfn = ts_sort_caseinsensitive;
  }
  var newRows = new Array();
  for (var i=0;i<table.rows.length;i++) {
    newRows[i] = table.rows[i];
  }
  newRows.sort(sortfn);
  $('sortspan'+old_index).innerHTML = '';
  if (span.getAttribute("sortdir") == 'down') {
    newRows.reverse();
    span.innerHTML = '&uarr;';
    span.setAttribute('sortdir','up');
    createCookie('sortdir', 'down')
  }
  else {
    span.innerHTML = '&darr;';
    span.setAttribute('sortdir','down');
    createCookie('sortdir', 'up')
  }
  for (var i=0;i<newRows.length;i++) {
    table.tBodies[0].appendChild(newRows[i]);
  }
  removeClass($('sortlink'+old_index), 'error');
  addClass(lnk, 'error');
  createCookie('column', column);
}

function ts_sort_numeric(a,b) {
  aa = parseFloat(ts_getInnerText(a.cells[COL_INDEX]));
  if (isNaN(aa)) aa = 0;
  bb = parseFloat(ts_getInnerText(b.cells[COL_INDEX])); 
  if (isNaN(bb)) bb = 0;
  return aa-bb;
}

function ts_sort_date(a,b) {
  aa = parseInt(a.cells[COL_INDEX].getAttribute('timestamp'));
  if (isNaN(aa)) aa = 0;
  bb = parseInt(b.cells[COL_INDEX].getAttribute('timestamp')); 
  if (isNaN(bb)) bb = 0;
  return aa-bb;
}

function ts_sort_size(a,b) {
  aa = parseFloat(ts_getInnerText(a.cells[COL_INDEX]).split(' ')[0]);
  if (isNaN(aa)) aa = 0;
  bb = parseFloat(ts_getInnerText(b.cells[COL_INDEX]).split(' ')[0]); 
  if (isNaN(bb)) bb = 0;
  return aa-bb;
}

function ts_sort_caseinsensitive(a,b) {
  aa = ts_getInnerText(a.cells[COL_INDEX]).toLowerCase();
  bb = ts_getInnerText(b.cells[COL_INDEX]).toLowerCase();
  if (aa==bb) return 0;
  if (aa<bb) return -1;
  return 1;
}

function ts_getInnerText(el) {
  if (typeof el == "string") return el;
  if (typeof el == "undefined") { return el };
  if (el.innerText) return el.innerText;
  var str = "";
  var cs = el.childNodes;
  var l = cs.length;
  for (var i = 0; i < l; i++) {
    switch (cs[i].nodeType) {
      case 1: //ELEMENT_NODE
        str += ts_getInnerText(cs[i]);
        break;
      case 3:  //TEXT_NODE
        str += cs[i].nodeValue;
        break;
    }
  }
  return str;
}

//quirksmode.org cookie functions
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
