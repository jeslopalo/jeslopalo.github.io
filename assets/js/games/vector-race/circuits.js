function TheExperimentCircuit() {

    this.id = "experiment";

    var settings = [];
    var track_width = 50;
    var margin = 3.1;

    this.initialize = function (options) {
        settings = options;
        track_width = settings.track_width || track_width;
    };

    function c(number) {
        return number * settings.cell_size;
    }

    this.track_layout = function () {
        var columns = settings.width / settings.cell_size;
        var rows = settings.height / settings.cell_size;

        // A ----- B
        // |
        // |
        // C
        var point_a = new Point(c(margin), c(margin));
        var point_b = new Point(c(columns - margin), c(margin));
        var point_c = new Point(c(margin), c(rows - margin));

        var track_layout = new Path2D();
        track_layout.moveTo(point_a.x(), point_a.y());
        track_layout.lineTo(point_b.x(), point_b.y());
        track_layout.lineTo(point_c.x(), point_c.y());
        track_layout.closePath();

        track_layout.moveTo(point_a.x() + track_width, point_a.y() + track_width);
        track_layout.lineTo(point_a.x() + track_width, point_c.y() - (track_width * 1.75));
        track_layout.lineTo(point_b.x() - (track_width * 3.5), point_b.y() + track_width);
        track_layout.closePath();

        return track_layout;
    };

    function normalize(coordinate) {
        return Math.round(coordinate / settings.cell_size) * settings.cell_size
    }

    this.starting_line = function () {
        var y = normalize((settings.height / 2));

        return new Line(
            new Point(margin * settings.cell_size, y),
            new Point((margin * settings.cell_size) + track_width, y));
    };

    this.starting_direction = function () {
        return StartingDirection.UP;
    };

    this.waypoints = function () {
        var waypoints = [];
        var offset = 1;

        waypoints.push(new Line(
            new Point((settings.width / 3) - offset, c(margin)),
            new Point((settings.width / 3) - offset, c(margin) + track_width)
        ));

        waypoints.push(new Line(
            new Point(settings.width / 3, 210 + c(margin)),
            new Point((settings.width / 3) + 35, 210 + c(margin) + track_width)
        ));

        waypoints.push(new Line(
            new Point(margin * settings.cell_size, normalize((settings.height / 2)) + offset),
            new Point((margin * settings.cell_size) + track_width, normalize((settings.height / 2)) + offset)
        ));

        return waypoints;
    };

    this.name = function () {
        return "The Experiment Racing Circuit";
    };
}

function TheRingCircuit() {

    this.id = "ring";

    var settings = [];
    var track_width = 100;
    var external_radius = 450;
    var internal_radius = external_radius - track_width;

    this.initialize = function (options) {
        settings = options;

        track_width = settings.track_width || track_width;
        external_radius = (Math.min(settings.height, settings.width) - (4 * settings.cell_size)) / 2;
        internal_radius = external_radius - track_width;
    };

    this.track_layout = function () {
        var track_layout = new Path2D();

        track_layout.arc(
            settings.width / 2,
            settings.height / 2,
            external_radius, Math.PI * 2, 0, false);

        track_layout.moveTo(
            (settings.width / 2) + internal_radius,
            (settings.height / 2));

        track_layout.arc(
            settings.width / 2,
            settings.height / 2,
            internal_radius, Math.PI * 2, 0, true);

        return track_layout;
    };

    function normalize(coordinate) {
        return Math.round(coordinate / settings.cell_size) * settings.cell_size
    }

    this.starting_line = function () {
        var y = normalize(settings.height / 2);

        return new Line(
            new Point((settings.width / 2) - external_radius, y),
            new Point((settings.width / 2) - internal_radius, y));
    };

    this.starting_direction = function () {
        return StartingDirection.UP;
    };

    this.waypoints = function () {
        var waypoints = [];
        var offset = 1;

        waypoints.push(new Line(
            new Point(normalize(settings.width / 2) - offset, (settings.height / 2) - external_radius),
            new Point(normalize(settings.width / 2) - offset, (settings.height / 2) - internal_radius)
        ));

        waypoints.push(new Line(
            new Point((settings.width / 2) + internal_radius, normalize(settings.height / 2) + offset),
            new Point((settings.width / 2) + external_radius, normalize(settings.height / 2) + offset)
        ));

        waypoints.push(new Line(
            new Point(normalize(settings.width / 2) - offset, (settings.height / 2) + internal_radius),
            new Point(normalize(settings.width / 2) - offset, (settings.height / 2) + external_radius)
        ));

        waypoints.push(new Line(
                new Point((settings.width / 2) - external_radius, normalize(settings.height / 2) + offset),
                new Point((settings.width / 2) - internal_radius, normalize(settings.height / 2) + offset))
        );

        return waypoints;
    };

    this.name = function () {
        return "The Ring Racing Circuit";
    };
}

