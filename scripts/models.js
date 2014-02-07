define(function(require) {
	var _ = require('lib/underscore-1.5.2');
	var Backbone = require('lib/backbone-1.1.0');

	var Game = Backbone.Model.extend({
		defaults: {
			colors: ["red", "green", "purple"],
			numbers: [1, 2, 3],
			shapes: ["diamond", "pill", "squiggle"],
			fills: ["empty", "lined", "solid"]
		},
		initialize: function() {
			_.bindAll(this, 'getAllCards', 'shuffle', 'deal');
			this.reset();
		},
		getAllCards: function() {
			var cards = [];

			_.each(this.get('colors'), _.bind(function(color) {
				_.each(this.get('numbers'), _.bind(function(number) {
					_.each(this.get('shapes'), _.bind(function(shape) {
						_.each(this.get('fills'), function(fill) {
							var card = new Card({
								color: color,
								number: number,
								shape: shape,
								fill: fill
							});
							cards.push(card);
						})
					}, this))
				}, this))
			}, this));

			return cards;
		},
		shuffle: function(deck) {
			return _.shuffle(deck);
		},
		deal: function(numberToDeal) {
			var deal = [];

			for (var i = 0; i < numberToDeal; i++) {
				if (this.get('deck').length == 0) {
					break;
				}
				deal.push(this.get('deck').pop());
			}

			return deal;
		},
		reset: function() {
			this.set('deck', this.shuffle(this.getAllCards()));
		}
	});

	var Card = Backbone.Model.extend({
		defaults: {
			selected: false
		},
		toggleSelected: function() {
			this.set('selected', !this.get('selected'));
		},
		hasSameFeatures: function(otherCard) {
			return this.get('color') == otherCard.get('color') &&
			this.get('number') == otherCard.get('number') &&
			this.get('shape') == otherCard.get('shape') &&
			this.get('fill') == otherCard.get('fill');
		}
	});

	var CardCollection = Backbone.Collection.extend({
		model: Card
	});

	var Summary = Backbone.Model.extend({
		defaults: {
			setsFound: 0
		},
		getThirdCardForSet: function(card1, card2) {
			var color = (card1.get('color') == card2.get('color')) ? card1.get('color') :
				_.difference(this.get('game').get('colors'), [card1.get('color'), card2.get('color')])[0];
			var number = (card1.get('number') == card2.get('number')) ? card1.get('number') :
				_.difference(this.get('game').get('numbers'), [card1.get('number'), card2.get('number')])[0];
			var shape = (card1.get('shape') == card2.get('shape')) ? card1.get('shape') :
				_.difference(this.get('game').get('shapes'), [card1.get('shape'), card2.get('shape')])[0];
			var fill = (card1.get('fill') == card2.get('fill')) ? card1.get('fill') :
				_.difference(this.get('game').get('fills'), [card1.get('fill'), card2.get('fill')])[0];
			var card = new Card({
								color: color,
								number: number,
								shape: shape,
								fill: fill
							});
			return card;
		},
		getNumberOfSets: function() {
			var numSets = 0;
			this.get('collection').each(_.bind(function(card1) {
				this.get('collection').each(_.bind(function(card2) {
					if (card1 != card2) {
						var thirdCard = this.getThirdCardForSet(card1, card2);
						var setExists = this.get('collection').find(function(card) {
							return thirdCard.hasSameFeatures(card);
						});
						if (setExists) {
							numSets += 1;
						}
					}
				}, this))
			}, this));
			return numSets / 6;
		},
		cardsLeft: function() {
			return this.get('game').get('deck').length;
		},
		checkSet: function() {
			var selectedCards = this.get('collection').filter(function(card) {
				return card.get('selected');
			});
			return this.getThirdCardForSet(selectedCards[0], selectedCards[1]).hasSameFeatures(selectedCards[2]);
		},
		handleSet: function() {
			var selectedCards = this.get('collection').filter(function(card) {
				return card.get('selected');
			});
			_.forEach(selectedCards, _.bind(function(card) {
				var index = this.get('collection').indexOf(card);
				this.get('collection').remove(card);
				if (this.get('collection').length < 12) {
					this.get('collection').add(this.get('game').deal(1), {at: index});
				}
			}, this));
			this.set('setsFound', this.get('setsFound') + 1);
		},
		moreCards: function() {
			this.get('collection').add(this.get('game').deal(3));
		},
		newGame: function() {
			this.get('game').reset();
			this.get('collection').set(this.get('game').deal(12));
			this.set('setsFound', 0);
		}
	});

	return {
		Game: Game,
		CardCollection: CardCollection,
		Summary: Summary
	};
});