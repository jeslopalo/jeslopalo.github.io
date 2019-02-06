function CircuitDrawer(options) {

    const CELL_SIZE = 20;

    var defaults = {
        circuit: "default",
        cell_size: CELL_SIZE,
        height: 25 * CELL_SIZE,
        width: 25 * CELL_SIZE,
        start_line_color: "rgba(250,250,250,.4)",
        waypoint_color: "rgba(204,204,153,.3)",
        waypoint_width: 4,
        waypoint_tolerance_factor: 2,
        border_color: "#333",
        border_width: 4,
        track_color: "rgba(128,128,128,1)"
    };
    var settings = $.extend({}, defaults, options || {});

    var context;
    var starting_points = undefined;
    var track_layout;
    var circuit;

    var self = this;

    this.initialize = function (the_context) {

        context = the_context;
        circuit = CircuitFactory[settings.circuit];

        if (circuit == null) {
            throw new Error("Unknown circuit type: " + circuit);
        }
        circuit.initialize(settings);

        track_layout = circuit.track_layout();
    };

    this.starting_direction = function () {
        return circuit.starting_direction();
    };

    this.starting_points = function () {
        if (starting_points === undefined) {
            starting_points = circuit
                .starting_line()
                .points({
                    increment: settings.cell_size,
                    bounds_exclusive: true
                });
        }
        return starting_points.slice();
    };

    this.waypoints = function () {
        return circuit
            .waypoints()
            .map(add_tolerance)
            .map(function (line, index) {
                return new Waypoint(index, line);
            });
    };

    this.finish_line = function () {
        return add_tolerance(circuit.starting_line());
    };

    function add_tolerance(line) {
        var margin_tolerance = settings.cell_size * settings.waypoint_tolerance_factor;

        return line.increase_by_both_ends(margin_tolerance);
    }

    this.is_on_track = function (point) {
        if (context.isPointInPath(track_layout, point.x(), point.y())) {
            console.log("The " + point.to_s() + " is on track!");
            return true;
        }
        console.log("The " + point.to_s() + " is out of track!");
        return false;
    };

    this.draw = function () {
        draw_waypoints(context, settings);
        draw_circuit();
        draw_start_line(context, settings);
        return this;
    };

    function reset(context) {
        context.setLineDash([]);
        context.lineDashOffset = 0;
        context.lineWidth = 1;
    }

    function draw_circuit() {
        context.beginPath();
        context.strokeStyle = settings.border_color;
        context.fillStyle = settings.track_color;
        context.lineWidth = settings.border_width;

        context.stroke(track_layout);
        context.fill(track_layout);

        context.beginPath();
        context.font = "italic 20px Courier New";
        context.lineWidth = 1;
        context.textAlign = "center";
        context.strokeText(circuit.name(), settings.width / 2, settings.height - (settings.cell_size / 2));
        context.closePath();
    }

    function draw_start_line(context, settings) {
        var starting_line = circuit.starting_line();

        context.beginPath();
        context.lineWidth = 3;
        context.strokeStyle = settings.start_line_color;
        context.moveTo(starting_line.from().x(), starting_line.from().y());
        context.lineTo(starting_line.to().x(), starting_line.to().y());
        context.stroke();

        [0, settings.cell_size].forEach(function (offset) {
            var x_offset = starting_line.is_vertical() ? -(settings.cell_size * 0.25) - offset : 0;
            var y_offset = starting_line.is_horizontal() ? -(settings.cell_size * 0.25) - offset : 0;

            context.beginPath();
            context.lineWidth = settings.cell_size / 2;
            context.setLineDash([settings.cell_size / 2]);
            context.lineDashOffset = 0;
            context.moveTo(starting_line.from().x() + x_offset, starting_line.from().y() + y_offset);
            context.lineTo(starting_line.to().x() + x_offset, starting_line.to().y() + y_offset);
            context.stroke();

            x_offset = starting_line.is_vertical() ? -(settings.cell_size * 0.75) - offset : 0;
            y_offset = starting_line.is_horizontal() ? -(settings.cell_size * 0.75) - offset : 0;

            context.beginPath();
            context.lineWidth = settings.cell_size / 2;
            context.setLineDash([settings.cell_size / 2]);
            context.lineDashOffset = settings.cell_size / 2;
            context.moveTo(starting_line.from().x() + x_offset, starting_line.from().y() + y_offset);
            context.lineTo(starting_line.to().x() + x_offset, starting_line.to().y() + y_offset);
            context.stroke();
        });

        reset(context);
    }

    function draw_waypoints(context, settings) {
        if (circuit.waypoints) {
            self.waypoints()
                .forEach(function (waypoint) {
                    var line = waypoint.as_line();

                    context.beginPath();
                    context.lineWidth = settings.waypoint_width;
                    context.strokeStyle = settings.waypoint_color;
                    context.moveTo(line.from().x() - 0.5, line.from().y() + 0.5);
                    context.lineTo(line.to().x() - 0.5, line.to().y() + 0.5);
                    context.stroke();

                    reset(context);
                });
        }
    }
}

