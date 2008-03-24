// $Id$

IMCE is an image/file uploader and browser that supports personal directories and quota.
IMCE can easily be integrated into any WYSIWYG editor or any web application that needs a file browser.
See INTEGRATION METHODS for more information.

~~~~~~~~~~~FEATURES~~~~~~~~~~~

 -Basic file operations: upload, delete
- Image(jpg, png, gif) operations: resize, create thumbnails, preview
- Support for private downloads.
- Configurable limits for user roles: file size per upload, total directory size(quota), file extensions, and image dimensions.
- Personal or shared folders for users.
- User-friendly interface: directory and file listing, file sorting(by name, size, dimensions, date), selecting, preview, keyboard shortcuts(up, down, insert(or enter), delete).
- Built-in support for inline image/file insertion into textareas.
New in 6.x:
- Improved UI:
  - Tabbed interface for file operations.
  - Resizable workspaces.
  - Ftp-like directory navigation.
  - Log messages.
  - Additional keyboard shortcuts: home, end, ctrl+A, R(esize), T(humbnails), U(pload)
  - Multiple file selection(using ctrl or shift).
- Ajax file operations.
- Operate on multiple files at a time.
- Directory caching.
- Themable layout using tpl files.
- Improved configuration profiles.
- Multiple personal or shared directory assignments for users.
- Permissions per directory.
- Multiple thumbnail definitions.
- New integration API for wysiwyg editors.


~~~~~~~~~~INSTALLATION~~~~~~~~~~~

1) Copy imce directory to your modules directory
2) Enable the module at: /admin/build/modules
3) Create configuration profiles and assign them to user roles at: /admin/settings/imce
4) Test it at: /user/USER-ID/imce or /imce.
5) See INTEGRATION METHODS to make IMCE collaborate with your application if it's not already integrated.
Note: When you configure IMCE for inline image/file insertion into textareas there should appear an IMCE link under each textarea you specified.


~~~~~~FREQUENTLY FACED ISSUES~~~~~~

- Inaccessible/invalid directory or subdirectory:
In some server configurations, manually(ftp or directly) created directories may not be writable by PHP(by IMCE). In this case, you have to set the chmod permissions of the directory to 0777 in order to make it writable by anyone. 
You should also make sure that in each configuration profile all of the defined directories are located under drupal's file system path which is usually "files".
And also if "safe mode restriction" is active in your server, don't expect IMCE to run flawlessly.

- Disappearing images after node submission:
Having nothing to do with IMCE, it appeared many times in issue queues. This is an input filtering issue that can be resolved by adding <img> tag into the default input format. Using Full HTML is another solution. See admin/settings/filters.

- No browse button in IE/FF/at all:
Probably talking about tinyMCE or FCKeditor. See INTEGRATION METHODS to learn to integrate it by yourself.


~~~~~~~INTEGRATION METHODS~~~~~~~

Here are the applications whose users are lucky that they don't have to read the details of integration methods.

BUEditor: Obviously, the author knows how to integrate IMCE to his application:). Users need nothing to do.

FCKeditor: Another module from another blessed author, which makes IMCE integration as simple as a single click. Fckeditor profile->File browser settings->IMCE integration

