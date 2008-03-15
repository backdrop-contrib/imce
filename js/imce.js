// $Id$

//Global container.
var imce = {'jsTree': {}, 'fileIndex': [], 'fileId': {}, 'selected': {}, 'conf': {}, 'ops': {}, 'vars': {'previewImages': 1}};

//initiate imce.
imce.initiate = function() {
  if (imce.conf.error != false) return;
  imce.prepareMsgs();//process initial status messages
  imce.initiateTree();//build js tree
  imce.initiateList();//process file list
  imce.initiateOps();//prepare operation tabs
  imce.refreshOps();
  imce.initiateSorting();//sorting
  imce.initiateResizeBars();//activate resize-bars
  if (window['imceOnLoad']) {//run functions set by external applications.
    window['imceOnLoad'](window);
  }
};

/**************** DIRECTORIES ********************/

//process navigation tree
imce.initiateTree = function() {
  $('#navigation-tree li').each(function(i) {
    var a = this.firstChild;
    a.firstChild.data = unescape(a.firstChild.data);
    var branch = imce.jsTree[a.title] = {'a': a, 'li': this, 'ul': this.lastChild.tagName == 'UL' ? this.lastChild : null};
    if (a.href) imce.dirClickable(branch);
    imce.dirCollapsible(branch);
  });
};

//update navigation tree after getting subdirectories.
imce.updateTree = function() {
  var branch = imce.jsTree[imce.conf.dir];
  if (imce.conf.subdirectories.length) {
    var prefix = imce.conf.dir == '.' ? '' : imce.conf.dir +'/';
    for (var i in imce.conf.subdirectories) {//add subdirectories
      imce.dirAdd(prefix + imce.conf.subdirectories[i], branch, true);
    }
    $(branch.li).removeClass('leaf').addClass('expanded');
    $(branch.ul).show();
  }
  else if (!branch.ul){//no subdirs->leaf
    $(branch.li).removeClass('expanded').addClass('leaf');
  }
};

//Add a dir to the tree under parent
imce.dirAdd = function(dir, parent, clickable) {
  if (imce.jsTree[dir]) return clickable ? imce.dirClickable(imce.jsTree[dir]) : imce.jsTree[dir];
  var parent = parent || imce.jsTree['.'];
  parent.ul = parent.ul ? parent.ul : parent.li.appendChild(document.createElement('ul'));
  var branch = imce.dirCreate(dir, unescape(dir.substr(dir.lastIndexOf('/')+1)), clickable);
  parent.ul.appendChild(branch.li);
  return branch;
};

//create list item for navigation tree
imce.dirCreate = function(dir, text, clickable) {
  if (imce.jsTree[dir]) return imce.jsTree[dir];
  var branch = imce.jsTree[dir] = {'li': document.createElement('li'), 'a': document.createElement('a')};
  $(branch.a).addClass('folder').text(text).attr('title', dir).appendTo(branch.li);
  imce.dirCollapsible(branch);
  return clickable ? imce.dirClickable(branch) : branch;
};

//change currently active directory
imce.dirActivate = function(dir) {
  if (dir != imce.conf.dir) {
    if (imce.jsTree[imce.conf.dir]){
      $(imce.jsTree[imce.conf.dir].a).removeClass('active');
    }
    $(imce.jsTree[dir].a).addClass('active');
    imce.conf.dir = dir;
  }
  return imce.jsTree[imce.conf.dir];
};

//make a dir accessible
imce.dirClickable = function(branch) {
  if (branch.clkbl) return branch;
  $(branch.a).attr('href', '#').removeClass('disabled').click(function() {imce.navigate(this.title); return false;});
  branch.clkbl = true;
  return branch;
};

//sub-directories expand-collapse ability
imce.dirCollapsible = function (branch) {
  if (branch.clpsbl) return branch;
  $(document.createElement('span')).addClass('expander').html('&nbsp; &nbsp;').bind('click', branch.a.title, function(e) {
    var branch = imce.jsTree[e.data];
    if (branch.ul) {
      $(branch.ul).toggle();
      $(branch.li).toggleClass('expanded');
    }
    else if (branch.clkbl){
      $(branch.a).click();
    }
  }).prependTo(branch.li);
  branch.clpsbl = true;
  return branch;
};

