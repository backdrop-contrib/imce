// $Id$

IMCE is an image/file uploader and browser that supports personal directories and quota.

IMCE, initially, was implemented for easy uploading images and adding them to TinyMCE.
In the development process many features have been added.

It now supports the other most used wysiwyg editor FCKeditor. In addition to these two editors,
with the aid of newly implemented Javacript API, IMCE has also support for inline image/file 
insertion into plain textareas.


Features:

No module dependency.
Uploading .jpg, .png, and .gif images and previewing.
Option to allow uploading non-image file types.
Support for private downloads.
Limits for file size per upload, total directory size(quota), and image dimensions.
Option to use personal folders or a shared folder for users.
File sorting according to file name, file size or date.
Highlighting of active files.
Built-in support for TinyMCE
Automatic thumbnail creation.
Custom resizing.
Role based settings.
Custom settings for user #1.
File filtering according to type and extension.
Keyboard shurtcuts (UP, DOWN, DELETE, INSERT).
Javascript API that allows custom usage of the browser, which makes IMCE suitable for any wysiwyg editor.
Built-in support for FCKeditor
Built-in support for inline image/file insertion into plain textareas.#
admin ability to switch to any user's settings.
administration of user files in user/x/imce pages.

How to install:

1) Copy imce directory to your modules directory
2) Enable the module at: admin/build/modules
3) Assign permissions to user roles at: admin/user/access
4) Configure the module settings at: admin/settings/imce
5) Start using imce by clicking the browse button in image or link popup of tinymce or fckeditor.
If you configure imce to work with plain textareas there should appear a link under the specified textareas.
You can also reach IMCE from your account page.

Common issues to pay attention:
- Make sure you have the closure variable in your theme file. It contains the html that activates browse button 
for WYSIWYG editors. For phptemplate based themes, closure is $closure inside page.tpl.php.
- Directory paths in settings page must be relative to drupal's file system path that is usually "files".
Therefore, to use the folder "files/foo" just enter "foo".
- If your images disappear after node submission it is probably becouse of your default "input format" not
allowing <img> tag. Select "Full HTML" as default or add <img> tag to allowed tags for your default input format.
- If you are using an ftp-created directory and getting errors, try setting the folder permissions to
chmod 0777 to make sure PHP has full access to it.
