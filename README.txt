// $Id$

IMCE is mainly designed for uploading and adding images to tinyMCE editor.
It also supports non-image file uploading and browsing.
So, it can be used as an image browser in tinyMCE's image popup window 
and as a link browser in link window.

Features:

- no requirements for any image related module since its image handling
is minimal. no image nodes, no thumbnails. 

- allows only .jpg, .png, and .gif images 

- non-image file support can be activated in configurations by defining
allowed extensions.

- by default, it uploads images to personal directories. instead of personal
directories a common folder for all users can be defined in configurations. 

- configurable upload limits:
filesize per upload(default:100kb)
image dimensions(default:500x500)
total quota per user(default:500kb)

- introduces view, upload, delete, limitless upload permissions.

- detects tinymce action automatically and throws necessary .js to activate 
image browser thatcan be reached byclicking the browse icon in popups.

- javascript-based file sorting.

- scaling of big images to allowed dimensions.

- highlighting of newly uploaded files or files that come from tinyMCE.
