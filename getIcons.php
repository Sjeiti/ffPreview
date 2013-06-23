<html><style>
body,html{width:100%,margin:0;padding:0;}
</style><body>
<p>
data:image/gif;base64,<br/>
data:image/jpeg;base64,<br/>
data:image/png;base64,<br/>
</p>
<?php
/*if ($handle = opendir('.')) {
    while (false !== ($file = readdir($handle))) {
		if (!in_array($file,array('.','..','index.php'))) {
		    echo "$file<br/>";
			$imgbinary = fread(fopen($file, "r"), filesize($file));
			echo base64_encode($imgbinary).'<br/>';
		}
    }
    closedir($handle);
}*/
if ($handle = opendir('.')) {
    while (false !== ($file = readdir($handle))) {
//		if (!in_array($file,array('.','..','index.php'))) {
//		echo array_pop(explode($file,'.')).'<br/>';
		if (array_pop(explode('.',$file))=='png') {
		    echo '"'.$file.'":'."\t";
			$imgbinary = fread(fopen($file, "r"), filesize($file));
			echo 'url(data:image/png;base64,'.base64_encode($imgbinary).')';
		}
    }
    closedir($handle);
}

//$imgfile = "test.gif";
//
//$handle = fopen($filename, "r");
//
//$imgbinary = fread(fopen($imgfile, "r"), filesize($imgfile));
//
//echo '<img src="data:image/gif;base64,' . base64_encode($imgbinary) . '" />';
//
//
//
//gif - data:image/gif;base64,...
//jpg - data:image/jpeg;base64,...
//png - data:image/png;base64,...
//etc.

?><body><html>