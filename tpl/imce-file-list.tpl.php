<?php
// $Id$
$imce =& $imce_ref['imce'];
?>

<table id="file-list" class="files"><tbody><?php
if ($imce['perm']['browse'] && !empty($imce['files'])) {
  foreach ($imce['files'] as $name => $file) {?>
  <tr>
    <td class="name" id="<?php print $raw = rawurlencode($file['name']); ?>"><?php print $raw; ?></td>
    <td class="size" id="<?php print $file['size']; ?>"><?php print format_size($file['size']); ?></td>
    <td class="width"><?php print $file['width']; ?></td>
    <td class="height"><?php print $file['height']; ?></td>
    <td class="date" id="<?php print $file['date']; ?>"><?php print format_date($file['date'], 'small'); ?></td>
  </tr><?php
  }
}?>
</tbody></table>