/**************** FILES ********************/

//process file list
imce.initiateList = function() {
  imce.fileIndex = []; imce.fileId = {}; imce.selected = {}; imce.vars.selcount = 0;
  imce.tbody = imce.el('file-list').tBodies[0];
  var token = {'%dir': imce.conf.dir == '.' ? imce.jsTree['.'].a.firstChild.data : unescape(imce.conf.dir)};
  if (imce.tbody.rows.length) {
    for (var i=0; row = imce.tbody.rows[i]; i++) {
      var fid = imce.fid(row);
      $(row.cells[0]).text(unescape(fid));
      imce.fileIndex[i] = imce.fileId[fid] = row;
      $(row).click(function(e) {imce.fileClick(this, e.ctrlKey, e.shiftKey)});
    }
    imce.setMessage(Drupal.t('Directory %dir is loaded.', token));
  }
  else if (imce.conf.perm.browse) imce.setMessage(Drupal.t('Directory %dir is empty.', token), 'warning');
  else imce.setMessage(Drupal.t('File browsing is disabled in directory %dir.', token), 'error');
};

//add a file to the list. (having properties name,size,formatted size,width,height,date,formatted date)
imce.fileAdd = function(file) {
  var row, i = imce.fileIndex.length, attr = ['name', 'size', 'width', 'height', 'date'];
  if (!(row = imce.fileId[file.name])) {
    row = imce.fileIndex[i] = imce.fileId[file.name] = imce.tbody.insertRow(i);
    for (i in attr) row.insertCell(i).className = attr[i];
    row.cells[0].innerHTML = unescape(file.name); row.cells[0].id = file.name;
    $(row).click(function(e) {imce.fileClick(this, e.ctrlKey, e.shiftKey)});
  }
  row.cells[1].innerHTML = file.fsize; row.cells[1].id = file.size;
  row.cells[2].innerHTML = file.width;
  row.cells[3].innerHTML = file.height;
  row.cells[4].innerHTML = file.fdate; row.cells[4].id = file.date;
  if (imce.vars.prvid == file.name) imce.setPreview(file.name);
};

//remove a file from the list
imce.fileRemove = function(fid) {
  if (!imce.fileId[fid]) return;
  imce.fileDeSelect(fid);
  imce.fileIndex.splice(imce.fileId[fid].rowIndex, 1);
  $(imce.fileId[fid]).remove();
  delete imce.fileId[fid];
  if (imce.vars.prvid == fid) imce.setPreview();
};

//return a file object containing all properties.
imce.fileGet = function (fid) {
  if (!imce.fileId[fid]) return null;
  var row = imce.fileId[fid];
  var file = {'name': unescape(fid)};
  file.url = imce.getURL(fid);
  file.size = row.cells[1].innerHTML;
  file.bytes = parseInt(row.cells[1].id);
  file.width = parseInt(row.cells[2].innerHTML);
  file.height = parseInt(row.cells[3].innerHTML);
  file.date = row.cells[4].innerHTML;
  file.time = parseInt(row.cells[4].id);
  return file;
};

//simulate row click. selection-highlighting
imce.fileClick = function(row, ctrl, shft) {
  var fid = typeof(row) == 'string' ? row : imce.fid(row);
  if (ctrl) {
    imce.fileToggleSelect(fid);
  }
  else if (shft) {
    for (var last in imce.selected);
    var start = last ? imce.fileId[last].rowIndex : -1;
    var end = imce.fileId[fid].rowIndex;
    var step = start > end ? -1 : 1;
    while (start != end) {
      start += step;
      imce.fileSelect(imce.fid(imce.fileIndex[start]));
    }
  }
  else {
    var alone = imce.vars.selcount == 1 && imce.selected[fid] ? true : false;
    for (var fname in imce.selected) {
      imce.fileDeSelect(fname);
    }
    if (!alone) {
      imce.fileSelect(fid);
    }
  }
  //set preview
  fid = null;
  if (imce.vars.selcount == 1) for (fid in imce.selected);//get the first(only) fid
  imce.setPreview(fid);
};

