function Stack() {
    this.movements = new Array();

    this.pop = function () {
        return this.movements.pop();
    }

    this.push = function (item) {
        this.movements.push(item);
    }

    this.peek = function () {
        if (this.movements.length > 0) {
            return this.movements[this.movements.length - 1];
        }
        return null;
    };

    this.clear = function () {
        this.movements = new Array();
    };

    this.empty = function () {
        return this.movements.length == 0;
    };
}

function Counter() {
    this.counter = 0;

    this.increase = function () {
        return ++this.counter;
    };

    this.decrease = function () {
        return this.counter == 0 ? this.counter : --this.counter;
    };

    this.value = function () {
        return this.counter;
    };

    this.reset = function () {
        this.counter = 0;
    };
}

function Cell(row, column) {
    this._row = row;
    this._column = column;

    this._selected = false;
    this._value = null;

    this.row = function () {
        return this._row;
    };

    this.column = function () {
        return this._column;
    };

    this.equals = function (other) {
        return this._row == other._row && this._column == other._column;
    };

    this.element = function () {
        return $('[data-coordinates="' + this.coordinates() + '"]')
    };

    this.coordinates = function () {
        return [this._row, this._column];
    };

    this.selected = function () {
        return this._selected;
    };

    this.select = function (value) {
        this._selected = true;
        this._value = value;
        return this;
    };

    this.unselect = function () {
        this._selected = false;
        this._value = null;
        return this;
    };

    this.value = function (value) {
        if (value) {
            this._value = value;
        }
        return this._value;
    };

    this.update = function ($tableCell, board) {
        this._selected ? $tableCell.addClass("selected") : $tableCell.removeClass("selected");
        var background = "";
        var color = "";
        if (!$tableCell.hasClass("last") && this._value) {
            background = "rgb(" + (255 - this._value) + "," + (255 - this._value) + "," + (230 - this._value) + ")";
            color = "rgb(" + (15 + this._value) + "," + (15 + this._value) + "," + (30 + this._value) + ")";
        }
        var cellLength = board.cellLength();
        $tableCell.css('background-color', background);
        $tableCell.css('color', color);
        $tableCell.css("width", cellLength + 'px')
        $tableCell.css("height", cellLength + 'px');
        $tableCell.text(this._value);
    };

    this.toString = function () {
        return this.coordinates() + " = " + this._value + " - " + this._selected + " - " + (this.element().hasClass("last") ? "last" : "");
    };
}

function Board(canvas, container, dimensions) {
    const MIN_CELL_LENGTH = 38;
    const MAX_CELL_LENGTH = 120;

    this.$canvas = $(canvas);
    this.$board = $(container);

    this.dimensions = dimensions;
    this.movements = new Stack();
    this.counter = new Counter();
    this.finished = false;

    this.initialize = function () {
        this.$board.html(createGameBoard(this));
        return this;
    };

    this.reinitialize = function (dimensions) {
        this.dimensions = dimensions;
        this.finished = false;
        $("#message").text("");
        this.counter.reset();
        this.movements.clear()
        this.$board.html(createGameBoard(this));
        return this;
    };

    this.cellLength = function () {
        var viewport_width = $(window).width();
        var viewport_height = $(window).height();

        var min_total_length =
            Math.min(viewport_height, viewport_width) - (screenfull.isFullscreen ? 100 : 200);

        return Math.max(Math.min(Math.floor(min_total_length / this.dimensions.rows), MAX_CELL_LENGTH), MIN_CELL_LENGTH);
    };

    this.click = function (element) {
        if (!this.finished) {
            $element = $(element);

            cell = $element.data("cell");
            last = this.movements.peek();

            //si puede ser seleccionada
            if (is_selectable(this, cell)) {
                console.log("La celda es seleccionable " + cell.toString());
                cell.select(this.counter.increase());
                this.movements.push(cell);
            }

            // se ha elegido el último seleccionado
            else if (last && cell.equals(last)) {
                console.log("Deseleccionando celda " + cell.toString());
                this.movements.pop();
                this.counter.decrease();

                cell.unselect()
            }
        }

        return this.update();
    };

    function is_selectable(board, cell) {
        var current = board.getCurrentCell();

        return current == null || candidates(board, current).find(function (candidate) {
                return candidate.equals(cell);
            });
    }

    this.getCell = function (row, column) {
        return getTableCell([row, column].join(",")).data("cell");
    }

    this.getCurrentCell = function () {
        return this.movements.peek();
    };

    function getTableCell(cell) {
        if (cell instanceof String) {
            return $('[data-coordinates="' + cell + '"]')
        }
        if (cell instanceof Cell) {
            return $('[data-coordinates="' + cell.coordinates() + '"]')
        }
        return $('[data-coordinates="' + cell + '"]');
    };

    this.update = function () {
        $(".last").removeClass("last");
        $(".candidate").removeClass("candidate");
        $("#message").text("");

        var currentCell = this.movements.peek();

        $currentTableCell = getTableCell(currentCell);
        if ($currentTableCell) {
            $currentTableCell.addClass("last");
        }

        board = this;
        this.$board.find(".cell").each(function () {
            var $tableCell = $(this);
            var cell = $tableCell.data("cell");

            cell.update($tableCell, board);
        });

        candidates(this, currentCell).forEach(function (candidate) {
            getTableCell(candidate).addClass("candidate");
        });

        return this;
    };

    this.checkWinner = function () {

        $("#message").removeClass("loser winner");

        if (!this.movements.empty() && $(".candidate").length == 0) {
            this.finished = true;

            if (this.counter.value() == this.dimensions.size()) {
                console.log("Tenemos ganador!");
                $("#message").addClass("winner").text("Great job! you win! (^__^)");
            }
            else {
                console.log("Partida perdida... :(")
                $("#message").addClass("loser").text("Game over! Don't worry and try again");
            }
        }
        return this;
    };

    function candidates(board, current) {
        var cells = new Array();

        if (current) {
            cells.push(board.getCell(current.row() - 2, current.column() - 1));
            cells.push(board.getCell(current.row() - 2, current.column() + 1));

            cells.push(board.getCell(current.row() - 1, current.column() - 2));
            cells.push(board.getCell(current.row() - 1, current.column() + 2));

            cells.push(board.getCell(current.row() + 1, current.column() - 2));
            cells.push(board.getCell(current.row() + 1, current.column() + 2));

            cells.push(board.getCell(current.row() + 2, current.column() - 1));
            cells.push(board.getCell(current.row() + 2, current.column() + 1));
        }

        return cells.filter(function (cell) {
            return board.dimensions.contains(cell) && !cell.selected();
        });
    }

    function createGameBoard(board) {

        var dimensions = board.dimensions;
        var table = $('<table></table>')
            .attr({
                id: "gameBoard",
                "data-rows": dimensions.rows,
                "data-columns": dimensions.columns
            });

        for (var i = 1; i <= dimensions.rows; i++) {
            var row = $('<tr></tr>').appendTo(table);

            for (var j = 1; j <= dimensions.columns; j++) {
                var cell = new Cell(i, j);
                var cellLength = board.cellLength();

                $('<td></td>')
                    .data("cell", cell)
                    .attr("data-coordinates", cell.coordinates())
                    .addClass("cell")
                    .css("width", cellLength + 'px')
                    .css("height", cellLength + 'px')
                    .click(function () {
                        board.click($(this));
                        board.checkWinner();
                    })
                    .appendTo(row);
            }
        }
        return table;
    }
}

