(function(){
	//
	var sId = 'ffPreview';
	//
	var bDebug = !true;
	//
	var bStats = bDebug;
	//
	var iSceneW;
	var iSceneH;
	//
	var $Body;
	var $Preview;
	var $Texturemaps;
	var $Container;
	var $UI;

	var mContainer, mStats, oLoader;
	//
	var bInited = false;

	var oCamera, oScene, oRenderer;

	var directionalLight, pointLight, ambientLight;

	var oMaterial;

	var oGeometry;
	var oMesh, lightMesh;

	var iObjScale = 23;

	var mouseX = 0;
	var mouseY = 0;
	var mouseMoveX = 512/2;
	var mouseMoveY = 512/2;

	var bMouseObj = true;

	var fCameraSpeed = .001;

	var $LightGrad;
	var iLightGrad = 80;

	var oCookie;
	var sObjectType = 'flatplane';
	//
	//var sModel = 'http://localhost/ffPreview/web/obj/ninja/NinjaLo_bin.js';
	//
	// trace
	var trace = function trace() {
		if (bDebug) try {console.log.apply(console, arguments);} catch (e) {}
	}
	// addChild
	HTMLElement.prototype.addChild = function(elementName,attributes,append) {
		if (append===undefined) append = true;
		var m = document.createElement(elementName);
		if (attributes!==undefined) m.setAttributes(attributes);
		if (append===true) this.appendChild(m);
		else this.insertBefore(m, this.firstChild);
		return m;
	}
	HTMLElement.prototype.setAttributes = function(o) {
		for (var s in o) this.setAttribute(s,o[s]);
	}
	// dynamically load scripts
	var sPreviewBase = bDebug?'http://localhost/ffpreview/web/':'http://www.sjeiti.com/sub/ffpreview/';
	var aScripts = [
		 [typeof jQuery,						'http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js']
//		,[typeof jQuery.fn.mousewheel,			sPreviewBase+'jquery.mousewheel.min.js']
		,[typeof THREE,							sPreviewBase+'Three.js']
		,[typeof Detector,						sPreviewBase+'Detector.js']
		,[typeof window.requestAnimationFrame,	sPreviewBase+'RequestAnimationFrame.js']
		,[typeof Stats,							sPreviewBase+'Stats.js']
	];
	var iNumScripts = aScripts.length;
	var checkScripts = function checkScripts(){
		iNumScripts--;
		if (iNumScripts===0) init();
	}
	for (var i=0;i<aScripts.length;i++) {
		if (aScripts[i][0]=='undefined') {
			document.body.addChild('script',{
				type: 'text/javascript'
				,src: aScripts[i][1]
			}).onload = checkScripts;
		} else {
			checkScripts();
		}
	}

	function init() {
		$Body = $('body');
		$Preview = $('.big_prev_vis');
		$Texturemaps = $('.texturemaps');
		if ($Preview.length===0) {
			alert('This bookmarklet only works on Filter Forge filter pages.');
			return;
		} else if ($Texturemaps.length===0) {
			alert('ffPreview only works for filters with texture maps.');
			return;
		}
		//
		(function(c){var a=["DOMMouseScroll","mousewheel"];c.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var d=a.length;d;){this.addEventListener(a[--d],b,false)}}else{this.onmousewheel=b}},teardown:function(){if(this.removeEventListener){for(var d=a.length;d;){this.removeEventListener(a[--d],b,false)}}else{this.onmousewheel=null}}};c.fn.extend({mousewheel:function(d){return d?this.bind("mousewheel",d):this.trigger("mousewheel")},unmousewheel:function(d){return this.unbind("mousewheel",d)}});function b(i){var g=i||window.event,f=[].slice.call(arguments,1),j=0,h=true,e=0,d=0;i=c.event.fix(g);i.type="mousewheel";if(i.wheelDelta){j=i.wheelDelta/120}if(i.detail){j=-i.detail/3}d=j;if(g.axis!==undefined&&g.axis===g.HORIZONTAL_AXIS){d=0;e=-1*j}if(g.wheelDeltaY!==undefined){d=g.wheelDeltaY/120}if(g.wheelDeltaX!==undefined){e=-1*g.wheelDeltaX/120}f.unshift(i,j,e,d);return c.event.handle.apply(this,f)}})(jQuery);
		//
		cookieJar(false);
		//
		iSceneW = $Preview.width();
		iSceneH = $Preview.height();
		mouseMoveX = iSceneW/2;
		mouseMoveY = iSceneH/2;
		//
		buildScene();
		buildLights();
		buildMaterial();
		buildUI();
		//
		bInited = true;
		animate();
		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		$Preview.bind('mousewheel',handleMouseWheel);
	}

	// buildScene
	function buildScene() {
		//
		$Container = $('<div id="ffPreviewContainer"></div>').appendTo($Preview).width(iSceneW).height(iSceneH);
		mContainer = $Container.get(0);
		//
//		Detector.webgl = false; //##################################################
		oRendererClass = Detector.webgl?THREE.WebGLRenderer:THREE.CanvasRenderer;
		oRenderer = new oRendererClass();
		oRenderer.setSize(iSceneW,iSceneH);
		mContainer.appendChild( oRenderer.domElement );
		//
		if (Detector.webgl===THREE.WebGLRenderer) {
			oCamera = new THREE.Camera( 60, iSceneW / iSceneH, 1, 100000 );
			oCamera.projectionMatrix = THREE.Matrix4.makeOrtho( iSceneW / - 2, iSceneW / 2, iSceneH / 2, iSceneH / - 2, -10000, 10000 );
			Camera.position.z = 6200;
		} else {
			oCamera = new THREE.Camera( 60, iSceneW/iSceneH, 1, 10000 );
			oCamera.position.z = 500;
		}
		//
		oScene = new THREE.Scene();
	}

	// buildLights
	function buildLights() {
		//
		// ambient
		ambientLight = new THREE.AmbientLight( 0x111111 );
		oScene.addLight( ambientLight );
		//
		// directional
		directionalLight = new THREE.DirectionalLight( 0xaaaaaa );
		directionalLight.position.x = 1;
		directionalLight.position.y = 1;
		directionalLight.position.z = 0.5;
		directionalLight.position.normalize();
		oScene.addLight( directionalLight );
		//
		// point
		pointLight = new THREE.PointLight( 0xffffff );
		pointLight.position.z = 10000;
		oScene.addLight( pointLight );
		// sphere obj
		var sphere = new THREE.Sphere( 100, 16, 8 );
		lightMesh = new THREE.Mesh( sphere, new THREE.MeshBasicMaterial( { color:0x000000 } ) );
		lightMesh.position = pointLight.position;
		lightMesh.scale.x = lightMesh.scale.y = lightMesh.scale.z = 0.05;
		oScene.addObject(lightMesh);
	}

	// buildMaterial
	function buildMaterial() {
		//
		var sTexturemaps = $Texturemaps.html();
		var bAO =		sTexturemaps.match(/ambientocclusion/g)!==null;
		var bDiffuse =  sTexturemaps.match(/diffuse/g)!==null;
		var bNormal =	sTexturemaps.match(/normal/g)!==null;
		var bSpecular =	sTexturemaps.match(/specular/g)!==null;
		var bBump =		sTexturemaps.match(/bump/g)!==null;
		//
//		var sUri = $Preview.find('a:first').attr('href');
//		var aUri = sUri.match(/\/([0-9]*)-/);
//		trace('$Preview:',$Preview); // TRACE ### $Preview
//		trace('sUri:',sUri); // TRACE ### sUri
//		trace('aUri:',aUri); // TRACE ### aUri
//		var sFilterNr = parseInt(aUri[1]);//928;//1063;//4651;//8890;//4585;//
		var sUri = $Preview.find('img:first').attr('src');
		var sFilterNr = sUri.split('/').pop().split('.')[0];
		var sBaseUri = 'http://www.filterforge.com/filters/';
		var getMapUri = function getMapUri(s){return sBaseUri+sFilterNr+'-'+s+'.jpg';};
		//
		var sDiffuse = bDiffuse?getMapUri('diffuse'):$('#afterImage').attr('src');
		//
		if (oRendererClass===THREE.WebGLRenderer) {
			//
			if (!bDiffuse) {
				oMaterial = new THREE.MeshPhongMaterial( {
						map: THREE.ImageUtils.loadTexture(sDiffuse)
//						,shininess: 0
						,reflectivity: 11
						,color: 0xAAAAAA
				});
			} else { // normal map shader
				var shader = THREE.ShaderUtils.lib[ 'normal' ];
				var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

				uniforms[ 'enableAO' ].value = bAO;
				uniforms[ 'enableDiffuse' ].value = true;//bDiffuse;
				uniforms[ 'enableSpecular' ].value = bSpecular;


//				var texture = THREE.ImageUtils.loadTexture( bDiffuse?getMapUri('diffuse'):sAfter );
//				texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//				texture.repeat.set( 5, 5 );
//				uniforms['tDiffuse'].texture = texture;

				uniforms['tDiffuse'].texture = THREE.ImageUtils.loadTexture(bDiffuse?getMapUri('diffuse'):sAfter);
				if (bNormal)	uniforms[ 'tNormal' ].texture = THREE.ImageUtils.loadTexture( getMapUri('normal') );
				if (bAO)		uniforms[ 'tAO' ].texture = THREE.ImageUtils.loadTexture( getMapUri('ambientocclusion') );
				if (bSpecular)	uniforms[ 'tSpecular' ].texture = THREE.ImageUtils.loadTexture( getMapUri('specular') );
				else			uniforms[ 'uSpecularColor' ].value.setHex( 0x7F7F7F );

				if (bBump)	uniforms[ 'tDisplacement' ].texture = THREE.ImageUtils.loadTexture( getMapUri('bump') );

				uniforms[ 'uDisplacementBias' ].value = - 0.428408 * iObjScale;
				uniforms[ 'uDisplacementScale' ].value = 2.436143 * iObjScale;

				uniforms[ 'uPointLightPos' ].value = pointLight.position;
				uniforms[ 'uPointLightColor' ].value = pointLight.color;

				uniforms[ 'uDirLightPos' ].value = directionalLight.position;
				uniforms[ 'uDirLightColor' ].value = directionalLight.color;

				uniforms[ 'uAmbientLightColor' ].value = ambientLight.color;

				//var ambient = 0x050505, diffuse = 0x555555, specular = 0xaa6600, shininess = 11, iObjScale = 23;
				
				uniforms[ 'uAmbientColor' ].value.setHex( 0x050505 );
				uniforms[ 'uShininess' ].value = 11;

				oMaterial = new THREE.MeshShaderMaterial({
					fragmentShader:	shader.fragmentShader
					,vertexShader:	shader.vertexShader
					,uniforms:		uniforms
				});
				//oMaterial.wrapT = oMaterial.wrapS = THREE.RepeatWrapping;
			}
			//oLoader = new THREE.BinaryLoader( true );
			//document.body.appendChild( oLoader.statusDomElement );
			//oLoader.load({
			//	model: sModel
			//	,callback:function(oGeometry){
			//		addObject(oGeometry,iObjScale,oMaterial)
			//	}
			//});
		} else {

//			var texture = THREE.ImageUtils.loadTexture( sDiffuse );
//			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
//			texture.repeat.set( 5, 5 );

//			oMaterial = new THREE.MeshBasicMaterial( { map: texture } );
			oMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture(sDiffuse) } );