function Board(options) {

    var self = this;

    var settings = options;
    var canvas = document.getElementById(settings.canvas_id);
    var point_factory = new PointFactory(settings.cell_size);
    var circuit_drawer = new CircuitDrawer(settings);
    var context = null;

    this.initialize = function (on_select) {

        if (!canvas.getContext) {
            throw new Error("error: canvas context not found. Ough! :(");
        }

        context = canvas.getContext('2d');
        context.canvas.width = settings.width;
        context.canvas.height = settings.height;

        $(canvas).click(function (event) {
            on_select(clicked_point(canvas, point_factory, event));
        });

        circuit_drawer.initialize(context);

        return self;
    };

    this.waypoints = function () {
        return circuit_drawer.waypoints();
    };

    this.crosses_the_finish_line = function (player) {

        if (player.number_of_movements() > 1) {
            var last_movement = player.last_movement().as_line();

            return last_movement.intersects(circuit_drawer.finish_line()) &&
                circuit_drawer.starting_direction().check(last_movement.from(), last_movement.to());
        }
        return false;
    };

    this.finish_line_overtake = function (player) {
        if (self.crosses_the_finish_line(player)) {
            return circuit_drawer.finish_line()
                .overtake_length(player.last_movement().as_line());
        }
        return -1;
    };

    function is_on_track(point) {
        return circuit_drawer.is_on_track(point);
    }

    function draw_player(player) {

        draw_point(player.start_position(), {
            fill_color: player.options.color,
            stroke_color: player.options.color,
            radius: settings.cell_size / 5
        });

        draw_point(player.last_position(), {
            fill_color: player.options.color,
            stroke_color: "black",
            radius: settings.cell_size / 3
        });

        player.for_each_movement(function (vector) {

            draw_vector(vector, {
                fill_color: player.options.color,
                stroke_color: player.options.color,
                body_line_width: 2,
                head_stroke_color: "black"
            });
        });
    }

    function reference_point(player) {
        var reference_point = player.last_position();
        if (player.started() && !player.at_start_position() && is_on_track(player.last_position())) {
            reference_point = player.next_reference_vector().to();
        }
        return reference_point;
    }

    this.candidate_points = function (turn_player, players) {

        var invalid_points_at_start_line = function (candidate) {
            if (turn_player.at_start_position()) {
                var direction = circuit_drawer.starting_direction();
                return direction.check(reference_point(turn_player), candidate);
            }
            return true;
        };

        var player_positions = function (candidate) {
            return players
                    .filter(function (player) {
                        return player.started();
                    })
                    .map(function (player) {
                        return player.last_position();
                    })
                    .filter(function (player_position) {
                        return candidate.equals(player_position);
                    }).length == 0;
        };

        var out_of_canvas_positions = function (candidate) {
            return (0 <= candidate.x() && candidate.x() <= settings.width)
                && (0 <= candidate.y() && candidate.y() <= settings.height);
        };

        return candidate_points_for(turn_player)
            .filter(invalid_points_at_start_line)
            .filter(player_positions)
            .filter(out_of_canvas_positions);
    };

    function candidate_points_for(player) {
        var reference = reference_point(player);

        if (reference) {
            var points = [];
            var cell_size = settings.cell_size;

            points.push(new Point(reference.x() + cell_size, reference.y() + cell_size));
            points.push(new Point(reference.x() + cell_size, reference.y() - cell_size));
            points.push(new Point(reference.x() - cell_size, reference.y() - cell_size));
            points.push(new Point(reference.x() - cell_size, reference.y() + cell_size));
            points.push(reference);
            points.push(new Point(reference.x(), reference.y() + cell_size));
            points.push(new Point(reference.x() + cell_size, reference.y()));
            points.push(new Point(reference.x(), reference.y() - cell_size));
            points.push(new Point(reference.x() - cell_size, reference.y()));

            return points;
        }
        return circuit_drawer.starting_points();
    }

    function draw_next_position_candidates(turn_player, players) {

        var candidate_points = self.candidate_points(turn_player, players);

        candidate_points.forEach(function (point) {
            draw_square(point, {
                length: settings.cell_size / 3,
                fill_color: turn_player.options.color,
                stroke_color: "black"
            });
        });
    }

    function reset(context) {
        context.setLineDash([]);
        context.lineDashOffset = 0;
        context.lineWidth = 1;
    }

    function draw_canvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = settings.canvas_color || "whitesmoke";
        context.fill();
        context.fillRect(0, 0, canvas.width, canvas.height);

        //red line
        context.beginPath();
        context.moveTo(5.4 * settings.cell_size, 0);
        context.lineTo(5.4 * settings.cell_size, canvas.height);
        context.strokeStyle = 'red';
        context.stroke();

        circuit_drawer.draw(context);

        context.beginPath();

        /* vertical lines */
        for (var x = 0; x <= canvas.width; x += settings.cell_size) {
            context.moveTo(0.5 + x, 0);
            context.lineTo(0.5 + x, canvas.height);
        }

        /* horizontal lines */
        for (var y = 0; y <= canvas.height; y += settings.cell_size) {
            context.moveTo(0, 0.5 + y);
            context.lineTo(canvas.width, 0.5 + y);
        }

        /* draw it! */
        context.strokeStyle = 'rgba(150,150,250,0.5)';
        context.stroke();
    }

    this.draw = function (turn_player, players) {

        draw_canvas();

        players.forEach(draw_player);

        if (turn_player) {
            draw_next_position_candidates(turn_player, players);

            if (turn_player.started() && is_on_track(turn_player.last_position())) {
                draw_vector(turn_player.next_reference_vector(), {
                    fill_color: "#222",
                    stroke_color: "#333",
                    line_dash_offset: settings.cell_size / 2,
                    line_dash: [settings.cell_size / 5, settings.cell_size / 5]
                });
            }
        }

        return this;
    };

    function draw_point(point, options) {
        if (point) {
            context.beginPath();
            context.arc(point.x(), point.y(), options.radius || 2, 0, Math.PI * 2);
            context.fillStyle = options.fill_color;
            context.strokeStyle = options.stroke_color;
            context.fill();
            context.stroke();
            context.closePath();

            reset(context);
        }
    }

    function draw_square(point, options) {
        if (point) {
            var offset = options.length / 2;
            context.fillStyle = options.fill_color;
            context.strokeStyle = options.stroke_color;

            context.fillRect(point.x() - offset, point.y() - offset, options.length, options.length);
            context.strokeRect(point.x() - offset, point.y() - offset, options.length, options.length);

            reset(context);
        }
    }

    function draw_vector(vector, options) {

        if (!vector) {
            return;
        }

        var head_length = Math.max(5, Math.round(settings.cell_size * 0.44));

        var from = vector.from();
        var to = vector.to();

        var angle = Math.atan2(to.y() - from.y(), to.x() - from.x());

        //starting path of the arrow from the start square to the end square and drawing the stroke
        context.beginPath();
        context.moveTo(from.x(), from.y());
        context.lineTo(to.x(), to.y());
        context.lineDashOffset = options.line_dash_offset || 0;
        context.setLineDash(options.line_dash || []);
        context.strokeStyle = options.body_stroke_color || options.stroke_color;
        context.fillStyle = options.body_fill_color || options.fill_color;
        context.lineWidth = options.body_line_width || 1;
        context.stroke();
        context.fill();
        context.closePath();
        reset(context);

        //starting a new path from the head of the arrow to one of the sides of the point
        context.beginPath();
        context.moveTo(to.x(), to.y());
        context.lineTo(to.x() - head_length * Math.cos(angle - Math.PI / 7), to.y() - head_length * Math.sin(angle - Math.PI / 7));

        //path from the side point of the arrow, to the other side point
        context.lineTo(to.x() - head_length * Math.cos(angle + Math.PI / 7), to.y() - head_length * Math.sin(angle + Math.PI / 7));

        //path from the side point back to the tip of the arrow, and then again to the opposite side point
        context.lineTo(to.x(), to.y());
        context.lineTo(to.x() - head_length * Math.cos(angle - Math.PI / 7), to.y() - head_length * Math.sin(angle - Math.PI / 7));

        //draws the paths created above
        context.strokeStyle = options.head_stroke_color || options.stroke_color;
        context.lineWidth = 1;
        context.stroke();
        context.fillStyle = options.head_fill_color || options.fill_color;
        context.fill();

        context.closePath();

        reset(context);
    };

    function clicked_point(canvas, pointFactory, event) {
        var rect = canvas.getBoundingClientRect();

        var x = event.clientX - rect.left;
        var y = event.clientY - rect.top;

        return pointFactory.get(x, y);
    }
}

