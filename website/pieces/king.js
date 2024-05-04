/**
 * Created Date: May 04 2024, 01:11:53 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 04 2024, 01:42:44 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Piece from "./piece.js";
import Move from "../move.js";

class King extends Piece {
    constructor(player) {
        super(player, "king", player === "white" ? "K" : "k", 1000);

        this.movementOffsets = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ];

        this.kingSideDirection = this.player === "white" ? 1 : -1;
    }

    getMoves(tile, board) {
        let moves = super.getMoves(tile, board);

        if (!tile.flags.kingCanCastle) {
            return moves;
        }

        let kingSideRookTile = board.tileAt(tile.x + this.kingSideDirection * 3, tile.y);

        if (kingSideRookTile?.flags?.kingCanCastle) {
            let kingSideTile1 = board.tileAt(tile.x + this.kingSideDirection, tile.y);
            let kingSideTile2 = board.tileAt(tile.x + this.kingSideDirection * 2, tile.y);

            if (!kingSideTile1.piece && !kingSideTile2.piece) {
                moves.push(new Move(tile, kingSideTile2, { castling: true }));
            }
        }

        let queenSideRookTile = board.tileAt(tile.x - 4, tile.y);

        if (queenSideRookTile?.flags?.kingCanCastle) {
            let queenSideTile1 = board.tileAt(tile.x - 1, tile.y);
            let queenSideTile2 = board.tileAt(tile.x - 2, tile.y);
            let queenSideTile3 = board.tileAt(tile.x - 3, tile.y);

            if (!queenSideTile1.piece && !queenSideTile2.piece && !queenSideTile3.piece) {
                moves.push(new Move(tile, queenSideTile2, { castling: true }));
            }
        }

        for (let move of moves) {
            move.flags.movedFromCastling = true;
        }

        return moves;
    }
}

export default King;
