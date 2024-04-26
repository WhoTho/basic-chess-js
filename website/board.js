/**
 * Created Date: Apr 26 2024, 02:08:07 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: Apr 26 2024, 03:16:36 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

class Board {
    constructor() {
        this.initElement();

        this.initPieces();
        this.initTiles();

        this.loadFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    }

    initElement() {
        this.element = document.getElementById("board");
    }

    initPieces() {
        this.pieces = new Map();

        this.pieces.set("white-pawn", new Piece("pawn", "P", "Chess_plt45"));
        this.pieces.set("white-rook", new Piece("rook", "R", "Chess_rlt45"));
        this.pieces.set("white-knight", new Piece("knight", "N", "Chess_nlt45"));
        this.pieces.set("white-bishop", new Piece("bishop", "B", "Chess_blt45"));
        this.pieces.set("white-queen", new Piece("queen", "Q", "Chess_qlt45"));
        this.pieces.set("white-king", new Piece("king", "K", "Chess_klt45"));

        this.pieces.set("black-pawn", new Piece("pawn", "p", "Chess_pdt45"));
        this.pieces.set("black-rook", new Piece("rook", "r", "Chess_rdt45"));
        this.pieces.set("black-knight", new Piece("knight", "n", "Chess_ndt45"));
        this.pieces.set("black-bishop", new Piece("bishop", "b", "Chess_bdt45"));
        this.pieces.set("black-queen", new Piece("queen", "q", "Chess_qdt45"));
        this.pieces.set("black-king", new Piece("king", "k", "Chess_kdt45"));

        this.piecesByFenNotation = new Map();
        this.pieces.forEach((value, key) => this.piecesByFenNotation.set(value.fenNotation, value));
    }

    initTiles() {
        this.tiles = [];

        for (let i = 0; i < 64; i++) {
            let tile = new Tile(this, i, (i % 2) + (Math.floor(i / 8) % 2) === 1 ? "black" : "white");
            this.tiles.push(tile);
        }
    }

    loadFEN(fen) {
        let [board, turn, castling, enPassant, halfMove, fullMove] = fen.split(" ");

        let rank = 0;
        let file = 0;

        for (let char of board) {
            if (char === "/") {
                rank++;
                file = 0;
                continue;
            }

            if (isNaN(char)) {
                let piece = this.piecesByFenNotation.get(char);
                this.tiles[rank * 8 + file].render(piece);
                file++;
            } else {
                file += parseInt(char);
            }
        }
    }
}

class Tile {
    constructor(board, index, color) {
        this.board = board;

        this.index = index;
        this.color = color;

        this.initElement();
    }

    initElement() {
        this.element = document.createElement("div");
        this.element.classList.add("tile");
        this.element.classList.add(this.color);

        this.board.element.appendChild(this.element);
    }

    render(piece) {
        if (!piece) {
            this.element.innerHTML = "";
            return;
        }

        this.element.appendChild(piece.element.cloneNode(true));
    }
}

class Piece {
    constructor(name, fenNotation, fileName) {
        this.name = name;
        this.fenNotation = fenNotation;
        this.fileName = fileName;

        this.initElement();
    }

    initElement() {
        this.element = document.createElement("img");
        this.element.src = `./assets/${this.fileName}.svg`;
        this.element.alt = this.name;
    }
}

export default Board;
export { Tile };
