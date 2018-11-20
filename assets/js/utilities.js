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

function rotatePoint(point, degrees, axisPoint = undefined) {
    if(axisPoint == undefined) {
        axisPoint = {x: 0, y: 0}
    } 
    const rad = degrees * Math.PI / 180;
    point.x -= axisPoint.x;
    point.y -= axisPoint.y;

    let newx = point.x * Math.cos(rad) - point.y * Math.sin(rad);
    let newy = point.x * Math.sin(rad) + point.y * Math.cos(rad);

    return {x: newx + axisPoint.x, y: newy + axisPoint.y};
}

/**
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
function polygonsDoIntersect (p1, p2) {
    let polygons = [p1, p2];
    let minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {

        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        let polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            // grab 2 vertices to create an edge
            let i2 = (i1 + 1) % polygon.length;
            let point1 = polygon[i1];
            let point2 = polygon[i2];

            // find the line perpendicular to this edge
            let normal = { x: point2.y - point1.y, y: point1.x - point2.x };

            minA = maxA = undefined;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (j = 0; j < p1.length; j++) {
                projected = normal.x * p1[j].x + normal.y * p1[j].y;
                if (minA === undefined || projected < minA) {
                    minA = projected;
                }
                if (maxA === undefined || projected > maxA) {
                    maxA = projected;
                }
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            minB = maxB = undefined;
            for (j = 0; j < p2.length; j++) {
                projected = normal.x * p2[j].x + normal.y * p2[j].y;
                if (minB === undefined || projected < minB) {
                    minB = projected;
                }
                if (maxB === undefined || projected > maxB) {
                    maxB = projected;
                }
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA < minB || maxB < minA) {
                return false;
            }
        }
    }
    return true;
};

module.exports = {
    findPoint,
    liesIn,
    rotatePoint,
    polygonsDoIntersect
}