//file select/deselect functions
imce.fileSelect = function (fid) {
  if (imce.selected[fid] || !imce.fileId[fid]) return;
  imce.selected[fid] = imce.fileId[fid];
  $(imce.selected[fid]).addClass('selected');
  imce.vars.selcount++;
};
imce.fileDeSelect = function (fid) {
  if (!imce.selected[fid] || !imce.fileId[fid]) return;
  $(imce.selected[fid]).removeClass('selected');
  delete imce.selected[fid];
  imce.vars.selcount--;
};
imce.fileToggleSelect = function (fid) {
  imce['file'+ (imce.selected[fid] ? 'De' : '') +'Select'](fid);
};

/**************** OPERATIONS ********************/

//process file operation form and create operation tabs.
imce.initiateOps = function() {
  $(imce.el('ops-wrapper')).prependTo(imce.el('imce-content'));//move to the top
  imce.setHtmlOps();//help
  imce.setUploadOp();//upload
  imce.setFileOps();//thumb, delete, resize
};

//process existing html ops.
imce.setHtmlOps = function () {
  $('#ops-list>li').each(function() {
    var name = this.id.substr(8);
    var O = imce.ops[name] = {};
    O.div = imce.el('op-content-'+ name);
    O.li = imce.el('op-item-'+ name);
    O.a = O.li.firstChild;
    O.title = O.a.innerHTML;
    $(O.a).click(function() {imce.opClick(name); return false;});
  });
};

//convert upload form to an op.
imce.setUploadOp = function () {
  var form = $(imce.el('imce-upload-form'));
  form.find('fieldset').each(function() {//clean up fieldsets
    this.removeChild(this.firstChild);
    $(this).after(this.childNodes);
  }).remove();
  form.ajaxForm(imce.uploadSettings());//set ajax
  imce.opAdd({'name': 'upload', 'title': Drupal.t('Upload'), 'content': form});//add op
};

//convert fileop form submit buttons to ops.
imce.setFileOps = function () {
  $(imce.el('edit-filenames-wrapper')).remove();
  $('#imce-fileop-form fieldset').each(function() {//remove fieldsets
    var sbmt = $('input:submit', this);
    var Op = {'name': sbmt.attr('id').substr(5)};
    var func = function() {imce.fopSubmit(Op.name); return false;};
    sbmt.click(func);
    Op.title = this.firstChild.innerHTML;
    this.removeChild(this.firstChild);
    Op.name == 'delete' ? (Op.func = func) : (Op.content = this.childNodes);
    imce.opAdd(Op);
  }).remove();
  imce.vars.opform = $(imce.el('imce-fileop-form')).serialize();//serialize remaining parts.
};

//refresh ops states. enable/disable
imce.refreshOps = function() {
  for (var p in imce.conf.perm) {
    if (imce.conf.perm[p]) imce.opEnable(p);
    else imce.opDisable(p);
  }
};

//add a new file operation
imce.opAdd = function (op) {
  var name = op.name || ('op-'+ $('#ops-list>li').size());
  var O = imce.ops[name] = {'title': op.title||'Untitled'};
  if (op.content) {
    O.div = document.createElement('div');
    $(O.div).attr('id', 'op-content-'+ name).addClass('op-content').append(op.content).appendTo(imce.el('op-contents'));
  }
  O.a = document.createElement('a');
  O.li = document.createElement('li');
  $(O.a).attr({'href': '#', 'name': name}).html(op.title).click(function() {imce.opClick(this.name); return false;});
  $(O.li).attr('id', 'op-item-'+ op.name).append(O.a).appendTo(imce.el('ops-list'));
  O.func = op.func || null;
  return O;
};

//perform op click
imce.opClick = function(name) {
  if (!imce.ops[name] || imce.ops[name].disabled) {
    return imce.setMessage(Drupal.t('You can\'t perform this operation.'), 'error');
  }
  if (imce.ops[name].div) {
    if (imce.vars.op) {
      $(imce.ops[imce.vars.op].div).slideUp('normal');
      $(imce.ops[imce.vars.op].li).removeClass('active');
      if (imce.vars.op == name) {
        imce.vars.op = null;
        return false;
      }
    }
    $(imce.ops[name].div).slideDown('normal');
    $(imce.ops[name].li).addClass('active');
    imce.vars.op = name;
  }
  if (imce.ops[name].func) imce.ops[name].func();
};

