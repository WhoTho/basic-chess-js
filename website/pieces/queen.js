/**
 * Created Date: May 04 2024, 01:10:49 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 04 2024, 01:27:48 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Piece from "./piece.js";

class Queen extends Piece {
    constructor(player) {
        super(player, "queen", player === "white" ? "Q" : "q", 9.5);

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
        this.maxMovements = 8;
    }
}

export default Queen;