function Player(name, options) {

    var self = this;

    this.active = false;
    this.name = name;
    this.options = options;
    this.movements = new Stack();

    this.reload = function (state) {
        if (state) {
            self.active = state.active;
            self.name = state.name;
            self.options = state.options;
            self.movements = new Stack();
            state.movements.forEach(function (point) {
                self.movements.push(new Point(point.x, point.y));
            });
        }
        return self;
    };

    this.state = function () {
        var movements = self.movements.map(function (movement) {
            return {x: movement.x(), y: movement.y()};
        });
        return {active: self.active, name: self.name, options: self.options, movements: movements};
    };

    this.is_active = function () {
        return self.active;
    };

    this.stats = function () {
        return {
            number_of_movements: self.number_of_movements(),
            distance: self.distance(),
            speed: self.speed(),
            average_speed: self.average_speed(),
            max_speed: self.max_speed()
        };
    };

    this.started = function () {
        return !self.movements.empty();
    };

    this.at_start_position = function () {
        return self.movements.length() == 1;
    };

    this.move_to = function (to_point) {
        this.movements.push(to_point);
        return self;
    };

    this.start_position = function () {
        return self.movements.at(0);
    };

    this.has_finished = function (board) {
        return board.crosses_the_finish_line(self);
    };

    this.finish_line_overtake = function (board) {
        return board.finish_line_overtake(self);
    };

    this.last_position = function () {
        if (self.movements.empty()) {
            return undefined;
        }
        return self.movements.at(self.movements.length() - 1);
    };

    this.last_movement = function () {
        if (self.started() && !self.at_start_position()) {
            return new Vector(
                self.movements.at(self.movements.length() - 2),
                self.movements.at(self.movements.length() - 1));
        }
        return undefined
    };

    this.number_of_movements = function () {
        return vectors().length;
    };

    function round(number) {
        return number > 0 ? Math.floor(number * 100) / 100 : 0;
    }

    function distance() {
        var sum = 0;
        self.for_each_movement(function (v) {
            sum += v.magnitude();
        });
        return sum;
    }

    this.distance = function () {
        return round(distance());
    };

    this.speed = function () {
        var last_movement = this.last_movement();
        return round((last_movement ? last_movement.magnitude() : 0));
    };

    this.average_speed = function () {
        if (self.movements.length() <= 1) {
            return 0;
        }
        return round(this.distance() / this.number_of_movements());
    };

    this.max_speed = function () {
        var max = 0;
        self.for_each_movement(function (v) {
            max = Math.max(max, v.magnitude());
        });
        return round(max);
    };

    this.find_first_movement = function (filter) {
        var vector = vectors().find(filter);
        if (vector) {
            return {
                turn: vectors().findIndex(filter) + 1,
                vector: vector
            };
        }
        return undefined;
    };

    this.for_each_movement = function (callback) {
        vectors().forEach(callback);
    };

    function vectors() {
        var vectors = [];

        for (var i = 1; i < self.movements.length(); i++) {
            vectors.push(new Vector(self.movements.at(i - 1), self.movements.at(i)));
        }

        return vectors;
    };

    this.next_reference_vector = function () {
        if (!this.at_start_position()) {
            var last = this.last_movement();
            return last.translate_to(last.to());
        }
    };

    this.to_s = function () {
        return "Player(" + self.name + ", " + self.options.color + ")";
    };
}

