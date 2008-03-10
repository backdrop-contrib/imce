// $Id$
//When imce url contains &app=appName|fileProperty1@correspondingFiledId1|fileProperty2@correspondingFiledId2...
//the specified fields are filled with the specified properties of the selected file.

var imceAppFields = {};

//executed when imce loads.
function imceOnLoad (win) {
  var data = location.href.substr(location.href.lastIndexOf('app=')+4).split('|');
  var appname = data.shift();
  for (var i in data) {
    var arr = data[i].split('@');
    imceAppFields[arr[0]] = arr[1];
  }
  //set send to
  imce.setSendTo(Drupal.t('Send to @app', {'@app': appname}), imceAppFinish);
  //highlight file
  if (imceAppFields['url']) {
    var filename = $('#'+ imceAppFields['url'], window.opener.document).val();
    filename = filename.substr(filename.lastIndexOf('/')+1);
    imce.fileClick(filename);
  }
}

//sendTo function
function imceAppFinish (file, win) {
  var doc = $(window.opener.document);
  for (var i in imceAppFields) {
    doc.find('#'+ imceAppFields[i]).val(file[i]);
  }
  if (imceAppFields['url']) {
    try{doc.find('#'+ imceAppFields['url']).blur().change().focus()}catch(e){};
  }
  win.close();
}
