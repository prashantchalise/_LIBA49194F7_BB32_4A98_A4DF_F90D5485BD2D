/* direction.js */

const Direction = {
    Horizontal: 0,
    Vertical: 1,
    DiagonalUp: 2,
    DiagonalDown: 3
};

function randomDirection(allowDiagonal = true) {
    const maxDirection = allowDiagonal ? Direction.DiagonalDown : Direction.Vertical;
    return randomIntInRange(0, maxDirection);
}

function getWordRowCol(direction, row, col, index) {
    var r = row;
    var c = col;
    if (direction === Direction.Horizontal || direction === Direction.DiagonalDown) {
        r += index;
    } else if (direction === Direction.DiagonalUp) {
        r -= index;
    }
    if (direction === Direction.Vertical || direction === Direction.DiagonalDown || direction === Direction.DiagonalUp) {
        c += index;
    }
    return { row: r, col: c };
};

/*word.js*/

function reverseWord(word) {
    return word.split('').reverse().join('');
}

var cleanWord = function (word) {
    return word.split(' ').join('').toUpperCase();
};

var sortWordList = function (words) {
    return words.sort(function (a, b) {
        return b.length - a.length;
    });
};

/*//random.js*/
var randomIntInRange = function (min, max) {
    var iMin = Math.ceil(min);
    var iMax = Math.floor(max);
    return Math.floor(Math.random() * (iMax - iMin + 1)) + iMin;
};
var randomBool = function () {
    return Math.random() >= 0.5;
};
function randomChar() {
    return String.fromCharCode(randomIntInRange(65, 90));
}

/*//grid.js*/
function createGrid(options) {
    const size = options.size;
    const grid = [];
    for (let i = 0; i < size.height; i++) {
        grid.push(Array(size.width).fill(undefined));
    }
    return grid;
}

function cloneGrid(grid) {
    const newGrid = [];
    grid.forEach((row) => newGrid.push([...row]));
    return newGrid;
};

var minRowIndex = function () {
    return 0;
};

var maxRowIndex = function (word, grid) {
    var wordLength = word.length;
    var gridHeight = grid.length;
    if (wordLength > gridHeight) {
        throw new Error('Word '.concat(word, ' is too long to fit in grid'));
    }
    return gridHeight - wordLength;
};

var minColIndex = function () {
    return 0;
};

var maxColIndex = function (word, grid) {
    var wordLength = word.length;
    var gridWidth = grid[0].length;
    if (wordLength > gridWidth) {
        throw new Error('Word '.concat(word, ' is too long to fit in grid'));
    }
    return gridWidth - wordLength;
};

//Get Random Number;
function _rand(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}


class WS {
    constructor(_words, size, allowBackwards, allowDiagonals) {

        this._words = _words;
        this.words = [];

        this.size = size;
        this.allowBackwards = allowBackwards;
        this.allowDiagonals = allowDiagonals;
    }



