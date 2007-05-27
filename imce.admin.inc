<?php
// $Id$

/**
 * Admin main page.
 */
function imce_admin() {
  $profiles = variable_get('imce_profiles', array());
  $header = array(t('Profile name'), array('data' => t('Operations'), 'colspan' => 2));
  $rows = array();

  foreach ($profiles as $name => $profile) {
    $rows[] = array($name, l(t('Edit'), 'admin/settings/imce/edit/'. $name), l(t('Delete'), 'admin/settings/imce/delete/'. $name));
  }

  $rows[] = array(array('data' => l(t('Add new profile'), 'admin/settings/imce/add'), 'colspan' => 3));
  $output = '<h2 class="title">'. t('Profiles') .'</h2>';
  $output .= theme('table', $header, $rows);

  $output .= drupal_get_form('imce_form_admin');
  return $output;
}

/**
 * Admin form.
 */
function imce_form_admin() {

  //roles profiles
  $form['roles'] = array('#tree' => TRUE);
  $roles = imce_sorted_roles();
  $weighted = count($roles) > 3;
  foreach ($roles as $rid => $role) {
    $core = !$weighted || $rid == DRUPAL_ANONYMOUS_RID || $rid == DRUPAL_AUTHENTICATED_RID;
    $form['roles'][$rid] = imce_form_role($role, $core);
  }
  //user #1 profile
  $form['user1profile'] = array(
    '#type' => 'select',
    '#options' => imce_profile_options(),
    '#default_value' => variable_get('imce_user1_profile', ''),
  );

  //common settings
  $form['common'] = array(
    '#type' => 'fieldset',
    '#title' => t('Common settings'),
    '#collapsible' => TRUE,
    '#collapsed' => TRUE,
  );
  $form['common']['textarea'] = array(
    '#type' => 'textfield',
    '#title' => t('Enable inline image/file insertion into plain textareas'),
    '#default_value' => variable_get('imce_settings_textarea', ''),
    '#maxlength' => 255,
    '#description' => t('This feature allows you to add your images or files as <strong>html code into any plain textarea</strong>. This is useful especially when you dont use a wysiwyg editor such as tinyMCE or FCKeditor. Enter <strong>comma separated textarea IDs</strong> if you want to enable this feature. Otherwise, leave it blank. Hint: ID of Body fields in most node types is edit-body.'),
  );
  $form['common']['absurls'] = array(
    '#type' => 'checkbox',
    '#title' => t('Absolute URLs'),
    '#default_value' => variable_get('imce_settings_absurls', 0),
    '#description' => t('Check if you want to work with absolute file URLs.'),
  );

  $form['submit'] = array('#type' => 'submit', '#value' => t('Save'),);
  return $form;
}

/**
 * Admin form themed.
 */
function theme_imce_form_admin($form) {
  $header = array(t('User role'), t('Weight'), t('Assigned profile'));
  $rows = array();

  //user #1
  $rows[] = array(t('user #1'), '---', drupal_render($form['user1profile']));
  //roles
  foreach (imce_sorted_roles() as $rid => $role) {
    $rows[] = array(
      drupal_render($form['roles'][$rid]['name']),
      drupal_render($form['roles'][$rid]['weight']),
      drupal_render($form['roles'][$rid]['profile']),
    );
  }

  $output = '<h2 class="title">'. t('User access settings'). '</h2>';
  $output .= theme('table', $header, $rows);
  $output .= '<div class="form-item"><div class="description">'. t('Assign profiles to user roles. For users who have <strong>multiple roles</strong>, <strong>weight</strong> property will determine the assigned profile. Lighter roles that are placed upper will take the precedence. So, an administrator role should be placed over other roles by having a smaller weight, ie. -10. Note that, this will only be needed when there is at least four user roles.') .'</div></div>';

  $output .= drupal_render($form['common']);
  $output .= drupal_render($form);
  return $output;
}

/**
 * Submit admin form.
 */
function imce_form_admin_submit($form_values, $form, &$form_state) {

  //before saving, sort roles according to weight.
  if (count($form_values['roles']) > 3) {
    $form_values['roles'][DRUPAL_AUTHENTICATED_RID]['weight'] = 11;
    $form_values['roles'][DRUPAL_ANONYMOUS_RID]['weight'] = 12;
    uasort($form_values['roles'], 'imce_rolesort');
  }

  variable_set('imce_roles_profiles', $form_values['roles']);
  variable_set('imce_user1_profile', $form_values['user1profile']);
  variable_set('imce_settings_textarea', $form_values['textarea']);
  variable_set('imce_settings_absurls', $form_values['absurls']);

  drupal_set_message(t('Changes have been saved.'));
}

/**
 * Profile form.
 */
