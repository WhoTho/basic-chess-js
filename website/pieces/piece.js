/**
 * Created Date: May 04 2024, 12:37:16 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 05 2024, 01:19:48 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Move from "../move.js";

class Piece {
    constructor(board, player, name, fenNotation, value) {
        this.board = board;
        this.player = player;

        this.name = name;

        this.fenNotation = fenNotation;

        this.fileName = `${this.player}_${this.name}`;

        this.value = value;

        if (this.board.options.gui) this.initElement();

        this.movementOffsets = [];
        this.maxMovements = 1;
    }

    initElement() {
        this.element = document.createElement("img");
        this.element.src = `./assets/${this.fileName}.svg`;
        this.element.alt = this.name;
    }

    getMoves(tile) {
        let moves = [];

        for (let offset of this.movementOffsets) {
            for (let i = 1; i <= this.maxMovements; i++) {
                let targetTile = this.board.tileAt(tile.x + offset[0] * i, tile.y + offset[1] * i);

                if (targetTile === null) {
                    break;
                }

                if (!targetTile.piece) {
                    moves.push(new Move(tile, targetTile));
                } else if (targetTile.piece.player !== this.player) {
                    moves.push(new Move(tile, targetTile, { capturedPiece: targetTile.piece }));
                    break;
                } else {
                    break;
                }
            }
        }

        return moves;
    }
}

export default Piece;
