/*global describe, it, expect, require, beforeEach*/
var layoutGeometry = require('../src/layout-geometry');
describe('layoutGeometry', function () {
	'use strict';
	describe('projectPointOnLineVector', function () {
		it('should project point on horizontal line', function () {
			expect(layoutGeometry.projectPointOnLineVector([2,0], [0,1], [1,0])).toEqual([2,1]);
		});
		it('should project point on vertical line', function () {
			expect(layoutGeometry.projectPointOnLineVector([0, 3], [1,0], [0,1])).toEqual([1,3]);
		});
		it('should project point onto an upward sloped line', function () {
			expect(layoutGeometry.projectPointOnLineVector([2, 3], [0,0], [1,2])).toEqual([8 / 5,16 / 5]);
		});
		it('should project point onto an downward sloped line', function () {
			expect(layoutGeometry.projectPointOnLineVector([0, -2], [0,0], [1,3])).toEqual([-3 / 5, -9 / 5]);
		});
		it('should project point on a line when it is the origin', function () {
			expect(layoutGeometry.projectPointOnLineVector([2,0], [2,0], [1,0])).toEqual([2,0]);
		});
		it('should project point on a line when it is not the origin', function () {
			expect(layoutGeometry.projectPointOnLineVector([3,0], [2,0], [1,0])).toEqual([3,0]);
		});
		describe('should throw invalid-args exception', function () {
			it('when vector is 0', function () {
				expect(function () {
					layoutGeometry.projectPointOnLineVector([3,0], [2,0], [0,0]);
				}).toThrow('invalid-args');
			});
		});

	});
	describe('orderPointsOnVector', function () {
		var points;
		describe('when vector is horizontal', function () {
			beforeEach(function () {
				points = [[2,1], [3,1], [0,1], [-2,1]];
			});
			it('should order points left to right', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [0,1], [1,0])).toEqual([[0,1], [2,1], [3,1]]);
			});
			it('should order points left to right and include points before origin', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [0,1], [1,0], true)).toEqual([[-2,1]]);
			});
			it('should order points right to left', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [0,1], [-1,0])).toEqual([[0,1], [-2,1]]);
			});
			it('should order points right to left and include points before origin', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [0,1], [-1,0], true)).toEqual([[3, 1], [2,1]]);
			});

		});
		describe('when vector is vertical', function () {
			beforeEach(function () {
				points = [[1,2], [1,3], [1,0], [1, -2]];
			});
			it('should order points bottom to top', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [1,0], [0,1])).toEqual([[1, 0], [1, 2], [1, 3]]);
			});
			it('should order points bottom to top and include points before origin', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [1,0], [0,1], true)).toEqual([[1, -2]]);
			});
			it('should order points top to bottom', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [1,0], [0,-1])).toEqual([[1, 0], [1, -2]]);
			});
			it('should order points top to bottom and include points before origin', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [1,0], [0,-1], true)).toEqual([[1, 3], [1, 2]]);
			});
		});
		describe('when line is sloped', function () {
			beforeEach(function () {
				points = [[4, 2], [2, 4], [3, 3], [7, -1]];
			});
			it('should order points top to bottom', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [3,3], [1,-1])).toEqual([[3, 3], [4, 2], [7, -1]]);
			});
			it('should order points bottom to top', function () {
				expect(layoutGeometry.orderPointsOnVector(points, [3,3], [-1,1])).toEqual([[3, 3], [2, 4]]);
			});

		});
	});
	describe('translatePoly', function () {
		it('should move all points of all regions in the poly', function () {
			expect(layoutGeometry.translatePoly([
				[[1,2], [2,3]],
				[[2,1], [3,2]]
			], [2,3])).toEqual([
				[[3,5], [4,6]],
				[[4,4], [5,5]]
			]);
		});
	});
	describe('addVectors', function () {
		it('should add vectors', function () {
			expect(layoutGeometry.addVectors([1,2], [3,4])).toEqual([4,6]);
		});
		describe('should throw exception', function () {
			it('when vector1 is falsy', function () {
				expect(function () {
					layoutGeometry.addVectors(undefined, [3,4]);
				}).toThrow();
			});
			it('when vector2 is falsy', function () {
				expect(function () {
					layoutGeometry.addVectors([1,2]);
				}).toThrow();
			});
			it('when result is not a number', function () {
				expect(function () {
					layoutGeometry.addVectors([1, 'a'], [3,4]);
				}).toThrow();
			});
		});
	});
	describe('subtractVectors', function () {
		it('should subtract vectors', function () {
			expect(layoutGeometry.subtractVectors([1,2], [3,4])).toEqual([-2,-2]);
		});
		describe('should throw exception', function () {
			it('when vector1 is falsy', function () {
				expect(function () {
					layoutGeometry.subtractVectors(undefined, [3,4]);
				}).toThrow();
			});
			it('when vector2 is falsy', function () {
				expect(function () {
					layoutGeometry.subtractVectors([1,2]);
				}).toThrow();
			});
			it('when result is not a number', function () {
				expect(function () {
					layoutGeometry.subtractVectors([1, 'a'], [3,4]);
				}).toThrow();
			});
		});
	});
	describe('translatePoly', function () {
		it('should translate a single point in a single region', function () {
			expect(layoutGeometry.translatePoly([[[1,2]]], [2,3])).toEqual([[[3,5]]]);
		});
		it('should translate a multiple points in a multiple regions', function () {
			var poly = [
					[
						[1,2], [3,4]
					],
					[
						[2,4], [6,8]
					]
				];
			expect(layoutGeometry.translatePoly(poly, [2,3])).toEqual([
					[
						[3,5], [5,7]
					],
					[
						[4,7], [8,11]
					]
				]);
		});
	});

	describe('firstProjectedPolyPointOnVector', function () {
		var poly, vector;
		beforeEach(function () {
			poly = [
				[
					[-20, 20], [20, 20], [20, -20], [-20, -20]
				]
			];
		});
		describe('should return first projected point', function () {
			describe('when the vector is horizontal', function () {
				describe('left to right', function () {
					beforeEach(function () {
						vector = [1,0];
					});
					it('should return falsy when all points are after the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [-20, 10], vector)).toBeFalsy();
					});
					it('when some points are before the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [0,0], vector)).toEqual([-20, 0]);
					});
					it('when all points are before the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [30, 10], vector)).toEqual([-20, 10]);
					});
				});
				describe('right to left', function () {
					beforeEach(function () {
						vector = [-1,0];
					});
					it('when all points are after the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [-30, 10], vector)).toEqual([20, 10]);
					});
					it('when some points are after the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [0,0], vector)).toEqual([20, 0]);
					});
					it('should return falsy when all points are after the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [20, 10], vector)).toBeFalsy();
					});

				});
			});
			describe('when the vector is vertical', function () {
				describe('top to bottom', function () {
					beforeEach(function () {
						vector = [0,-1];
					});
					it('when all points are before the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [10, -30], vector)).toEqual([10, 20]);
					});
					it('when some points are before the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [0, 0], vector)).toEqual([0, 20]);
					});
					it('should return falsy when all points are after the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [10, 20], vector)).toBeFalsy();
					});
				});
				describe('bottom to top', function () {
					beforeEach(function () {
						vector = [0,1];
					});
					it('when all points are before the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [10, 30], vector)).toEqual([10, -20]);
					});
					it('when some points are before the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [0,0], vector)).toEqual([0, -20]);
					});
					it('should return falsy when all points are after the origin', function () {
						expect(layoutGeometry.firstProjectedPolyPointOnVector(poly, [10, -20], vector)).toBeFalsy();
					});
				});

			});

		});
	});
	describe('furthestIntersectionPoint', function () {
		var movePoly, placedPolys, vectorOrigin;
		beforeEach(function () {
			movePoly = [
				[
					[-20, 20], [20, 20], [20, -20], [-20, -20]
				]
			];
			placedPolys = [
				[
					[-15, 15], [-5, 15], [-5, -5], [-15, -5]
				],
				[
					[-30, -10], [-10,-10], [-10, -30], [-30, -30]
				],
				[
					[10, -10], [30, -10], [30, -30], [10,-30]
				]
			];
			vectorOrigin = [0, 0];
		});
		describe('should return the most distant intersection point', function () {
			describe('when vector is horizontal', function () {
				it('left to right', function () {
					expect(layoutGeometry.furthestIntersectionPoint(movePoly, placedPolys, vectorOrigin, [1, 0])).toEqual([20, 0]);
				});
				it('right to left', function () {
					expect(layoutGeometry.furthestIntersectionPoint(movePoly, placedPolys, vectorOrigin, [-1, 0])).toEqual([-20, 0]);
				});
			});
			describe('when vector is vertical', function () {
				it('bottom to top', function () {
					expect(layoutGeometry.furthestIntersectionPoint(movePoly, placedPolys, vectorOrigin, [0, 1])).toEqual([0, 15]);
				});
				it('top to bottom', function () {
					expect(layoutGeometry.furthestIntersectionPoint(movePoly, placedPolys, vectorOrigin, [0, -1])).toEqual([0, -20]);
				});
			});
			describe('when vector is sloped', function () {
				it('top to bottom left to right', function () {
					expect(layoutGeometry.furthestIntersectionPoint(movePoly, placedPolys, vectorOrigin, [1, -1])).toEqual([20, -20]);
				});
				it('top to bottom right to left', function () {
					expect(layoutGeometry.furthestIntersectionPoint(movePoly, placedPolys, vectorOrigin, [-1, -1])).toEqual([-20, -20]);
				});
				it('bottom to top left to right', function () {
					expect(layoutGeometry.furthestIntersectionPoint(movePoly, placedPolys, vectorOrigin, [1, 1])).toEqual([5, 5]);
				});
				it('bottom to top right to left', function () {
					expect(layoutGeometry.furthestIntersectionPoint(movePoly, placedPolys, vectorOrigin, [-1, 1])).toEqual([-15, 15]);
				});
			});
		});
	});
	describe('translatePolyToIntersecton', function () {
		var movePoly, vector;
		beforeEach(function () {
			movePoly = [
				[
					[-20, 20], [20, 20], [20, -20], [-20, -20]
				]
			];
		});
		describe('when vector is horizontal', function () {
			describe('left to right', function () {
				beforeEach(function () {
					vector = [1,0];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translation).toEqual([20, 0]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translatedPoly).toEqual([
						[
							[0, 20], [40, 20], [40, -20], [0, -20]
						]
					]);
				});
				it('should return falsy when the intersection is before the poly', function () {
					expect(layoutGeometry.translatePolyToIntersecton(movePoly, [-20,0], vector)).toBeFalsy();
				});
			});
			describe('right to left', function () {
				beforeEach(function () {
					vector = [-1,0];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translation).toEqual([-20, 0]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translatedPoly).toEqual([
						[
							[-40, 20], [0, 20], [0, -20], [-40, -20]
						]
					]);
				});
				it('should return falsy when the intersection is before the poly', function () {
					expect(layoutGeometry.translatePolyToIntersecton(movePoly, [20,0], vector)).toBeFalsy();
				});
			});
		});
		describe('when vector is vertical', function () {
			describe('top to bottom', function () {
				beforeEach(function () {
					vector = [0, -1];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translation).toEqual([0, -20]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translatedPoly).toEqual([
						[
							[-20, 0], [20, 0], [20, -40], [-20, -40]
						]
					]);
				});
				it('should return falsy when the intersection is before the poly', function () {
					expect(layoutGeometry.translatePolyToIntersecton(movePoly, [0,20], vector)).toBeFalsy();
				});
			});
			describe('bottom to top', function () {
				beforeEach(function () {
					vector = [0, 1];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translation).toEqual([0, 20]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translatedPoly).toEqual([
						[
							[-20, 40], [20, 40], [20, 0], [-20, 0]
						]
					]);
				});
				it('should return falsy when the intersection is before the poly', function () {
					expect(layoutGeometry.translatePolyToIntersecton(movePoly, [0,-20], vector)).toBeFalsy();
				});
			});
		});
		describe('when vector is diagonal', function () {
			describe('top to bottom', function () {
				beforeEach(function () {
					vector = [1, -1];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translation).toEqual([20, -20]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translatedPoly).toEqual([
						[
							[0, 0], [40, 0], [40, -40], [0, -40]
						]
					]);
				});
				it('should return falsy when the intersection is before the poly', function () {
					expect(layoutGeometry.translatePolyToIntersecton(movePoly, [-20,20], vector)).toBeFalsy();
				});
			});
			describe('bottom to top', function () {
				beforeEach(function () {
					vector = [1, 1];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translation).toEqual([20, 20]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToIntersecton(movePoly, [0,0], vector);
					expect(result.translatedPoly).toEqual([
						[
							[0, 40], [40, 40], [40, 0], [0, 0]
						]
					]);
				});
				it('should return falsy when the intersection is before the poly', function () {
					expect(layoutGeometry.translatePolyToIntersecton(movePoly, [-20,-20], vector)).toBeFalsy();
				});
			});
		});
	});
	describe('translatePolyToNotOverlap', function () {
		var movePoly, placedPolys, vectorOrigin, vector;
		beforeEach(function () {
			movePoly = [
				[
					[-20, 20], [20, 20], [20, -20], [-20, -20]
				]
			];
			placedPolys = [
				[
					[-15, 15], [-5, 15], [-5, -5], [-15, -5]
				],
				[
					[-30, -10], [-10,-10], [-10, -30], [-30, -30]
				],
				[
					[10, -10], [30, -10], [30, -30], [10,-30]
				]
			];
			vectorOrigin = [0, 0];
		});
		describe('when vector is horizontal', function () {
			describe('left to right', function () {
				beforeEach(function () {
					vector = [1,0];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translation).toEqual([50,0]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translatedPoly).toEqual([[[30, 20], [70, 20], [70, -20], [30, -20]]]);

				});
			});
			describe('right to left', function () {
				beforeEach(function () {
					vector = [-1,0];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translation).toEqual([-50,0]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translatedPoly).toEqual([[[-70, 20], [-30, 20], [-30, -20], [-70, -20]]]);

				});
			});
		});
		describe('when vector is vertical', function () {
			describe('top to bottom', function () {
				beforeEach(function () {
					vector = [0,-1];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translation).toEqual([0,-50]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translatedPoly).toEqual([[[-20, -30], [20, -30], [20, -70], [-20, -70]]]);

				});

			});
			describe('bottom to top', function () {
				beforeEach(function () {
					vector = [0,1];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translation).toEqual([0,35]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translatedPoly).toEqual([[[-20, 55], [20, 55], [20, 15], [-20, 15]]]);

				});

			});

		});
		describe('when vector is diagonal', function () {
			describe('bottom to top', function () {
				beforeEach(function () {
					vector = [1,1];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translation).toEqual([25,25]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translatedPoly).toEqual([[[5, 45], [45, 45], [45, 5], [5, 5]]]);

				});

			});
			describe('top to bottom', function () {
				beforeEach(function () {
					vector = [1,-1];
				});
				it('should return translation', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translation).toEqual([50,-50]);
				});
				it('should return the translated poly', function () {
					var result = layoutGeometry.translatePolyToNotOverlap(movePoly, placedPolys, [0,0], vector);
					expect(result.translatedPoly).toEqual([[[30, -30], [70, -30], [70, -70], [30, -70]]]);

				});

			});

		});
	});
});


