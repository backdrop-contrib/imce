// $Id$

var oldOnLoad = imceOnLoad || function(){};
var imceOnLoad = function (win) {
  oldOnLoad(win);
  imce.LPW = imce.el('log-prv-wrapper'), imce.BW = imce.el('browse-wrapper'), imce.NW = imce.el('navigation-wrapper'), imce.LW = imce.el('log-wrapper');
  imce.initiateSorting();//sorting
  imce.initiateResizeBars();//activate resize-bars
  $(imce.NW).attr('tabindex', '0').keydown(imce.dirShortCut);//shortcuts
  $(imce.FLW).attr('tabindex', '0').keydown(imce.fileShortCut);//shortcuts
  $(imce.tree[imce.conf.dir].a).focus();
};

/**************** SHORTCUTS ********************/

//shortcuts for directories
imce.dirShortCut = function (e) {
  switch (e.keyCode) {
    case 40://down
      var B = imce.tree[imce.conf.dir], L = B.li, U = B.ul;
      if (U && imce.hasC(L, 'expanded')) $(U.firstChild.childNodes[1]).click().focus();
      else do {if (L.nextSibling) return $(L.nextSibling.childNodes[1]).click().focus();
      }while ((L = L.parentNode.parentNode).tagName == 'LI');
      break;
    case 38://up
      var B = imce.tree[imce.conf.dir];
      if (L = B.li.previousSibling) {
        while (imce.hasC(L, 'expanded')) L = L.lastChild.lastChild;
        $(L.childNodes[1]).click().focus();
      }
      else if ((L = B.li.parentNode.parentNode) && L.tagName == 'LI') $(L.childNodes[1]).click().focus();
      break;
    case 37:case 39://left-right
      var L, B = imce.tree[imce.conf.dir], right = e.keyCode == 39;
      if (B.ul && (right ^ imce.hasC(L = B.li, 'expanded')) ) $(L.firstChild).click();
      else if (right) $(imce.FLW).focus();
      break;
    case 35:case 36://end-home
      var L = imce.tree['.'].li;
      if (e.keyCode == 35) while (imce.hasC(L, 'expanded')) L = L.lastChild.lastChild;
      $(L.childNodes[1]).click().focus();
  }
};

//shortcuts for files
imce.fileShortCut = function (e) {
  switch (e.keyCode) {
    case 38:case 40://up-down
      var fid = imce.lastFid(), i = fid ? imce.fileId[fid].rowIndex+e.keyCode-39 : 0;
      imce.fileClick(imce.fileIndex[i], e.ctrlKey, e.shiftKey);
      return;
    case 35:case 36://end-home
      imce.fileClick(imce.fileIndex[e.keyCode == 35 ? imce.fileIndex.length-1 : 0], e.ctrlKey, e.shiftKey); return;
    case 13:case 45://enter-insert
      imce.send(imce.vars.prvfid); return false;
    case 37://left
      $(imce.tree[imce.conf.dir].a).focus(); return;
  }
  //shotcuts for operations
  var op = imce.opKeys['k'+ e.keyCode], O = op ? imce.ops[op] : 0;
  if (op && !O.disabled && (imce.vars.op == op || (imce.opClick(op) && O.div))) $('input:first', O.div).focus();
};

/**************** SORTING ********************/

//prepare column sorting
imce.initiateSorting = function() {
  imce.cols = imce.el('file-header').rows[0].cells;
  imce.vars.cid = imce.cookie('icid')*1;
  imce.vars.dsc = imce.cookie('idsc')*1;
  $(imce.cols).click(function () {imce.columnSort(this.cellIndex, imce.hasC(this, 'asc'));});
  $(window).unload(function() {imce.cookie('icid', imce.vars.cid); imce.cookie('idsc', imce.vars.dsc ? 1 : 0);});
  imce.firstSort();
};

//sort the list for the first time
imce.firstSort = function() {
  imce.vars.cid || imce.vars.dsc ? imce.columnSort(imce.vars.cid, imce.vars.dsc) : $(imce.cols[0]).addClass('asc');
};

//sort file list according to column index.
imce.columnSort = function(cid, dsc) {
  if (imce.fileIndex.length < 2) return;
  if (cid == imce.vars.cid && dsc != imce.vars.dsc) {
    imce.fileIndex.reverse();
  }
  else {
    var func = 'sort'+ (cid == 0 ? 'Str' : 'Num') + (dsc ? 'Dsc' : 'Asc');
    var prop = cid == 2 || cid == 3 ? 'innerHTML' : 'id';
    //sort rows
    imce.fileIndex.sort(cid ? function(r1, r2) {return imce[func](r1.cells[cid][prop], r2.cells[cid][prop])} : function(r1, r2) {return imce[func](r1.id, r2.id)});
  }
  //insert sorted rows
  var row;
  for (var i=0; row = imce.fileIndex[i]; i++) {
    imce.tbody.appendChild(row);
  }
  imce.updateSortState(cid, dsc);
};