function Dimensions() {

    const MIN_DIMENSION_VALUE = 1;
    const MAX_DIMENSION_VALUE = 15;

    this.rows = 10;
    this.columns = 10;

    this.contains = function (cell) {
        if (!cell) {
            return false;
        }
        return cell.row() >= MIN_DIMENSION_VALUE && cell.row() <= this.rows &&
            cell.column() >= MIN_DIMENSION_VALUE && cell.column() <= this.columns;
    };

    this.readHash = function () {
        if (location.hash) {
            var hash_info = location.hash.slice(1).split("x");

            this.rows = sanitize(hash_info[0]);
            this.columns = sanitize(hash_info[1]);
            location.hash = this.rows + "x" + this.columns;
        }
        return this;
    };

    this.writeHash = function () {
        location.hash = this.rows + "x" + this.columns;
        return this;
    };

    this.readForm = function () {
        this.rows = $("input#rows").val();
        this.columns = $("input#columns").val();
        return this;
    };

    this.writeForm = function () {
        $("input#rows").val(this.rows);
        $("input#columns").val(this.columns);
        return this;
    };

    this.size = function () {
        return this.rows * this.columns;
    };

    function sanitize(value) {
        return Math.min(Math.max(value, MIN_DIMENSION_VALUE), MAX_DIMENSION_VALUE);
    }
}

$(function () {

    var dimensions = new Dimensions().readHash().writeHash().writeForm();
    var board = new Board("#canvas", "#board #table", dimensions).initialize();

    $("#clean").click(function (e) {
        e.preventDefault();
        var dimensions = new Dimensions().readForm().writeHash().writeForm();
        board.reinitialize(dimensions);
    });

    $(window).on('resize', function () {
        board.update();
    });

    $(window).on('hashchange', function () {
        var dimensions = new Dimensions().readHash().writeHash().writeForm();
        board.reinitialize(dimensions);
    });

    if (screenfull.enabled) {
        screenfull.on('change', function (event) {
            console.log(event);

            onFullscreenChange(board);
        });

        $("input[type=checkbox].fullscreen-activator").change(function () {
            screenfull.toggle(board.$canvas[0]);
        });

        $("a.fullscreen-activator").click(function (event) {
            event.preventDefault();
            screenfull.toggle(board.$canvas[0]);
        });
    }
});

function onFullscreenChange(board) {
    $activator_links = $("a.fullscreen-activator");
    $activator_checkboxes = $("input[type=checkbox].fullscreen-activator");

    var isFullscreen = screenfull.isFullscreen;

    board.$canvas.toggleClass("fullscreen");
    $activator_links.find("i").toggleClass(isFullscreen ? "fa-expand fa-compress" : "fa-compress fa-expand");
    $activator_checkboxes.prop('checked', isFullscreen);

    board.update();
}