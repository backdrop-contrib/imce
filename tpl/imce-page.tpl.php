<?php
// $Id$
?><!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="<?php print $GLOBALS['language']->language; ?>" xml:lang="<?php print $GLOBALS['language']->language; ?>">

<head>
  <title><?php print t('File Browser'); ?></title>
  <?php print drupal_get_html_head(); ?>
  <?php print drupal_get_css(); ?>
  <?php print drupal_get_js(); ?>
  <style media="all" type="text/css">/*Overwrite css*/
    body {
      margin: 0.1em 0.3em;
    }
  </style>
</head>

<body>
<div id="imce-messages"><?php print theme('status_messages'); ?></div>
<?php print $content; ?>
</body>
</html>
