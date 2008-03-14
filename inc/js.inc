<?php
// $Id$

/**
 * Ajax operation: navigate
 */
function imce_js_navigate(&$imce) {
  $imce['files'] = theme('imce_file_list', array('imce' => &$imce));
  $imce['dir'] = str_replace('%2F', '/', rawurlencode($imce['dir']));
  $imce['dirsize'] = format_size($imce['dirsize']);
  $imce['subdirectories'] = array_map('rawurlencode', $imce['subdirectories']);
  unset($imce['name'], $imce['directories'], $imce['filesize'], $imce['quota'], $imce['thumbnails'], $imce['uid']);
  return $imce;
}

/**
 * Ajax operation: upload
 */
function imce_js_upload(&$imce) {
  if ($imce['perm']['upload']) {
    $_POST['op'] = t('Upload');
    drupal_get_form('imce_upload_form', array('imce' => &$imce));
    return array('added' => $imce['added'], 'dirsize' => format_size($imce['dirsize']));
  }
}

/**
 * Ajax operation: thumbnails
 */
function imce_js_thumb(&$imce) {
  if ($imce['perm']['thumb']) {
    $_POST['op'] = t('Create');
    return imce_process_fileop($imce);
  }
}

/**
 * Ajax operation: delete
 */
function imce_js_delete(&$imce) {
  if ($imce['perm']['delete']) {
    $_POST['op'] = t('Delete');
    return imce_process_fileop($imce);
  }
}

/**
 * Ajax operation: resize
 */
function imce_js_resize(&$imce) {
  if ($imce['perm']['resize']) {
    $_POST['op'] = t('Resize');
    return imce_process_fileop($imce);
  }
}

/**
 * Process file operations form
 */
function imce_process_fileop(&$imce) {
  drupal_get_form('imce_fileop_form', array('imce' => &$imce));
  return array('added' => $imce['added'], 'removed' => $imce['removed'], 'dirsize' => format_size($imce['dirsize']));
}