function imce_form_profile($profile = array()) {

  if (empty($profile)) {
    $profile = array('name' => '', 'filesize' => '1024', 'quota' => '2048', 'extensions' => 'gif, png, jpg, jpeg', 'dimensions' => '800x600', 'nolimit' => 0, 'scaleonupload' => 0, 'customresize' => 0, 'folders' => array(), 'thumbnails' => array());
  }

  //import profile
  if (isset($_GET['import'])) {
    $profiles = variable_get('imce_profiles', array());
    if (isset($profiles[$_GET['import']])) {
      $profiles[$_GET['import']]['name'] = $profile['name']; //preserve the original name.
      $profile = $profiles[$_GET['import']];
    }
  }

  //General upload settings
  $upload = array('#tree' => TRUE);
  $upload['filesize'] = array(
    '#type' => 'textfield', 
    '#title' => t('File size'),
    '#default_value' => $profile['filesize'],
    '#description' => t('Define the maximum file size(KB) for a file to be uploaded.'),
  );
  $upload['quota'] = array(
    '#type' => 'textfield',
    '#title' => t('Upload quota'), 
    '#default_value' => $profile['quota'],
    '#description' => t('Define the upload quota(KB) per folder. Total user quota is proportional to the number of folders that the user has upload access to.'),
  );
  $upload['extensions'] = array(
    '#type' => 'textfield',
    '#title' => t('Allowed extensions'),
    '#default_value' => $profile['extensions'],
    '#description' => t('Specify allowed file extensions.'),
  );
  $upload['nolimit'] = array(
    '#type' => 'checkbox',
    '#title' => t('Disable limits'),
    '#default_value' => $profile['nolimit'],
    '#description' => t('Check if you want to disable all upload limits applied to this profile.'),
  );

  //Folders
  $upload['folders'] = array('#theme' => 'imce_folders',);
  for ($i = 0; $i < count($profile['folders']); $i++) {
    $upload['folders'][$i] = imce_form_folder($profile['folders'][$i]);
  }
  $upload['folders'][$i] = imce_form_folder();
  $upload['folders'][$i+1] = imce_form_folder();

  //Image settings
  $image = array('#tree' => TRUE);
  $image['dimensions'] = array(
    '#type' => 'textfield',
    '#title' => t('Image Dimensions'),
    '#default_value' => $profile['dimensions'],
    '#description' => t('Define the maximum WidthxHeight for an image to be uploaded.'),
  );
  $image['scaleonupload'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable scaling of newly uploaded images.'),
    '#default_value' => $profile['scaleonupload'],
    '#description' => t('If a newly uploaded image has dimensions exceeding the limit, it will be scaled down instead of giving an error.'),
  );
  $image['customresize'] = array(
    '#type' => 'checkbox',
    '#title' => t('Enable custom resizing.'),
    '#default_value' => $profile['customresize'],
    '#description' => t('Users will be able to resize their images to any size up to allowed dimensions.'),
  );

  //Thumbnails
  $image['thumbnails'] = array('#theme' => 'imce_thumbnails',);
  for ($i = 0; $i < count($profile['thumbnails']); $i++) {
    $image['thumbnails'][$i] = imce_form_thumbnail($profile['thumbnails'][$i]);
  }
  $image['thumbnails'][$i] = imce_form_thumbnail();
  $image['thumbnails'][$i+1] = imce_form_thumbnail();

  $form['profilename'] = array(
    '#type' => 'textfield', 
    '#title' => t('Profile name'),
    '#default_value' => $profile['name'],
    '#description' => t('Give a name to this profile. Use alphanumeric characters.'),
    '#required' => TRUE,
    '#element_validate' => array('imce_profile_name_validate'),
  );
  $form['oldname'] = array(
    '#type' => 'hidden',
    '#value' => $profile['name'],
  );
  $form['import'] = array(
    '#type' => 'markup', 
    '#value' => imce_profile_import_html($profile['name']),
  );
  $form['upload'] = array(
    '#type' => 'fieldset',
    '#title' => t('General upload settings'),
    '#collapsible' => TRUE,
    '#collapsed' => !($profile['name'] == '' || isset($_GET['import'])),
    'profile' => $upload,
  );
  $form['image'] = array(
    '#type' => 'fieldset',
    '#title' => t('Image settings'),
    '#collapsible' => TRUE,
    '#collapsed' => !($profile['name'] == '' || isset($_GET['import'])),
    'profile' => $image,
  );

  $form['submit'] = array('#type' => 'submit', '#value' => t('Save'),);
  return $form;
}

/**
 * Profile form validate.
 */
function imce_profile_name_validate($form) {
  if ($form['#value'] != $form['#default_value']) {
    $profiles = variable_get('imce_profiles', array());
    if (isset($profiles[$form['#value']])) {//existing name
      form_error($form, t('You must specify a profile name that doesnt exist.'));
    }
  }
}

