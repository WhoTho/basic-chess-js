/**
 * Created Date: May 05 2024, 04:44:35 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 05 2024, 06:10:38 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Board from "./board.js";

class Match {
    constructor(fenList, whitePlayer, blackPlayer) {
        this.whitePlayer = whitePlayer;
        this.blackPlayer = blackPlayer;

        if (!this.whitePlayer || !this.blackPlayer) {
            console.error("Both players must be engines.");
            return;
        }

        this.fenList = fenList;

        this.whiteWins = 0;
        this.blackWins = 0;
        this.draws = 0;
        this.drawsByRepetition = 0;
        this.drawsByStalemate = 0;
        this.drawsByMaxMove = 0;
        this.drawsByInsufficientMaterial = 0;

        this.board = new Board({ gui: false, maxMoves: 200 });
        this.board.setWhitePlayer(this.whitePlayer);
        this.board.setBlackPlayer(this.blackPlayer);

        this.setup = true;
    }

    async playFEN(fen) {
        this.board.resetGame(fen);
        console.log("Playing game");

        let result = await this.board.startGame();
        console.log("Game played");

        if (result === "white") {
            this.whiteWins++;
        } else if (result === "black") {
            this.blackWins++;
        } else {
            this.draws++;
            let reason = result.split("-")[1];
            if (reason === "repetition") {
                this.drawsByRepetition++;
            } else if (reason === "stalemate") {
                this.drawsByStalemate++;
            } else if (reason === "maxMove") {
                this.drawsByMaxMove++;
            } else if (reason === "insufficientMaterial") {
                this.drawsByInsufficientMaterial++;
            }
        }
    }

    async playMatch() {
        for (let fen of this.fenList) {
            await this.playFEN(fen);
        }

        return this.getScore();
    }

    getScore() {
        return {
            white: this.whiteWins,
            black: this.blackWins,
            draws: this.draws,
            drawsByRepetition: this.drawsByRepetition,
            drawsByStalemate: this.drawsByStalemate,
            drawsByMaxMove: this.drawsByMaxMove,
            gamesPlayed: this.whiteWins + this.blackWins + this.draws,
        };
    }
}

export default Match;
