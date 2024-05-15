/**
 * Created Date: May 06 2024, 04:00:00 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 06 2024, 04:20:38 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Engine from "../engine.js";

class V3_MoveOrdering extends Engine {
    constructor(player, board) {
        super(player, board);

        this.maxDepth = 4;
    }

    moveMade(move) {
        return;
    }

    getMove() {
        this.movesSearched = 0;
        this.startTime = Date.now();

        let bestMove = this.search(-Infinity, Infinity, 0);

        console.log(
            "Ms taken and moves searched (MoveOrdering):",
            (Date.now() - this.startTime).toFixed(2) + "ms",
            this.movesSearched
        );

        return bestMove;
    }

    search(alpha, beta, depth) {
        this.movesSearched++;

        if (depth === this.maxDepth) {
            return this.evaluate();
        }

        let allMoves = this.getAllMoves();

        if (depth === 0) this.orderMoves(allMoves);

        if (allMoves.length === 0) {
            if (this.board.isInCheck()) {
                return -10000 + depth;
            } else {
                return 0;
            }
        }

        let bestMove = null;
        let bestScore = -Infinity;

        for (let move of allMoves) {
            this.board.doMove(move);
            this.board.nextPlayerTurn();
            let score = -this.search(-beta, -alpha, depth + 1);
            this.board.previousPlayerTurn();
            this.board.undoMove();

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }

            alpha = Math.max(alpha, score);
            if (alpha >= beta) {
                break;
            }
        }

        if (depth === 0) {
            return bestMove;
        }

        return bestScore + Math.random() * 0.01;
    }

    getAllMoves() {
        let allMoves = [];

        for (let row of this.board.tiles) {
            for (let tile of row) {
                if (tile.piece?.player === this.board.playerTurn) {
                    let moves = tile.getMoves();
                    allMoves.push(...moves);
                }
            }
        }

        return allMoves.filter((move) => this.board.isValidMove(move));
    }

    evaluate() {
        let score = 0;

        for (let row of this.board.tiles) {
            for (let tile of row) {
                if (!tile.piece) continue;

                if (tile.piece.player === "white") {
                    score += tile.piece.value;
                } else {
                    score -= tile.piece.value;
                }
            }
        }

        return score * (this.board.playerTurn === "white" ? 1 : -1);
    }

    orderMoves(moves) {
        for (let move of moves) {
            move.score = this.getMoveScore(move);
        }

        // sort moves by best score to worst score
        moves.sort((a, b) => b.score - a.score);
    }

    getMoveScore(move) {
        let score = 0;

        if (move.capturedPiece) {
            score += 10 * move.capturedPiece.value - move.originalTile.piece.value;
        }

        if (move.flags.castling) {
            score += 30;
        }

        if (move.flags.promotingTo) {
            score += 30;
        }

        if (move.flags.movedFromCastling) {
            score -= 30;
        }

        return score;
    }
}

export default V3_MoveOrdering;
