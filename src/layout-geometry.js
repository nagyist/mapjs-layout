/*global module, require, isNaN, console*/
var _ = require('underscore'),
	PolyBool = require('polybooljs'),
	dotProduct = function (p1, p2) {
		'use strict';
		return (p1[0] * p2[0]) + (p1[1] * p2[1]);
	},
	polygonIntersectionPoints = function (poly1, poly2) {
		'use strict';
		var toPolyBoolPoly = function (poly) {
				return {
					regions: poly,
					inverted: false
				};
			},
			intersection = PolyBool.intersect(toPolyBoolPoly(poly1), toPolyBoolPoly(poly2));
		return _.flatten(intersection.regions, true);
	},
	projectPointOnLineVector = function (point, vectorOrigin, vector) {
		'use strict';
		var pointVector = [point[0] - vectorOrigin[0], point[1] - vectorOrigin[1]],
			valDp = dotProduct(vector, pointVector),
			len2 = dotProduct(vector, vector),
			resultVector = [
				vectorOrigin[0] + ((valDp * vector[0]) / len2),
				vectorOrigin[1] + ((valDp * vector[1]) / len2)
			];
		if (!vector[0] && !vector[1]) {
			console.log('projectPointOnLineVector invalid-args point', point, 'vectorOrigin', vectorOrigin, 'vector', vector);
			throw 'invalid-args';
		}
		return resultVector;
	},

	orderPointsOnVector = function (points, vectorOrigin, vector, pointsBeforeOriginOnly) {
		'use strict';
		var pointScale = function (point) {
				var dx = point[0] - vectorOrigin[0],
					dy = point[1] - vectorOrigin[1],
					val = (function () {
						if (dx === 0) {
							if (vector[1] === 0) {
								return 1;
							}
							return dy / vector[1];
						} else {
							if (vector[0] === 0) {
								return 1;
							}
							return dx / vector[0];
						}
					}()),
					pointSign = val >= 0 ? 1 : -1,
					vectorScale = pointSign * (Math.pow(dx, 2) + Math.pow(dy, 2));
				return vectorScale;
			},
			filteredPoints = _.filter(points, function (point) {
				if (pointsBeforeOriginOnly) {
					return pointScale(point) < 0;
				}
				return pointScale(point) >= 0;
			});


		return _.sortBy(filteredPoints, pointScale);
	},
	tolayoutPolygon = function (layout) {
		'use strict';
		var minX =  0,
			maxX = 0,
			minY = 0,
			maxY = 0;
		_.each(layout, function (node) {
			minX = Math.min(minX, node.x);
			maxX = Math.max(maxX, node.x + node.width);
			minY = Math.min(minY, node.y);
			maxY = Math.max(maxY, node.y + node.width);
		});
		return [
			[
				[minX, minY], [maxX, minY], [maxX, maxY], [minX, maxY]
			]
		];
	},
	addVectors = function (vector1, vector2) {
		'use strict';
		var x = vector1[0] + vector2[0],
			y = vector1[1] + vector2[1];
		if (isNaN(x) || isNaN(y)) {
			console.log('addVectors invalid-args x', x, 'y', y, 'vector1', vector1, 'vector2', vector2);
			throw 'invalid-args';
		}
		return [x, y];
	},
	subtractVectors = function (vector1, vector2) {
		'use strict';
		var x = vector1[0] - vector2[0],
			y = vector1[1] - vector2[1];
		if (isNaN(x) || isNaN(y)) {
			console.log('subtractVectors invalid-args vector1', vector1, 'vector2', vector2);
			throw 'invalid-args';
		}
		return [x, y];
	},
	translatePoly = function (poly, translation) {
		'use strict';
		return poly.map(function (region) {
			return region.map(function (vector) {
				return addVectors(vector, translation);
			});
		});
	},
	firstProjectedPolyPointOnVector = function (poly, vectorOrigin, vector) {
		'use strict';
		var polyPoints = _.flatten(poly, true),
			intersectionsOnLine = polyPoints.map(function (intersection) {
				return projectPointOnLineVector(intersection, vectorOrigin, vector);
			}),
			orderedIntersectionsOnLine = orderPointsOnVector(intersectionsOnLine, vectorOrigin, vector, true);
		return orderedIntersectionsOnLine.length && orderedIntersectionsOnLine[0];
	},
	furthestIntersectionPoint = function (poly1, poly2, vectorOrigin, vector) {
		'use strict';
		var intersections = polygonIntersectionPoints(poly1, poly2),
			intersectionsOnLine = intersections.map(function (intersection) {
				return projectPointOnLineVector(intersection, vectorOrigin, vector);
			}),
			orderedIntersectionsOnLine = orderPointsOnVector(intersectionsOnLine, vectorOrigin, vector);
		return orderedIntersectionsOnLine.length && orderedIntersectionsOnLine.pop();
	},
	translatePolyToIntersecton = function (polyToTranslate, intersectionPoint, vector) {
		'use strict';
		var firstPolyPoint = firstProjectedPolyPointOnVector(polyToTranslate, intersectionPoint, vector),
			translation =  firstPolyPoint && subtractVectors(intersectionPoint, firstPolyPoint);

		if (!firstPolyPoint) {
			return false;
		}
		return {
			translation: translation,
			translatedPoly: translatePoly(polyToTranslate, translation)
		};
	},
	translatePolyToNotOverlap = function (polyToFit, existingRegions, polyRootCenter, vector, previousTranslation) {
		'use strict';

		var intersectionPoint = furthestIntersectionPoint(polyToFit, existingRegions, polyRootCenter, vector),
			polyTranslation;
		previousTranslation = previousTranslation || [0,0];

		if (intersectionPoint) {
			polyTranslation = translatePolyToIntersecton(polyToFit, intersectionPoint, vector);
			if (polyTranslation) {
				previousTranslation	= addVectors(previousTranslation, polyTranslation.translation);
				return translatePolyToNotOverlap(polyTranslation.translatedPoly, existingRegions, polyRootCenter, vector, previousTranslation);
			} else {
				console.log('unable to translate poly', polyToFit, 'to intersectionPoint', intersectionPoint, 'with vector', vector);
			}
		}
		return {
			translation: previousTranslation,
			translatedPoly: polyToFit
		};
	};

module.exports = {
	tolayoutPolygon: tolayoutPolygon,
	furthestIntersectionPoint: furthestIntersectionPoint,
	projectPointOnLineVector: projectPointOnLineVector,
	orderPointsOnVector: orderPointsOnVector,
	firstProjectedPolyPointOnVector: firstProjectedPolyPointOnVector,
	translatePoly: translatePoly,
	addVectors: addVectors,
	subtractVectors: subtractVectors,
	translatePolyToIntersecton: translatePolyToIntersecton,
	translatePolyToNotOverlap: translatePolyToNotOverlap
};