// factory class
class ComponentFactory {
    static createComponent(char) {
        let type = ""
        switch (char) {
            case ".": type = "empty"; break;
            case "+": type = "lava"; break;
            case "@": type = "player"; break;
            case "=": type = "lava"; break;
            case "|": type = "lava"; break;
            case "#": type = "wall"; break;
            default:  type = "wall"; break;
        }

        return {type: type};
    }
}

// creates a data structure representing a game level from a string
class Level {
    constructor(plan) {
        let rows = plan.trim().split("\n").map(
                line => [...line].map(char => ComponentFactory.createComponent(char))
        );
        this.height = rows.length;
        this.width  = rows[0].length;
        this.startActors = [];
        
        this.rows = rows;
    }
}

let someplan = `
aaaaaaaaaaaaaaaaaaaaaa
bbbbbbbbbbbbbbbbbbbbbb
cccccccccccccccccccccc
dddddddddddddddddddddd
+++++++++///++++++++++
`;

// represents two dimensional vector
class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // vector addition
    plus(other) {
        return new Vec(this.x + other.x, this.y + other.y);
    }
    // scales vector
    times(factor) {
        return new Vec(this.x * factor, this.y * factor);
    }
}

class HTMLFactory {
    // create an html element and append child to it
    static elt(name, attrs, ...child) {
        let dom = document.createElement(name);
        for (let attr of Object.keys(attrs)) {
            dom.setAttribute(attr, attrs[attr]);
        }
        for (let c of child) {
            dom.appendChild(c);
        }
    
        return dom;
    }
    // converts level into html represented table
    static drawGrid(level) {
        return this.elt("table", {class: "background", style: `width: ${level.width * scale}px`},
            ...level.rows.map(row => this.elt("tr", {style: `height: ${scale}px`},
                ...row.map(component => 
                    this.elt("td", {class: component.type})
                )
            ))
        );
    }
}

class DOMDisplay {
    constructor(parent, level) {
        this.dom = HTMLFactory.elt("div", {class: "game"}, HTMLFactory.drawGrid(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }

    clear() {
        this.dom.remove();
    }
}

class DOMDisplayProto {
    // redraws the game according to the given state
    syncsState(state) {
        if (this.actorLayer) this.actorLayer.remove();
        this.actorLayer = drawActors(state.actors);
        this.dom.appendChild(this.actorLayer);
        this.dom.className = `game $(state.status)`;
        this.scrollPlayerIntoView(state);
    }
    scrollPlayerIntoView(state) {

    }
}

DOMDisplay.prototype = DOMDisplayProto;

// creates an html representaiton of level
// level is represented as table


const scale = 20;

let newlevel = new Level(someplan);
console.log(newlevel.rows);
let newDOM = new DOMDisplay(document.body, newlevel);
console.log(newDOM.dom);