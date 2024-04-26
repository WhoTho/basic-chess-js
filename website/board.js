/**
 * Created Date: Apr 26 2024, 02:08:07 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: Apr 26 2024, 02:48:28 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

class Board {
    constructor() {
        this.initElement();
        this.initTiles();
    }

    initElement() {
        this.element = document.getElementById("board");
    }

    initTiles() {
        this.tiles = [];

        for (let i = 0; i < 64; i++) {
            let tile = new Tile(this, i, (i % 2) + (Math.floor(i / 8) % 2) === 1 ? "black" : "white");
            this.tiles.push(tile);
        }
    }
}

class Tile {
    constructor(board, index, color) {
        this.board = board;

        this.index = index;
        this.color = color;

        this.initElement();
    }

    initElement() {
        this.element = document.createElement("div");
        this.element.classList.add("tile");
        this.element.classList.add(this.color);

        this.board.element.appendChild(this.element);
    }
}

export default Board;
export { Tile };
