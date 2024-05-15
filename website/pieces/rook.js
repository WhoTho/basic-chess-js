/**
 * Created Date: May 04 2024, 01:11:16 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 05 2024, 01:17:20 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Piece from "./piece.js";

class Rook extends Piece {
    constructor(board, player) {
        super(board, player, "rook", player === "white" ? "R" : "r", 5.05);

        this.movementOffsets = [
            [-1, 0],
            [0, -1],
            [0, 1],
            [1, 0],
        ];
        this.maxMovements = 8;
    }

    getMoves(tile) {
        let moves = super.getMoves(tile);

        if (tile.flags.kingCanCastle) {
            for (let move of moves) {
                move.flags.movedFromCastling = true;
            }
        }

        return moves;
    }
}

export default Rook;
