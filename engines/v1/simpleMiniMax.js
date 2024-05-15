/**
 * Created Date: Apr 29 2024, 03:44:50 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 06 2024, 03:09:47 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Engine from "../engine.js";

class V1_SimpleMiniMax extends Engine {
    constructor(player, board) {
        super(player, board);

        this.maxDepth = 3;
    }

    moveMade(move) {
        return;
    }

    getMove() {
        this.movesSearched = 0;
        this.startTime = Date.now();
        let move = this.search(this.player, 0);

        console.log(
            "Ms taken and moves searched (MiniMax):",
            (Date.now() - this.startTime).toFixed(2) + "ms",
            this.movesSearched
        );
        return move;
    }

    search(player, depth) {
        this.movesSearched++;

        if (depth === this.maxDepth) {
            return this.evaluate();
        }

        let allMoves = [];

        for (let row of this.board.tiles) {
            for (let tile of row) {
                if (tile.piece?.player === player) {
                    let moves = tile.getMoves();
                    allMoves.push(...moves);
                }
            }
        }

        allMoves = allMoves.filter((move) => this.board.isValidMove(move, player));
        if (allMoves.length === 0 && depth === 0) {
            return null;
        }

        let bestScore = player === "white" ? -Infinity : Infinity;
        let bestMove = null;

        for (let move of allMoves) {
            this.board.doMove(move);

            this.board.nextPlayerTurn();
            let score = this.search(player === "white" ? "black" : "white", depth + 1);
            this.board.nextPlayerTurn();

            this.board.undoMove();

            if (player === "white") {
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            } else {
                if (score < bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
            }
        }

        if (bestMove === null && depth !== 0) {
            let additionalPoints = player === "white" ? -10000 : 10000;
            if (!this.board.isInCheck(player)) {
                return 0;
            }
            return this.evaluate() + additionalPoints;
        }

        // Add some randomness to the score to make the engine less likely to go back and forth
        return depth === 0 ? bestMove : bestScore + (Math.random() - 0.5) / 50;
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

        return score;
    }
}

export default V1_SimpleMiniMax;
