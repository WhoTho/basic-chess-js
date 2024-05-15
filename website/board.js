/**
 * Created Date: Apr 26 2024, 02:08:07 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 06 2024, 02:58:19 PM
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
import StandardNotation from "./standardNotationIntegration.js";

/* 
TODO


make move algebraic notation




add ui for selecting players
add system for playing multiple games
 - fix endGame


FIXME
work out en passant undo move when loading fen with en passant (no previous move to reenable en passant flag)
castling through check
*/

class Board {
    constructor(options = {}) {
        this.initGameVariables();
        this.initOptions(options);
        if (this.options.gui) this.initElement();

        this.initPieces();
        this.initTiles();
        this.initAudio();
        if (this.options.gui) this.initPromotionOptions();

        this.initStandardNotation();

        // this.blackPlayer = new V1_SimpleMiniMax("black", this);

        this.whitePlayer = "human";
        this.blackPlayer = "human";
    }

    initGameVariables() {
        this.selectedTile = null;
        this.validMoves = [];
        this.playerTurn = "white";
        this.playing = false;
        this.moves = [];
        this.selectingPromotion = false;
    }

    initOptions(options) {
        this.options = Object.assign(
            {
                gui: true,
                maxMoves: 1_000,
            },
            options
        );
    }

    initElement() {
        this.element = document.getElementById("board");
    }