    placeWordRandom(grid, word, wordObj) {

        var placeWordInner = function () {
            var isReversed = this.allowBackwards && randomBool();
            const direction = randomDirection(this.allowDiagonals);

            const clonedGrid = cloneGrid(grid);
            const wordToPlace = isReversed ? reverseWord(word) : word;

            let row = randomIntInRange(minRowIndex(), maxRowIndex(word, clonedGrid));
            if (direction === Direction.DiagonalUp) {
                row = grid.length - row - 1;
            }
            const col = randomIntInRange(minColIndex(), maxColIndex(word, clonedGrid));

            const canPlaceWord = () => {
                for (let i = 0; i < wordToPlace.length; i++) {
                    const { row: r, col: c } = getWordRowCol(direction, row, col, i);

                    var cell = clonedGrid[r][c];
                    if (cell !== undefined && wordToPlace[i] != cell) {
                        return false;
                    }
                }
                return true;
            };

            if (canPlaceWord()) {
                for (var i = 0; i < wordToPlace.length; i++) {
                    var _a = getWordRowCol(direction, row, col, i);
                    clonedGrid[_a.row][_a.col] = wordToPlace[i];
                }

                var init = getWordRowCol(direction, row, col, 0);
                var final = getWordRowCol(direction, row, col, wordToPlace.length - 1);

                wordObj.rowi = init.row;
                wordObj.coli = init.col;
                wordObj.rowf = final.row;
                wordObj.colf = final.col;
                wordObj.found = true;
                wordObj.strike = false;
                wordObj.direction = direction;
                return clonedGrid;
            }
            return undefined;
        }.bind(this);

        let newGrid;
        var maxAttempts = 1000;
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            newGrid = placeWordInner();
            if (newGrid !== undefined) {
                return newGrid;
            }
        }
        throw new Error(`Could not place word ${word} in grid after ${maxAttempts} attempts`);
    }

    _wsg122422022() {
        var maxSize = 20;
        this._words.forEach((item, index) => {
            this.words.push({ word: Object.assign({}, item), _word: cleanWord(item.Word), isCopied: 0 });
        });

        var sortedWords = sortWordList(this.words.map((x) => cleanWord(x._word)));

        var placedWords = [],
            fillBlanks = true;

        let resultGrid;

        while (this.size.width <= maxSize) {
            let grid = createGrid({ size: this.size });
            placedWords = [];

            sortedWords.forEach((w) => {
                try {

                    let match = this.words.filter(x => (x._word === w && x.isCopied == 0));
                    if (match.length > 0) {
                        grid = this.placeWordRandom(grid, w, match[0]);
                        placedWords.push(w);
                        match[0].isCopied = 1;
                    }
                } catch (e) {
                    console.error(e);
                }
            });
            if (fillBlanks) {
                grid = grid.map(function (row) {
                    return row.map(function (c) {
                        return c !== null && c !== undefined ? c : randomChar();
                    });
                });
            }


            if (placedWords.length != sortedWords.length) {
                this.size.width += 1;
                this.size.height += 1;
                this.words = [];
                this._words.forEach((item, index) => {
                    this.words.push({ word: Object.assign({}, item), _word: cleanWord(item.Word), isCopied: 0 });
                });
            } else {
                resultGrid = grid;
                break;
            }
        }

        this.words.forEach(item => {
            const match = this._words.filter(x => x.Word == item._cword);
            if (match.length > 0) {
                item.word = match[0];
            }
        });

        return {
            grid: resultGrid,
            placedWords: placedWords
        };
    };
}

/* ####################### VIEW ################################################################## */

function WSView(puzzle, fontName, fontWeight, panelCtx, cursorCtx, width, pad) {

    this.fontName = fontName;
    this.fontWeight = fontWeight;
    this.pad = pad;
    this.panelCtx = panelCtx;
    this.cursorCtx = cursorCtx;
    this.puzzle = puzzle;

    this.width = width;

    this.cell = Math.floor(this.width / this.puzzle.COLS);
    this.width = this.cell * this.puzzle.COLS;

    this.height = this.puzzle.ROWS * this.cell;

    this.fontSize = Math.floor((this.cell - this.pad) / 1.6);
    if (this.fontSize < 10) { this.fontSize = 10; }

    this.fontString = this.fontWeight + ' ' + this.fontSize + 'pt ' + this.fontName;

    this.panelCtx.font = this.fontString;

    this.tokenWidth = this.panelCtx.measureText('A').width;
    //this.foundColor = 'rgba(0, 230, 0, 0.3)';
    //this.seekColor = 'rgba(255, 0, 255, 0.3)';
    this.lineWidth = this.tokenWidth * 1.8;
    this.lineCap = 'round';

    this.colors = [
        { seek: 'rgba(255, 0, 255, 0.3)', found: 'rgba(255, 0, 255, 0.3)' }, //#ff00ff4d //pink
        { seek: 'rgba(0, 230, 0, 0.3)', found: 'rgba(0, 230, 0, 0.3)' },      //#00e6004d //green
        { seek: 'rgba(37, 15, 156, 0.3)', found: 'rgba(37, 15, 156, 0.3)' }, //##250f9c4d //blue
        { seek: 'rgba(197, 36, 61, 0.3)', found: 'rgba(197, 36, 61, 0.3)' }, //#c5243d4d
        { seek: 'rgba(232, 220, 0, 0.6)', found: 'rgba(232, 220, 0, 0.6)' }, //#fbee0080 //dark yellow
        { seek: 'rgba(51, 238, 22, 0.3)', found: 'rgba(51, 238, 22, 0.3)' }, //#33ee164d
        { seek: 'rgba(29, 22, 238, 0.3)', found: 'rgba(29, 22, 238, 0.3)' }, //#1d16ee4d
        { seek: 'rgba(253, 127, 25, 0.3)', found: 'rgba(253, 127, 25, 0.3)' },//#fd7f194d
        { seek: 'rgba(236, 5, 5, 0.3)', found: 'rgba(236, 5, 5, 0.3)' },//#ec05054d
    ];
    this._currentColor = _rand(0, this.colors.length - 1);
    this.foundColor = this.colors[this._currentColor].found; //'rgba(0, 230, 0, 0.3)';
    this.seekColor = this.colors[this._currentColor].seek; //'rgba(255, 0, 255, 0.3)';
}

