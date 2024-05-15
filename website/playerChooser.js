/**
 * Created Date: May 05 2024, 04:41:21 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 05 2024, 06:14:49 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

class PlayerChooser {
    constructor(players) {
        this.players = players;

        this.whitePlayer = players["human"].engineClass;
        this.blackPlayer = players["human"].engineClass;

        this.initElement();
    }

    initElement() {
        this.element = document.getElementById("player-chooser");

        this.whitePlayerChooser = document.getElementById("white-player-chooser");
        this.blackPlayerChooser = document.getElementById("black-player-chooser");

        for (let player of Object.values(this.players)) {
            this.whitePlayerChooser.appendChild(player.element);
            this.blackPlayerChooser.appendChild(player.element.cloneNode(true));
        }

        this.whitePlayerChooser.addEventListener("change", () => {
            this.whitePlayer = this.players[this.whitePlayerChooser.value].engineClass;
        });

        this.blackPlayerChooser.addEventListener("change", () => {
            this.blackPlayer = this.players[this.blackPlayerChooser.value].engineClass;
        });
    }
}

export default PlayerChooser;
