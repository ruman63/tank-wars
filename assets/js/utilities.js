/**
 * @typedef Bounds
 * @type {object}
 * @property {Number} x
 * @property {Number} y
 * @property {Number} width
 * @property {Number} height
 */
/**
 * @typedef Point
 * @type {object}
 * @property {Number} x
 * @property {Number} y
 */


 /**
  * returns {deltaX, deltaY} based on the direction & distance
  * @param {Number} direction direction in degrees
  * @param {Number} distance size of the delta
  */
function findPoint(direction, distance) {
    return {
        deltaX: distance * Math.cos(direction * Math.PI / 180), 
        deltaY: distance * Math.sin(direction * Math.PI / 180), 
    };
    }
/**
 * returns true if point lies inside bounds.
 * @param {Bounds} bounds Bounds
 * @param {Point} point point
 */
function liesIn(bounds, point) {
    return point.x > bounds.x && point.x < bounds.width
    && point.y > bounds.y && point.y < bounds.height;
}
module.exports = {
    findPoint,
    liesIn
}