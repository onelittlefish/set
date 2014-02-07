function Card(color, number, shape, fill) {
	this.color = color;
	this.number = number;
	this.shape = shape;
	this.fill = fill;
	this.name = this.color.substring(0,1) + this.number + this.shape.substring(0,1) + this.fill.substring(0,1);
}

var getAllCards = function(colors, numbers, shapes, fills) {
	var cards = [];

	_.each(colors, function(color) {
		_.each(numbers, function(number) {
			_.each(shapes, function(shape) {
				_.each(fills, function(fill) {
					var card = new Card(color, number, shape, fill);
					cards.push(card);
				})
			})
		})
	});

	return cards;
};

var getShuffledDeal = function(deck, numberToDeal) {
	var shuffledDeck = _.shuffle(deck);

	var deal = [];

	for (var i = 0; i < 12; i++) {
		deal.push(shuffledDeck.pop());
	}

	_.each(deal, function(card) {
		console.log(card);
	});

	return deal;
};

var getThirdCardForSet = function(card1, card2) {
	var color = (card1.color == card2.color) ? card1.color : _.difference(colors, [card1.color, card2.color])[0];
	var number = (card1.number == card2.number) ? card1.number : _.difference(numbers, [card1.number, card2.number])[0];
	var shape = (card1.shape == card2.shape) ? card1.shape : _.difference(shapes, [card1.shape, card2.shape])[0];
	var fill = (card1.fill == card2.fill) ? card1.fill : _.difference(fills, [card1.fill, card2.fill])[0];
	var card = new Card(color, number, shape, fill);
	return card;
};

var getNumberOfSets = function(deal) {
	var numSets = 0;
	_.each(deal, function(card1) {
		_.each(deal, function(card2) {
			if (card1 != card2) {
				var thirdCard = getThirdCardForSet(card1, card2);
				var setExists = _.find(deal, function(card) {
					return _.isEqual(card, thirdCard);
				});
				if (setExists) {
					numSets += 1;
				}
			}
		})
	});
	return numSets / 6;
};

var getIsSet = function(card1, card2, card3) {
	return _.isEqual(getThirdCardForSet(card1, card2), card3);
};

var colors = ["red", "green", "purple"];
var numbers = [1, 2, 3];
var shapes = ["diamond", "pill", "squiggle"];
var fills = ["empty", "lined", "solid"];

var deal = getShuffledDeal(getAllCards(colors, numbers, shapes, fills), 12);
console.log("Sets: " + getNumberOfSets(deal));