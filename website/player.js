/**
 * Created Date: May 05 2024, 04:44:23 PM
 * Author: @WhoTho#9592 whotho06@gmail.com
 * -----
 * Last Modified: May 05 2024, 05:32:41 PM
 * Modified By: @WhoTho#9592
 * -----
 * CHANGE LOG:
 * Date                        | Comments
 * ----------------------------+---------------------------------------------
 */

class Player {
    constructor(name, engineClass) {
        this.name = name;
        this.engineClass = engineClass;

        this.initElement();
    }

    initElement() {
        this.element = document.createElement("option");
        this.element.value = this.name;
        this.element.innerText = this.name;
    }
}

export default Player;