Note: One can also override the settings at advanced settings->custom javascript configuration.
Here are the lines that force imce integration (don't force unless you need to):
LinkBrowser= true;
ImageBrowser= true;
FlashBrowser= true;
LinkBrowserURL= '/?q=imce&app=FCKEditor|url@txtUrl';//might be txtLnkUrl for older versions
ImageBrowserURL= '/?q=imce&app=FCKEditor|url@txtUrl|width@txtWidth|height@txtHeight';
FlashBrowserURL= '/?q=imce&app=FCKEditor|url@txtUrl';

There may be other applications that integrated IMCE already. If your application is not one of them, please keep reading.


Let's create a CASE and embody the IMCE integration on it:
- An application named myApp
- Has an url field for file url:
  <input type="text" name="urlField" id="urlField">
- Has a browse button with click event: (This can be a text link or anything that is clickable)
  <input type="button" value="Browse" onclick="openFileBrowser()">
  
Now let's go through the integration methods and define the openFileBrowser function that opens IMCE and makes it fill our url field on file selection.


~~~~~~~~INTEGRATION BY URL~~~~~~~

When IMCE is opened using an url that contains &app=applicationName|fileProperty1@FieldId1|fileProperty2@FieldId2|...
the specified fields are filled with the specified properties of the selected file.

Avaliable file properties are: url, name, size(formatted), width, height, date(formatted), bytes(integer size in bytes), time(integer date timestamp)

In our CASE, we should open IMCE using this URL: /?q=imce&app=myApp|url@urlField which contains our application name and our url field id

function openFileBrowser() {
  window.open('/?q=imce&app=myApp|url@urlField', '', 'width=760,height=560,resizable=1');
}

That's all we need. Leave the rest to IMCE.
It will automatically create an operation tab named "Send to myApp" that sends the file url to our url field.
Clicking the files in preview do the same thing as well.

- What if we had another field for another file property e.g, Size: <input type="text" id="file-size"> ?
- We should have opened imce using this URL: /?q=imce&app=myApp|url@urlField|size@file-size


~~~~~~INTEGRATION BY ONLOAD~~~~~~

A more flexible method that gives a finer control over IMCE.
Note: This could be extended to alter the content or the interface of IMCE by using its javascript methods.

var imcePopup;// this is our global variable referencing to IMCE window. We use it for tracking its open/closed state

function openFileBrowser() {

  // if IMCE is closed or not opened yet.
  if (typeof imcePopup == 'undefined' || imcePopup.closed) {

    //open IMCE
    imcePopup = window.open('/?q=imce', '', 'width=760,height=560,resizable=1');
    
    //we create a function that runs when IMCE loads, by setting the imceOnLoad property of the window
    //It is automatically called by IMCE with a single parameter(win) referencing to IMCE window.
    //We can access all methods of IMCE using win.imce
    imcePopup['imceOnLoad'] = function (win) {
      //we use IMCE's setSendTo method to make a selected file sent to our imceFinish function
      //setSendTo(title, function) creates an operation tab that has the "title" and runs the "function" on click.
      win.imce.setSendTo('Give it to myApplication baby', imceFinish);
    }
  }

  //knowing the popup is opened, we bring it into view.
  imcePopup.focus();
}

//Finalizing function that is executed when the user selects a file for our application.
//This function is called with two parameters.
//file is the file object having the properties: url, name, size, width, height, date, bytes, time
//win is the reference to IMCE window. We can access all IMCE methods using win.imce
function imceFinish(file, win) {
  //We set the value of our url field using file.url
  document.getElementById('urlField').value = file.url
  //hide the popup. We don't close it in order to save time for later use.
  win.blur();
}


~~~~~~~ADVANCED INTEGRATION~~~~~~~~~

In case:
- Your application wants to go beyond the simple "give me that file property" interaction with IMCE.
- Your application wants IMCE to send multiple files to it.(e.g., a gallery application)
- Your application wants to gain total control over IMCE.
Then you should consider applying advanced integration.

The initial step of advanced integration is the same as onload-integration above.

We open IMCE and set its imceOnLoad function:

imcePopup = window.open('/?q=imce', '', 'width=760,height=560,resizable=1');
imcePopup['imceOnLoad'] = initiateMyApp;//initiateMyApp(win) will run when imce loads

Now we define our initiator function in which we do the necessary manipulations to IMCE interface:

initiateMyApp = function (win) {
  var imce = win.imce;
  ...use imce methods to add/remove/change things...
}

- Allright, but what do we add/romeve/change in IMCE ?
- Depends on our goal. Here are some handy methods that can help us to achieve it:

TO BE CONTINUED...



NOTE:
All URL strings in the examples start with "/" considering the base path is "/".
In case your drupal is running on a sub directory e.g, http://localhost/drupal, these URLs should start with "/drupal/".
There is a safer solution that does not require manual URL fixing: If the Drupal javascript object is avaliable in your page you can use Drupal.settings.basePath at the beginning of URLs (Drupal.settings.basePath+'?q=imce....')