//enable a file operation
imce.opEnable = function(name) {
  if (imce.ops[name] && imce.ops[name].disabled) {
    imce.ops[name].disabled = false;
    $(imce.ops[name].li).show();
  }
};

//disable a file operation
imce.opDisable = function(name) {
  if (imce.ops[name] && !imce.ops[name].disabled) {
    imce.ops[name].disabled = true;
    $(imce.ops[name].li).hide();
    if (imce.vars.op == name) {
      imce.vars.op = null;
      $(imce.ops[name].div).hide();
      $(imce.ops[name].li).removeClass('active');
    }
  }
};

/**************** AJAX OPERATIONS  ********************/

//navigate to dir
imce.navigate = function(dir) {
  if (!imce.vars.nownav && (dir != imce.conf.dir || confirm(Drupal.t('Do you want to refresh the current directory?')))) {
    $.ajax(imce.navSet(dir));
  }
};
//ajax navigation settings
imce.navSet = function (dir) {
  $(imce.jsTree[dir].li).addClass('loading');
  imce.vars.nownav = dir;
  return {'url': imce.conf.url + (imce.conf.clean ? '?' :'&') +'jsop=navigate&dir='+ dir,
  'type': 'GET',
  'dataType': 'json',
  'success': function(response) {
    if (response.data && !response.data.error) {
      imce.dirActivate(dir);
      imce.conf = response.data;
      $(imce.el('file-list-wrapper')).html(imce.conf.files);
      imce.initiateList();
      imce.updateTree();
      imce.updateStat();
      imce.refreshOps();
      imce.setPreview();
      if (imce.vars.cid != 0 || imce.vars.dsc) {
        imce.columnSort(imce.vars.cid, imce.vars.dsc);
      }
    }
    if (response.messages) {
      imce.resMsgs(response.messages);
    }
  },
  'complete': function () {
    $(imce.jsTree[dir].li).removeClass('loading');
    imce.vars.nownav = null;
  }
  };
};

/**************** UPLOAD  ********************/
//validate upload form
imce.uploadValidate = function (data, form) {
  var path = data[0].value;
  if (!path) return false;
  if (imce.conf.extensions != '*') {
    var ext = path.substr(path.lastIndexOf('.') + 1);
    if ((' '+ imce.conf.extensions +' ').indexOf(' '+ ext +' ') == -1) {
      return imce.setMessage(Drupal.t('Only files with the following extensions are allowed: %files-allowed.', {'%files-allowed': imce.conf.extensions}), 'error');
    }
  }
  var sep = path.indexOf('/') == -1 ? '\\' : '/';
  imce.setMessage(Drupal.t('Uploading %filename...', {'%filename': path.substr(path.lastIndexOf(sep) + 1)}));
  imce.fopLoading('upload', true);
  return true;
};

//settings for upload
imce.uploadSettings = function () {
  return {'url': imce.conf.url +'&jsop=upload', 'beforeSubmit': imce.uploadValidate, 'success': function (response) {imce.processResponse(Drupal.parseJson(response));}, 'complete': function () {imce.fopLoading('upload', false);}, 'resetForm': true};
};

/**************** FILE OPS  ********************/
//validate default ops(delete, thumb, resize)
imce.fopValidate = function(fop) {
  if (!imce.validateCount()) return false;
  switch (fop) {
    case 'thumb':
      if (!$('#op-content-thumb input:checked').size()) {
        return imce.setMessage(Drupal.t('Please select a thumbnail.'), 'error');
      }
      return imce.validateImage();
    case 'delete':
      return confirm(Drupal.t('Delete selected files?'));
    case 'resize':
      var w = imce.el('edit-width').value, h = imce.el('edit-height').value;
      var maxDim = imce.conf.dimensions.split('x');
      var maxW = parseInt(maxDim[0]), maxH = maxW ? parseInt(maxDim[1]) : 0;
      if (w.search(/^[1-9][0-9]*$/) == -1 || h.search(/^[1-9][0-9]*$/) == -1 || (maxW && (maxW < w*1 || maxH < h*1))) {
        return imce.setMessage(Drupal.t('Please specify dimensions within the allowed range that is from 1x1 to @dimensions.', {'@dimensions': maxW ? imce.conf.dimensions : Drupal.t('unlimited')}), 'error');
      }
      return imce.validateImage();
  }
  return true;
};

