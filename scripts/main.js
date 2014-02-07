requirejs.config({
    shim: {
        'lib/backbone-1.1.0': {
            deps: ['lib/underscore-1.5.2', 'lib/jquery-2.1.0'],
            exports: 'Backbone'
        },
        'lib/underscore-1.5.2': {
            exports: '_'
        },
        'lib/svg': {
        	exports: 'SVG'
        },
        'lib/svg.pattern': {
        	deps: ['lib/svg']
        }
    }
});

define(function(require) {
	var _ = require('lib/underscore-1.5.2');
    var models = require('models');
    var views = require('views');

	var game = new models.Game();

	var deal = game.deal(12);

	var cardList = new models.CardCollection(deal);

	var summary = new models.Summary({
		game: game,
		collection: cardList
	});

	var cardListView = new views.CardListView({
		collection: cardList
	});

	var cardSummaryView = new views.CardSummaryView({
		model: summary
	});
 });