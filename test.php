<?php

$iFilter = isset($_GET['f'])?$_GET['f']:4147;//5706;//9451;//4147;//
$sBaseUri = 'http://www.filterforge.com';
$sPage = file_get_contents($sBaseUri.'/filters/'.$iFilter.'.html');

preg_match_all('/(?:<link)(?:[^>]*)(?:href=")([^"]*)(?:.*text\/css)(?:".*>)/', $sPage, $aMatches);
$sStyle = '';
foreach ($aMatches[1] as $k=>$v) $sStyle .= file_get_contents($sBaseUri.$v);
$sStyle = str_replace("url(", "url(".$sBaseUri, $sStyle);
$sStyle = str_replace("src('", "src('".$sBaseUri, $sStyle);

$sPage = str_replace("src=\"", "src=\"".$sBaseUri, $sPage);
preg_match("/<body.*\/body>/s", $sPage, $aMatches);
$sBody = $aMatches[0];

?>
<!DOCTYPE html>
<html>
	<head>
		<title>ff Preview</title>
		<style><?php echo $sStyle; ?>
			div#ffPreviewUI {
				position:	absolute;
				left:		0;
				bottom:		0;
				padding:	0;
				/*border-top-right-radius: 10px;*/
				background:	rgba(0,0,0,.5);
				font-size:	14px;
				color: white;
			}
				div#ffPreviewUI br { clear: both; }
				div#ffPreviewUI h3 {
					font: .9em Tahoma, Arial, Helvetica, sans-serif;
					font-weight: bold;
					margin: 3px 90px 3px 6px;

				}
				div#ffPreviewUI a {
					color: white;
					text-decoration: none;
					cursor: pointer;
				}
				div#ffPreviewUI a.ffp {
					display:	block;
					width:		18px;
					height:		18px;
					background: url(icons.png);
				}
				div#ffPreviewUI a.ffp:hover {		background-color: rgba(255,255,255,.2); }
					div#ffPreviewUI a.ffp span {
						display: none;
					}
				div#ffPreviewUI a.ffp.closeffp {	background-position: -00px -36px; }
				div#ffPreviewUI a.ffp.maximize {	background-position: -18px -36px; }
				div#ffPreviewUI a.ffp.minimize {	background-position: -36px -36px; }

				div#ffPreviewUI a.ffp.light {		background-position: -54px 0; }
				div#ffPreviewUI a.ffp.cube {		background-position: -72px 0; }
				div#ffPreviewUI a.ffp.material {	background-position: -90px 0; }

				div#ffPreviewUI a.ffp.plane {		background-position: -108px 0; }
				div#ffPreviewUI a.ffp.sphere {		background-position: -126px 0; }
				div#ffPreviewUI a.ffp.torus {		background-position: -144px 0; }
				div#ffPreviewUI a.ffp.cylinder {	background-position: -162px 0; }
				div#ffPreviewUI a.ffp.knot {		background-position: -180px 0; }

				div#ffPreviewUI a.ffp.info {		background-position: -198px 0; }

				div#ffPreviewUI a.ffp.flatplane {	background-position: -216px 0; }
				
				div#ffPreviewUI ul.ffp, div#ffPreviewUI ul.content {
					list-style: none;
					margin: 0;
					padding: 0;
				}
				div#ffPreviewUI ul.content {
					background-color: #333;
					font-size: .75em;
				}
					div#ffPreviewUI ul.content li {
						display: none;
						margin: 0;
						padding: 4px 8px;
					}
					div#ffPreviewUI li.info p.message {
						color: #800;
						background: #FFFFC8;
						padding: 1px 2px;
					}

					div#ffPreviewUI ul.ffp li {
						display:	block;
						width:		18px;
						height:		18px;
						float:		left;
						margin: 0;
						padding: 0;
					}
				div#ffPreviewUI ul.ffp.topMenu {
					position: absolute;
					top: 2px;
					left: 73px;
				}
				div#ffPreviewUI ul.ffp.closeMenu {
					position: absolute;
					top: 0;
					right: 0;
				}
					div#ffPreviewUI ul.ffp.closeMenu li {
						width:		10px;
						height:		10px;
						overflow:	hidden;
					}

			#ffPreviewContainer {
				position:	absolute;
				left:		0;
				bottom:		0;
			}
			.stats {
				position:	absolute;
				top:		0;
			}
		</style>
		<script id="ffPreviewTpl" type="text/x-jquery-tmpl">
			<div id="ffPreviewUI">
				<h3><a href="http://ffpreview.sjeiti.com" target="_blank">ffPreview</a></h3>
				<ul class="ffp topMenu">
					<li><a class="ffp light"><span>*</span></a></li>
					<li><a class="ffp cube"><span>[]</span></a></li>
					<li><a class="ffp material"><span>#</span></a></li>
					<li><a class="ffp info"><span>i</span></a></li>
				</ul>
				<ul class="content">
					<li class="light">
						lighting options placeholder
						<!--p class="angle"></p-->
					</li>
					<li class="cube">
						<ul class="ffp">
							<li><a class="ffp flatplane" title="flatplane"><span>[[]]</span></a></li>
							<li><a class="ffp cube" title="cube"><span>#</span></a></li>
							<li><a class="ffp plane" title="plane"><span>[]</span></a></li>
							<li><a class="ffp sphere" title="sphere"><span>O</span></a></li>
							<li><a class="ffp torus" title="torus"><span>@</span></a></li>
							<li><a class="ffp cylinder" title="cylinder"><span>p</span></a></li>
							<li><a class="ffp knot" title="knot"><span>&</span></a></li>
						</ul><br/>
					</li>
					<li class="material">
						<div>
							<div class="repeatx">repeat x: <a class="lt">&lt;</a><span>1</span><a class="gt">&gt;</a></div>
							<div class="repeaty">repeat y: <a class="lt">&lt;</a><span>1</span><a class="gt">&gt;</a></div>
						</div>
					</li>
					<li class="info"><p class="about">Created by <a href="http://sjeiti.com/" target="_blank">Sjeiti</a> in <a href="http://github.com/mrdoob/three.js" target="_blank">three.js</a>.</p></li>
				</ul>
				<ul class="ffp closeMenu">
					<li><a class="ffp minimize"><span>_</span></a></li>
					<li><a class="ffp maximize"><span>[]</span></a></li>
					<li><a class="ffp closeffp"><span>x</span></a></li>
				</ul>
			</div>
		</script>
		<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
		<script type="text/javascript">
			function ShowPopup(){};
			function HidePopup(){};
			$(function(){
				$.ajax('ffPreview.js');
			});
		</script>
	</head>
	<body><?php echo $sBody; ?></body>
</html>