//submit wrapper for default ops
imce.fopSubmit = function(fop) {
  switch (fop) {
    case 'thumb': case 'delete': case 'resize':  return imce.commonSubmit(fop);
  }
  var func = fop +'OpSubmit';
  if (imce[func]) imce[func]();
};

//common submit function shared by default ops
imce.commonSubmit = function(fop) {
  if (!imce.fopValidate(fop)) return false;
  imce.fopLoading(fop, true);
  $.ajax(imce.fopSettings(fop));
};

//settings for default file operations
imce.fopSettings = function (fop) {
  var settings = {'url': imce.conf.url, 'type': 'POST', 'dataType': 'json', 'success': imce.processResponse, 'complete': function (response) {imce.fopComplete(response, fop);}, 'data': imce.vars.opform +'&filenames='+ imce.serialNames() +'&jsop='+ fop};
  if (imce.el('op-content-'+ fop)) {
    settings.data += '&'+ $('#op-content-'+ fop +' input').serialize();
  }
  return settings;
};

//toggle loading state
imce.fopLoading = function(fop, state) {
  var el = imce.el('edit-'+ fop), func = state ? 'addClass' : 'removeClass'
  if (el) {
    $(el)[func]('loading').attr('disabled', state);
  }
  else {
    $(imce.el('op-item-'+ fop))[func]('loading');
    imce.ops[fop].disabled = state;
  }
};

//complete file operation
imce.fopComplete = function (response, fop) {
  imce.fopLoading(fop, false);
};

/**************** SORTING ********************/

//prepare column sorting
imce.initiateSorting = function() {
  imce.vars.cid = imce.cookie('icid')*1;
  imce.vars.dsc = imce.cookie('idsc')*1;
  imce.cols = imce.el('file-header').rows[0].cells;
  if (imce.vars.cid || imce.vars.dsc) {
    imce.columnSort(imce.vars.cid, imce.vars.dsc);
  }
  else {
    $(imce.cols[0]).addClass('asc');
  }
  $(imce.cols).click(function () {imce.columnSort(this.cellIndex, !this.dsc);});
  $(window).unload(function() {imce.cookie('icid', imce.vars.cid); imce.cookie('idsc', imce.vars.dsc ? 1 : 0);});
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
    imce.fileIndex.sort(function(r1, r2) {
      return imce[func](r1.cells[cid][prop], r2.cells[cid][prop]);
    });
  }
  //insert sorted rows
  var row;
  for (var i=0; row = imce.fileIndex[i]; i++) {
    imce.tbody.appendChild(row);
  }
  $(imce.cols[imce.vars.cid]).removeClass(imce.vars.dsc ? 'desc' : 'asc');
  $(imce.cols[cid]).addClass(dsc ? 'desc' : 'asc');
  imce.vars.cid = cid;
  imce.vars.dsc = imce.cols[cid].dsc = dsc;
};

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
    var Max = area2 ? (start + $(imce.el(area2))[O.func]()) : $(document)[O.func]();
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
  var el = $(imce.el('file-list-wrapper')), h = el.height() + end - start;
  el.height(h < 1 ? 1 : h);
};

//set heights of browse and log-prv areas.
imce.resizeRows = function(start, end, Max) {
  var el1 = $(imce.el('browse-wrapper')), h = h1 = el1.height();
  var el2 = $(imce.el('log-prv-wrapper')), h2 = el2.height();
  var diff = end - start, r1 = h1 / (h1 + h2), d1 = Math.round(diff * r1);
  h1 = Math.max(h+d1, 50);
  h2 += diff - (h1-h);
  el1.height(h1);
  el2.height(h2);
  imce.resizeList(h, h1);
};

