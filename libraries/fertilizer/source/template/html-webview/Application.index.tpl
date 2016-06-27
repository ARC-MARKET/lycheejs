<!doctype html>
<html>
<head>
	<title>${id}</title>
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />

	<script src="./core.js"></script>

	<style>
		body {
			margin: 0;
			padding: 0;
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

	var environment = lychee.deserialize(${blob});
	if (environment !== null) {
		lychee.envinit(environment, ${profile});
	}

})(lychee, typeof global !== 'undefined' ? global : this);
</script>
</body>
</html>
