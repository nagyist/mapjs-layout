/*global require, module */
var Theme = require ('./theme'),
	_ = require('underscore'),
	nodeConnectionPointX = require('./layouts/node-connection-point-x'),
	appendUnderLine = function (connectorCurve, calculatedConnector, position) {
		'use strict';
		if (calculatedConnector.nodeUnderline) {
			connectorCurve.d += 'M' + (calculatedConnector.nodeUnderline.from.x - position.left) + ',' + (calculatedConnector.nodeUnderline.from.y - position.top) + ' H' + (calculatedConnector.nodeUnderline.to.x - position.left);
		}
		return connectorCurve;
	},
	appendOverLine = function (connectorCurve, calculatedConnector) {
		'use strict';
		var halfWidth,
			initialRadius = connectorCurve.initialRadius || 0;

		if (calculatedConnector.nodeOverline) {
			halfWidth = Math.floor(0.5 * Math.abs(calculatedConnector.nodeOverline.to.x - calculatedConnector.nodeOverline.from.x)) - 1;
			connectorCurve.d += 'm' + (-1 * halfWidth) + ',' + initialRadius +
				'q0,' + (-1 * initialRadius) + ' ' + initialRadius + ',' +  (-1 * initialRadius) +
				' h' + (2 * (halfWidth - initialRadius)) +
				'q' + initialRadius + ',0 ' + initialRadius + ',' +  initialRadius;
		}
		return connectorCurve;

	},
	appendBorderLines = function (connectorCurve, calculatedConnector, position) {
		'use strict';
		return appendOverLine(appendUnderLine(connectorCurve, calculatedConnector, position), calculatedConnector);
	},
	nodeConnectionPointY = {
		'center': function (node) {
			'use strict';
			return Math.round(node.top + node.height * 0.5);
		},
		'base': function (node) {
			'use strict';
			return node.top + node.height + 1;
		},
		'base-inset': function (node, inset) {
			'use strict';
			return node.top + node.height + 1 - inset;
		},
		'top': function (node) {
			'use strict';
			return node.top;
		}
	},
	connectorPaths = require('./connector-paths'),
	calculateConnector = function (parent, child, theme) {
		'use strict';
		var calcChildPosition = function () {
				var tolerance = 10,
					childMid = child.top + child.height * 0.5,
					parentMid = parent.top + parent.height * 0.5;
				if (Math.abs(parentMid - childMid) + tolerance < Math.max(child.height, parent.height * 0.75)) {
					return 'horizontal';
				}
				return (childMid < parentMid) ? 'above' : 'below';
			},
			childPosition = calcChildPosition(),
			fromStyles = parent.styles,
			toStyles = child.styles,
			connectionPositionDefaultFrom = theme.attributeValue(['node'], fromStyles, ['connections', 'default'], {h: 'center', v: 'center'}),
			connectionPositionDefaultTo = theme.attributeValue(['node'], toStyles, ['connections', 'default'], {h: 'nearest-inset', v: 'center'}),
			connectionPositionFrom = _.extend({}, connectionPositionDefaultFrom, theme.attributeValue(['node'], fromStyles, ['connections', 'from', childPosition], {})),
			connectionPositionTo = _.extend({}, connectionPositionDefaultTo, theme.attributeValue(['node'], toStyles, ['connections', 'to'], {})),
			connectorTheme = theme.connectorTheme(childPosition, toStyles, fromStyles),
			fromInset = theme.attributeValue(['node'], fromStyles, ['cornerRadius'], 10),
			toInset = theme.attributeValue(['node'], toStyles, ['cornerRadius'], 10),
			borderType = theme.attributeValue(['node'], toStyles, ['border', 'type'], ''),
			nodeUnderline = false, nodeOverline = false;
		if (borderType === 'underline' || borderType === 'under-overline') {
			nodeUnderline = {
				from: {
					x: child.left,
					y: child.top + child.height + 1
				},
				to: {
					x: child.left + child.width,
					y: child.top + child.height + 1
				}
			};
		}
		if (borderType === 'overline' || borderType === 'under-overline') {
			nodeOverline = {
				from: {
					x: child.left,
					y: child.top
				},
				to: {
					x: child.left + child.width,
					y: child.top
				}
			};
		}

		return {
			from: {
				x: nodeConnectionPointX[connectionPositionFrom.h](parent, child, fromInset),
				y: nodeConnectionPointY[connectionPositionFrom.v](parent, fromInset)
			},
			to: {
				x: nodeConnectionPointX[connectionPositionTo.h](child, parent, toInset),
				y: nodeConnectionPointY[connectionPositionTo.v](child, toInset)
			},
			connectorTheme: connectorTheme,
			nodeUnderline: nodeUnderline,
			nodeOverline: nodeOverline
		};
	},
	themePath = function (parent, child, theme) {
		'use strict';
		var position = {
				left: Math.min(parent.left, child.left),
				top: Math.min(parent.top, child.top)
			},
			calculatedConnector,
			result;
		theme = theme || new Theme({});
		position.width = Math.max(parent.left + parent.width, child.left + child.width, position.left + 1) - position.left;
		position.height = Math.max(parent.top + parent.height, child.top + child.height, position.top + 1) - position.top + 2;
		calculatedConnector = calculateConnector(parent, child, theme);
		result = appendBorderLines(connectorPaths[calculatedConnector.connectorTheme.type](calculatedConnector, position, parent, child), calculatedConnector, position);
		result.color = calculatedConnector.connectorTheme.line.color;
		result.width = calculatedConnector.connectorTheme.line.width;
		return result;
	},
	linkPath = function (parent, child, arrow) {
		'use strict';
		var calculateConnector = function (parent, child) {
			var parentPoints = [
				{
					x: parent.left + Math.round(0.5 * parent.width),
					y: parent.top
				},
				{
					x: parent.left + parent.width,
					y: parent.top + Math.round(0.5 * parent.height)
				},
				{
					x: parent.left + Math.round(0.5 * parent.width),
					y: parent.top + parent.height
				},
				{
					x: parent.left,
					y: parent.top + Math.round(0.5 * parent.height)
				}
			], childPoints = [
				{
					x: child.left + Math.round(0.5 * child.width),
					y: child.top
				},
				{
					x: child.left + child.width,
					y: child.top + Math.round(0.5 * child.height)
				},
				{
					x: child.left + Math.round(0.5 * child.width),
					y: child.top + child.height
				},
				{
					x: child.left,
					y: child.top + Math.round(0.5 * child.height)
				}
			], i, j, min = Infinity, bestParent, bestChild, dx, dy, current;
			for (i = 0; i < parentPoints.length; i += 1) {
				for (j = 0; j < childPoints.length; j += 1) {
					dx = parentPoints[i].x - childPoints[j].x;
					dy = parentPoints[i].y - childPoints[j].y;
					current = dx * dx + dy * dy;
					if (current < min) {
						bestParent = i;
						bestChild = j;
						min = current;
					}
				}
			}
			return {
				from: parentPoints[bestParent],
				to: childPoints[bestChild]
			};
		},
		arrowPath = function () {
			var len = 14, dx, dy, iy, a1x, a2x, a1y, a2y, n, m;
			if (!arrow) {
				return false;
			}
			n = Math.tan(Math.PI / 9);
			dx = conn.to.x - conn.from.x;
			dy = conn.to.y - conn.from.y;
			if (dx === 0) {
				iy = dy < 0 ? -1 : 1;
				a1x = conn.to.x + len * Math.sin(n) * iy;
				a2x = conn.to.x - len * Math.sin(n) * iy;
				a1y = conn.to.y - len * Math.cos(n) * iy;
				a2y = conn.to.y - len * Math.cos(n) * iy;
			} else {
				m = dy / dx;
				if (conn.from.x < conn.to.x) {
					len = -len;
				}
				a1x = conn.to.x + (1 - m * n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
				a1y = conn.to.y + (m + n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
				a2x = conn.to.x + (1 + m * n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
				a2y = conn.to.y + (m - n) * len / Math.sqrt((1 + m * m) * (1 + n * n));
			}
			return 'M' + Math.round(a1x - position.left) + ',' + Math.round(a1y - position.top) +
				'L' + Math.round(conn.to.x - position.left) + ',' + Math.round(conn.to.y - position.top) +
				'L' + Math.round(a2x - position.left) + ',' + Math.round(a2y - position.top) +
				'Z';
		},
		position = {
			left: Math.min(parent.left, child.left),
			top: Math.min(parent.top, child.top)
		},
		conn = calculateConnector(parent, child);
		position.width = Math.max(parent.left + parent.width, child.left + child.width, position.left) - position.left;
		position.height = Math.max(parent.top + parent.height, child.top + child.height, position.top) - position.top;

		return {
			'd': 'M' + Math.round(conn.from.x - position.left) + ',' + Math.round(conn.from.y - position.top) + 'L' + Math.round(conn.to.x - position.left) + ',' + Math.round(conn.to.y - position.top),
			'conn': conn,
			'position': position,
			arrow: arrowPath()
		};
	};

Math.sign = Math.sign || function (val) {
	'use strict';
	return val >= 0 ? 1 : -1;
};
module.exports = {
	themePath: themePath,
	linkPath: linkPath
};