//get area dimensions of the last session from the cookie
imce.recallDimensions = function() {
  var h1 = imce.cookie('ih1')*1, h2 = imce.cookie('ih2')*1, w1 = imce.cookie('iw1')*1, w2 = imce.cookie('iw2')*1;
  if (h1) {
    var el = $(imce.el('browse-wrapper')), h0 = el.height();
    el.height(h1);
    imce.resizeList(h0, h1);
  }
  if (h2) $(imce.el('log-prv-wrapper')).height(h2);
  if (w1) $(imce.el('navigation-wrapper')).width(Math.min(w1, 99) +'%');
  if (w2) $(imce.el('log-wrapper')).width(Math.min(w2, 99) +'%');
  $(window).unload(function() {
    imce.cookie('ih1', $(imce.el('browse-wrapper')).height());
    imce.cookie('ih2', $(imce.el('log-prv-wrapper')).height());
    var el1 = imce.el('navigation-wrapper'), el2 = imce.el('log-wrapper');
    imce.cookie('iw1', Math.max(Math.round($(el1).width() * 100 / $(el1.parentNode).width()), 1));
    imce.cookie('iw2', Math.max(Math.round($(el2).width() * 100 / $(el2.parentNode).width()), 1));
  });
}

/**************** PREVIEW & EXTERNAL APP  ********************/

//preview a file.
imce.setPreview = function (fid) {
  var row, html = '';
  imce.vars.prvid = fid;
  if (fid && (row = imce.fileId[fid])) {
    var width = parseInt(row.cells[2].innerHTML);
    html = imce.vars.previewImages && width ? ('<img src="'+ imce.getURL(fid) +'" width="'+ width +'" height="'+ row.cells[3].innerHTML +'" alt="">') : unescape(fid);
    html = '<a href="#" onclick="imce.send(\''+ fid +'\'); return false;" title="'+ (imce.vars.prvtitle||'') +'">'+ html +'</a>';
  }
  imce.el('file-preview').innerHTML = html;
};

//default file send function. sends the file to the new window.
imce.send = function (fid) {
  window.open(imce.getURL(fid));
};

//add an operation for an external application to which the files are send.
imce.setSendTo = function (title, func) {
  imce.send = function (fid) {func(imce.fileGet(fid), window);};
  var newfunc = function () {
    if (imce.vars.selcount != 1) return alert(Drupal.t('Please select a single file.'));
    imce.send(imce.vars.prvid);
  }
  imce.vars.prvtitle = title;
  return imce.opAdd({'title': title, 'func': newfunc});
};

/**************** LOG MESSAGES  ********************/

//move initial page messages into log
imce.prepareMsgs = function () {
  var msgs;
  if (msgs = imce.el('imce-messages')) {
    $('>div', msgs).each(function (){
      var type = this.className.split(' ')[1];
      var li = $('>ul li', this);
      if (li.size()) li.each(function () {imce.setMessage(this.innerHTML, type);});
      else imce.setMessage(this.innerHTML, type);
    });
    $(msgs).remove();
  }
  //log clearer
  $(imce.el('log-clearer')).css('display', 'inline').click(function() {$(imce.el('log-wrapper')).empty();return false;});
};

//insert log message
imce.setMessage = function (msg, type) {
  var logs = imce.el('log-wrapper');
  var type = type || 'status';
  var msg = '<span class="time">'+ imce.logTime() +'</span> ' + msg;
  $(logs).append($(document.createElement('div')).addClass(type).html(msg)).animate({'scrollTop': logs.scrollHeight}, 'slow');
  return false;
};

//return time in HH:MM:SS format for log
imce.logTime = function () {
  var time = new Date();
  var arr = ['Hours', 'Minutes', 'Seconds'];
  for (var i in arr) {
    var part = time['get'+ arr[i]]();
    arr[i] = (part < 10 ? '0' : '') + part;
  }
  return arr.join(':');
};

