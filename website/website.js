/**
 * Created Date: Apr 26 2024, 02:09:46 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 06 2024, 04:04:57 PM
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
let copyFenBtn = document.getElementById("copyFenBtn");
let pasteFenBtn = document.getElementById("pasteFenBtn");

startBtn.addEventListener("click", () => {
    board.setWhitePlayer(playerChooser.whitePlayer);
    board.setBlackPlayer(playerChooser.blackPlayer);
    board.startGame();
});

resetBtn.addEventListener("click", () => {
    board.setWhitePlayer(playerChooser.whitePlayer);
    board.setBlackPlayer(playerChooser.blackPlayer);
    board.resetGame();
    board.renderAllTiles();
});

undoBtn.addEventListener("click", () => {
    board.previousPlayerTurn();
    board.undoMove();
    board.destyleTiles();
    board.selectedTile = null;

    board.renderAllTiles();
});

copyFenBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(board.standardNotation.toFEN());
});

pasteFenBtn.addEventListener("click", () => {
    navigator.clipboard.readText().then((text) => {
        board.standardNotation.loadFEN(text);
        board.renderAllTiles();
    });
});

let testBtn = document.getElementById("testBtn");
import test from "../tests/perftTest.js";
testBtn.addEventListener("click", () => {
    test();
});

import Player from "./player.js";
import PlayerChooser from "./playerChooser.js";

import V1_SimpleMiniMax from "../engines/v1/simpleMiniMax.js";
import V2_SimpleAlphaBeta from "../engines/v2/alphaBeta.js";
import V3_MoveOrdering from "../engines/v3/moveOrdering.js";

const players = {
    human: new Player("human", null),
    V1_SimpleMiniMax: new Player("V1_SimpleMiniMax", V1_SimpleMiniMax),
    V2_SimpleAlphaBeta: new Player("V2_SimpleAlphaBeta", V2_SimpleAlphaBeta),
    V3_MoveOrdering: new Player("V3_MoveOrdering", V3_MoveOrdering),
};

const playerChooser = new PlayerChooser(players);

// let whitePlayerChoice = document.getElementById("white-player-choice");
// let blackPlayerChoice = document.getElementById("black-player-choice");

// whitePlayerChoice.addEventListener("change", () => {
//     if (whitePlayerChoice.value === "human") {
//         board.setWhitePlayer("human");
//     } else {
//         board.setWhitePlayer(players[whitePlayerChoice.value]);
//     }
// });

import Match from "./match.js";

let startMatchBtn = document.getElementById("startMatchBtn");
let fenData;
fetch("../resources/fens.txt")
    .then((response) => response.text())
    .then((data) => {
        fenData = data.split("\n");
        console.log(`Loaded ${fenData.length} FENs for matches`);
    });

startMatchBtn.addEventListener("click", async () => {
    if (!fenData) {
        console.error("FEN data not loaded yet.");
        return;
    }

    let match = new Match(fenData.slice(0, 5), playerChooser.whitePlayer, playerChooser.blackPlayer);
    if (!match.setup) {
        return;
    }

    console.log("Playing match...");
    console.log(await match.playMatch());
});

export default {};