//update column states
imce.updateSortState = function(cid, dsc) {
  $(imce.cols[imce.vars.cid]).removeClass(imce.vars.dsc ? 'desc' : 'asc');
  $(imce.cols[cid]).addClass(dsc ? 'desc' : 'asc');
  imce.vars.cid = cid;
  imce.vars.dsc = dsc;
};

//sorters
imce.sortStrAsc = function(a, b) {return a.substr(0, 1).toLowerCase() < b.substr(0, 1).toLowerCase() ? -1 : b < a;};
imce.sortStrDsc = function(a, b) {return b.substr(0, 1).toLowerCase() < a.substr(0, 1).toLowerCase() ? -1 : a < b;};
imce.sortNumAsc = function(a, b) {return a-b;};
imce.sortNumDsc = function(a, b) {return b-a};

/**************** RESIZE-BARS  ********************/

//set resizers for resizable areas and recall previous dimensions
imce.initiateResizeBars = function () {
  imce.setResizer('navigation-resizer', 'X', 'navigation-wrapper', null, 1);
  imce.setResizer('log-resizer', 'X', 'log-wrapper', null, 1);
  imce.setResizer('browse-resizer', 'Y', 'browse-wrapper', 'log-prv-wrapper', 50, imce.resizeList);
  imce.setResizer('content-resizer', 'Y', 'resizable-content', null, 150, imce.resizeRows);
  imce.recallDimensions();
};

//set a resize bar
imce.setResizer = function (resizer, axis, area1, area2, Min, endF) {
  var O = axis == 'X' ? {'pos': 'pageX', 'func': 'width'} : {'pos': 'pageY', 'func': 'height'};
  var Min = Min || 0;
  $(imce.el(resizer)).mousedown(function(e) {
    var pos = e[O.pos];
    var end = start = $(imce.el(area1))[O.func]();
    var Max = area2 ? (start + $(imce.el(area2))[O.func]()) : 1200;
    $(document).mousemove(doDrag).mouseup(endDrag);
    function doDrag(e) {
      end = Math.min(Max - Min, Math.max(start + e[O.pos] - pos, Min));
      $(imce.el(area1))[O.func](end);
      if (area2) $(imce.el(area2))[O.func](Max - end);
      return false;
    }
    function endDrag(e) {
      $(document).unbind("mousemove", doDrag).unbind("mouseup", endDrag);
      if (endF) endF(start, end, Max);
    }
  });
};

//set height file-list area
imce.resizeList = function(start, end, Max) {
  var el = $(imce.FLW), h = el.height() + end - start;
  el.height(h < 1 ? 1 : h);
};

//set heights of browse and log-prv areas.
imce.resizeRows = function(start, end, Max) {
  var el = $(imce.BW), h = el.height();
  var diff = end - start, r = h / start, d = Math.round(diff * r), h1 = Math.max(h + d, 50);
  el.height(h1);
  $(imce.LPW).height(end - h1 - $(imce.el('browse-resizer')).height() - 1);
  imce.resizeList(h, h1);
};

//get area dimensions of the last session from the cookie
imce.recallDimensions = function() {
  $(window).unload(function() {
    imce.cookie('ih1', $(imce.BW).height());
    imce.cookie('ih2', $(imce.LPW).height());
    imce.cookie('iw1', Math.max($(imce.NW).width(), 1));
    imce.cookie('iw2', Math.max($(imce.LW).width(), 1));
  });
  if (h1 = imce.cookie('ih1')*1) {
    var h2 = imce.cookie('ih2')*1, w1 = imce.cookie('iw1')*1, w2 = imce.cookie('iw2')*1;
    var el = $(imce.BW), h = el.height(), w = el.width();
    $(imce.NW).width(Math.min(w1, w-5));
    $(imce.LW).width(Math.min(w2, w-5));
    el.height(h1);
    imce.resizeList(h, h1);
    $(imce.LPW).height(h2);
  }
};

//cookie get & set
imce.cookie = function (name, value) {
  if (typeof(value) == 'undefined') {//get
    return unescape((document.cookie.match(new RegExp('(^|;) *'+ name +'=([^;]*)(;|$)')) || ['', '', ''])[2]);
  }
  document.cookie = name +'='+ escape(value) +'; expires='+ (new Date(new Date()*1 + 30*86400000)).toGMTString() +'; path=/';//set
};