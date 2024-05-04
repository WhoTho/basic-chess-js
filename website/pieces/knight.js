/**
 * Created Date: May 04 2024, 01:08:40 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 04 2024, 01:27:41 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Piece from "./piece.js";

class Knight extends Piece {
    constructor(player) {
        super(player, "knight", player === "white" ? "N" : "n", 3.05);

        this.movementOffsets = [
            [-2, -1],
            [-2, 1],
            [-1, -2],
            [-1, 2],
            [1, -2],
            [1, 2],
            [2, -1],
            [2, 1],
        ];
    }
}

export default Knight;
