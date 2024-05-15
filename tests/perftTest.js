/**
 * Created Date: May 05 2024, 12:54:43 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 05 2024, 03:31:35 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import Board from "../website/board.js";

let testData = [];

function loadPerftData(filePath) {
    fetch(filePath)
        .then((response) => response.text())
        .then((data) => {
            for (let line of data.split("\n")) {
                let [fen, ...depthsAndCounts] = line.split(";");
                let correctResults = {};
                let maxDepth = 0;
                for (let depthAndCount of depthsAndCounts) {
                    let [depth, count] = depthAndCount.trim().split(" ");
                    count = parseInt(count);
                    depth = parseInt(depth.substring(1));
                    correctResults[depth] = count;
                    if (count < 100_000) {
                        maxDepth = Math.max(maxDepth, depth);
                    } else {
                        break;
                    }
                }

                if (maxDepth === 0) {
                    continue;
                }

                testData.push([fen, maxDepth, correctResults]);
            }

            console.log(`Loaded ${testData.length} test cases from ${filePath}`);
        })
        .catch((error) => {
            console.error(`Error loading ${filePath}`, error);
        });
}

// loadPerftData("../tests/basicPerft.txt");
// loadPerftData("../tests/complexPerft.txt");
loadPerftData("../tests/specialMovesPerft.txt");

function test() {
    if (testData.length === 0) {
        console.error("Test data not loaded yet.");
        return;
    }

    let board = new Board({ gui: false });

    let totalFails = 0;
    let outOf = 0;

    for (let [fen, maxDepth, correctResults] of testData) {
        totalFails += testFEN(board, fen, maxDepth, correctResults);
        outOf += maxDepth;
    }

    console.log(`Total fails: ${totalFails} out of ${outOf} (${((totalFails / outOf) * 100).toFixed(2)}%)`);
}

function testFEN(board, fen, maxDepth, correctResults) {
    board.resetGame();
    board.standardNotation.loadFEN(fen);

    let results = {};
    for (let n = 1; n <= maxDepth; n++) {
        results[n] = 0;
    }

    function playAllMoves(depth = 0) {
        if (depth === maxDepth) {
            return 1;
        }

        let numberOfPositions = 0;

        let moves = board.generateAllValidMoves();

        results[depth + 1] += moves.length;

        for (let move of moves) {
            board.doMove(move);
            board.nextPlayerTurn();
            numberOfPositions += playAllMoves(depth + 1);
            board.nextPlayerTurn();
            board.undoMove();
        }

        return numberOfPositions;
    }

    playAllMoves();

    console.log("Results for FEN:", fen);

    let fails = 0;

    for (let depth in results) {
        if (!correctResults.hasOwnProperty(depth)) {
            continue;
        }
        if (results[depth] !== correctResults[depth]) {
            console.error(`Depth ${depth} is incorrect. Expected: ${correctResults[depth]}, got: ${results[depth]}`);
            fails++;
        } else {
            console.log(`Depth ${depth} is correct. (${results[depth]})`);
        }
    }
    console.log("\n\n");

    return fails;
}

export default test;
