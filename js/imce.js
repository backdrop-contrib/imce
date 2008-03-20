// $Id$

//Global container.
var imce = {'tree': {}, 'fileIndex': [], 'fileId': {}, 'selected': {}, 'conf': {}, 'ops': {}, 'vars': {'previewImages': 1, 'cache': 1}, 'cache': {}};

//initiate imce.
imce.initiate = function() {
  if (imce.conf.error != false) return;
  imce.FLW = imce.el('file-list-wrapper');
  imce.prepareMsgs();//process initial status messages
  imce.initiateTree();//build js tree
  imce.initiateList();//process file list
  imce.initiateOps();//prepare operation tabs
  imce.refreshOps();
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
    var branch = imce.tree[a.title] = {'a': a, 'li': this, 'ul': this.lastChild.tagName == 'UL' ? this.lastChild : null};
    if (a.href) imce.dirClickable(branch);
    imce.dirCollapsible(branch);
  });
};

//Add a dir to the tree under parent
imce.dirAdd = function(dir, parent, clickable) {
  if (imce.tree[dir]) return clickable ? imce.dirClickable(imce.tree[dir]) : imce.tree[dir];
  var parent = parent || imce.tree['.'];
  parent.ul = parent.ul ? parent.ul : parent.li.appendChild(document.createElement('ul'));
  var branch = imce.dirCreate(dir, unescape(dir.substr(dir.lastIndexOf('/')+1)), clickable);
  parent.ul.appendChild(branch.li);
  return branch;
};

//create list item for navigation tree
imce.dirCreate = function(dir, text, clickable) {
  if (imce.tree[dir]) return imce.tree[dir];
  var branch = imce.tree[dir] = {'li': document.createElement('li'), 'a': document.createElement('a')};
  $(branch.a).addClass('folder').text(text).attr('title', dir).appendTo(branch.li);
  imce.dirCollapsible(branch);
  return clickable ? imce.dirClickable(branch) : branch;
};

