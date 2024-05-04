/**
 * Created Date: May 04 2024, 12:45:06 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 04 2024, 04:32:22 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

const FEN_PIECE_MAP = {
    pawn: "P",
    knight: "N",
    bishop: "B",
    rook: "R",
    queen: "Q",
    king: "K",
};

class Move {
    constructor(originalTile, targetTile, flags = {}) {
        this.originalTile = originalTile;
        this.targetTile = targetTile;
        this.flags = Object.assign(
            {
                capturedPiece: null,
                enPassant: false,
                enPassantTile: null,
                doubleForwardPawn: false,
                castling: false,
                movedFromCastling: false,
                promotingTo: null,
            },
            flags
        );
    }

    copy() {
        return new Move(this.originalTile, this.targetTile, this.flags);
    }

    toMoveNotation() {
        // TODO improve this. might move to the board class cuz moves need to know abt other stuff happening
        let notation = "";

        if (this.flags.castling) {
            if (this.targetTile.x === 2) {
                notation = "O-O-O";
            } else {
                notation = "O-O";
            }
        } else {
            let piece = this.originalTile.piece.fenNotation;

            if (piece === "P") {
                if (this.flags.capturedPiece) {
                    notation += this.originalTile.file;
                }
            } else {
                notation += piece;
            }

            if (this.flags.capturedPiece) {
                notation += "x";
            }

            notation += this.targetTile.file + this.targetTile.rank;

            if (this.flags.promotingTo) {
                notation += "=" + FEN_PIECE_MAP[this.flags.promotingTo];
            }
        }

        return notation;
    }

    // fromMoveNotation(moveNotation, board) {
    //     if (moveNotation === "O-O") {
    //         if (board.playerTurn === "white") {
    //             return new Move(board.tileAt(4, 0), board.tileAt(6, 0), { castling: true });
    //         }

    //         return new Move(board.tileAt(4, 7), board.tileAt(6, 7), { castling: true });
    //     }

    //     if (moveNotation === "O-O-O") {
    //         if (board.playerTurn === "white") {
    //             return new Move(board.tileAt(4, 0), board.tileAt(2, 0), { castling: true });
    //         }

    //         return new Move(board.tileAt(4, 7), board.tileAt(2, 7), { castling: true });
    //     }

    //     let targetTile = board.tileAt(moveNotation.substr(1, 1), moveNotation.substr(2, 1));

    // }
}

export default Move;