/**
 * Profile form submit.
 */
function imce_form_profile_submit($form_values, $form, &$form_state) {
  $profile = $form_values['profile'];
  $profile['name'] = $form_values['profilename'];

  //unset empty fields of folders and thumbnails.
  imce_unset_profile_fields($profile);

  //save profile.
  imce_update_profiles($form_values['oldname'], $profile);

  //update role-profile assignments.
  imce_update_roles($form_values['oldname'], $profile['name']);

  //create non-existing folders.
  imce_create_missing_folders($profile['folders']);

  $message = $form_values['oldname'] == '' ? 'Profile has been added.' : 'The changes have been saved.';
  drupal_set_message(t($message));
  $form_state['redirect'] = 'admin/settings/imce/edit/'. $profile['name'];
}

/**
 * Profile delete form
 */
function imce_form_delete_profile($profile = array()) {
  if (empty($profile)) {
    drupal_goto('admin/settings/imce');
  }
  return confirm_form(
    array('name' => array('#type' => 'hidden', '#value' => $profile['name'])),
    t('Are you sure you want to delete the profile !name?',
    array('!name' => theme('placeholder', $profile['name']))),
    'admin/settings/imce',
    '',
    t('Delete'),
    t('Cancel')
  );
}

/**
 * Profile delete form submit
 */
function imce_form_delete_profile_submit($form_values, $form, &$form_state) {

  //delete profile.
  imce_update_profiles($form_values['name'], NULL);

  //update role-profile assignments.
  imce_update_roles($form_values['name'], '');

  $form_state['redirect'] = 'admin/settings/imce';
}

/**
 * folder settings form
 */
function imce_form_folder($folder = array()) {
  if (empty($folder)) {
    $folder = array('name' => '', 'browse' => 0, 'delete' => 0, 'upload' => 0);
  }
  $form['name'] = array(
    '#type' => 'textfield',
    '#default_value' => $folder['name'],
    '#size' => 24,
  );
  $form['browse'] = array(
    '#type' => 'checkbox',
    '#title' => t('Browse'),
    '#default_value' => $folder['browse'],
  );
  $form['delete'] = array(
    '#type' => 'checkbox',
    '#title' => t('Delete'),
    '#default_value' => $folder['delete'],
  );
  $form['upload'] = array(
    '#type' => 'checkbox',
    '#title' => t('Upload'),
    '#default_value' => $folder['upload'],
  );
  return $form;
}

/**
 * Folders form themed.
 */
function theme_imce_folders($form) {
  $header = array(t('Folder path'), array('data' => t('Permissions'), 'colspan' => 3));
  $rows = array();
  $root = file_directory_path();

  foreach ($form as $key => $value) {
    if (isset($value['name']['#type'])) {
      $rows[] = array(
        '<div class="container-inline">'. $root .'/'. drupal_render($form[$key]['name']) .'</div>',
        drupal_render($form[$key]['browse']),
        drupal_render($form[$key]['delete']),
        drupal_render($form[$key]['upload']),
      );
    }
  }

  $output = '<h3 class="title">'. t('Folder settings'). '</h3>';
  $output .= theme('table', $header, $rows);
  $output .= '<div class="form-item"><div class="description">'. t('You can give access to separate folders under the file system directory. Use alphanumeric characters as folder paths. The special characters and tokens that you may use are; <dl><dt>*:</dt><dd>Use at the end of a path to specify all subfolders with any depth. Ex: users/* covers <em>users</em> folder and all its subfolders with any depth.</dd><dt>%uid:</dt><dd>This is a place holder for user ID. Using it in folder paths is ideal to create personal folders. Ex: <em>users/user%uid</em> creates folders like <em>user1</em>, <em>user42</em>, etc. under <em>users</em> folder.</dd><dt>%username:</dt><dd>This is a place holder for user name. Ex: <em>editors/%username</em>. Warning: Using this token may cause some security issues. Do not give your user the permission to change their username. Make sure no user has a name that is a special folder name like <em>images</em>. There may appear some other issues related to this token, so use it if you only know what you are doing.</dd></dl> If you need more fields, just fill all and save, and you will get two more on the next page.') .'</div></div>';
  $output .= drupal_render($form);
  return $output;
}

/**
 * thumbnail settings form
 */
function imce_form_thumbnail($thumb = array()) {
  if (empty($thumb)) {
    $thumb = array('name' => '', 'dimensions' => '', 'prefix' => '', 'suffix' => '');
  }
  $form['name'] = array(
    '#type' => 'textfield',
    '#default_value' => $thumb['name'],
    '#size' => 20,
  );
  $form['dimensions'] = array(
    '#type' => 'textfield',
    '#default_value' => $thumb['dimensions'],
    '#size' => 20,
  );
  $form['prefix'] = array(
    '#type' => 'textfield',
    '#default_value' => $thumb['prefix'],
    '#size' => 20,
  );
  $form['suffix'] = array(
    '#type' => 'textfield',
    '#default_value' => $thumb['suffix'],
    '#size' => 20,
  );
  return $form;
}

