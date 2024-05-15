/**
 * Created Date: May 04 2024, 01:04:46 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 05 2024, 01:15:35 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Piece from "./piece.js";

class Bishop extends Piece {
    constructor(board, player) {
        super(board, player, "bishop", player === "white" ? "B" : "b", 3.33);

        this.movementOffsets = [
            [-1, -1],
            [-1, 1],
            [1, -1],
            [1, 1],
        ];
        this.maxMovements = 8;
    }
}

export default Bishop;
