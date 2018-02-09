/**
 * Class to create balls on screen
 * @param {Integer} x     The x-pos of the ball
 * @param {Integer} y     The y-pos of the ball
 * @param {Integer} y     The radius of the ball
 * @param {String}  color The color of the ball
 * @param {Integer} size  The size of the ball
 */

function Ball(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
}

/**
 * Check if the ball is colliding with second ball
 * @param   {Object}   ball The ball to check collision on
 * @returns {Boolean} Whether a collision is happening
 */
Ball.prototype.collide = function (ball) {
    var distX = this.x - ball.x;
    var distY = this.y - ball.y;
    var distance = Math.sqrt(distX * distX + distY * distY);
    return distance < this.radius + ball.radius;
}