WSView.prototype.getD = function () {
    return { width: this.width, height: this.height };
};

WSView.prototype.getCursorContext = function () {
    return this.cursorCtx;
};

WSView.prototype.draw = function () {

    this.drawGrid();
    this.drawFound();
};

WSView.prototype.drawGrid = function () {
    this.panelCtx.clearRect(0, 0, this.width, this.height);
    this.panelCtx.lineWidth = 1;
    this.panelCtx.textBaseline = "middle";
    this.panelCtx.textAlign = "center";

    this.panelCtx.fillStyle = '#333';

    this.panelCtx.font = this.fontString;

    for (var i = 0; i < this.puzzle.ROWS; i++) {
        for (var j = 0; j < this.puzzle.COLS; j++) {
            this.panelCtx.fillText(this.puzzle.grid[i][j], this.cell / 2 + j * this.cell, this.cell / 2 + i * this.cell);

            this.panelCtx.strokeStyle = '#ccc';
            this.panelCtx.strokeRect((j * this.cell), j * this.cell, i * this.cell, i * this.cell);
        }
    }

    this.panelCtx.strokeStyle = '#666';
    this.panelCtx.strokeRect(0, 0, this.width, this.height);
};

WSView.prototype.changecolor = function () {
    this._currentColor = _rand(0, this.colors.length - 1);
    this.foundColor = this.colors[this._currentColor].found; //'rgba(0, 230, 0, 0.3)';
    this.seekColor = this.colors[this._currentColor].seek; //'rgba(255, 0, 255, 0.3)';
}; 

WSView.prototype.drawLoopFound = function () {
    var rootScope = angular.element(document.body).injector().get('$rootScope');

    var ctx = this.cursorCtx;
    ctx.clearRect(0, 0, this.width, this.height);
    this.puzzle.words.forEach(function (word) {
        word.strike = false;
    });

    ctx.lineWidth = this.lineWidth;
    ctx.strokeStyle = this.foundColor;
    ctx.lineCap = this.lineCap;

    var i = 0;
    var that = this;
    var loop = setInterval(function () {
        if (i >= that.puzzle.words.length) {
            clearInterval(loop);
            ctx.clearRect(0, 0, that.width, that.height);
            that.drawLoopFound();
        }
        var obj = that.puzzle.words[i];

        if (typeof (obj) != 'undefined') {
            if (obj.found) {
                obj.strike = true;
                var x0 = that.cell / 2 + obj.coli * that.cell;
                var y0 = that.cell / 2 + obj.rowi * that.cell;
                var xf = that.cell / 2 + obj.colf * that.cell;
                var yf = that.cell / 2 + obj.rowf * that.cell;

                ctx.beginPath();
                ctx.moveTo(x0, y0);
                ctx.lineTo(xf, yf);
                setTimeout(function () {
                    ctx.stroke();
                    obj.strike = true;
                    i++;
                }, 1000);
            }
        }


    }, 2000);
};
