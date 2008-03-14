<?php
// $Id$
$imce =& $imce_ref['imce'];
drupal_add_js('misc/jquery.form.js');
//make sure the paths are correct when you move this tpl file to another $directory.
//orginal files reside in drupal_get_path('module', 'imce').
drupal_add_js($directory .'/js/imce.js');
drupal_add_css($directory .'/css/content.css');
?>
<!--[if IE]><style type="text/css">#file-list-wrapper{padding-right: 2em}#file-list{margin-right: -2em}</style><![endif]-->
<!--[if IE 6]><style type="text/css">.y-resizer{font-size: 0.2em;}#sub-browse-wrapper{float: left; clear: right;}#preview-wrapper{overflow: visible;}#file-preview{width: 99%; height: 99%; overflow: auto;}</style><![endif]-->
<noscript><?php print t('You should use a javascript-enabled browser in order to experince a much more user-friendly interface.'); ?></noscript>

<div id="imce-content"><div id="resizable-content">

<div id="browse-wrapper">

  <div id="navigation-wrapper">
    <div class="navigation-text"><?php print t('Navigation'); ?></div>
    <ul id="navigation-tree"><li class="expanded root"><?php print $tree; ?></li></ul>
  </div>

  <div id="navigation-resizer" class="x-resizer"></div>

  <div id="sub-browse-wrapper">

    <div id="file-header-wrapper">
      <table id="file-header" class="files"><tbody><tr>
        <td class="name"><?php print t('File name'); ?></td>
        <td class="size"><?php print t('Size'); ?></td>
        <td class="width"><?php print t('Width'); ?></td>
        <td class="height"><?php print t('Height'); ?></td>
        <td class="date"><?php print t('Date'); ?></td>
      </tr></tbody></table>
    </div>

    <div id="file-list-wrapper">
      <?php print theme('imce_file_list', $imce_ref); ?>
    </div>

    <div id="dir-stat"><?php print t('!num files using !dirsize of !quota', array(
        '!num' => '<span id="file-count">'. count($imce['files']) .'</span>',
        '!dirsize' => '<span id="dir-size">'. format_size($imce['dirsize']) .'</span>',
        '!quota' => '<span id="dir-quota">'. ($imce['quota'] ? format_size($imce['quota']) : t('unlimited quota')) .'</span>'
      )); ?>
    </div>

  </div><!-- sub-browse-wrapper -->
</div><!-- browse-wrapper -->

<div id="browse-resizer" class="y-resizer"></div>

<div id="log-prv-wrapper">
  <div id="log-wrapper"></div>
  <div id="log-resizer" class="x-resizer"></div>
  <div id="preview-wrapper"><div id="file-preview"></div></div>
</div>

<div id="forms-wrapper"><?php print $forms; ?></div>

<div id="ops-wrapper"><!-- This will be moved to top by js -->

  <div id="op-items">
    <ul class="tabs secondary" id="ops-list">
      <li id="op-item-help"><a href="#"><?php print t('Help'); ?></a></li>
    </ul>
  </div>

  <div id="op-contents">
    <div id="op-content-help" class="op-content"><!-- Help box -->
    <?php print t('Tips'); ?>:
    <ul class="tips">
      <li><?php print t('To select a file click the corresponding row in the list.'); ?></li>
      <li><?php print t('Use Ctrl+click to add files to the selection or to remove files from the selection.'); ?></li>
      <li><?php print t('Use Shift+click to create a range selection. Click to start the range and shift+click to end it.'); ?></li>
    </ul>
    <?php print t('Limitations'); ?>:
    <ul class="tips">
      <li><?php print t('Maximum file size per upload') .': '. ($imce['filesize'] ? format_size($imce['filesize']) : t('unlimited')); ?></li>
      <li><?php print t('Permitted file extensions') .': '. ($imce['extensions'] != '*' ? $imce['extensions'] : t('all')); ?></li>
      <li><?php print t('Maximum image resolution') .': '. ($imce['dimensions'] ? $imce['dimensions'] : t('unlimited')); ?></li>
      <li><?php print t('Maximum number of files per operation') .': '. ($imce['filenum'] ? $imce['filenum'] : t('unlimited')); ?></li>
    </ul>
    </div>
  </div>

</div><!-- ops-wrapper -->

</div><!-- resizable-content -->
<div id="content-resizer" class="y-resizer"></div>
<a href="#" id="log-clearer" class="imce-hide"><?php print t('Clear log'); ?></a>

</div><!-- imce-content -->