function Stack() {
    this.elements = [];

    this.at = function (index) {
        return this.elements[index];
    };

    this.pop = function () {
        return this.elements.pop();
    };

    this.push = function (item) {
        this.elements.push(item);
    };

    this.peek = function () {
        if (this.elements.length > 0) {
            return this.elements[this.elements.length - 1];
        }
        return null;
    };

    this.clear = function () {
        this.elements = [];
    };

    this.length = function () {
        return this.elements.length;
    };

    this.empty = function () {
        return this.elements.length == 0;
    };

    this.map = function (func) {
        return this.elements.map(func);
    };
}

const GameEvent = {
    START: "start",
    OVER: "over",
    PLAYER_MOVE: "player-move",
    PLAYER_TURN: "player-turn",
    PLAYER_ENDS: "player-ends",
    UPDATED_STATE: "updated-state"
};

function Game(state) {

    var self = this;

    var turn = state ? state.turn() : -1;
    var players = state ? state.players() : [];
    var options = state ? state.options() : {};

    var listeners = [];

    var board = new Board(options).initialize(on_select);

    this.reload = function (state) {
        if (state) {
            options = state.options();
            turn = state.turn();
            players = state.players();
            board = new Board(options).initialize(on_select);
        }
        return self;
    };

    this.state = function () {
        var players_state = players.map(function (p) {
            return p.state();
        });

        return {
            options: options,
            turn: turn,
            players: players_state
        };
    };

    function on_select(point) {

        if (!self.is_on_going()) {
            return
        }

        var is_a_candidate_point = function (point) {
            var candidates = board.candidate_points(self.turn_player(), players)
                .filter(function (candidate) {
                    return candidate.equals(point);
                });
            return candidates.length > 0;
        };

        if (is_a_candidate_point(point)) {
            console.log(point.to_s() + " is selectable!");

            var turn_player = players[turn];

            turn_player.move_to(point);
            notify_listeners(GameEvent.PLAYER_MOVE, turn_player);

            if (turn_player.has_finished(board)) {
                console.log("GREAT! " + turn_player.to_s() + " finish the race!");
                notify_listeners(GameEvent.PLAYER_ENDS, turn_player);
            }
        }
    }

    this.active_players = function () {
        return players
            .filter(function (p) {
                return p.is_active()
            })
            .slice(0);
    }

    function player_position_resume(player, waypoints) {

        var last_waypoint = waypoints.find(function (waypoint) {
            var crossed = waypoint.crossed_by(player);
            if (crossed) {
                console.log(player.name + " has crossed the waypoint " + waypoint.order + "!");
            }
            return crossed;
        });
        return {
            number_of_movements: player.number_of_movements(),
            finished: player.has_finished(board),
            finish_line_overtake: player.finish_line_overtake(board),
            last_waypoint: last_waypoint,
            average_speed: player.average_speed()
        };
    }

    this.classification = function () {
        var waypoints = board.waypoints().reverse();
        return self.active_players()
            .sort(function (player_a, player_b) {
                var a = player_position_resume(player_a, waypoints);
                var b = player_position_resume(player_b, waypoints);

                /** If both players has been finished */
                if (a.finished && b.finished) {
                    if (a.number_of_movements != b.number_of_movements) {
                        return a.number_of_movements - b.number_of_movements;
                    }
                    return b.finish_line_overtake - a.finish_line_overtake;
                }

                /** If a player has been finished */
                if (a.finished != b.finished) {
                    return a.finished ? -1 : 1;
                }

                /** If players doesn't cross any waypoint */
                if (!a.last_waypoint && !b.last_waypoint) {
                    if (player_b.last_movement() && player_a.last_movement()) {
                        return b.average_speed - a.average_speed;
                    }
                    return 0
                }

                /** If only one has crossed a waypoint */
                if (!a.last_waypoint != !b.last_waypoint) {
                    return a.last_waypoint ? -1 : 1;
                }

                /** If it's not the same waypoint */
                if (a.last_waypoint.order != b.last_waypoint.order) {
                    return b.last_waypoint.order - a.last_waypoint.order;
                }

                var a_overtake_movement = a.last_waypoint.overtake_movement(player_a);
                var b_overtake_movement = b.last_waypoint.overtake_movement(player_b);

                /** If it's the same waypoint and turn but not in the last movement */
                if ((a_overtake_movement.turn != player_a.number_of_movements()) ||
                    (b_overtake_movement.turn != player_b.number_of_movements())) {
                    return b.average_speed - a.average_speed;
                }

                /** If it's the same waypoint but not in the same turn */
                if (a_overtake_movement.turn != b_overtake_movement.turn) {
                    return a_overtake_movement.turn - b_overtake_movement.turn;
                }

                return b.last_waypoint.overtake_length(player_b) - a.last_waypoint.overtake_length(player_a);
            });
    };


    this.listen = function (event, on_event) {
        listeners.push({event: event, on_event: on_event});
    };

    function notify_listeners(event, payload) {
        listeners.forEach(function (listener) {
            if (listener.event == event) {
                return listener.on_event(self, payload);
            }
        });
    };

    this.start = function () {
        notify_listeners(GameEvent.START);

        return this.continue();
    };

    this.continue = function () {
        next_turn();
        update();

        return this;
    };

    this.is_on_going = function () {
        return (players.length != 0) && !self.is_over()
    };

    this.is_started = function () {
        return turn >= 0;
    };

    this.is_over = function () {
        var running_players = players.filter(function (p) {
            return p.is_active() && !p.has_finished(board)
        });

        return running_players == 0;
    };

    this.turn_player = function () {
        return players[turn];
    };

    function next_turn() {
        if (self.is_on_going()) {
            turn = (turn + 1) % players.length;

            while (!players[turn].is_active() || players[turn].has_finished(board)) {
                turn = (turn + 1) % players.length;
            }

            notify_listeners(GameEvent.PLAYER_TURN, players[turn]);

            console.log("Ok, now it's '" + players[turn].name + "' turn!");
            return players[turn];
        }
    }

    function update() {
        board.draw(self.is_over() ? undefined : players[turn], players);

        if (self.is_over()) {
            notify_listeners(GameEvent.OVER);
        }
    }
}