    initPieces() {
        this.pieces = [];

        for (let player of ["white", "black"]) {
            this.pieces.push(new Pawn(this, player));
            this.pieces.push(new Rook(this, player));
            this.pieces.push(new Knight(this, player));
            this.pieces.push(new Bishop(this, player));
            this.pieces.push(new Queen(this, player));
            this.pieces.push(new King(this, player));
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
        if (!this.options.gui) return;
        this.sounds = {
            selfMove: new Audio("./assets/move-self.mp3"),
            opponentMove: new Audio("./assets/move-opponent.mp3"),
            capture: new Audio("./assets/capture.mp3"),
            check: new Audio("./assets/move-check.mp3"),
            gameEnd: new Audio("./assets/game-end.mp3"),
            promote: new Audio("./assets/promote.mp3"),
            castle: new Audio("./assets/castle.mp3"),
        };
    }

    initPromotionOptions() {
        if (!this.options.gui) return;

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

    initStandardNotation() {
        this.standardNotation = new StandardNotation(this);
    }

    setWhitePlayer(player) {
        if (!player) {
            this.whitePlayer = "human";
        } else {
            this.whitePlayer = new player("white", this);
        }
    }

    setBlackPlayer(player) {
        if (!player) {
            this.blackPlayer = "human";
        } else {
            this.blackPlayer = new player("black", this);
        }
    }

    resetGame(fen) {
        this.standardNotation.loadFEN(fen);
        this.startGame();
    }

    startGame() {
        this.playing = true;
        // this.moves = []; moved to loadFEN

        this.seenBoards = new Map();

        return this.gameLoop();
    }

    destyleTiles() {
        if (!this.options.gui) return;

        for (let row of this.tiles) {
            for (let tile of row) {
                tile.destyle();
            }
        }
    }

    clearBoard() {
        for (let row of this.tiles) {
            for (let tile of row) {
                tile.setPiece(null);
                tile.resetFlags();
            }
        }
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
        if (!this.options.gui) return;

        if (this.selectingPromotion) {
            return;
        }

        if (
            !this.playing ||
            (this.playerTurn === "white" ? this.whitePlayer !== "human" : this.blackPlayer !== "human") ||
            (!this.selectedTile && tile.piece?.player !== this.playerTurn)
        ) {
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
                    this.promotion.element.style.display = "block";

                    let topOffset;
                    if (this.playerTurn === "white") {
                        topOffset = tile.element.offsetTop + this.element.offsetTop;
                    } else {
                        topOffset =
                            tile.element.offsetTop + this.element.offsetTop - this.promotion.element.offsetHeight;
                    }

                    this.promotion.element.style.top = `${topOffset}px`;
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

    playMove(move) {
        this.doMove(move);
        this.renderAllTiles();

        if (this.options.gui) {
            if (this.isInCheck(this.playerTurn === "white" ? "black" : "white")) {
                this.sounds.check.play();
            } else if (move.flags.capturedPiece) {
                this.sounds.capture.play();
            } else if (move.flags.promotingTo) {
                this.sounds.promote.play();
            } else if (move.flags.castling) {
                this.sounds.castle.play();
            } else {
                this.sounds.selfMove.play();
            }
        }

        if (this.getCurrentPlayer() === "human") {
            this.manualMove = true;
        }
    }

    getCurrentPlayer() {
        return this.playerTurn === "white" ? this.whitePlayer : this.blackPlayer;
    }

    nextPlayerTurn() {
        this.playerTurn = this.playerTurn === "white" ? "black" : "white";
    }

    previousPlayerTurn() {
        this.nextPlayerTurn();
    }

    async gameLoop() {
        while (this.playing) {
            if (!(await this.takeTurn())) {
                if (!this.isInCheck(this.playerTurn)) {
                    return this.gameEnd("draw-stalemate");
                } else {
                    return this.gameEnd(this.playerTurn === "white" ? "black" : "white");
                }
            }

            if (this.checkForRepetition()) {
                return this.gameEnd("draw-repetition");
            }

            if (this.checkForInsufficientMaterial()) {
                return this.gameEnd("draw-insufficientMaterial");
            }

            if (this.moves.length >= this.options.maxMoves) {
                return this.gameEnd("draw-maxMoves");
            }

            this.nextPlayerTurn();
        }

        return "draw-unknown";
    }

    gameEnd(winner) {
        this.playing = false;

        if (this.options.gui) {
            this.renderAllTiles();
            this.sounds.gameEnd.play();
            setTimeout(() => {
                if (winner.startsWith("draw")) {
                    alert(`Game Over! Draw! ${winner.split("-")[1]}`);
                } else {
                    alert(`Game Over! ${winner} wins!`);
                }
            }, 1000);
        }

        return winner;
    }

    async takeTurn() {
        let currentPlayer = this.getCurrentPlayer();

        if (this.generateAllValidMoves().length === 0) {
            return false;
        }

        if (currentPlayer === "human") {
            return this.humanMove();
        } else {
            return this.engineMove(currentPlayer);
        }
    }

    async engineMove(currentPlayer) {
        if (this.options.gui) {
            await sleep(10);
        }

        let move = currentPlayer.getMove();

        if (!move) {
            return false;
        }

        this.playMove(move);

        return true;
    }

    async humanMove() {
        this.manualMove = false;

        if (this.generateAllValidMoves(this.playerTurn).length === 0) {
            return false;
        }

        while (!this.manualMove) {
            await sleep(1000);
        }

        this.manualMove = false;

        return true;
    }

    generateAllValidMoves(player = this.playerTurn) {
        let moves = [];

        for (let row of this.tiles) {
            for (let tile of row) {
                if (tile.piece?.player === player) {
                    let pieceMoves = tile.getMoves();
                    moves.push(...pieceMoves);
                }
            }
        }

        moves = moves.filter((move) => this.isValidMove(move));

        return moves;
    }

    isValidMove(move, player = this.playerTurn) {
        if (move.flags.castling) {
            return this.isValidCastle(move, player);
        }

        this.doMove(move);
        let isInCheck = this.isInCheck(player);
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

    isValidCastle(move, player) {
        if (this.isInCheck(player)) {
            return false;
        }

        // check if opponent can attack any of the tiles the king will move through
        let kingTile = move.originalTile;
        let destinationTile = move.targetTile;

        let direction = destinationTile.x < kingTile.x ? -1 : 1;

        let tilesToCheck = [kingTile, this.tileAt(kingTile.x + direction, kingTile.y), destinationTile];

        for (let row of this.tiles) {
            for (let tile of row) {
                if (!tile.piece || tile.piece.player === player) {
                    continue;
                }

                let moves = tile.getMoves();
                for (let move of moves) {
                    if (tilesToCheck.includes(move.targetTile)) {
                        return false;
                    }
                }
            }
        }

        return true;
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
            move.originalTile.setPiece(
                this.pieces.find((piece) => piece.player === this.playerTurn && piece.name === "pawn")
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

    checkForRepetition() {
        let board = this.standardNotation.boardToFEN();

        if (this.seenBoards.has(board)) {
            this.seenBoards.set(board, this.seenBoards.get(board) + 1);
        } else {
            this.seenBoards.set(board, 1);
        }

        if (this.seenBoards.get(board) >= 3) {
            return true;
        }

        return false;
    }

    checkForInsufficientMaterial() {
        let pieces = [];

        for (let row of this.tiles) {
            for (let tile of row) {
                if (tile.piece) {
                    pieces.push(tile.piece);
                }
            }
        }

        if (pieces.length === 2) {
            return true;
        }

        if (pieces.length === 3) {
            if (pieces.some((piece) => piece.name === "bishop")) {
                return true;
            }
        }

        return false;
    }

    renderAllTiles() {
        if (!this.options.gui) return;

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
        this.resetFlags();

        this.piece = null;

        this.file = String.fromCharCode(97 + x);
        this.rank = 8 - y;

        if (this.board.options.gui) this.initElement();
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

    resetFlags() {
        this.flags = {
            doubleForwardPawn: false,
            kingCanCastle: false,
        };
    }

    setPiece(piece) {
        this.piece = piece;
    }

    render() {
        if (!this.board.options.gui) return;

        this.element.innerHTML = "";

        if (!this.piece) return;

        this.element.appendChild(this.piece.element.cloneNode(true));
    }

    select() {
        if (!this.board.options.gui) return;

        this.element.classList.add("selected");
    }

    highlight() {
        if (!this.board.options.gui) return;

        this.element.classList.add("highlighted");
    }

    destyle() {
        if (!this.board.options.gui) return;

        this.element.classList.remove("selected");
        this.element.classList.remove("highlighted");
    }

    getMoves() {
        if (!this.piece) {
            return [];
        }

        return this.piece.getMoves(this);
    }
}

export default Board;
export { Tile };
