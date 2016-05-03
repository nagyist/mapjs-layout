/*global module, require */
var _ = require('underscore'),
	combineVerticalSubtrees = require('./combine-vertical-subtrees');
module.exports  = function topdownLayout(aggregate, dimensionProvider, margin) {
	'use strict';
	var layout = { nodes: {}, connectors: {}, links: {} },
		toNode = function (idea, level) {
			var dimensions = dimensionProvider(idea, level);
			return _.extend({level: level}, dimensions, _.pick(idea, ['id', 'title', 'attr']));
		},
		traverse = function (idea, predicate, level) {
			var childResults;
			level = level || 1;
			if (idea.ideas) {
				childResults = Object.keys(idea.ideas).map(function (subNodeRank) {
					return traverse(idea.ideas[subNodeRank], predicate, level + 1);
				});
			}
			return predicate(idea, childResults, level);
		},
		traversalLayout = function (idea, childLayouts, level) {
			var node = toNode(idea, level);
			return combineVerticalSubtrees(node, childLayouts, margin);
		},
		setLevelHeights = function (nodes, levelHeights) {
			_.each(layout.nodes, function (node) {
				node.y = levelHeights[node.level - 1];
			});
		},
		getLevelHeights = function (nodes) {
			var maxHeights = [],
				level,
				heights = [];

			_.each(nodes, function (node) {
				if (!maxHeights[node.level - 1]) {
					maxHeights[node.level - 1] = node.height; /* do max later */
				}
			});

			heights[0] = Math.round(-0.5 * layout.nodes[aggregate.id].height);

			for (level = 1; level < maxHeights.length; level++) {
				heights [level] = heights [level - 1] + margin + maxHeights[level - 1];
			}
			return heights;
		},
		tree;

	tree = traverse(aggregate, traversalLayout);
	layout.nodes = tree.nodes;
	setLevelHeights(layout.nodes, getLevelHeights(layout.nodes));

	return layout;
};
