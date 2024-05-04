/**
 * Created Date: Apr 26 2024, 02:08:07 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 04 2024, 04:51:38 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

import { sleep } from "../helpers/promise.js";
import Piece from "./pieces/piece.js";
import Pawn from "./pieces/pawn.js";
import Rook from "./pieces/rook.js";
import Knight from "./pieces/knight.js";
import Bishop from "./pieces/bishop.js";
import Queen from "./pieces/queen.js";
import King from "./pieces/king.js";

const FEN = {
    start: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    promotion: "4p3/1k1P4/8/pB2p3/P1R5/1KP5/8/4q3 w - - 1 87",
}.promotion;

class Board {
    constructor() {
        this.initGameVariables();
        this.initElement();

        this.initPieces();
        this.initTiles();
        this.initAudio();
        this.initPromotionOptions();

        this.loadFEN(FEN);

        this.startGame();
    }

    initGameVariables() {
        this.selectedTile = null;
        this.validMoves = [];
        this.playerTurn = "white";
        this.playing = false;
        this.moves = [];
        this.selectingPromotion = false;
    }

    initElement() {
        this.element = document.getElementById("board");
    }

    initPieces() {
        this.pieces = [];

        for (let player of ["white", "black"]) {
            this.pieces.push(new Pawn(player));
            this.pieces.push(new Rook(player));
            this.pieces.push(new Knight(player));
            this.pieces.push(new Bishop(player));
            this.pieces.push(new Queen(player));
            this.pieces.push(new King(player));
        }
    }

    initTiles() {
        this.tiles = [];

        for (let y = 0; y < 8; y++) {
            let row = [];
            for (let x = 0; x < 8; x++) {
                let tile = new Tile(this, x, y, (x % 2) + (y % 2) === 1 ? "black" : "white");
                row.push(tile);
            }
            this.tiles.push(row);
        }
    }

    initAudio() {
        this.sounds = {
            selfMove: new Audio("./assets/move-self.mp3"),
            opponentMove: new Audio("./assets/move-opponent.mp3"),
            capture: new Audio("./assets/capture.mp3"),
            check: new Audio("./assets/move-check.mp3"),
            gameEnd: new Audio("./assets/game-end.mp3"),
            promote: new Audio("./assets/promote.mp3"),
        };
    }

    initPromotionOptions() {
        // todo put piece imag there
        this.promotion = {
            element: document.getElementById("promotion-options"),
            queen: document.getElementById("queen-promotion"),
            rook: document.getElementById("rook-promotion"),
            bishop: document.getElementById("bishop-promotion"),
            knight: document.getElementById("knight-promotion"),
        };

        this.promotion.element.style.display = "none";

        for (let [key, element] of Object.entries(this.promotion)) {
            if (key === "element") continue;

            element.addEventListener("click", () => {
                let moveToPlay = this.validMoves.find((move) => move.flags.promotingTo === key);
                this.playMove(moveToPlay);
                this.promotion.element.style.display = "none";
                this.destyleTiles();
                this.selectedTile = null;

                this.selectingPromotion = false;
            });

            element.appendChild(
                this.pieces.find((piece) => piece.name === key && piece.player === "white").element.cloneNode(true)
            );
        }
    }

    resetGame() {
        this.loadFEN(FEN);
        this.startGame();
    }

    startGame() {
        this.playing = true;
        this.moves = [];
        this.tiles[0][0].flags.kingCanCastle = true;
        this.tiles[0][4].flags.kingCanCastle = true;
        this.tiles[0][7].flags.kingCanCastle = true;
        this.tiles[7][0].flags.kingCanCastle = true;
        this.tiles[7][4].flags.kingCanCastle = true;
        this.tiles[7][7].flags.kingCanCastle = true;

        this.gameLoop();
    }

    loadFEN(fen) {
        for (let row of this.tiles) {
            for (let tile of row) {
                tile.setPiece(null);
            }
        }

        this.destyleTiles();

        let [board, turn, castling, enPassant, halfMove, fullMove] = fen.split(" ");

        let rank = 0;
        let file = 0;

        for (let char of board) {
            if (char === "/") {
                rank++;
                file = 0;
                continue;
            }

            if (isNaN(char)) {
                let piece = this.pieces.find((piece) => piece.fenNotation === char);
                this.tiles[rank][file].setPiece(piece);
                this.tiles[rank][file].render();
                file++;
            } else {
                file += parseInt(char);
            }
        }

        this.playerTurn = turn === "w" ? "white" : "black";
    }

    tileAt(x, y) {
        if (x < 0 || x > 7 || y < 0 || y > 7) {
            return null;
        }
        return this.tiles[y][x];
    }

    pieceAt(x, y) {
        return this.tileAt(x, y)?.piece;
    }

    tileClicked(tile) {
        if (this.selectingPromotion) {
            return;
        }

        if (!this.playing || this.playerTurn !== "white" || (!this.selectedTile && tile.piece?.player !== "white")) {
            return;
        }

        if (this.selectedTile && tile === this.selectedTile) {
            this.selectedTile = null;
            this.destyleTiles();
            return;
        }

        if (this.selectedTile && tile !== this.selectedTile) {
            for (let move of this.validMoves) {
                if (move.targetTile !== tile) continue;
                if (move.flags.promotingTo) {
                    // FIXME pawn cant be clicked after clicking off when promoting
                    // player can promote
                    this.promotion.element.style.display = "block";
                    this.promotion.element.style.top = `${tile.element.offsetTop + this.element.offsetTop}px`;
                    this.promotion.element.style.left = `${tile.element.offsetLeft + this.element.offsetLeft}px`;
                    this.selectingPromotion = true;

                    // only allow promotion to this tile
                    this.validMoves = this.validMoves.filter((move) => move.targetTile === tile);

                    return;
                }

                this.playMove(move);
                this.selectedTile = null;
                this.destyleTiles();
                return;
            }
            return;
        }

        if (!tile.piece) {
            this.selectedTile = null;
            this.validMoves = [];
            return;
        }

        this.selectedTile = tile;
        this.validMoves = [];
        this.destyleTiles();
        tile.select();

        let moves = this.selectedTile.piece.getMoves(this.selectedTile, this);
        moves = moves.filter((move) => this.isValidMove(move));
        for (let move of moves) {
            move.targetTile.highlight();
            this.validMoves.push(move);
        }
    }

    destyleTiles() {
        for (let row of this.tiles) {
            for (let tile of row) {
                tile.destyle();
            }
        }
    }

    playMove(move) {
        console.log(move.toMoveNotation());

        this.doMove(move);
        this.renderAllTiles();

        if (this.isInCheck(this.playerTurn === "white" ? "black" : "white")) {
            this.sounds.check.play();
        } else if (move.flags.capturedPiece) {
            this.sounds.capture.play();
        } else if (move.flags.promotingTo) {
            this.sounds.promote.play();
        } else {
            this.sounds.selfMove.play();
        }

        if (this.playerTurn === "white") {
            this.manualMove = true;
        }
    }

    nextPlayerTurn() {
        this.playerTurn = this.playerTurn === "white" ? "black" : "white";
    }

    async gameLoop() {
        while (this.playing) {
            if (!(await this.whiteTurn())) {
                this.playing = false;
                this.showGameEnd("black");
                break;
            }

            this.nextPlayerTurn();

            if (!(await this.blackTurn())) {
                this.playing = false;
                this.showGameEnd("white");
                break;
            }
            this.nextPlayerTurn();
        }
    }

    showGameEnd(winner) {
        this.sounds.gameEnd.play();
        alert(`Game Over! ${winner} wins!`);
    }

    async whiteTurn() {
        this.manualMove = false;

        while (!this.manualMove) {
            await sleep(1000);
        }

        this.manualMove = false;

        return true;
    }

    async blackTurn() {
        let allMoves = [];

        for (let row of this.tiles) {
            for (let tile of row) {
                if (tile.piece?.player === "black") {
                    let moves = tile.getMoves();
                    allMoves.push(...moves);
                }
            }
        }

        allMoves = allMoves.filter((move) => this.isValidMove(move));

        if (allMoves.length === 0) {
            return false;
        }

        let move = allMoves[Math.floor(Math.random() * allMoves.length)];
        this.playMove(move);

        return true;
    }

    // generateAllMoves(player) {
    //     let moves = [];

    //     return moves;
    // }

    isValidMove(move) {
        this.doMove(move);
        let isInCheck = this.isInCheck();
        this.undoMove();

        return !isInCheck;
    }

    isInCheck(player = this.playerTurn) {
        let kingTile;
        for (let row of this.tiles) {
            for (let tile of row) {
                if (tile.piece?.name === "king" && tile.piece?.player === player) {
                    kingTile = tile;
                    break;
                }
            }
        }

        if (!kingTile) {
            console.log("No king found");
            return false;
        }

        let isKingInCheck = false;
        for (let row of this.tiles) {
            for (let tile of row) {
                if (!tile.piece || tile.piece.player === player) {
                    continue;
                }

                let moves = tile.getMoves();
                for (let move of moves) {
                    if (move.targetTile === kingTile) {
                        isKingInCheck = true;
                        break;
                    }
                }
            }
        }

        return isKingInCheck;
    }

    doMove(move) {
        this.moves.push(move);

        move.targetTile.setPiece(move.originalTile.piece);
        move.originalTile.setPiece(null);

        if (move.flags.doubleForwardPawn) {
            move.targetTile.flags.doubleForwardPawn = true;
        }

        if (move.flags.castling) {
            let rookTile, newRookTile;
            if (move.targetTile.x < move.originalTile.x) {
                rookTile = this.tileAt(move.targetTile.x - 2, move.targetTile.y);
                newRookTile = this.tileAt(move.targetTile.x + 1, move.targetTile.y);
            } else {
                rookTile = this.tileAt(move.targetTile.x + 1, move.targetTile.y);
                newRookTile = this.tileAt(move.targetTile.x - 1, move.targetTile.y);
            }

            newRookTile.setPiece(rookTile.piece);
            rookTile.setPiece(null);

            move.originalTile.flags.kingCanCastle = false;
            rookTile.flags.kingCanCastle = false;
        }

        if (move.flags.promotingTo) {
            move.targetTile.setPiece(
                this.pieces.find((piece) => piece.player === this.playerTurn && piece.name === move.flags.promotingTo)
            );
        }

        if (move.flags.enPassant) {
            move.flags.enPassantTile.setPiece(null);
        }

        if (move.flags.movedFromCastling) {
            move.originalTile.flags.kingCanCastle = false;
        }

        // en passant clear flag

        if (this.moves.length > 1 && this.moves[this.moves.length - 2].flags.doubleForwardPawn) {
            this.moves[this.moves.length - 2].targetTile.flags.doubleForwardPawn = false;
        }
    }

    undoMove() {
        let move = this.moves.pop();
        if (!move) {
            return;
        }

        move.originalTile.setPiece(move.targetTile.piece);
        if (!move.flags.enPassant) {
            move.targetTile.setPiece(move.flags.capturedPiece);
        } else {
            move.targetTile.setPiece(null);
        }

        if (move.flags.doubleForwardPawn) {
            move.targetTile.flags.doubleForwardPawn = false;
        }

        if (move.flags.castling) {
            let rookTile, newRookTile;
            if (move.targetTile.x < move.originalTile.x) {
                rookTile = this.tileAt(move.targetTile.x - 2, move.targetTile.y);
                newRookTile = this.tileAt(move.targetTile.x + 1, move.targetTile.y);
            } else {
                rookTile = this.tileAt(move.targetTile.x + 1, move.targetTile.y);
                newRookTile = this.tileAt(move.targetTile.x - 1, move.targetTile.y);
            }

            rookTile.setPiece(newRookTile.piece);
            newRookTile.setPiece(null);
            move.originalTile.flags.kingCanCastle = true;
            rookTile.flags.kingCanCastle = true;
        }

        if (move.flags.promotingTo) {
            // piece.player !== this.playerTurn because the turn has not yet been switched
            move.originalTile.setPiece(
                this.pieces.find((piece) => piece.player !== this.playerTurn && piece.name === "pawn")
            );
        }

        if (move.flags.enPassant) {
            move.flags.enPassantTile.setPiece(move.flags.capturedPiece);
        }

        if (move.flags.movedFromCastling) {
            move.originalTile.flags.kingCanCastle = true;
        }

        // en passant reenable flag

        if (this.moves.length !== 0 && this.moves[this.moves.length - 1].flags.doubleForwardPawn) {
            this.moves[this.moves.length - 1].targetTile.flags.doubleForwardPawn = true;
        }
    }

    renderAllTiles() {
        for (let row of this.tiles) {
            for (let tile of row) {
                tile.render();
                if (tile.flags.kingCanCastle) {
                    tile.element.style.outline = "2px solid green";
                } else if (tile.flags.doubleForwardPawn) {
                    tile.element.style.outline = "2px solid blue";
                } else {
                    tile.element.style.outline = "none";
                }
            }
        }
    }
}

class Tile {
    constructor(board, x, y, color) {
        this.board = board;

        this.x = x;
        this.y = y;
        this.color = color;
        this.flags = {
            doubleForwardPawn: false,
            kingCanCastle: false,
        };

        this.piece = null;

        this.file = String.fromCharCode(97 + x);
        this.rank = 8 - y;

        this.initElement();
    }

    initElement() {
        this.element = document.createElement("div");
        this.element.classList.add("tile");
        this.element.classList.add(this.color);

        this.board.element.appendChild(this.element);

        this.piece = null;

        this.element.addEventListener("click", () => {
            this.board.tileClicked(this);
        });
    }

    setPiece(piece) {
        this.piece = piece;
    }

    render() {
        this.element.innerHTML = "";

        if (!this.piece) return;

        this.element.appendChild(this.piece.element.cloneNode(true));
    }

    select() {
        this.element.classList.add("selected");
    }

    highlight() {
        this.element.classList.add("highlighted");
    }

    destyle() {
        this.element.classList.remove("selected");
        this.element.classList.remove("highlighted");
    }

    getMoves() {
        if (!this.piece) {
            return [];
        }

        return this.piece.getMoves(this, this.board);
    }
}

export default Board;
export { Tile };