function BrunoloRacingCircuit() {

    this.id = "brunolo";

    var settings = [];
    var xoff = 0;
    var yoff = 0;
    var scale_factor = 1;

    this.initialize = function (options) {
        settings = options;
        scale_factor = Math.min(settings.width, settings.height) / 675;
        xoff = -90 + (settings.width / 7);
    };

    function scale(factor, dimension) {
        return factor * dimension;
    }

    function s(dimension) {
        return scale(scale_factor, dimension);
    };

    this.track_layout = function () {
        var track_layout = new Path2D();

        track_layout.moveTo(s(150 + xoff), s(50 + yoff));
        track_layout.bezierCurveTo(s(345 + xoff), s(4 + yoff), s(522 + xoff), s(50 + yoff), s(525 + xoff), s(60 + yoff));
        track_layout.bezierCurveTo(s(638 + xoff), s(114 + yoff), s(628 + xoff), s(137 + yoff), s(554 + xoff), s(266 + yoff));
        track_layout.bezierCurveTo(s(530 + xoff), s(305 + yoff), s(517 + xoff), s(309 + yoff), s(568 + xoff), s(331 + yoff));
        track_layout.bezierCurveTo(s(677 + xoff), s(385 + yoff), s(699 + xoff), s(580 + yoff), s(517 + xoff), s(620 + yoff));
        track_layout.bezierCurveTo(s(502 + xoff), s(620 + yoff), s(212 + xoff), s(619 + yoff), s(197 + xoff), s(619 + yoff));
        track_layout.bezierCurveTo(s(150 + xoff), s(619 + yoff), s(99 + xoff), s(594 + yoff), s(100 + xoff), s(551 + yoff));
        track_layout.bezierCurveTo(s(100 + xoff), s(566 + yoff), s(100 + xoff), s(116 + yoff), s(100 + xoff), s(131 + yoff));
        track_layout.bezierCurveTo(s(103 + xoff), s(65 + yoff), s(115 + xoff), s(64 + yoff), s(150 + xoff), s(50 + yoff));

        track_layout.moveTo(s(200 + xoff), s(150 + yoff));
        track_layout.bezierCurveTo(s(198 + xoff), s(265 + yoff), s(198 + xoff), s(265 + yoff), s(198 + xoff), s(510 + yoff));
        track_layout.bezierCurveTo(s(198 + xoff), s(540 + yoff), s(230 + xoff), s(540 + yoff), s(250 + xoff), s(540 + yoff));
        track_layout.bezierCurveTo(s(198 + xoff), s(540 + yoff), s(230 + xoff), s(540 + yoff), s(500 + xoff), s(540 + yoff));
        track_layout.bezierCurveTo(s(608 + xoff), s(550 + yoff), s(570 + xoff), s(410 + yoff), s(500 + xoff), s(390 + yoff));
        track_layout.bezierCurveTo(s(408 + xoff), s(350 + yoff), s(440 + xoff), s(300 + yoff), s(450 + xoff), s(280 + yoff));
        track_layout.bezierCurveTo(s(500 + xoff), s(180 + yoff), s(540 + xoff), s(160 + yoff), s(500 + xoff), s(140 + yoff));
        track_layout.bezierCurveTo(s(400 + xoff), s(90 + yoff), s(200 + xoff), s(100 + yoff), s(200 + xoff), s(150 + yoff));

        return track_layout;
    };

    function normalize(coordinate) {
        return Math.round(coordinate / settings.cell_size) * settings.cell_size
    }

    this.starting_line = function () {
        var y = normalize(s(310 + yoff));

        return new Line(
            new Point(s(100 + xoff), y),
            new Point(s(199 + xoff), y));
    };

    this.starting_direction = function () {
        return StartingDirection.UP;
    };

    this.waypoints = function () {
        var waypoints = [];
        var offset = 1;

        waypoints.push(new Line(
                new Point(s(110 + xoff), s(70 + yoff)),
                new Point(s(210 + xoff), s(137 + yoff)))
        );

        waypoints.push(new Line(
                new Point(s(580 + xoff), s(85 + yoff)),
                new Point(s(510 + xoff), s(150 + yoff)))
        );

        waypoints.push(new Line(
                new Point(s(550 + xoff), s(315 + yoff)),
                new Point(s(485 + xoff), s(385 + yoff)))
        );

        waypoints.push(new Line(
                new Point(s(515 + xoff) + offset, s(537 + yoff)),
                new Point(s(515 + xoff) + offset, s(622 + yoff)))
        );

        waypoints.push(new Line(
            new Point(s(253 + xoff) + offset, s(537 + yoff)),
            new Point(s(253 + xoff) + offset, s(622 + yoff))
        ));

        waypoints.push(new Line(
            new Point(s(100 + xoff), normalize(s(310 + yoff)) + offset),
            new Point(s(199 + xoff), normalize(s(310 + yoff)) + offset)
        ));

        return waypoints;
    };

    this.name = function () {
        return "Brunolo Racing Circuit";
    };
}