function State(the_state) {

    var defaults = {
        options: {
            circuit: "ring",
            canvas_id: "canvas",
            width: 500,
            height: 500,
            track_width: 70,
            cell_size: 20,
            max_players: 3
        },
        turn: -1,
        players: []
    };
    var state = $.extend({}, defaults, the_state || {});

    var $circuit = $("#circuit");
    var $players = $("#players");

    this.state = function () {
        return state;
    };

    this.turn = function () {
        return state.turn;
    };

    this.players = function () {
        if (state.players) {
            return state.players
                .map(function (p) {
                    //TODO remove reload and change the constructor
                    return new Player().reload(p);
                });
        }
        return [];
    };

    this.options = function () {
        return state.options ? state.options : defaults.options;
    };

    function decode(hash) {
        if (hash) {
            return JSON.parse(atob(decodeURIComponent(hash)));
        }
    }

    function encode(state) {
        if (state) {
            var stringified = JSON.stringify(state);
            return encodeURIComponent(btoa(stringified));
        }
    }

    this.from_hash = function () {
        if (location.hash) {
            state = decode(location.hash.slice(1));
        }
        return this;
    };

    this.to_hash = function () {
        if (state) {
            location.hash = encode(state);
        }
        return this;
    };

    this.read_form = function () {
        if ($circuit.val()) {
            state.options.circuit = $circuit.val();
        }
        state.turn = -1;

        state.players = [];
        for (var i = 1; i <= state.options.max_players; i += 1) {
            state.players[i - 1] = {
                active: $players.find("#player_" + i).prop("checked"),
                name: $players.find("#name_" + i).val(),
                options: {
                    color: $players.find("#color_" + i).val()
                },
                movements: []
            };
        }

        return this;
    };

    this.write_form = function () {
        if (state.options.circuit) {
            $circuit.val(state.options.circuit);
        }

        if (state.players) {
            for (var i = 1; i <= state.options.max_players; i += 1) {
                $players.find("#player_" + i).prop("checked", state.players[i - 1].active);
                $players.find("#name_" + i).val(state.players[i - 1].name);
                $players.find("#color_" + i).val(state.players[i - 1].options.color);
            }
        }
        return this;
    };
}

