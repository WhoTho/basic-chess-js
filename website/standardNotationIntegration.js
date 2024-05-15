/**
 * Created Date: May 05 2024, 08:39:25 AM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 05 2024, 03:34:22 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

// const fens = require("../resources/fens.txt");

const FENCastleTilePositions = {
    K: [
        [7, 4],
        [7, 7],
    ],
    Q: [
        [7, 4],
        [7, 0],
    ],
    k: [
        [0, 4],
        [0, 7],
    ],
    q: [
        [0, 4],
        [0, 0],
    ],
};

class StandardNotation {
    constructor(board) {
        this.board = board;
    }

    loadFEN(fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        this.board.clearBoard();
        this.board.destyleTiles();
        this.board.moves = [];

        let [board, turn, castling, enPassant, halfMove, fullMove] = fen.split(" ");

        this._handleFENBoard(board);
        this._handleTurnFEN(turn);
        this._handleCastlingFEN(castling);
        this._handleEnPassantFEN(enPassant);
        this._handleHalfMoveFEN(halfMove);
        this._handleFullMoveFEN(fullMove);
    }

    _handleFENBoard(boardFEN) {
        let rank = 0;
        let file = 0;

        for (let char of boardFEN) {
            if (char === "/") {
                rank++;
                file = 0;
                continue;
            }

            if (isNaN(char)) {
                let piece = this.board.pieces.find((piece) => piece.fenNotation === char);
                this.board.tiles[rank][file].setPiece(piece);
                this.board.tiles[rank][file].render();
                file++;
            } else {
                file += parseInt(char);
            }
        }
    }

    _handleTurnFEN(turnFEN) {
        this.board.playerTurn = turnFEN === "w" ? "white" : "black";
    }

    _handleCastlingFEN(castlingFEN) {
        for (let char of castlingFEN) {
            if (char === "-") {
                continue;
            }

            let positions = FENCastleTilePositions[char];
            for (let [y, x] of positions) {
                let tile = this.board.tileAt(x, y);
                tile.flags.kingCanCastle = true;
            }
        }
    }

    _handleEnPassantFEN(enPassantFEN) {
        if (enPassantFEN === "-") {
            return;
        }

        let [x, y] = this.algebraicToXY(enPassantFEN);

        // my tile flags are setup such that the en passant tile is the one that has the pawn that can be captured
        if (y === 2) {
            y = 3;
        } else if (y === 5) {
            y = 4;
        }

        let tile = this.board.tileAt(x, y);
        tile.flags.doubleForwardPawn = true;
    }

    _handleHalfMoveFEN(halfMoveFEN) {
        this.board.halfMove = parseInt(halfMoveFEN);
    }

    _handleFullMoveFEN(fullMoveFEN) {
        this.board.fullMove = parseInt(fullMoveFEN);
    }

    algebraicToXY(algebraic) {
        let [file, rank] = algebraic.split("");
        return [file.charCodeAt(0) - 97, 8 - parseInt(rank)];
    }

    xyToAlgebraic(x, y) {
        return `${String.fromCharCode(y + 97)}${8 - x}`;
    }

    toFEN() {
        let boardFEN = this.boardToFEN();
        let turnFEN = this._turnToFEN();
        let castlingFEN = this._castlingToFEN();
        let enPassantFEN = this._enPassantToFEN();
        let halfMoveFEN = this._halfMoveToFEN();
        let fullMoveFEN = this._fullMoveToFEN();

        return `${boardFEN} ${turnFEN} ${castlingFEN} ${enPassantFEN} ${halfMoveFEN} ${fullMoveFEN}`;
    }

    boardToFEN() {
        let fen = "";

        for (let row of this.board.tiles) {
            let empty = 0;

            for (let tile of row) {
                if (!tile.piece) {
                    empty++;
                    continue;
                }

                if (empty) {
                    fen += empty;
                    empty = 0;
                }

                fen += tile.piece.fenNotation;
            }

            if (empty) {
                fen += empty;
            }

            fen += "/";
        }

        return fen.slice(0, -1);
    }

    _turnToFEN() {
        return this.board.playerTurn === "white" ? "w" : "b";
    }

    _castlingToFEN() {
        let fen = "";

        for (let [letter, positions] of Object.entries(FENCastleTilePositions)) {
            let positionsAbleToCastle = positions.every(([y, x]) => this.board.tileAt(x, y).flags.kingCanCastle);
            if (positionsAbleToCastle) {
                fen += letter;
            }
        }

        return fen || "-";
    }

    _enPassantToFEN() {
        for (let row of this.board.tiles) {
            for (let tile of row) {
                if (tile.flags.doubleForwardPawn) {
                    // my tile flags are setup such that the en passant tile is the one that has the pawn that can be captured
                    let y;
                    if (tile.y === 3) {
                        y = 2;
                    } else {
                        y = 5;
                    }

                    return this.xyToAlgebraic(tile.x, y);
                }
            }
        }

        return "-";
    }

    _halfMoveToFEN() {
        return this.board.halfMove ?? 0;
    }

    _fullMoveToFEN() {
        return this.board.fullMove ?? 1;
    }
}

export default StandardNotation;