//change currently active directory
imce.dirActivate = function(dir) {
  if (dir != imce.conf.dir) {
    if (imce.tree[imce.conf.dir]){
      $(imce.tree[imce.conf.dir].a).removeClass('active');
    }
    $(imce.tree[dir].a).addClass('active');
    imce.conf.dir = dir;
  }
  return imce.tree[imce.conf.dir];
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
  $(document.createElement('span')).addClass('expander').html('&nbsp; &nbsp;').click(function() {
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

//update navigation tree after getting subdirectories.
imce.dirUpdate = function(dir, subdirs) {
  var branch = imce.tree[dir];
  if (subdirs && subdirs.length) {
    var prefix = dir == '.' ? '' : dir +'/';
    for (var i in subdirs) {//add subdirectories
      imce.dirAdd(prefix + subdirs[i], branch, true);
    }
    $(branch.li).removeClass('leaf').addClass('expanded');
    $(branch.ul).show();
  }
  else if (!branch.ul){//no subdirs->leaf
    $(branch.li).removeClass('expanded').addClass('leaf');
  }
};

/**************** FILES ********************/

//process file list
imce.initiateList = function(cached) {
  imce.fileIndex = [], imce.fileId = {}, imce.selected = {}, imce.vars.selcount = 0, imce.vars.lastfid = null;
  imce.tbody = imce.el('file-list').tBodies[0];
  var token = {'%dir': imce.conf.dir == '.' ? $(imce.tree['.'].a).text() : unescape(imce.conf.dir)};
  if (imce.tbody.rows.length) {
    for (var i=0; row = imce.tbody.rows[i]; i++) {
      var fid = row.id;
      imce.fileIndex[i] = imce.fileId[fid] = row;
      if (cached) {
        if (imce.hasC(row, 'selected')) {
          imce.selected[imce.vars.lastfid = fid] = row;
          imce.vars.selcount++;
        }
        continue;
      }
      $(row.cells[0]).text(unescape(fid));
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
    row.cells[0].innerHTML = unescape(row.id = file.name);
    $(row).click(function(e) {imce.fileClick(this, e.ctrlKey, e.shiftKey)});
  }
  row.cells[1].innerHTML = file.fsize; row.cells[1].id = file.size;
  row.cells[2].innerHTML = file.width;
  row.cells[3].innerHTML = file.height;
  row.cells[4].innerHTML = file.fdate; row.cells[4].id = file.date;
  if (imce.vars.prvfid == file.name) imce.setPreview(file.name);
};

//remove a file from the list
imce.fileRemove = function(fid) {
  if (!imce.fileId[fid]) return;
  imce.fileDeSelect(fid);
  imce.fileIndex.splice(imce.fileId[fid].rowIndex, 1);
  $(imce.fileId[fid]).remove();
  delete imce.fileId[fid];
  if (imce.vars.prvfid == fid) imce.setPreview();
};

//return a file object containing all properties.
imce.fileGet = function (fid) {
  if (!imce.fileId[fid]) return null;
  var row = imce.fileId[fid];
  var file = {'name': unescape(fid)};
  file.url = imce.getURL(fid);
  file.size = row.cells[1].innerHTML;
  file.bytes = row.cells[1].id * 1;
  file.width = row.cells[2].innerHTML * 1;
  file.height = row.cells[3].innerHTML * 1;
  file.date = row.cells[4].innerHTML;
  file.time = row.cells[4].id * 1;
  return file;
};

//simulate row click. selection-highlighting
imce.fileClick = function(row, ctrl, shft) {
  if (!row) return;
  var fid = typeof(row) == 'string' ? row : row.id;
  if (ctrl || fid == imce.vars.prvfid) {
    imce.fileToggleSelect(fid);
  }
  else if (shft) {
    var last = imce.lastFid();
    var start = last ? imce.fileId[last].rowIndex : -1;
    var end = imce.fileId[fid].rowIndex;
    var step = start > end ? -1 : 1;
    while (start != end) {
      start += step;
      imce.fileSelect(imce.fileIndex[start].id);
    }
  }
  else {
    for (var fname in imce.selected) {
      imce.fileDeSelect(fname);
    }
    imce.fileSelect(fid);
  }
  //set preview
  imce.setPreview(imce.vars.selcount == 1 ? imce.lastFid() : null);
};

//file select/deselect functions
imce.fileSelect = function (fid) {
  if (imce.selected[fid] || !imce.fileId[fid]) return;
  imce.selected[fid] = imce.fileId[imce.vars.lastfid=fid];
  $(imce.selected[fid]).addClass('selected');
  imce.vars.selcount++;
};
imce.fileDeSelect = function (fid) {
  if (!imce.selected[fid] || !imce.fileId[fid]) return;
  if (imce.vars.lastfid == fid) imce.vars.lastfid = null;
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
  imce.opKeys = {'k46': 'delete', 'k82': 'resize', 'k84': 'thumb', 'k85': 'upload'};//shortcuts. delete, R, T, U
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
  if (op.key) imce.opKeys['k'+ op.key] = name;
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
      $(imce.ops[imce.vars.op].div).slideUp();
      $(imce.ops[imce.vars.op].li).removeClass('active');
      if (imce.vars.op == name) {
        imce.vars.op = null;
        return false;
      }
    }
    $(imce.ops[name].div).slideDown();
    $(imce.ops[name].li).addClass('active');
    imce.vars.op = name;
  }
  if (imce.ops[name].func) imce.ops[name].func();
  return true;
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
  if (imce.vars.navbusy || (dir == imce.conf.dir && !confirm(Drupal.t('Do you want to refresh the current directory?')))) return;
  var cache = imce.vars.cache && dir != imce.conf.dir;
  var set = imce.navSet(dir, cache);
  if (cache && imce.cache[dir]) {//load from the cache
    set.success({'data': imce.cache[dir]});
    set.complete();
  }
  else $.ajax(set);//live load
};
//ajax navigation settings
imce.navSet = function (dir, cache) {
  $(imce.tree[dir].li).addClass('loading');
  imce.vars.navbusy = dir;
  return {'url': imce.ajaxURL('navigate', dir),
  'type': 'GET',
  'dataType': 'json',
  'success': function(response) {
    if (response.data && !response.data.error) {
      if (cache) imce.navCache();//cache the current dir
      imce.navUpdate(response.data, dir);
    }
    imce.processResponse(response);
  },
  'complete': function () {
    $(imce.tree[dir].li).removeClass('loading');
    imce.vars.navbusy = null;
  }
  };
};

//update directory using the given data
imce.navUpdate = function(data, dir) {
  var cached = data == imce.cache[dir];
  cached ? imce.navCache(dir) : (imce.FLW.innerHTML = data.files);
  imce.dirActivate(dir);
  imce.dirUpdate(dir, data.subdirectories);
  $.extend(imce.conf.perm, data.perm);
  imce.refreshOps();
  imce.setPreview();
  imce.initiateList(cached);
  if (imce.firstSort) cached ? imce.updateSortState(data.cid, data.dsc) : imce.firstSort();
};

//set get cache
imce.navCache = function (dir) {
  if (dir) {//content from the cache
    $(imce.el('cached-list-'+ dir)).attr('id', 'file-list').appendTo(imce.FLW);
  }
  else {//content to the cache
    imce.cache[imce.conf.dir] = {'size': imce.el('dir-size').innerHTML, 'cid': imce.vars.cid, 'dsc': imce.vars.dsc, 'perm': $.extend({}, imce.conf.perm)};
    imce.fileDeSelect(imce.vars.prvfid);
    $(imce.el('file-list')).attr('id', 'cached-list-'+ imce.conf.dir).appendTo(imce.el('forms-wrapper'));
  }
};

/**************** UPLOAD  ********************/
//validate upload form
imce.uploadValidate = function (data, form, options) {
  var path = data[0].value;
  if (!path) return false;
  if (imce.conf.extensions != '*') {
    var ext = path.substr(path.lastIndexOf('.') + 1);
    if ((' '+ imce.conf.extensions +' ').indexOf(' '+ ext.toLowerCase() +' ') == -1) {
      return imce.setMessage(Drupal.t('Only files with the following extensions are allowed: %files-allowed.', {'%files-allowed': imce.conf.extensions}), 'error');
    }
  }
  var sep = path.indexOf('/') == -1 ? '\\' : '/';
  imce.setMessage(Drupal.t('Uploading %filename...', {'%filename': path.substr(path.lastIndexOf(sep) + 1)}));
  options.url = imce.ajaxURL('upload');//make url contain current dir.
  imce.fopLoading('upload', true);
  return true;
};

//settings for upload
imce.uploadSettings = function () {
  return {'beforeSubmit': imce.uploadValidate, 'success': function (response) {imce.processResponse(Drupal.parseJson(response));}, 'complete': function () {imce.fopLoading('upload', false);}, 'resetForm': true};
};

/**************** FILE OPS  ********************/
//validate default ops(delete, thumb, resize)
imce.fopValidate = function(fop) {
  if (!imce.validateSelCount(1, imce.conf.filenum)) return false;
  switch (fop) {
    case 'delete':
      return confirm(Drupal.t('Delete selected files?'));
    case 'thumb':
      if (!$('input:checked', imce.ops['thumb'].div).size()) {
        return imce.setMessage(Drupal.t('Please select a thumbnail.'), 'error');
      }
      return imce.validateImage();
    case 'resize':
      var w = imce.el('edit-width').value, h = imce.el('edit-height').value;
      var maxDim = imce.conf.dimensions.split('x');
      var maxW = maxDim[0]*1, maxH = maxW ? maxDim[1]*1 : 0;
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
  return {'url': imce.ajaxURL(fop), 'type': 'POST', 'dataType': 'json', 'success': imce.processResponse, 'complete': function (response) {imce.fopLoading(fop, false);}, 'data': imce.vars.opform +'&filenames='+ imce.serialNames() +'&jsop='+ fop + (imce.ops[fop].div ? '&'+ $('input', imce.ops[fop].div).serialize() : '')};
};

//toggle loading state
imce.fopLoading = function(fop, state) {
  var el = imce.el('edit-'+ fop), func = state ? 'addClass' : 'removeClass'
  if (el) {
    $(el)[func]('loading').attr('disabled', state);
  }
  else {
    $(imce.ops[fop].li)[func]('loading');
    imce.ops[fop].disabled = state;
  }
};

/**************** PREVIEW & SEND TO  ********************/

//preview a file.
imce.setPreview = function (fid) {
  var row, html = '';
  imce.vars.prvfid = fid;
  if (fid && (row = imce.fileId[fid])) {
    var width = row.cells[2].innerHTML * 1;
    html = imce.vars.previewImages && width ? ('<img src="'+ imce.getURL(fid) +'" width="'+ width +'" height="'+ row.cells[3].innerHTML +'" alt="">') : unescape(fid);
    html = '<a href="#" onclick="imce.send(\''+ fid +'\'); return false;" title="'+ (imce.vars.prvtitle||'') +'">'+ html +'</a>';
  }
  imce.el('file-preview').innerHTML = html;
};

//default file send function. sends the file to the new window.
imce.send = function (fid) {
  if (fid) window.open(imce.getURL(fid));
};

//add an operation for an external application to which the files are send.
imce.setSendTo = function (title, func) {
  imce.send = function (fid) { if(fid) func(imce.fileGet(fid), window);};
  var opFunc = function () {
    if (imce.vars.selcount != 1) return alert(Drupal.t('Please select a single file.'));
    imce.send(imce.vars.prvfid);
  };
  imce.vars.prvtitle = title;
  return imce.opAdd({'title': title, 'func': opFunc});
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
      if (imce.vars.prvfid != fid) imce.fileClick(fid);//highlight
    }
    if (imce.fileIndex.length != cnt) {//if new files added
      $(imce.FLW).animate({'scrollTop': imce.FLW.scrollHeight});//scroll to bottom.
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
  return imce.fileId[fid].cells[2].innerHTML * 1;
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
imce.validateSelCount = function (Min, Max) {
  if (Min && imce.vars.selcount < Min) {
    return imce.setMessage(Min == 1 ? Drupal.t('Please select a file.') : Drupal.t('You must select at least %num files.', {'%num': Min}), 'error');
  }
  if (Max && Max < imce.vars.selcount) {
    return imce.setMessage(Drupal.t('You are not allowed to operate on more than %num files.', {'%num': Max}), 'error');
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
//el. by id
imce.el = function (id) {
  return document.getElementById(id);
};
//find the latest selected fid
imce.lastFid = function () {
  if (imce.vars.lastfid) return imce.vars.lastfid;
  for (var fid in imce.selected);
  return fid;
};
//create ajax url
imce.ajaxURL = function (op, dir) {
  return imce.conf.url + (imce.conf.clean ? '?' :'&') +'jsop='+ op +'&dir='+ (dir||imce.conf.dir);
};
//fast class check
imce.hasC = function (el, name) {
  return el.className && (' '+ el.className +' ').indexOf(' '+ name +' ') != -1;
};

//global ajax error function
imce.ajaxError = function (e, response, settings, thrown) {
  imce.setMessage(Drupal.ahahError(response, settings.url).replace('\n', '<br />'), 'error');
};

//initiate
$(document).ready(imce.initiate).ajaxError(imce.ajaxError);