function update_classification(game) {
    var $classification = $("#classification tbody").empty();
    var $stats = $('#stats tbody').empty();

    console.log("Updating classification...");

    var rank_body = "";
    var stats_body = "";

    game.classification()
        .forEach(function (player, index) {
            var stats = player.stats();

            rank_body += '<tr><td>' +
                (index + 1) +
                '</td><td class="classified" style="color:' + player.options.color + ';">'
                + player.name + '</td><td>' + stats.number_of_movements + '</td></tr>';

            stats_body += '<tr>' +
                '<td style="color:' + player.options.color + ';">' + stats.distance +
                '</td><td style="color:' + player.options.color + ';">' + stats.speed +
                '</td><td style="color:' + player.options.color + ';">' + stats.average_speed +
                '</td><td style="color:' + player.options.color + ';">' + stats.max_speed + '</td></tr>';
        });

    $classification.append(rank_body);
    $stats.append(stats_body)
}

var $messenger = $("#messenger");
function write_message(message) {
    $messenger
        .append('<li>' + message + '</li>')
        .animate({scrollTop: $messenger.prop("scrollHeight")}, 500);
}
function clean_messenger() {
    $messenger.empty();
}

function play(game, state) {

    var name = function (player) {
        return '<span style="color:' + player.options.color + ';"><b> ' + player.name + '</b></span>';
    };

    try {
        game.listen(GameEvent.START, function (game) {

            var players = game.active_players();
            var names = function (players) {
                return players.map(name);
            };

            clean_messenger();
            if (players.length == 1) {
                write_message(names(players).join() + " is the only player")
            } else {
                write_message("<b>" + players.length + "</b> players at the start line: " + names(players).join());
            }
            write_message("The race is going to start...");
            write_message("Ready, steady, go!");
        });

        game.listen(GameEvent.OVER, function (game) {
            write_message("The race is over and the winner is " + name(game.classification()[0]));
            write_message("Try it again!");
        });

        game.listen(GameEvent.PLAYER_TURN, function (game, player) {
            if (!player.started()) {
                write_message("Ok, " + name(player) + ", choose your start position!");
            }
            else {
                write_message(name(player) + ", it's your turn!");
            }
        });

        game.listen(GameEvent.PLAYER_MOVE, function (game, player) {
            state = new State(game.state()).to_hash();
            write_message(name(player) + " has moved at a speed of <b>" + player.last_movement().magnitude(true) + "</b> pixels/turn");
        });

        game.listen(GameEvent.PLAYER_ENDS, function (game, player) {
            write_message("Congrats, " + name(player) + " you finish the race!");
        });

        return game.is_started() ? game.continue() : game.start();

    } catch (error) {
        console.log(error);
    }
}

