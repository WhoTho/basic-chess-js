/**
 * Created Date: May 04 2024, 12:37:29 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 04 2024, 04:07:13 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Piece from "./piece.js";
import Move from "../move.js";

class Pawn extends Piece {
    constructor(player) {
        super(player, "pawn", player === "white" ? "P" : "p", 1);

        this.direction = this.player === "white" ? -1 : 1;
        this.canMoveDoubleForwardRank = this.player === "white" ? 6 : 1;
        this.canEnPassantRank = this.player === "white" ? 3 : 4;
        this.prePromotionRank = this.player === "white" ? 1 : 6;
    }

    getMoves(tile, board) {
        let moves = [];

        let forwardTile = board.tileAt(tile.x, tile.y + this.direction);
        if (forwardTile && !forwardTile.piece) {
            moves.push(new Move(tile, forwardTile));
        }

        if (tile.y === this.canMoveDoubleForwardRank && !forwardTile.piece) {
            let doubleForwardTile = board.tileAt(tile.x, tile.y + 2 * this.direction);
            if (!doubleForwardTile.piece) {
                moves.push(new Move(tile, doubleForwardTile, { doubleForwardPawn: true }));
            }
        }

        let leftDiagonalTile = board.tileAt(tile.x - 1, tile.y + this.direction);
        if (leftDiagonalTile && leftDiagonalTile.piece && leftDiagonalTile.piece.player !== this.player) {
            moves.push(new Move(tile, leftDiagonalTile, { capturedPiece: leftDiagonalTile.piece }));
        }

        let rightDiagonalTile = board.tileAt(tile.x + 1, tile.y + this.direction);
        if (rightDiagonalTile && rightDiagonalTile.piece && rightDiagonalTile.piece.player !== this.player) {
            moves.push(new Move(tile, rightDiagonalTile, { capturedPiece: rightDiagonalTile.piece }));
        }

        moves = this.addPromotionMoves(tile, board, moves);

        if (tile.y !== this.canEnPassantRank) {
            return moves;
        }

        // might be able to en passant cuz the pawn is at the right rank

        let leftTile = board.tileAt(tile.x - 1, tile.y);
        if (
            leftTile &&
            leftTile.piece &&
            leftTile.piece.player !== this.player &&
            leftTile.piece.name === "pawn" &&
            leftTile.flags.doubleForwardPawn
        ) {
            moves.push(
                new Move(tile, leftDiagonalTile, {
                    capturedPiece: leftTile.piece,
                    enPassant: true,
                    enPassantTile: leftTile,
                })
            );
        }

        let rightTile = board.tileAt(tile.x + 1, tile.y);
        if (
            rightTile &&
            rightTile.piece &&
            rightTile.piece.player !== this.player &&
            rightTile.piece.name === "pawn" &&
            rightTile.flags.doubleForwardPawn
        ) {
            moves.push(
                new Move(tile, rightDiagonalTile, {
                    capturedPiece: rightTile.piece,
                    enPassant: true,
                    enPassantTile: rightTile,
                })
            );
        }

        return moves;
    }

    addPromotionMoves(tile, board, moves) {
        if (tile.y !== this.prePromotionRank) {
            return moves;
        }

        let newMoves = [];

        for (let move of moves) {
            for (let promotion of ["queen", "rook", "bishop", "knight"]) {
                let newMove = move.copy();
                newMove.flags.promotingTo = promotion;
                newMoves.push(newMove);
            }
        }

        return newMoves;
    }
}

export default Pawn;
