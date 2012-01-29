
ly.console = function(settings) {

	this.settings = {};
	for (var d in this.defaults) {
		this.settings[d] = this.defaults[d];
	}

	if (Object.prototype.toString.call(settings) === '[object Object]') {
		for (var s in settings) {
			this.settings[s] = settings[s];
		}
	}

	this.__messages = [];
	this.__queue = [];
	this.__count = 0;

	if (this.__intervalId === undefined) {
		this.__initLoop();
	}

};


ly.console.prototype = {

	defaults: {
		id: 'ly-console'
	},

	/*
	 * PUBLIC API
	 */
	log: function(title, content, priority) {

		priority = typeof priority === 'string' ? priority : null;

		if (Object.prototype.toString.call(content) === '[object Object]') {
			content = JSON.stringify(content);
		}

		this.__queue.push({
			title: title || null,
			content: content || null,
			priority: priority
		});

	},

	toggle: function() {

		if (this.context.className === 'ly-console hidden') {

			this.context.className = 'ly-console';
			this.__isHidden = false;

			// Reset the counter
			this.__count = 0;
			this.__status.innerHTML = this.__count;

		} else {

			this.context.className = 'ly-console hidden';
			this.__isHidden = true;

		}

	},



	/*
	 * PRIVATE API
	 */
	__initLoop: function() {

		var that = this;
		this.__intervalId = setInterval(function() {
			that.__loop();
		}, 100);

		if (this.context === undefined) {

			var context = document.createElement('ul');
			context.id = this.settings.id;
			context.className = 'ly-console';
			context.onclick = function() {
				that.toggle();
			};

			this.__status = document.createElement('li');
			this.__status.id = this.settings.id + '-status';
			this.__status.className = 'ly-console-status';
			this.__status.innerHTML = '0';


			// This is a hack, but works fine and saves a DOM element, yay!
			this.__lastMessage = this.__status;

			context.appendChild(this.__status);

			document.body.appendChild(context);

			this.context = context;

			this.toggle();

		}

	},

	__loop: function() {

		if (this.__queue.length !== 0) {

			var message = this.__queue[0],
				item = document.createElement('li');

			if (message.priority !== null) {
				item.className = message.priority;
			}
			item.innerHTML = '<b>' + message.title + '</b>: ' + message.content;


			// Update the DOM functionality
			this.__queue.splice(0, 1);
			this.context.insertBefore(item, this.__lastMessage);
			this.__lastMessage = item;


			// Update the status icon
			this.__count++;
			this.__status.innerHTML = this.__count;

		}

	}

};