/**************** OTHER HELPER FUNCTIONS  ********************/
//process response
imce.processResponse = function (response) {
  if (response.data) imce.resData(response.data);
  if (response.messages) imce.resMsgs(response.messages);
};
//process response data
imce.resData = function (data) {
  if (data.added) {
    var cnt = imce.fileIndex.length;
    for (var i in data.added) {//add new files or update existing
      imce.fileAdd(data.added[i]);
    }
    if (data.added.length == 1) {//if it is a single file operation
      var fid = data.added[0].name;
      if (imce.vars.prvid != fid) imce.fileClick(fid);//highlight
    }
    if (imce.fileIndex.length != cnt) {//if new files added
      var flw = imce.el('file-list-wrapper');
      $(flw).animate({'scrollTop': flw.scrollHeight});//scroll to bottom.
    }
  }
  if (data.removed) for (var i in data.removed) {
    imce.fileRemove(data.removed[i]);
  }
  imce.conf.dirsize = data.dirsize;
  imce.updateStat();
};
//set response messages
imce.resMsgs = function (msgs) {
  for (var type in msgs) for (var i in msgs[type]) {
    imce.setMessage(msgs[type][i], type);
  }
};
//check if the file is an image
imce.isImage = function (fid) {
  return parseInt(imce.fileId[fid].cells[2].innerHTML);
};
//find the first non-image in the selection
imce.getNonImage = function (selected) {
  for (var fid in selected) {
    if (!imce.isImage(fid)) return fid;
  }
  return false;
};
//validate current selection for images
imce.validateImage = function () {
  var nonImg = imce.getNonImage(imce.selected);
  return nonImg ? imce.setMessage(Drupal.t('%filename is not an image.', {'%filename': nonImg}), 'error') : true;
};
//validate number of selected files
imce.validateCount = function () {
  if (!imce.vars.selcount) {
    return imce.setMessage(Drupal.t('Please select a file.'), 'error');
  }
  if (imce.conf.filenum && imce.vars.selcount > imce.conf.filenum) {
    return imce.setMessage(Drupal.t('You are not allowed to operate on more than %num files.', {'%num': imce.conf.filenum}), 'error');
  }
  return true;
};
//update file count and dir size
imce.updateStat = function () {
  imce.el('file-count').innerHTML = imce.fileIndex.length;
  imce.el('dir-size').innerHTML = imce.conf.dirsize;
};
//serialize selected files. return fids with a colon between them
imce.serialNames = function () {
  var str = '';
  for (var fid in imce.selected) {
    str += ':'+ fid;
  }
  return str.substr(1);
};
//get file url
imce.getURL = function (fid) {
  var path = (imce.conf.dir == '.' ? '' : imce.conf.dir +'/') + fid;
  return imce.conf.furl +'/'+ (imce.conf.clean && imce.conf.prvt ? imce.rwURL(path) : path);
};
//re-encode & and # for mod rewrite
imce.rwURL = function (url) {
  return url.replace(/%(23|26)/g, '%25$1');
};
//get fid from the row
imce.fid = function (row) {
  return row.cells ? row.cells[0].id : null;
};
//el. by id
imce.el = function (id) {
  return document.getElementById(id);
};
//cookie get & set
imce.cookie = function (name, value) {
  if (typeof(value) == 'undefined') {//get
    return unescape((document.cookie.match(new RegExp('(^|;) *'+ name +'=([^;]*)(;|$)')) || ['', '', ''])[2]);
  }
  document.cookie = name +'='+ escape(value) +'; expires='+ (new Date(new Date()*1 + 30*86400000)).toGMTString() +'; path=/';//set
};
//sorters
imce.sortStrAsc = function(a, b) {return a.toLowerCase() < b.toLowerCase() ? -1 : 1;};
imce.sortStrDsc = function(a, b) {return b.toLowerCase() < a.toLowerCase() ? -1 : 1;};
imce.sortNumAsc = function(a, b) {return a-b;};
imce.sortNumDsc = function(a, b) {return b-a};

//global ajax error function
imce.ajaxError = function (e, response, settings, thrown) {
  imce.setMessage(Drupal.ahahError(response, settings.url).replace('\n', '<br />'), 'error');
};

//initiate
$(document).ready(imce.initiate).ajaxError(imce.ajaxError);