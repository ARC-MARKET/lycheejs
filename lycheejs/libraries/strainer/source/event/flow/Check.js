
lychee.define('strainer.event.flow.Check').requires([
	'lychee.Package',
	'lychee.Stash',
	'strainer.api.PARSER',
	'strainer.plugin.API'
]).includes([
	'lychee.event.Flow'
]).exports((lychee, global, attachments) => {

	const _plugin    = {
		API: lychee.import('strainer.plugin.API')
	};
	const _Flow      = lychee.import('lychee.event.Flow');
	const _Package   = lychee.import('lychee.Package');
	const _Stash     = lychee.import('lychee.Stash');
	const _PARSER    = lychee.import('strainer.api.PARSER');
	const _PLATFORMS = lychee.PLATFORMS;
	const _STASH     = new _Stash({
		type: _Stash.TYPE.persistent
	});



	/*
	 * HELPERS
	 */

	const _trace_dependencies = function() {

		let configs      = this.configs;
		let dependencies = [];

		configs.filter(config => config !== null).map(config => {

			let source = config.buffer.source;
			if (source !== null) {
				return source.header;
			} else {
				return { requires: [], includes: [] };
			}

		}).forEach(header => {

			let requires = header.requires || [];
			if (requires.length > 0) {
				requires.filter(id => dependencies.includes(id) === false).forEach(id => {
					dependencies.push(id);
				});
			}

			let includes = header.includes || [];
			if (includes.length > 0) {
				includes.filter(id => dependencies.includes(id) === false).forEach(id => {
					dependencies.push(id);
				});
			}

		});

		dependencies = dependencies.filter(identifier => {

			let config = configs.find(other => {

				let buffer = other.buffer;
				if (buffer !== null) {
					return identifier === buffer.source.header.identifier;
				}

				return false;

			}) || null;

			if (config !== null) {
				return false;
			}

			return true;

		});

		return dependencies;

	};

	const _trace_memory = function(memory, chunk, scope) {

		scope = scope instanceof Object ? scope : null;


		let values = [];


		if (chunk.startsWith('_')) {

			let tmp      = chunk.split('.');
			let variable = memory[tmp.shift()];

			if (variable !== undefined) {

				if (variable.value !== undefined && variable.value instanceof Object) {

					let identifier = variable.value.reference;
					let config     = this.configs.find(other => {

						if (other !== null) {

							let buffer = other.buffer;
							if (buffer !== null) {
								return identifier === buffer.source.header.identifier;
							}

						}

						return false;

					}) || null;

					if (config !== null) {

						let memory = config.buffer.source.memory;
						let result = config.buffer.source.result;
						let check  = tmp.shift();

						if (check === 'prototype') {

							let mid    = tmp.shift();
							let method = _trace_method.call(this, mid, config);
							if (method !== null) {

								if (method.values.length === 1) {

									let value = method.values[0];
									if (value.type === 'undefined' && value.chunk !== undefined) {
										return _trace_memory.call(this, memory, value.chunk, scope);
									} else {
										values.push(value);
									}

								} else {

									for (let v = 0, vl = method.values.length; v < vl; v++) {
										values.push(method.values[v]);
									}

								}

							}

						} else if (check === check.toUpperCase()) {

							let enam = result.enums[check] || null;
							if (enam !== null) {

								let name  = tmp.shift();
								let value = enam.values.find(val => val.name === name) || null;
								if (value !== null) {

									values.push({
										chunk: chunk,
										type:  value.value.type,
										value: value.value.value
									});

								}

							}

						}

					}

				} else if (variable.values !== undefined && variable.values instanceof Array) {

					let check = tmp.shift();
					if (check.startsWith('call(') || check.startsWith('(')) {

						for (let v = 0, vl = variable.values.length; v < vl; v++) {
							values.push(variable.values[v]);
						}

					}

				} else if (variable.value !== undefined) {
					values.push(variable.value);
				}

			}

		} else if (chunk.startsWith('this.')) {

			let path    = chunk.split('.').slice(1);
			let pointer = scope[path[0]] || null;
			if (pointer !== null) {

				if (pointer.value !== undefined && pointer.value.type === 'Object') {

					let tmp = pointer.value.value;
					if (tmp instanceof Object) {

						for (let p = 1, pl = path.length; p < pl; p++) {

							let prop = path[p];
							if (
								/^([A-Za-z0-9_]+)$/g.test(prop)
								&& pointer.value !== undefined
								&& pointer.value.type === 'Object'
							) {

								pointer = _PARSER.detect(pointer.value.value[prop]);

							} else {

								pointer = null;
								break;

							}

						}

					}

				}


				if (pointer !== null) {
					values.push(pointer);
				}

			}

		}


		return values;

	};

	const _trace_method = function(mid, config) {

		let configs = this.configs;
		let header  = config.buffer.source.header;
		let result  = config.buffer.source.result;


		let found = null;

		if (result.methods[mid] !== undefined) {

			found = result.methods[mid];

		} else {

			for (let i = 0, il = header.includes.length; i < il; i++) {

				let identifier = header.includes[i];
				let definition = configs.find(other => {

					let buffer = other.buffer;
					if (buffer !== null) {
						return identifier === buffer.source.header.identifier;
					}

					return false;

				}) || null;

				if (definition !== null) {

					let check = _trace_method.call(this, mid, definition);
					if (check !== null) {
						found = check;
						break;
					}

				}

			}

		}

		return found;

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data) {

		let states = Object.assign({}, data);


		this.configs = [];
		this.errors  = [];
		this.reviews = [];
		this.sources = [];

		this.debug   = false;
		this.project = null;
		this.stash   = new _Stash({
			type: _Stash.TYPE.persistent
		});

		this.__namespace = null;
		this.__packages  = {};


		this.setDebug(states.debug);
		this.setProject(states.project);


		_Flow.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('read-package', function(oncomplete) {

			let project = this.project;
			if (project !== null) {

				console.log('strainer: CHECK/READ-PACKAGE "' + project + '"');


				if (project !== '/libraries/lychee') {

					console.log('strainer: -> Mapping /libraries/lychee/lychee.pkg as "lychee"');

					this.__packages['lychee'] = new _Package({
						id:  'lychee',
						url: '/libraries/lychee/lychee.pkg'
					});

				}


				let pkg = new _Package({
					url:  project + '/lychee.pkg',
					type: 'source'
				});

				console.log('strainer: -> Mapping ' + pkg.url + ' as "' + pkg.id + '"');

				setTimeout(_ => {
					this.__namespace        = pkg.id;
					this.__packages[pkg.id] = pkg;
					oncomplete(true);
				}, 200);

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('trace-package', function(oncomplete) {

			let errors    = this.errors;
			let project   = this.project;
			let namespace = this.__namespace;

			if (project !== null && namespace !== null) {

				console.log('strainer: CHECK/TRACE-PACKAGE "' + project + '"');


				let pkg = this.__packages[namespace] || null;
				if (pkg !== null) {

					pkg.setType('build');

					let environments = pkg.getEnvironments();
					if (environments.length > 0) {

						environments.forEach(env => {

							let pkgs = env.pkgs || null;
							if (pkgs instanceof Array) {

								errors.push({
									url:     pkg.url,
									rule:    'pkg-error',
									line:    0,
									column:  0,
									message: 'Invalid settings for Environment "' + env.id + '" (Invalid packages).'
								});

							} else if (pkgs instanceof Object) {

								for (let ns in pkgs) {

									let url = pkgs[ns];
									if (url === './lychee.pkg') {
										url = project + '/lychee.pkg';
									}

									if (pkgs[ns] === undefined) {

										console.log('strainer: -> Mapping ' + url + ' as "' + ns + '"');

										this.__packages[ns] = new _Package({
											id:  ns,
											url: url
										});

									} else if (this.__packages[ns].url !== url) {

										errors.push({
											url:     pkg.url,
											rule:    'pkg-error',
											line:    0,
											column:  0,
											message: 'Invalid settings for Package "' + ns + '" in Environment "' + env.id + '" (Invalid url).'
										});

									}

								}

							}

						});

					}

					pkg.setType('source');


					let interval_end = Date.now() + 1000;
					let interval_id  = setInterval(_ => {

						let all_ready = true;

						for (let ns in this.__packages) {

							let pkg = this.__packages[ns];
							if (pkg.config === null) {
								all_ready = false;
								break;
							}

						}

						if (all_ready === true) {

							clearInterval(interval_id);
							oncomplete(true);

						} else if (Date.now() > interval_end) {

							for (let ns in this.__packages) {

								let pkg = this.__packages[ns];
								if (pkg.config === null) {

									errors.push({
										url:     pkg.url,
										rule:    'pkg-error',
										line:    0,
										column:  0,
										message: 'Invalid Package "' + ns + '".'
									});

								}

							}

							clearInterval(interval_id);
							oncomplete(true);

						}

					}, 100);

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(false);
			}

		}, this);



		/*
		 * SOURCES
		 */

		this.bind('read-sources', function(oncomplete) {

			let project   = this.project;
			let stash     = this.stash;
			let namespace = this.__namespace;

			if (project !== null && stash !== null && namespace !== null) {

				console.log('strainer: CHECK/READ-SOURCES "' + project + '"');


				let pkg = this.__packages[namespace] || null;
				if (pkg !== null) {

					pkg.setType('source');

					let sources = pkg.getFiles().filter(url => url.endsWith('.js') && url.split('/').pop().split('.').length === 2);
					if (sources.length > 0) {

						stash.read(sources.map(url => project + '/source/' + url), function(assets) {
							this.sources = assets.filter(asset => asset !== null);
							oncomplete(true);
						}, this);

					} else {
						oncomplete(true);
					}

					pkg.setType('source');

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('check-sources', function(oncomplete) {

			let api     = _plugin.API || null;
			let errors  = this.errors;
			let project = this.project;

			if (api !== null && project !== null) {

				console.log('strainer: CHECK/CHECK-SOURCES "' + project + '"');


				this.configs = this.sources.map(asset => {

					let result      = [];
					let api_report  = _plugin.API.check(asset);
					let api_unfixed = _plugin.API.fix(asset, api_report);

					if (api_report !== null) {

						if (api_unfixed.length > 0) {

							api_unfixed.forEach(err => {
								result.push(err);
								errors.push(err);
							});

							api_report.errors = result;

						}


						if (asset.url.includes('/source/')) {

							let url    = asset.url.replace('/source/', '/api/').replace(/\.js$/, '.json');
							let config = new lychee.Asset(url, 'json', true);
							if (config !== null) {

								config.buffer = {
									errors: api_report.errors,
									source: {
										header: api_report.header,
										memory: api_report.memory,
										result: api_report.result
									},
									review: null
								};

							}

							return config;

						}

					}


					return null;

				});


				oncomplete(true);

			} else {
				oncomplete(false);
			}

		}, this);



		/*
		 * REVIEWS
		 */

		this.bind('read-reviews', function(oncomplete) {

			let namespace = this.__namespace;
			let project   = this.project;
			let stash     = this.stash;

			if (namespace !== null && project !== null && stash !== null) {

				console.log('strainer: CHECK/READ-REVIEWS "' + project + '"');


				let pkg = this.__packages[namespace] || null;
				if (pkg !== null) {

					pkg.setType('review');

					let reviews = pkg.getFiles().filter(url => url.endsWith('.js'));
					if (reviews.length > 0) {

						stash.read(reviews.map(url => project + '/review/' + url), function(assets) {
							this.reviews = assets.filter(asset => asset !== null);
							oncomplete(true);
						}, this);

					} else {
						oncomplete(true);
					}

					pkg.setType('source');

				} else {
					oncomplete(false);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('check-reviews', function(oncomplete) {

			let api     = _plugin.API || null;
			let errors  = this.errors;
			let project = this.project;

			if (api !== null && project !== null) {

				console.log('strainer: CHECK/CHECK-REVIEWS "' + project + '"');


				this.reviews.map(asset => {

					let result      = [];
					let api_report  = _plugin.API.check(asset);
					let api_unfixed = _plugin.API.fix(asset, api_report);

					if (api_report !== null) {

						if (api_unfixed.length > 0) {

							api_unfixed.forEach(err => {
								result.push(err);
								errors.push(err);
							});

							api_report.errors = result;

						}

					}


					if (asset.url.includes('/review/')) {

						let url    = asset.url.replace('/review/', '/api/').replace(/\.js$/, '.json');
						let config = this.configs.find(other => other.url === url);
						if (config !== null) {

							config.buffer.review = {
								header: api_report.header,
								memory: api_report.memory,
								result: api_report.result
							};

						}

					}

				});


				oncomplete(true);

			} else {
				oncomplete(false);
			}

		}, this);



		/*
		 * INCLUDES
		 */

		this.bind('trace-includes', function(oncomplete) {

			let packages = this.__packages;
			let project  = this.project;
			let stash    = this.stash;

			if (project !== null && stash !== null) {

				let dependencies = _trace_dependencies.call(this);
				if (dependencies.length > 0) {

					let candidates  = [];
					let identifiers = [];

					dependencies.forEach(identifier => {

						let ns  = identifier.split('.')[0];
						let id  = identifier.split('.').slice(1).join('.');
						let pkg = packages[ns] || null;
						if (pkg !== null) {

							let prefix = pkg.url.split('/').slice(0, -1).join('/');
							let found  = false;

							let resolved = pkg.resolve(id, null);
							if (resolved.length > 0) {
								identifiers.push(identifier);
								candidates.push(prefix + '/api/' + resolved[0] + '.json');
								found = true;
							}


							if (found === false) {

								resolved = pkg.resolve(id, {
									platforms: _PLATFORMS
								});

								if (resolved.length > 0) {
									resolved.forEach(path => candidates.push(prefix + '/api/' + path + '.json'));
								}

							}

						}

					});


					console.log('strainer: CHECK/TRACE-INCLUDES "' + project + '" (' + candidates.length + ')');


					if (candidates.length > 0) {

						identifiers.forEach(id => {
							console.log('strainer: -> Tracing ' + id + ' in "' + id.split('.')[0] + '"');
						});

						stash.read(candidates, function(assets) {

							for (let a = 0, al = assets.length; a < al; a++) {

								let asset = assets[a];
								if (asset !== null && asset.buffer !== null) {
									this.configs.push(asset);
								}

							}

							setTimeout(_ => {

								let unknown_includes = _trace_dependencies.call(this).filter(dep => dependencies.includes(dep) === false);
								if (unknown_includes.length > 0) {
									this.trigger('trace-includes', [ oncomplete ]);
								} else {
									oncomplete(true);
								}

							}, 100);

						}, this);

					} else {
						oncomplete(true);
					}

				} else {
					oncomplete(true);
				}

			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('learn-includes', function(oncomplete) {

			let errors  = this.errors;
			let project = this.project;

			if (project !== null) {

				console.log('strainer: CHECK/LEARN-INCLUDES "' + project + '"');


				let configs = this.configs.filter(config => config !== null);
				if (configs.length > 0) {

					configs.forEach(config => {

						let result     = config.buffer.source.result;
						let memory     = config.buffer.source.memory;
						let methods    = result.methods    || {};
						let properties = result.properties || {};
						let scope      = properties;

						for (let pid in properties) {

							let value = properties[pid].value;
							if (value.type === 'undefined' && value.chunk !== undefined) {

								let references = _trace_memory.call(this, memory, value.chunk, scope);
								if (references.length === 1) {

									properties[pid].value = references[0];


									let error = config.buffer.errors.find(err => err.rule === 'unguessable-property-value' && err.message.includes('"' + pid + '"')) || null;
									if (error !== null) {

										let e0 = errors.indexOf(error);
										let e1 = config.buffer.errors.indexOf(error);

										if (e0 !== -1) {
											errors.splice(e0, 1);
										}

										if (e1 !== -1) {
											config.buffer.errors.splice(e1, 1);
										}

									}

								}

							}

						}


						for (let mid in methods) {

							let values = methods[mid].values;
							if (values.length > 0) {

								for (let v = 0, vl = values.length; v < vl; v++) {

									let value = values[v];
									if (value.type === 'undefined' && value.chunk !== undefined) {

										let references = _trace_memory.call(this, memory, value.chunk, scope);
										if (references.length > 0) {

											values.splice(v, 1);
											vl--;
											v--;

											for (let r = 0, rl = references.length; r < rl; r++) {

												let reference = references[r];
												if (values.indexOf(reference) === -1) {
													values.push(reference);
												}

											}


											let error = config.buffer.errors.find(err => err.rule === 'unguessable-return-value' && err.message.includes('"' + mid + '()"'));
											if (error !== null) {

												let e0 = errors.indexOf(error);
												let e1 = config.buffer.errors.indexOf(error);

												if (e0 !== -1) {
													errors.splice(e0, 1);
												}

												if (e1 !== -1) {
													config.buffer.errors.splice(e1, 1);
												}

											}

										}

									}

								}

							}

						}

					});

				}

			}


			oncomplete(true);

		}, this);

		this.bind('clean-includes', function(oncomplete) {

			let configs = this.configs;
			let project = this.project;

			if (configs.length > 0 && project !== null) {

				let cleaned_includes = 0;

				for (let c = 0, cl = configs.length; c < cl; c++) {

					let config = configs[c];
					if (config !== null) {

						if (config.url.startsWith(project) === false) {

							cleaned_includes++;
							configs.splice(c, 1);
							cl--;
							c--;

						}

					}

				}

				console.log('strainer: CHECK/CLEAN-INCLUDES "' + project + '" (' + cleaned_includes + ')');

			}


			oncomplete(true);

		}, this);



		/*
		 * WRITE
		 */

		this.bind('write-sources', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('strainer: CHECK/WRITE-SOURCES "' + project + '"');


				let sources = this.sources.filter(asset => asset._MODIFIED === true);
				if (sources.length > 0) {
					stash.write(sources.map(asset => asset.url), sources, result => oncomplete(result), this);
				} else {
					oncomplete(true);
				}

			} else if (debug === true) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-reviews', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('strainer: CHECK/WRITE-REVIEWS "' + project + '"');


				let reviews = this.reviews.filter(asset => asset._MODIFIED === true);
				if (reviews.length > 0) {
					stash.write(reviews.map(asset => asset.url), reviews, result => oncomplete(result), this);
				} else {
					oncomplete(true);
				}

			} else if (debug === true) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-configs', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (project !== null && stash !== null) {

				console.log('strainer: CHECK/WRITE-CONFIGS "' + project + '"');


				let configs = this.configs.filter(config => config !== null);
				if (configs.length > 0) {
					stash.write(configs.map(asset => asset.url), configs, result => oncomplete(result), this);
				} else {
					oncomplete(true);
				}

			} else if (debug === true) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);

		this.bind('write-package', function(oncomplete) {

			let debug   = this.debug;
			let project = this.project;
			let stash   = this.stash;

			if (debug === false && project !== null && stash !== null) {

				console.log('strainer: CHECK/WRITE-PACKAGE "' + project + '"');


				let configs = this.configs.filter(config => config !== null);
				if (configs.length > 0) {

					stash.read([
						project + '/api/strainer.pkg'
					], assets => {

						let index = assets[0] || null;
						if (index !== null) {

							let buffer = index.buffer || null;
							if (buffer === null) {
								buffer = index.buffer = {};
							}


							for (let c = 0, cl = configs.length; c < cl; c++) {

								let config     = configs[c];
								let identifier = config.buffer.source.header.identifier;
								let result     = config.buffer.source.result;


								let knowledge = {};

								knowledge.states     = Object.keys(result.states);
								knowledge.properties = Object.keys(result.properties).map(pid => [ pid, result.properties[pid].hash ]);
								knowledge.enums      = Object.keys(result.enums);
								knowledge.events     = Object.keys(result.events).map(eid => [ eid, result.events[eid].hash ]);
								knowledge.methods    = Object.keys(result.methods).map(mid => [ mid, result.methods[mid].hash ]);

								buffer[config.url] = {
									identifier: identifier,
									timestamp:  Date.now(),
									knowledge:  knowledge
								};

							}

							stash.write([ index.url ], [ index ], result => oncomplete(result), this);
							stash.sync();

						} else {
							oncomplete(false);
						}

					}, this);

				} else {
					oncomplete(true);
				}

			} else if (debug === true) {
				oncomplete(true);
			} else {
				oncomplete(false);
			}

		}, this);



		/*
		 * FLOW
		 */

		this.then('read-package');
		this.then('trace-package');

		this.then('read-sources');
		this.then('check-sources');

		this.then('read-reviews');
		this.then('check-reviews');

		this.then('trace-includes');
		this.then('learn-includes');
		this.then('clean-includes');

		this.then('write-sources');
		this.then('write-reviews');
		this.then('write-configs');
		this.then('write-package');

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.sources instanceof Array) {
				this.sources = blob.sources.map(lychee.deserialize).filter(source => source !== null);
			}

			if (blob.reviews instanceof Array) {
				this.reviews = blob.reviews.map(lychee.deserialize).filter(review => review !== null);
			}

			if (blob.configs instanceof Array) {
				this.configs = blob.configs.map(lychee.deserialize).filter(config => config !== null);
			}


			let stash = lychee.deserialize(blob.stash);
			if (stash !== null) {
				this.stash = stash;
			}

		},

		serialize: function() {

			let data = _Flow.prototype.serialize.call(this);
			data['constructor'] = 'strainer.event.flow.Check';


			let states = data['arguments'][0] || {};
			let blob   = data['blob'] || {};


			if (this.debug !== false)  states.debug   = this.debug;
			if (this.project !== null) states.project = this.project;


			if (this.stash !== null)     blob.stash   = lychee.serialize(this.stash);
			if (this.configs.length > 0) blob.configs = this.configs.map(lychee.serialize);
			if (this.reviews.length > 0) blob.reviews = this.reviews.map(lychee.serialize);
			if (this.sources.length > 0) blob.sources = this.sources.map(lychee.serialize);


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		setDebug: function(debug) {

			debug = typeof debug === 'boolean' ? debug : null;


			if (debug !== null) {

				this.debug = debug;

				return true;

			}


			return false;

		},

		setProject: function(project) {

			project = typeof project === 'string' ? project : null;


			if (project !== null) {

				this.project = project;

				return true;

			}


			return false;

		}

	};


	return Composite;

});

