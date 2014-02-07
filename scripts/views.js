define(function(require) {
	var _ = require('lib/underscore-1.5.2');
	var Backbone = require('lib/backbone-1.1.0');
	var SVG = require('lib/svg');
	require('lib/svg.pattern');

	_.templateSettings = { interpolate : /\{\{(.+?)\}\}/g };

	var CardView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#card-template').html()),
		events: {
			'click': 'toggleSelected'
		},
		initialize: function(options) {
			this.render();
		},
		render: function() {
			this.$el.html(this.template(this.model.toJSON()));
			this.renderImage();
			return this;
		},
		renderImage: function() {
			var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svgElement.width = 300;
			svgElement.height = 150;
			this.$('.image').append(svgElement);

			var draw = SVG(svgElement).size(300, 150);

			var shapeWidth = 50;
			var shapeHeight = 100;

			// Shape
			var shape;
			if (this.model.get('shape') == "pill") {
				shape = draw.rect(shapeWidth, shapeHeight);
				shape.radius(shapeWidth / 2);
			}
			else if (this.model.get('shape') == "diamond") {
				shape = draw.polygon('25,0 50,50 25,100 0,50');
			}
			else {
				// TODO: get this squiggle shape right (with fill)
				// M200,300 Q400,50 600,300 T1000,300
				shape = draw.path('M0,0 Q75,25 40,50 T50,100 M0,0 Q50,25 10,50 T50,100');
				// shape = draw.path('M0,0 C100,0 0,50 50,100 M0,0 C50,50 0,50 50,100');
				// shape = draw.path('M0,0 C100,0 0,50 50,100 C-50,100 0,50 0,0');
			}

			// Fill/color
			var strokeWidth = 4;
			shape.stroke({ color: this.model.get('color'), width: strokeWidth });
			shape.move(strokeWidth + 1, strokeWidth);

			if (this.model.get('fill') == "solid") {
				shape.fill({ color: this.model.get('color') });
			}
			else if (this.model.get('fill') == "lined") {
				var pattern = draw.pattern(1, 10, _.bind(function(add) {
				  add.rect(1, 3).fill(this.model.get('color'));
				}, this));
				shape.fill(pattern);
			}
			else {
				shape.fill({ opacity: 0 });
			}

			// Number
			for (var i = 1; i < this.model.get('number'); i++) {
				draw.use(shape).move((shapeWidth + 20)*i, 0);
			}

			draw.size((shapeWidth + 20)*this.model.get('number'), (shapeHeight + 2*strokeWidth));
		},
		toggleSelected: function() {
			this.model.toggleSelected();
			this.$el.toggleClass('selected');
		}
	});

	var CardListView = Backbone.View.extend({
		el: '#cardList',
		initialize: function(options) {
			this.collection.on('add', this.renderAdd, this);
			this.collection.on('remove', this.removed, this);
			this.render();
		},
		render: function() {
			this.collection.each(_.bind(function(card) {
				var cardView = new CardView({model: card});
				this.$('ul').append(cardView.render().el)
			}, this));
			return this;
		},
		renderAdd: function(card) {
			var cardView = new CardView({model: card});
			var index = this.collection.indexOf(card);
			if (this.$('ul li').length == 0) {
				this.$('ul').append(cardView.render().el);
			}
			else if (index == 0) {
				this.$('ul li:eq(' + index + ')').before(cardView.render().el);
			}
			else {
				this.$('ul li:eq(' + (index - 1) + ')').after(cardView.render().el);
			}
		},
		removed: function(model, collection, options) {
			this.$("ul li:nth-child(" + (options.index + 1) + ")").remove();
			// TODO: remove view
		}
	});

	var CardSummaryView = Backbone.View.extend({
		el: '#summary',
		template: _.template($('#summary-template').html()),
		events: {
			'click #submitSet': 'submitSet',
			'click #moreCards': 'moreCards',
			'click #newGame': 'newGame'
		},
		initialize: function() {
			this.model.get('collection').on('change:selected', this.updateSubmit, this);
			this.model.get('collection').on('add', this.render, this);
			this.model.on('change:setsFound', this.render, this);
			this.render();
		},
		render: function() {
			var setsFound = this.model.get('setsFound');
			var numberOfSets = this.model.getNumberOfSets();
			this.$el.html(this.template({
				setsFound: setsFound,
				setsFoundUnit: setsFound == 1 ? "set" : "sets",
				numberOfSets: numberOfSets,
				cardsLeft: this.model.cardsLeft(),
				numberOfSetsUnit: numberOfSets == 1 ? "set" : "sets"
			}));
			if (this.model.cardsLeft() == 0) {
				this.$('#moreCards').attr('disabled', 'disabled');
			}
			this.updateSubmit();
			return this;
		},
		updateSubmit: function() {
			this.$('.alert').hide();
			var numSelected = this.model.get('collection').reduce(function(count, card) {
				return count + (card.get('selected') ? 1 : 0);
			}, 0);
			if (numSelected == 3) {
				this.$('#submitSet').removeAttr('disabled');
			}
			else {
				this.$('#submitSet').attr('disabled', 'disabled');
			}
		},
		submitSet: function() {
			if (!this.model.checkSet()) {
				this.$('.alert').show();
			}
			else {
				this.model.handleSet();
			}
		},	
		moreCards: function() {
			this.model.moreCards();
		},
		newGame: function() {
			this.model.newGame();
		}
	});

	return {
		CardListView: CardListView,
		CardSummaryView: CardSummaryView
	};
});