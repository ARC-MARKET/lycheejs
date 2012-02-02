
game.quests = function(quests, status) {

	this._status = status;

	var questId = 0;
	this.__quests = {};

	if (Object.prototype.toString.call(quests) === '[object Array]') {

		for (var q = 0, l = quests.length; q < l; q++) {

			var quest = quests[q];

			if (this.isValidQuest(quest) === true) {
				this.__quests[questId++] = quest;
			}

		}

	}

};

game.quests.prototype = {

	/*
	 * PRIVATE API
	 */
	__onSuccess: function(quest) {

		console.log('quest success', quest.id, quest);

	},

	/*
	 * PUBLIC API
	 */
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
				if (this._status.get(property) < quest.criteria[property]) {
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