//			//oMaterial = new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture(sDiffuse) } );
			//oMaterial = new THREE.MeshPhongMaterial();
			//oMaterial = new THREE.MeshPhongMaterial( { map: sDiffuse } );
		}
		addObject();
	}

	// setRepeat
	function setRepeat(x,y) {
		trace('setRepeat:',x,y); // TRACE ### setRepeat
		if (y===undefined) y = x;
		var setTexture = function(tx){
			tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
			//tx.repeat = new THREE.Vector2(x,y);
			tx.repeat.set(x,y);
			tx.needsUpdate = true;
		};
		trace('oMaterial:',oMaterial); // TRACE ### oMaterial
		if (oMaterial.uniforms!==undefined) {
			$.each(oMaterial.uniforms,function(s,o){
				if (o&&o.texture!==undefined&&o.texture) {
					setTexture(o.texture);
				}
			});
		} else if (oMaterial.map!==undefined) {
			setTexture(oMaterial.map);
		}
	}

	// addObject
	function addObject(type) {
		if (type===undefined) type = sObjectType;
		sObjectType = type;
		cookieJar(true);
		trace('addObject:',type); // TRACE ### type
		//
		if (oMesh!==undefined) oScene.removeObject(oMesh);
		//
		var iSize = 10;
		var iSqrt1 = 1.414;
		var iSqrt2 = 1.189;
		var iSqrt1Size = iSize*iSqrt1;
		var iSqrt2Size = iSize*iSqrt2;
		var iPlaneDiv = 3;
		switch (type) {
			case 'flatplane':
				setRepeat(1,1);
				oGeometry = new THREE.Plane( 2.5*iSize, 2.5*iSize, iPlaneDiv,iPlaneDiv );
				bMouseObj = false;
				pointLight.position.z = 200;
			break;
			case 'sphere':		setRepeat(2,1); oGeometry = new THREE.Sphere( iSize, 32, 16 ); break;
			case 'torus':		setRepeat(3,1); oGeometry = new THREE.Torus( iSize*.6, iSize*.4, 31, 32 ); break;
			case 'plane':		setRepeat(1,1); oGeometry = new THREE.Plane( 2*iSize, 2*iSize, iPlaneDiv,iPlaneDiv ); break;
			case 'cube':		setRepeat(1,1); oGeometry = new THREE.Cube( iSqrt1Size,iSqrt1Size,iSqrt1Size, iPlaneDiv,iPlaneDiv,iPlaneDiv, [oMaterial,oMaterial,oMaterial,oMaterial,oMaterial,oMaterial] ); break;
			case 'cylinder':	setRepeat(2,1); oGeometry = new THREE.Cylinder( 32, iSqrt1Size/2,iSqrt1Size/2, iSqrt1Size, 0,0 ); break;
			case 'icosahedron': // ###
				oGeometry = new THREE.Icosahedron( 4 );
			break;
			case 'torusKnot': // ###
				oGeometry = new THREE.TorusKnot( iSize/2, .4*iSize, 16,16, 16,16, .5 );
			break;
			case 'lathe': // ###
				var aPoints = [];
				for (var i=0;i<20;i++) aPoints.push([10*Math.random(),10*Math.random()]);
				oGeometry = new THREE.Lathe( 16, 8, 2 );
			break;
		}
//		oGeometry.computeFaceNormals ();
//		oGeometry.computeVertexNormals ();
//		oGeometry.__dirtyVertices = true;
//		oGeometry.__dirtyNormals = true;
//		oGeometry.computeCentroids();
//		oGeometry.computeFaceNormals();
//		oGeometry.computeVertexNormals();
		oGeometry.computeVertexNormals ();
		oGeometry.computeTangents();
		oMesh = THREE.SceneUtils.addMesh( oScene, oGeometry, iObjScale, 0,0,0, 0,0,0, oMaterial );
		if (type=='plane') oMesh.doubleSided = true;
		if (oLoader!==undefined) oLoader.statusDomElement.style.display = 'none';
	}

	// buildUI
	function buildUI() {
		var $Template = $('#ffPreviewTpl');
		if ($Template.length>0) {
			$UI = $($('#ffPreviewTpl').remove().text()).appendTo($Preview);
		} else {
			$('<style>div#ffPreviewUI{position:absolute;left:0;bottom:0;padding:0;background:rgba(0,0,0,.5);font-size:14px;color:white}div#ffPreviewUI br{clear:both}div#ffPreviewUI h3{font:.9em Tahoma,Arial,Helvetica,sans-serif;font-weight:bold;margin:3px 90px 3px 6px}div#ffPreviewUI a{color:white;text-decoration:none;cursor:pointer}div#ffPreviewUI a.ffp{display:block;width:18px;height:18px;background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASAAAABICAYAAABWUygDAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAADhBJREFUeNrsXUtuG8sVLToPmYo7MDNIZoloZAGmpwEeTK9A1OhlkETkCkitQFTiQTIitQLTMJCpqAU8mHqZJQPTKxA1fAgQpS59SrosVVU3qW6Kn3OAQovdxWbX79S5t6qvKnd3d2ZXUalUotdsuY/soWbT0Ob7mshnCIIoaYzuMQFd2kNDks13lSKg2H3stQN7aOI+fZvveptILFQulKnunZ6GSJrknBt/QNL4UyTve+/zP5F2E9KJdjWpMr606dAr96FNrzHg7gefTW+zBhm+O7Dp5m4Rn0VZ6XsG6vgT0qqfC68fVUdnd3FcBuqwtHZD29wknufkGftv1ab6EvnfP+G33u/yGP3OnxExeEQVfIwQlgzQsb1+u0Uz4FBmdfu8NTy3DKQqrsls7xTQSMpur7dsvouI2mkrhTDCvSc2tZDk88zmH6VUUUH43qbf58z7o02fEkpOyjCzqSft62Wpo2wTm/eRYnRKSkgM+RpIIcjvTOV3dN14E8ZrPIPk6wfuMVecQgT2ePoM/ekSdXKM9l5re+2yAjrALH4HH8kjv4ma6Q8SzLYsylZA8twf8MyXgd+XmfYtrg/0TB+oly82dTHYggSN33I4ijxfEcqnt0Qd9xL18xl1cJDRVy5R/gPdd5SCcoplgDoKpTOV7yjSD7u4fph4ls94nixl5yvcS6/dP/h9PUffcs/fXlLFrNJee6WARB1MwO5D+D8ulNPWsf1kmxQQynAhHVvNzGN/RoXyOw7coqZUTzXmE1EzvIaopouyi5g1zyQGchdlq0ubZtyn6dSLTR1vkI+goGo57tMRkoKKmcXUtvwOlOTUO99Cm0wS5Tp0bRropzP05SrK1BQykWNqQULhHeqsv+722mkFpM4NvBn8SH0e5JgpNkoBKWXiZj3fl+F8H59jjlal/LS/57U3u3bV7Ojydkv0AfVy1l9UAUHRDJboL3Pfl9f+mYolZPZBjdwE1LS73wny+GmQUkBKsd7gXifqeKmU7Es8ywny3kDJlTXjP6m9dtJPmxiwgwBRDHJK1XtiyeiEpRIQiLOL33Jm0dvIs3xxgwgO0K7rjHqg4pw2sQb4nS+K4E6QL2SCFU5AOQZ7rEMfpuokYWK6enL3+RLoG4eoJ00cXc8kitVRN6tc6p6hejkJuRGU6fhSEc6Bcno70svqV3VlZi5NQE9or51LLxJmy7Fnpowj5skmowVzwSin8yySd6ryNfC9mnddzIuvNr1DnqlyPNcgySXPufruNOCI/B4Oxk9LfC4DWXUSwsz7rjNR/XL2kWeoHNtt7ZxW5k6t4HI1/bqHup2BKGdotyqORjnWqznu/dl9j3gaXiRY+MhbyWiEHNNbsPrV8wZOrLPXVL4xvjf1CUgNniubfgXfh4EPpaP8HzEC2he0UZd91GdT/b0uTLyVvBHaZazap7rkPUdrLsNO47sE+QzVIHZqYsExvSXOZ91xmnB8TvVSMmbFGpzLbmn4ylsenkbIawLn5XWI0GSW91T3J6WEVvlcxgDVWxGyUA8M7gnq9lTV/TWctSZjkjOKxIvCVLWBbhdZPDmFWd7X5VCm4Yy08IwKyCcfMbtget2f20Il5MhojBlvrJaFPyg53coarEs4WuupVZoNqZNbDP72kubNxFvpErVYX6ZfwAHch2lf9F6pHohkpIhlbgKKD0tICOq+qdSMP+ES6yYgNFZfk4/nE3KN08/aM7LoT4ssfeXsqzlT1oO89Tqc7weRzYdXiUE0duZZFglBUTUjUn2TfEBusNbyrIRh93HDJywsow8xOX3I2L8jK1Rn5mFDYuG+FPiWWk7Vqt8zIKUbR5ogJfdaTjPHFoJV8P6ZvrtdJhj29jQwGDuBhj2WfRsgp63ZB6Tf+wIpNDALOhNLPl9gELawY/o0UDfOfzBJ7JYeo2O31mWq3j2hIUR9SFlAHnXUxW2EVFto+6tI3xhhApP6mQb8X1VlwgkB9FMDXggPDn3//KEJO74XSBHtNQwovIlZ3K09RXt9zFlt1RX9R09ur50mINSLyOFOoo46nm8k2P5FTmgF3MNtkpuY+CsCRpFHP2GyvMJgHIKsZ6iP12bRIR0zK4r0Af1o8r+K8GPKPMUG1DEUg97851aKqlmkikE/Ng8v6Po+sxnIYJSx4a+PfKK0e157NBWJtXIooTeqfYxJbyLNgzPzsFDhXlEZLtEGT26vncI+vIzqlberXq50rxakdgrHzh8FXpa8DJmm2/AyqvPLeK9K6L1Oh+vqO8pU66r9Vfr1iTP3PFvSF/kyaiTtXTgO+Hicf8CZVJL3TYyAEuE4Ds3D0m4/ZLbmUIvE7oPhOGJjdM8DkrVixEPyIIg1+4D+8Z+/7E3BUdbx3//955d//M3fvmbkI/YIP/z6r6yE5yCgPYOYYQ2YYEmnpCWo4HlLXgsREW2+60i+jayAULlQpkcREUMkvanlIkhAGwVROfZQ9QhCVllkZWfiDb6Gzfcx436H+H7TqH1E9rzcS1ZsRvYeseXlTdoJ7ddR20Q2JdrrQtTtGMkWTYz299yqYmypW57lfN0kCEUsz1RzfYeKqSACQsMnB6G9Po+IKANsi2bAoczq9nlreO5kRER7vWXzXUTUTq6IiDb/KKWKCkIhEfZQtlwREW1e6RtXISUFEnPKshF5jvuIiLpudF8C+YxNRkREm2/bIiISKQJCRxxjsIYGoXtNY94R7TE2yy/rua2sgYCaKMOlPzjsOfd2tHthchKrF/MQkGvomSUyEE5B0I6MRBXJ8cIjjaKUj5BPN2cdnJp4iE9HOPWIchPCOUfdDe3xUT6Qz8QsvgEfQlWR2aM+pghG0IwQuNTzZ+Q7TZmW0nbuWdGOI3V/t59npJ/jh7tMRVNTZSEKVEC3MCPq6GjGNYwin/kstk0KCGW4sM+bGRHR5s0VETHhuN6qiIiok3qCfPyyOALueAR9HxExx3069jsDqJhZwuTtQUlOvfMtkxERESq3D0XrX34UEdHmaYPw1hERkYj5gGQAosFajoSUijCY+bctLpAzHXvofA1P/p/BtJLO/ipQJ9eoB03ObfghrtQgbHu+pdALqZvmA2qhTTNNRUw6I3yn4/nT8pKY/k4NdVmLqOmxCe92nprEaxhoiyHu79q8iqNbNGi6CcfmP0E+UWVSjiwSGhuG5CiHgEIkpE2ZJcmnEltBQke5K5l0jjAjn6qO3PIHm/0sM3ITpqfzDzVQ9q+q00+UmTZ/2dTmH5qH+EE1o143yBooBSq8rHpIqYSaWS4cxgimpXz3OkZiuN7zzJQx/GK3ILMW6ieoEsXJLKZf5NkvM0i1jra+8Myxc2UuTuAXPIfyH+NZzjPqQO59gmc/JY2sjheJTv0oIuIWKp+WKTgiokh0m5IRETFwat59tQ+IERG/9bG1RUSEz2gG0+9RRETlWGdExE0gIKiHhvaT4Nw2YWhKiogoHdamhYiIoqSUCRIjoH0BIyISq5lgnsN5qGW2dkxvOrznvI+IaMsw1UvJmBXns7gyI64882VqEhERAz6UmpvlPRNoLyIioj7e5TCRjVljREQxx+F4X4iICL/RsmqQKFoB+eQjZhdMr/tzW6iEHBmNMeOJ76aLtFRERPg28g7UyYbXycoRET1ns6jF+jL9An6YPkz70iIiKmKZm4CyGAGfYMMwIuJmKSA0Vl+Tj/YJKcd0H6shWSsedwUs1ed1VFcyOryLiDjyTMv7ncyiimQQRRTe2Jln2Ix3nfitgTI5TMAH9NzKxx+s4owdZPn4sFrU8OpP+sZHOOOHcOb3Eq+lHOA3W6akiIhQnS209RTP5lYlR9j35ZzOdexpq0PJ3ubYB0SUQUBYmWhgMHYCDXuMxhtu0z4gtfmwgU7XwCzoTCz5fAHiaGFl5DRQN85/MEnslh6bwApMyeW7e8JgvcZgHWIJuhFaSnd1g7a/ivSN+4iIYuaaHBERU8v2Qnhw6PvnMyMighRrZomIiFmv4AQmLW5ELFgBGdjMnQS5dDzfyNJqZElsTEREDJZXGIxDkPUM9bEQETGhkDYuIiLI9z4iorf5byEiYopUMejHJkdExIwNf/cREe39embFiIj4jTeqfYxJbyLNg6dERCT8wa3j3exa6InI295ds/i+kwwSUTyVyCwcu8+ReVhq1gTWDLymUBYBFVo/6oXUlleuoQm811aWAlbvJLpnqXkkNoQSuy7jGfhyKQmoTAIKRkS0ed8sQ0DKFLiPiBgyW8scqEQ5IAGRgEojIJ+IYsRD8iABEWsmIIIgiOcioJ9s+p13PXSOIAiiUAISovmtTf9ShBM6l4Wfbfpl5Nr/bPoFq5wgiJgCcoRjViAfQZY9V2GVEwQRIiBNQmYF8iEBLYdN2QlNEM+GMoLSV1Ykp7x5SWIEQRMsShyVFa7tMwFR+RB7r4BSTuhlVsJ+TpDHfwtQUQRB7LAC4jL85igfKiFi56HjAYWIhuRDEMRaFBCxmUqIIPZCAREEQVABUflQCRFUQARBEFRABEGQgAiCIEhABEGQgAiCIEhABEFsJ+arYJXK/NWrEzm6ZCEB18/wN0EQROGYv4xqVdD8X9XYY90SzrE9CvmMbarav+XfoJyyqgiCKMsE0//RU44NXHf/yO+WVUUQRCkEJGaWPR6AcGq4Jv/vqmWv3dJPRBBEGfB3Quv/hllj9RAEUToBQf2MQUBD8+3f387NMVwjCIIoTQG1QThDcUKbb34fR0JtVhNBEGVA+4CO7PHCXcBKmPiAOvQBEQRRGgERBEGQgAiCIAERBEGQgAiCIAERBEGQgAiCIAERBEGQgAiCIAERBEGsgv8LMAAxp6r1O/UvQwAAAABJRU5ErkJggg==)}div#ffPreviewUI a.ffp:hover{background-color:rgba(255,255,255,.2)}div#ffPreviewUI a.ffp span{display:none}div#ffPreviewUI a.ffp.closeffp{background-position:-00px -36px}div#ffPreviewUI a.ffp.maximize{background-position:-18px -36px}div#ffPreviewUI a.ffp.minimize{background-position:-36px -36px}div#ffPreviewUI a.ffp.light{background-position:-54px 0}div#ffPreviewUI a.ffp.cube{background-position:-72px 0}div#ffPreviewUI a.ffp.material{background-position:-90px 0}div#ffPreviewUI a.ffp.plane{background-position:-108px 0}div#ffPreviewUI a.ffp.sphere{background-position:-126px 0}div#ffPreviewUI a.ffp.torus{background-position:-144px 0}div#ffPreviewUI a.ffp.cylinder{background-position:-162px 0}div#ffPreviewUI a.ffp.knot{background-position:-180px 0}div#ffPreviewUI a.ffp.info{background-position:-198px 0}div#ffPreviewUI a.ffp.flatplane {	background-position: -216px 0; }div#ffPreviewUI ul.ffp,div#ffPreviewUI ul.content{list-style:none;margin:0;padding:0}div#ffPreviewUI ul.content{background-color:#333;font-size:.75em}div#ffPreviewUI ul.content li{display:none;margin:0;padding:4px 8px}div#ffPreviewUI li.info p.message{color:#800;background:#ffffc8;padding:1px 2px}div#ffPreviewUI ul.ffp li{display:block;width:18px;height:18px;float:left;margin:0;padding:0}div#ffPreviewUI ul.ffp.topMenu{position:absolute;top:2px;left:73px}div#ffPreviewUI ul.ffp.closeMenu{position:absolute;top:0;right:0}div#ffPreviewUI ul.ffp.closeMenu li{width:10px;height:10px;overflow:hidden}#ffPreviewContainer{position:absolute;left:0;bottom:0}.stats{position:absolute;top:0}</style>').appendTo($Preview);
			var sUI = '<div id="ffPreviewUI"><h3><a href="http://ffpreview.sjeiti.com" target="_blank">ffPreview</a></h3><ul class="ffp topMenu"><li><a class="ffp light"><span>*</span></a></li><li><a class="ffp cube"><span>[]</span></a></li><li><a class="ffp material"><span>#</span></a></li><li><a class="ffp info"><span>i</span></a></li></ul><ul class="content"><li class="light">lighting options placeholder<!--p class="angle"></p--></li><li class="cube"><ul class="ffp"><li><a class="ffp flatplane" title="flatplane"><span>[[]]</span></a></li><li><a class="ffp cube" title="cube"><span>#</span></a></li><li><a class="ffp plane" title="plane"><span>[]</span></a></li><li><a class="ffp sphere" title="sphere"><span>O</span></a></li><li><a class="ffp torus" title="torus"><span>@</span></a></li><li><a class="ffp cylinder" title="cylinder"><span>p</span></a></li><li><a class="ffp knot" title="knot"><span>&</span></a></li></ul><br/></li><li class="material"><div><div class="repeatx">repeat x: <a class="lt"><</a><span>1</span><a class="gt">></a></div><div class="repeaty">repeat y: <a class="lt"><</a><span>1</span><a class="gt">></a></div></div></li><li class="info"><p class="about">Created by <a href="http://sjeiti.com/" target="_blank">Sjeiti</a> in <a href="http://github.com/mrdoob/three.js" target="_blank">three.js</a>.</p></li></ul><ul class="ffp closeMenu"><li><a class="ffp minimize"><span>_</span></a></li><li><a class="ffp maximize"><span>[]</span></a></li><li><a class="ffp closeffp"><span>x</span></a></li></ul></div>';
			$UI = $(sUI).appendTo($Preview);
		}
		//
		if ( bStats ) {
			mStats = new Stats();
			$(mStats.domElement).appendTo($Preview).addClass('stats');
		}
		//
		$LightGrad = $UI.find('p.angle');
		//
		// topmenu
		var $ContentLi = $UI.find('ul.content>li');
		$UI.find('ul.topMenu>li>a').click(function(e){
			var $A = $(e.currentTarget);
			$ContentLi.each(function(i,el){
				var $Li = $(el);
				if ($Li.attr('class')==$A.attr('class').replace('ffp ','')) {
					$Li.addClass('sel').slideDown('fast');
				} else {
					$Li.removeClass('sel').slideUp('fast');
				}
			});
		});
		$UI.hover(function(e){
			$ContentLi.filter('.sel').slideDown('fast');
		},function(e){
			$ContentLi.slideUp('fast');
		});
//		$UI.mouseleave(function(e){
//			$ContentLi.slideUp('fast');
//		});
		//
		// content
		// objects
		$ContentLi.filter('.cube').find('ul>li>a').each(function(i,el){
			var $A = $(el);
			var sType = $A.attr('class').replace('ffp ','');
			$A.click(function(e){
				addObject(sType);
				bMouseObj = sType!='flatplane';
			});
		});
		//
		// HIDE ##############
		if (!bDebug) {
			$UI.find('ul.topMenu>li:has(a.light)').hide();
			$UI.find('ul.topMenu>li:has(a.material)').hide();
			$UI.find('ul.closeMenu>li>a.minimize').hide();
			$UI.find('ul.closeMenu>li>a.maximize').hide();
			$UI.find('ul>li:has(a.knot)').hide();
		}
		//
		// minimize/maximize/close
		$UI.find('a.minimize').click(function(e){
			$UI.find('.about').toggle('fast');
		});
		$UI.find('a.closeffp').click(function(e){
			$UI.remove();
			$(mContainer).remove();
			$(mStats.domElement).remove();
			document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
			$Preview.unbind('mousewheel',handleMouseWheel);
			bInited = false;
		});
		if (!Detector.webgl) {
			$('<p class="message">Reverting to software 3D rendering. To enable WebGL use Chrome (Windows: Chrome.exe --use-gl=desktop) or Firefox 4 (iOS: about:config => webgl.mochitest_native_gl=true)</p>').prependTo($UI.find('ul.content>li.info').show());
		}
	}

	function onDocumentMouseMove(e) {
		var oPrv = $Preview.position();
		mouseX = e.clientX - oPrv.left + $Body.scrollLeft() - mouseMoveX;
		mouseY = e.clientY - oPrv.top  + $Body.scrollTop()  - mouseMoveY;
//		trace('mouseX:',mouseX,mouseY,$Body.scrollTop()); // TRACE ### mouseX
	}

	function handleMouseWheel(e,delta){
		if (!bMouseObj) {
			lightMesh.position.z = Math.min(Math.max(lightMesh.position.z+10*delta,0),500);
		}
		return false;
	}

	function animate() {
		if (bInited) requestAnimationFrame(animate);
		render();
		if (bStats) mStats.update();
	}

	function render() {
		if (bMouseObj) { // mouse moves object
			var ry = 10*mouseX*fCameraSpeed
			var rx = 10*mouseY*fCameraSpeed;
			if (oMesh) {
				oMesh.rotation.y = ry;
				oMesh.rotation.x = rx;
				//oMesh.rotation.y += .01;
			}
			// light
			//iLightGrad += 1;
			//while (iLightGrad>360) iLightGrad -= 360;
			$LightGrad.text(iLightGrad);
			var fLightRad = iLightGrad/180*Math.PI;
			lightMesh.position.x = 2500*Math.cos(fLightRad);
			lightMesh.position.z = 2500*Math.sin(fLightRad);
		} else { // mouse moves light
			lightMesh.position.x = mouseX;
			lightMesh.position.y = -mouseY;
		}
		oRenderer.render( oScene, oCamera );
	}
	// cookie stuff
	function cookieJar(set) {
		if (set) { // set the cookie
			var sCval = '{';
			sCval += '"sObjectType":"'+sObjectType+'"';
			sCval += '}';
			trace("sfb set cookie: "+sCval);
			createCookie(sId,sCval,356);
		} else { // get the cookie
			var sCookie = readCookie(sId);
			trace("sfb get cookie: "+sCookie);
			try {
				oCookie = eval("("+sCookie+")");
				sObjectType = oCookie.sObjectType;
			} catch (e) {
				trace("sfb cookie error: "+sCookie);
				eraseCookie(sId);
			}
		}
	}
	function createCookie(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = 	name+"="+value+expires+"; path=/";
	}
	function readCookie(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	function eraseCookie(name) {
		createCookie(name,"",-1);
	}
}());