/**
 * Thumbnails form themed.
 */
function theme_imce_thumbnails($form) {
  $header = array(t('Name'), t('Dimensions'), t('Prefix'), t('Suffix'));
  $rows = array();

  foreach ($form as $key => $value) {
    if (isset($value['name']['#type'])) {
      $rows[] = array(
        drupal_render($form[$key]['name']),
        drupal_render($form[$key]['dimensions']),
        drupal_render($form[$key]['prefix']),
        drupal_render($form[$key]['suffix']),
      );
    }
  }

  $output = '<h3 class="title">'. t('Thumbnail settings'). '</h3>';
  $output .= theme('table', $header, $rows);
  $output .= '<div class="form-item"><div class="description">'. t('You may create a list of predefined thumbnail sizes that users can choose from. Use alphanumeric characters as thumbnail names. Specify dimensions as WidthxHeight. Prefix and suffix are strings that are added to original file name to create the thumbnail name. An example thumbnail: <em>Name</em> = Small, <em>Dimensions</em> = 80x80, <em>Prefix</em> = small_ <br /> If you need more fields, just fill all and save, and you will get two more on the next page.') .'</div></div>';
  $output .= drupal_render($form);
  return $output;
}

/**
 * Role-profile form
 */
function imce_form_role($role = array(), $core = TRUE) {
  $form['name'] = array(
    '#type' => 'markup',
    '#value' => $role['name'],
  );
  $form['weight'] = $core ? array(
    '#type' => 'markup',
    '#value' => '---',
  ) : array(
    '#type' => 'weight',
    '#default_value' => $role['weight'],
  );
  $form['profile'] = array(
    '#type' => 'select',
    '#options' => imce_profile_options(),
    '#default_value' => $role['profile'],
  );
  return $form;
}

/**
 * Profile options.
 */
function imce_profile_options() {
  $options = array('' => t('none'));
  foreach (variable_get('imce_profiles', array()) as $name => $profile) {
    $options[$name] = $name;
  }
  return $options;
}

/**
 * Profile import links.
 */
function imce_profile_import_html($pname = '') {
  $output = '';
  $links = array();

  foreach (variable_get('imce_profiles', array()) as $name => $profile) {
    if ($pname != $name) {
      $links[] = l($name, $_GET['q'], array('query' => 'import='. $name));
    }
  }

  if (!empty($links)) {
    $output = '<p><strong>'. t('Import settings from other profiles') .'</strong>: ';
    $output .= implode(', ', $links) .'</p>';
  }

  return $output;
}

/**
 * Update role-profile assignments.
 */
function imce_update_roles($oldname, $newname = '') {
  if ($oldname != '' && $newname != $oldname) {

    //user1
    if (variable_get('imce_user1_profile', '') == $oldname) {
      variable_set('imce_user1_profile', $newname);
    }

    //other roles
    $roles = variable_get('imce_roles_profiles', array());
    foreach ($roles as $rid => $role) {
      if ($role['profile'] == $oldname) {
        $roles[$rid]['profile'] = $newname;
      }
    }
    variable_set('imce_roles_profiles', $roles);

  }
}

/**
 * Update (or delete) a profile.
 */
function imce_update_profiles($oldname, $newprofile = NULL) {
  $profiles = variable_get('imce_profiles', array());

  if (isset($profiles[$oldname])) {
    unset($profiles[$oldname]);
  }

  if (isset($newprofile['name']) && $newprofile['name'] != '') {
    $profiles[$newprofile['name']] = $newprofile;
  }

  variable_set('imce_profiles', $profiles);
}

/**
 * Unset empty fields in thumbnails and folder paths.
 */
function imce_unset_profile_fields(&$profile) {
  foreach (array('thumbnails', 'folders') as $key) {
    for ($i = count($profile[$key])-1; $i > -1 ; $i--) {
      if ($profile[$key][$i]['name'] == '') {
        unset($profile[$key][$i]);
      }
      else {
        break;
      }
    }
  }
}

/**
 * Create missing folders in folder list.
 */
function imce_create_missing_folders($folders = array()) {
  $root = file_directory_path();
  foreach ($folders as $i => $folder) {
    $path = $root;
    $names = explode('/', str_replace('\\', '/', $folder['name']));
    foreach ($names as $name) {
      if (preg_match('/<root>|[\*\%]/', $name)) {
        break;
      }
      $path = $path .'/'. $name;
      file_check_directory($path, FILE_CREATE_DIRECTORY);
    }
  }
}