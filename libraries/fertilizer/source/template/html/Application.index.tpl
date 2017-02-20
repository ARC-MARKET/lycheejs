<!DOCTYPE html>
<html manifest="index.appcache">
<head>
	<meta charset="utf-8">
	<title>${id}</title>

	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<link rel="manifest" href="./manifest.json">
	<link rel="icon" href="./icon.png" sizes="128x128" type="image/png">

	<script src="./core.js"></script>

	<style>
		body {
			margin: 0;
			padding: 0;
			overflow: hidden;
		}
		
		.lychee-Renderer-canvas {
			display: block;
			margin: 0 auto;
			user-select: none;
			-moz-user-select: none;
			-ms-user-select: none;
			-webkit-user-select: none;
		} 
	</style>

</head>
<body>
<script>
(function(lychee, global) {

	let environment = lychee.deserialize(${blob});
	if (environment !== null) {
		lychee.envinit(environment, ${profile});
	}

})(lychee, typeof global !== 'undefined' ? global : this);
</script>
</body>
</html>