var StartingDirection = {
    DOWN: {
        check: function (reference, candidate) {
            return reference.y() < candidate.y();
        }
    },
    UP: {
        check: function (reference, candidate) {
            return reference.y() > candidate.y();
        }
    },
    RIGHT: {
        check: function (reference, candidate) {
            return reference.x() < candidate.x();
        }
    },
    LEFT: {
        check: function (reference, candidate) {
            return reference.x() > candidate.x();
        }
    }
};

var CircuitFactory = {
    default: new TheRingCircuit(),
    ring: new TheRingCircuit(),
    brunolo: new BrunoloRacingCircuit(),
    experiment: new TheExperimentCircuit()
};

function Waypoint(order, line) {

    this.order = order;
    var cache = [];

    function movement(player) {

        var cached_value = cache.find(function (hit) {
            return hit.player.name == player.name;
        });

        if (cached_value == undefined) {
            var movement = player
                .find_first_movement(function (m) {
                    return m.as_line().intersects(line);
                });

            if (movement != undefined) {
                cached_value = {
                    player: player,
                    movement: movement,
                    overtake_length: line.overtake_length(movement.vector.as_line())
                };
                cache.push(cached_value);
            }
        }

        return cached_value;
    }

    this.crossed_by = function (player) {
        return movement(player) != undefined;
    };

    this.overtake_movement = function (player) {
        return movement(player).movement;
    };

    this.overtake_length = function (player) {
        var cached_value = movement(player);
        return cached_value == undefined ? -1 : cached_value.overtake_length;
    };

    this.as_line = function () {
        return line;
    };

    this.to_s = function () {
        return "Waypoint(" + line.from().to_s() + " => " + line.to().to_s() + ")";
    };
}
