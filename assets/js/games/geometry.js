function PointFactory(coord_step) {

    this.get = function (x, y) {
        var point = new Point(normalize(x), normalize(y));

        //console.log("   {x: " + x + ", y: " + y + "} => {x: " + point.x() + ", y:" + point.y() + "}");
        return point;
    };

    function normalize(coord) {
        return Math.round(coord / coord_step) * coord_step;
    }
}

function Point(coord_x, coord_y) {
    this._x = coord_x;
    this._y = coord_y;

    this.x = function () {
        return this._x;
    };

    this.y = function () {
        return this._y;
    };

    this.equals = function (other) {
        return (this._x == other.x()) && (this._y == other.y());
    };

    this.to_s = function () {
        return "(" + this._x + ", " + this._y + ")";
    };
}

function Line(point_1, point_2) {
    var self = this;

    var from = point_1;
    var to = point_2;

    this.from = function () {
        return from;
    };

    this.to = function () {
        return to;
    };

    /**
     * If it's 0 then the line is vertical
     *
     * @returns {number}
     */
    this.delta_x = function () {
        return to.x() - from.x();
    };

    /**
     * If it's 0 then the line is horizontal
     *
     * @returns {number}
     */
    this.delta_y = function () {
        return to.y() - from.y();
    };

    this.length = function () {
        return Math.sqrt(Math.pow(this.delta_x(), 2) + Math.pow(this.delta_y(), 2));
    };

    this.is_vertical = function () {
        return (this.delta_x() == 0 && this.delta_y() != 0);
    };

    this.is_horizontal = function () {
        return (this.delta_x() != 0 && this.delta_y() == 0);
    };

    /**
     * The slope or gradient of a line is a number that describes
     * both the direction and the steepness of the line.
     *
     * @returns {number}
     */
    this.slope = function () {
        return this.delta_y() / this.delta_x();
    };

    /**
     * y= f(x)= m*x - b
     *
     * @param x
     * @returns {*}
     */
    this.f = function (x) {
        return (self.slope() * x) + this.y_intercept();
    };

    /**
     * x= g(y)= (y + b) / m
     *
     * @param y
     * @returns {number}
     */
    this.g = function (y) {
        return (y + this.y_intercept()) / self.slope();
    };

    /**
     * A y-intercept or vertical intercept is a point where
     * the graph of a function or relation intersects the
     * y-axis of the coordinate system
     *
     * @returns {number}
     */
    this.y_intercept = function () {
        return from.y() - (self.slope() * from.x())
    };

    /**
     * Determine the intersection point of two line segments.
     * Return UNDEFINED if the lines don't intersect
     *
     * @see line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
     *
     * @param line
     * @returns {*}
     */
    this.intersection = function (line) {
        var x1 = self.from().x();
        var y1 = self.from().y();
        var x2 = self.to().x();
        var y2 = self.to().y();
        var x3 = line.from().x();
        var y3 = line.from().y();
        var x4 = line.to().x();
        var y4 = line.to().y();

        // Check if none of the lines are of length 0
        if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
            return undefined
        }

        var denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        // Lines are parallel
        if (denominator === 0) {
            return undefined
        }

        var ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
        var ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;

        // is the intersection along the segments
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return undefined
        }

        // Return a object with the x and y coordinates of the intersection
        var x = x1 + ua * (x2 - x1);
        var y = y1 + ua * (y2 - y1);

        return new Point(x, y);
    };

    this.intersects = function (line) {
        var intersection = self.intersection(line);
        return self.contains(intersection) && line.contains(intersection);
    };

    function first_step(start_at, inc) {
        return (start_at % inc == 0 ? start_at : (start_at - (start_at % inc) + inc));
    }

    this.points = function (options) {

        var defaults = {increment: 1, bounds_exclusive: false};
        options = $.extend({}, defaults, options || {});

        var points = [];

        if (self.is_vertical()) {
            var x = from.x();
            var start_at = Math.min(from.y(), to.y()) + 1;
            var end_at = Math.max(from.y(), to.y());

            for (var y = start_at; y <= end_at; y += 1) {
                if (Number.isInteger(y) && (y % options.increment == 0)) {
                    points.push(new Point(x, y));
                }
            }
            return points;
        }

        var start_at = first_step(options.bounds_exclusive ? from.x() + 1 : from.x(), options.increment);
        var end_at = options.bounds_exclusive ? to.x() - 1 : to.x();

        var c = from.y() - (this.slope() * from.x());

        for (var i = start_at; i <= end_at; i += options.increment) {
            var y = (this.slope() * i) + c;

            if (Number.isInteger(y) && (y % options.increment == 0)) {
                points.push(new Point(i, y))
            }
        }

        return points;
    };

    this.contains = function (point) {
        if (point) {
            return (Math.min(from.x(), to.x()) <= point.x()) && (point.x() <= Math.max(from.x(), to.x()))
                && (Math.min(from.y(), to.y()) <= point.y()) && (point.y() <= Math.max(from.y(), to.y()));
        }
        return false;
    };

    // inspired by: https://math.stackexchange.com/a/352833
    function increase(length, direction_point) {
        var x_increase =
            self.delta_x() / (Math.sqrt(Math.pow(self.delta_x(), 2) + Math.pow(self.delta_y(), 2)));
        var y_increase =
            self.delta_y() / (Math.sqrt(Math.pow(self.delta_x(), 2) + Math.pow(self.delta_y(), 2)));

        return new Point(
            direction_point.x() + (length * x_increase),
            direction_point.y() + (length * y_increase)
        );
    }

    this.increase_by_both_ends = function (length) {
        var new_from = increase(-length, from);
        var new_to = increase(length, to);

        return new Line(new_from, new_to);
    };

    this.overtake_length = function (line) {
        var intersection = self.intersection(line);
        if (intersection) {
            return new Line(intersection, line.to()).length();
        }
        return -1;
    };

    this.to_s = function () {
        return "Line(" + from.to_s() + " => " + to.to_s() + ")";
    };
}

function Vector(from_point, to_point) {
    var self = this;
    var line = new Line(from_point, to_point);

    this.from = function () {
        return line.from();
    };

    this.to = function () {
        return line.to();
    };

    this.delta_x = function () {
        return line.delta_x();
    };

    this.delta_y = function () {
        return line.delta_y();
    };

    this.translate_to = function (point) {
        var to_translated = new Point(point.x() + self.delta_x(), point.y() + self.delta_y());

        return new Vector(point, to_translated);
    };

    this.magnitude = function (round) {
        return round ? (Math.round(line.length() * 100) / 100) : line.length();
    };

    this.as_line = function () {
        return line;
    };

    this.to_s = function () {
        return "vector(" + line.from().to_s() + ", " + line.to().to_s() + ")";
    }
}