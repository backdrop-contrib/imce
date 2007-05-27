<?php
// $Id$

/**
 * sub-folder creation form.
 */
function imce_form_subfolder() {
  $form['help'] = array(
    '#type' => 'markup',
    '#value' => t('<p>Here you can create sub-folders for your users. Multiple folder creation is possible at a time with the <strong>*</strong> character. For example, specifying <strong>user*/foo</strong> will create <strong>foo</strong> named folders under each folder starting with <strong>user</strong>. */foo*/bar will create bar named folders under folders starting with foo in each folder of file system path.</p>'),
  );
  $form['path'] = array(
    '#type' => 'textfield',
    '#default_value' => isset($POST['path']) ? $POST['path'] : '',
    '#maxlength' => 255,
    '#prefix' => '<div class="form-item"><label>'.t('Folder path').':</label><div class="container-inline">'. file_directory_path() .'/',
    '#suffix' => '</div></div>',
  );
  $form['submit'] = array('#type' => 'submit', '#value' => t('Create'),);
  return $form;
}

/**
 * sub-folder form submit.
 */
function imce_form_subfolder_submit($form_values, $form, &$form_state) {
  imce_create_subfolders($form_values['path'], file_directory_path());
  $form_state['redirect'] = FALSE;
}

/**
 * Create folders under root according to path.
 */
function imce_create_subfolders($path, $root) {
  $folders = explode('/', str_replace('\\', '/', $path));
  $paths = array($root);

  foreach ($folders as $folder) {

    //no asterisks. create the folder(s)
    if (strpos($folder, '*') === FALSE) {
      //check and create folders under each path.
      foreach ($paths as $i => $path) {
        $paths[$i] = $path = $path .'/'. $folder;
        if (!file_check_location($path, $root) || !file_check_directory($path, FILE_CREATE_DIRECTORY)) {
          drupal_set_message(t('Specified path must be under file sytem path.'), 'error');
          return FALSE;
        }
      }
    }

    //asterisks. get matching subfolders and update paths.
    else {
      $newpaths = array();
      $regexp = str_replace('*', '.*', $folder);
      
      //add matching paths.
      foreach ($paths as $path) {
        $newpaths = array_merge($newpaths, imce_get_subfolders($path, $regexp));
      }
      
      //no matching paths
      if (empty($newpaths)) {
        drupal_set_message(t('No matching sub-folders found.'), 'error');
        return FALSE;
      }
      
      $paths = $newpaths;
    }

  }

  return TRUE;
}

/**
 * Scan directory and return folders matching the expression.
 */
function imce_get_subfolders($dir, $expr = '') {
  $folders = array();

  if ($handle = @opendir($dir)) {
    while(($file = readdir($handle)) !== FALSE) {
      if ($file != '.' && $file != '..' && is_dir($dir.'/'.$file) && preg_match('/^'.$expr.'$/', $file)) {
        $folders[] = $dir.'/'.$file;
      }
    }
    closedir($handle);
  }

  return $folders;
}