function prepare_game(options) {

    var state = new State({options: options})
        .read_form()
        .from_hash()
        .to_hash()
        .write_form();
    var game = play(new Game(state), state);
    update_classification(game);

    $(window).on('hashchange', function () {
        state = new State({options: options}).from_hash().write_form();
        game.reload(state).is_started() ? game.continue() : game.start();
        update_classification(game);
        return true;
    });

    var $players = $("#players");
    $("#new-game").click(function () {
        if ($players.find("input[type=checkbox]:checked").length == 0) {
            return false;
        }

        options.width = Math.max($(window).width() - 500, 500);
        options.height = Math.max($(window).height() - 200, 500);

        state = new State({options: options}).read_form().to_hash();
        return true;
    });

    $("input[type=checkbox]").change(function () {
        var $self = $(this);
        if (!$self.prop("checked")) {
            if ($players.find("input[type=checkbox]:checked").length == 0) {
                $self.prop("checked", true);
            }
        }
    });
}

$(function () {

    var options = {
        //canvas_color: "#FFFFA5",
        circuit: "default",
        canvas_id: "canvas",
        width: Math.max($(window).width() - 500, 500),
        height: Math.max($(window).height() - 200, 500),
        track_width: 60,
        cell_size: 15,
        max_players: 3
    };

    prepare_game(options);
});