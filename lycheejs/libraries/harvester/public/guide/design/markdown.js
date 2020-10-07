
(function(global, $) {

	/*
	 * HELPERS
	 */

	const _EMOJI = {
		'book':         String.fromCodePoint(0x1f4d5),
		'bug':          String.fromCodePoint(0x1f41b),
		'construction': String.fromCodePoint(0x1f6a7),
		'ghost':        String.fromCodePoint(0x1f47b),
		'rainbow':      String.fromCodePoint(0x1f308),
		'robot':        String.fromCodePoint(0x1f916),
		'rocket':       String.fromCodePoint(0x1f680),
		'satellite':    String.fromCodePoint(0x1f4e1),
		'snowflake':    String.fromCodePoint(0x2744),
		'sparkles':     String.fromCodePoint(0x2728)
	};

	const _format_code = function(code, lang) {

		let highlight = global.$highlight || null;
		if (highlight !== null) {
			code = highlight(code, lang);
		}

		return code;

	};

	const _format_href = function(url) {

		if (url.startsWith('/guides/')) {

			url = '#!' + url.substr(8);

			if (url.endsWith('.md')) {

				if (url.startsWith('/')) {
					url = url.substr(1);
				}

				url = '#!' + url.substr(0, url.length - 3);

			}

		} else if (url.startsWith('/bin/')) {
			url = 'lycheejs://file=' + url;
		} else if (url.startsWith('/libraries/')) {
			url = 'lycheejs://file=' + url;
		} else if (url.startsWith('../')) {

			let hash = global.location.hash || '';
			if (hash.startsWith('#!') === true) {

				let path_cwd = hash.substr(2).split('/').slice(0, -1);
				let path_url = url.split('/');

				for (let p = 0, pl = path_url.length; p < pl; p++) {

					let tmp = path_url[p];
					if (tmp === '..') {
						path_url.splice(p, 1);
						path_cwd.splice(path_cwd.length - 1, 1);
						pl--;
						p--;
					}

				}

				url = path_cwd.join('/') + '/' + path_url.join('/');

				if (url.endsWith('.md')) {

					if (url.startsWith('/')) {
						url = url.substr(1);
					}

					url = '#!' + url.substr(0, url.length - 3);

				}

			}

		} else if (url.startsWith('./')) {

			let hash = global.location.hash || '';
			if (hash.startsWith('#!') === true) {

				let path_cwd = hash.substr(2).split('/').slice(0, -1);
				let path_url = url.split('/').slice(1);

				url = path_cwd.join('/') + '/' + path_url.join('/');

				if (url.endsWith('.md')) {

					if (url.startsWith('/')) {
						url = url.substr(1);
					}

					url = '#!' + url.substr(0, url.length - 3);

				}

			}

		}

		return url;

	};

	const _format_src = function(url) {

		if (url.startsWith('../')) {

			let hash = global.location.hash || '';
			if (hash.startsWith('#!') === true) {

				let path_cwd = hash.substr(2).split('/').slice(0, -1);
				let path_url = url.split('/');

				for (let p = 0, pl = path_url.length; p < pl; p++) {

					let tmp = path_url[p];
					if (tmp === '..') {
						path_url.splice(p, 1);
						path_cwd.splice(path_cwd.length - 1, 1);
						pl--;
						p--;
					}

				}

				url = '/guides/' + path_cwd.join('/') + '/' + path_url.join('/');

			}

		} else if (url.startsWith('./')) {

			let hash = global.location.hash || '';
			if (hash.startsWith('#!') === true) {

				let path_cwd = hash.substr(2).split('/').slice(0, -1);
				let path_url = url.split('/').slice(1);

				url = '/guides/' + path_cwd.join('/') + '/' + path_url.join('/');

			}

		}

		return url;

	};

	const _render_inline = function(str) {

		let loop = true;

		while (loop === true) {

			let check_a   = str.includes('[') && str.includes('](') && str.includes(')');
			let check_b   = str.includes('**');
			let check_em  = str.includes('`');
			let check_img = str.includes('![') && str.includes('](') && str.includes(')');

			let check_emoji = false;
			let check_hr    = false;

			if (str.length > 3 && str.startsWith(':') && str.endsWith(':')) {

				let tmp = str.slice(1, -1);
				if (tmp.length === tmp.split('').filter(v => v === '-').length) {

					check_hr = true;

				} else {

					let emoji = _EMOJI[tmp] || null;
					if (emoji !== null) {
						check_emoji = true;
					}

				}

			} else if (str.length > 3 && str.startsWith('-') && str.endsWith('-')) {

				let tmp = str.split('').slice(1, -1);
				if (tmp.length === tmp.filter(v => v === '-').length) {
					check_hr = true;
				}

			}


			if (check_emoji === true) {

				str = _EMOJI[str.slice(1, -1)];

			} else if (check_hr === true) {

				str = '<hr>';

			} else if (check_img === true) {

				let c0 = str.indexOf('![');
				let c1 = str.indexOf('](', c0 + 2);
				let c2 = str.indexOf(')',  c1 + 2);

				if (c1 !== -1) {

					let check = str.lastIndexOf('![', c1);
					if (check !== c0) {
						c0 = check;
					}

				}

				if (c0 !== -1 && c1 !== -1 && c2 !== -1) {

					let title = str.substr(c0 + 2, c1 - c0 - 2);
					let state = 'normal';

					let src = _format_src(str.substr(c1 + 2, c2 - c1 - 2));
					if (src.endsWith('.png') || src.endsWith('.svg')) {
						state = 'wide';
					}

					str = str.substr(0, c0) + '<img class="' + state + '" src="' + src + '" title="' + title + '" alt="' + title + '">' + str.substr(c2 + 1);

				} else if (c0 !== -1 && c1 !== -1) {
					str = str.replace('![', '');
					str = str.replace('](', '');
				} else if (c0 !== -1) {
					str = str.replace('![', '');
				}

			} else if (check_b === true) {

				let c0 = str.indexOf('**');
				let c1 = str.indexOf('**', c0 + 2);

				if (c0 !== -1 && c1 !== -1) {
					str = str.substr(0, c0) + '<b>' + str.substr(c0 + 2, c1 - c0 - 2) + '</b>' + str.substr(c1 + 2);
				} else if (c0 !== -1) {
					str = str.replace('**', '');
				}

			} else if (check_em === true) {

				let c0 = str.indexOf('`');
				let c1 = str.indexOf('`', c0 + 1);

				if (c0 !== -1 && c1 !== -1) {

					let chunk = str.substr(c0 + 1, c1 - c0 - 1);
					let code = _format_code('\n' + chunk + '\n', 'ecmascript');
					if (code !== '') {

						if (code.startsWith('\n')) code = code.substr(1);
						if (code.endsWith('\n'))   code = code.substr(0, code.length - 1);

						str = str.substr(0, c0) + '<code>' + code + '</code>' + str.substr(c1 + 1);

					} else {
						str = str.replace('`', '');
					}

				} else if (c0 !== -1) {
					str = str.replace('`', '');
				}

			} else if (check_a === true) {

				let c0 = str.indexOf('[');
				let c1 = str.indexOf('](', c0 + 1);
				let c2 = str.indexOf(')',  c1 + 2);

				if (c1 !== -1) {

					let check = str.lastIndexOf('[', c1);
					if (check !== c0) {
						c0 = check;
					}

				}

				if (c0 !== -1 && c1 !== -1 && c2 !== -1) {
					let href = _format_href(str.substr(c1 + 2, c2 - c1 - 2));
					str = str.substr(0, c0) + '<a href="' + href + '">' + str.substr(c0 + 1, c1 - c0 - 1) + '</a>' + str.substr(c2 + 1);
				} else {
					loop = false;
				}

			} else {
				loop = false;
			}

		}

		return str;

	};

	const _render = function(buffer) {

		let article  = $('article');
		let element  = null;
		let elements = [];


		buffer.split('\n').forEach((line, l) => {

			let chunk = line.trim();
			if (chunk === '' && element !== null) {

				if (/^(pre|ul|ol|p)$/g.test(element.type) === false) {
					element = null;
				}

			}


			if (element !== null && element.type === 'pre') {

				if (chunk === '```') {

					let text = _format_code((element._raw || '') + '\n', element.get('state'));
					if (text !== '') {

						if (text.endsWith('\n')) {
							text = text.substr(0, text.length - 1);
						}

						text.split('\n').slice(1).map(raw => $('code').set({
							html: raw
						})).forEach(code => code.appendTo(element));

					}

					element = null;
				} else {
					element._raw += '\n' + line;
				}

			} else if (element !== null && element.type === 'p') {

				if (chunk === '') {
					element = null;
				} else {
					element.html(element.get('html') + ' ' + _render_inline(chunk));
				}

			} else if (element !== null && element.type === 'table') {

				if (chunk === '') {
					element = null;
				} else {

					let tbody = element.query('tbody');
					if (tbody !== null) {

						let row = $('tr');
						let tmp = chunk.split('|').slice(1, -1).map(v => v.trim());
						if (tmp.length > 0) {

							tmp.map(str => $('td').set({
								html: _render_inline(str)
							})).forEach(td => td.appendTo(row));
							row.appendTo(tbody);

						}

					}

				}

			} else if (chunk.startsWith('```')) {

				if (element === null || element.type !== 'pre') {
					element = $('pre');
					element._raw = '';
				}

				if (chunk.length > 3) {

					let lang = chunk.substr(3).trim();
					element.state(lang);

				} else if (element !== null) {
					element = null;
				}

			} else if (chunk.startsWith('|') && chunk.endsWith('|')) {

				if (element === null || element.type !== 'table') {
					element = $('table');
					$('thead').appendTo(element);
					$('tbody').appendTo(element);
				}

				let thead = element.query('thead');
				if (thead !== null) {

					let row = $('tr');
					let tmp = chunk.split('|').slice(1, -1).map(v => v.trim());
					if (tmp.length > 0) {

						tmp.map(str => $('th').set({
							html: _render_inline(str)
						})).forEach(th => th.appendTo(row));
						row.appendTo(thead);

					}

				}

			} else if (chunk.startsWith('#')) {

				let type = null;
				let tmp  = chunk.split(' ').shift().trim();

				if (/#/g.test(tmp) === true) {

					if (tmp === '#') {
						type = 'label';
					} else if (tmp === '##') {
						type = 'h1';
					} else if (tmp === '###') {
						type = 'h2';
					} else if (tmp === '####') {
						type = 'h3';
					}

				}

				if (type !== null) {

					element = $(type).set({
						html: _render_inline(chunk.split(' ').slice(1).join(' '))
					});

				}

			} else if (chunk.startsWith('* ') || chunk.startsWith('- ')) {

				if (element === null || element.type !== 'ul') {
					element = $('ul');
				}

				$('li').set({
					html: _render_inline(chunk.substr(2).trim())
				}).appendTo(element);

			} else if (/^([0-9]+)\./g.test(chunk)) {

				if (element === null || element.type !== 'ol') {
					element = $('ol');
				}

				$('li').set({
					html: _render_inline(chunk.split('.').slice(1).join('.'))
				}).appendTo(element);

			} else if (chunk !== '') {

				if (element === null || element.type !== 'p') {
					element = $('p');
				}

				element.set({
					html: _render_inline(chunk)
				});

			}


			if (element !== null && elements.includes(element) === false) {
				elements.push(element);
			}

		});


		elements.forEach(element => element.appendTo(article));


		return article;

	};



	/*
	 * IMPLEMENTATION
	 */

	const MARKDOWN = {

		render: function(stuff) {

			let path = stuff.url;
			if (path.includes('/guides/')) {
				path = path.split('/guides/').pop();
			} else if (path.startsWith('/')) {
				path = path.substr(1);
			}

			if (path.endsWith('.md')) {
				path = path.substr(0, path.length - 3);
			}

			let buffer  = stuff.buffer.toString('utf8');
			let article = _render(buffer);
			if (article !== null) {
				article.set({
					'data-id': path
				});
			}

			return article;

		}

	};


	global.$MARKDOWN = MARKDOWN;

})(typeof window !== 'undefined' ? window : this, window.$);

