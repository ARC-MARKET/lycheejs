
game.quests = function(settings, status) {

	if (Object.prototype.toString.call(settings) !== '[object Object]') {
		return;
	}


	var questId = 0;

	this.__status = status;
	this.__quests = {};

	if (Object.prototype.toString.call(settings.quests) === '[object Array]') {

		for (var q = 0, l = settings.quests.length; q < l; q++) {

			var quest = settings.quests[q];

			if (this.isValidQuest(quest) === true) {
				this.__quests[questId++] = quest;
			}

		}

	}

	this.__init();

};

game.quests.prototype = {

	defaults: {
		onSuccess: null,
		onFailure: null
	},



	/*
	 * PRIVATE API
	 */
	__onSuccess: function(quest) {

		console.log('onsuccess', quest.id, quest);

	},

	refresh: function() {

		for (var id in this.__quests) {

			var quest = this.__quests[id];

			if (quest.id === undefined) {
				quest.id = id;
			}

			if (quest.completed !== true) {

				quest.completed = this.isCompleted(quest);

				if (quest.completed === true) {
					this.__onSuccess(quest);
				}

			}

		}

	},

	isCompleted: function(quest) {

		var completed = true;

		if (quest.type === 'collect') {

			for (var property in quest.criteria) {
				if (this.__status.get(property) < quest.criteria) {
					completed = false;
				}
			}

		}


		return completed;

	},

	// TODO: Validation of Quest structure
	isValidQuest: function(quest) {
		return true;
	}
};

