/**
 * Created Date: Apr 26 2024, 02:09:46 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 04 2024, 04:13:34 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Board from "./board.js";

let board = new Board();

let startBtn = document.getElementById("startBtn");
let resetBtn = document.getElementById("resetBtn");
let undoBtn = document.getElementById("undoBtn");

// startBtn.addEventListener("click", () => {
//     board.startGame();
// }
// );

resetBtn.addEventListener("click", () => {
    board.resetGame();
    board.renderAllTiles();
});

undoBtn.addEventListener("click", () => {
    board.undoMove();
    board.destyleTiles();
    board.selectedTile = null;
    board.nextPlayerTurn();

    board.renderAllTiles();
});

export default {};
