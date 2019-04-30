const SCALE_SIZE = 20;
const WOBBLE_SPEED = 8;
const WOBBLE_DIST = 0.07;

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

// factory class
class EntityFactory {
    static createEntity(char, pos) {
        let type = ""
        switch (char) {
            case "@": {
                type = "player";
                return new Player(type, pos);
            }
            case "=": {
                type = "lava";
                return new Lava(type, pos, new Vec(2, 0));
            }
            case "|": {
                type = "lava";
                return new Lava(type, pos, new Vec(0, 2));
            }
            case "v": {
                type = "lava";
                return new Lava(type, pos, new Vec(0, 3), pos);
            }
            case "o": {
                type = "coin";
                return new Coin(type, pos);
            }
            case ".": type = "empty"; break;
            case "+": type = "lava"; break;
            case "#": type = "wall"; break;
            default:  type = "wall"; break;
        }

        return new StaticEntity(type, pos);
    }

    static isDynamicEntity(char) {
        switch(char) {
            case "@":
            case "=":
            case "|":
            case "v":
            case "o":
                return true;
            default:
                return false;
        }
    }
}

// Map entities
class MapEntity {
    constructor(type, pos) {
        this.type = type;
        this.pos = pos;
    }
}
// default size for all map entities
MapEntity.prototype.size = new Vec(1, 1);

class StaticEntity extends MapEntity {
    constructor(type, pos) {
        super(type, pos);
    }
}
class Player extends MapEntity {
    constructor(type, pos) {
        super(type, pos.plus(new Vec(0, -0.5)));
        this.speed = new Vec(0, 0);
        this.size = new Vec(0.8, 1.5);
    }
    update(time, state, keys) {
        
    }
}
class Lava extends MapEntity {
    constructor(type, pos, speed, reset) {
        super(type, pos);
        this.speed = speed;
        this.reset = reset;
    }
    update(time, state) {
        let newpos = this.pos.plus(this.speed.times(time));
        // deal with movement of differnet types of lava
        // oscillating, resetting
        // need collision detection with the wall
        this.pos = newpos;
    }
}
class Coin extends MapEntity {
    constructor(type, pos) {
        let basepos = pos.plus(new Vec(0.2, 0.1));
        super(type, basepos);
        this.basepos = basepos;
        this.wobble = Math.random() * Math.PI * 2;
        this.size = new Vec(0.6, 0.6);
    }
    update(time, state) {
        this.wobble      = this.wobble + time * WOBBLE_SPEED;
        let wobbleOffset = Math.sin(newWobble) * WOBBLE_DIST;
        this.pos = this.basepos.plus(new Vec(0, wobbleOffset));
    }
}

// creates a data structure representing a game level from a string
class Level {
    constructor(plan) {
        // keeps track of dynamic map entities
        this.startActors = [];

        // create a grid of static map entity
        let rows = plan.trim().split("\n").map(
            (row, y) => [...(row.trim())].map(
                (char, x) => {
                    // if target square is occpuied by dynamic entity, the square behind it is assumed to be "empty"
                    if (EntityFactory.isDynamicEntity(char)) {
                        this.startActors.push(EntityFactory.createEntity(char, new Vec(x, y)));
                        return EntityFactory.createEntity(".", new Vec(x, y));
                    }
                    else {
                        return EntityFactory.createEntity(char, new Vec(x, y));
                    }
                }
            )
        );

        this.height = rows.length;
        this.width  = rows[0].length;
        this.rows = rows;
    }
}

// creates html
class HtmlFactory {
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
    static createHtmlForLevel(level) {
        return this.elt("table", {class: "background", style: `width: ${level.width * SCALE_SIZE}px`},
            ...level.rows.map(row => this.elt("tr", {style: `height: ${SCALE_SIZE}px`},
                ...row.map(entity => 
                    this.elt("td", {class: entity.type})
                )
            ))
        );
    }
    // creates html out of list of actors
    // bunch them up into one div element
    static createHtmlForActors(actors) {
        return this.elt("div", {}, ...actors.map(actor => {

            let actorHtml = this.elt("div", {class: `actor ${actor.type}`});
            actorHtml.style.left = `${actor.pos.x * SCALE_SIZE}px`;
            actorHtml.style.top = `${actor.pos.y * SCALE_SIZE}px`;
            actorHtml.style.width = `${actor.size.x * SCALE_SIZE}px`;
            actorHtml.style.height = `${actor.size.y * SCALE_SIZE}px`;

            return actorHtml;
        }));
    }
}

// displays the game onto the specified html element
class DomDisplay {
    constructor(parent, level) {
        this.dom = HtmlFactory.elt("div", {class: "game"}, HtmlFactory.createHtmlForLevel(level));
        this.actorLayer = null;
        parent.appendChild(this.dom);
    }
    // destroys game
    clear() {
        this.dom.remove();
    }
     // redraws the game according to the given state
     syncState(state) {
        if (this.actorLayer) this.actorLayer.remove();
        this.actorLayer = HtmlFactory.createHtmlForActors(state.actors);
        this.dom.appendChild(this.actorLayer);
        this.dom.className = `game ${state.status}`;
        this.scrollPlayerIntoView(state);
    }
    scrollPlayerIntoView(state) {

    }
}

// object containing the game state
// keeps track of dynamic elements of the game
class State {
    constructor(level, actors, status) {
        this.level = level;
        this.actors = actors;
        this.status = status;
    }

    static start(level) {
        return new State(level, level.startActors, "playing");
    }
    get player() {
        return this.actors.find(a => a.type === "player");
    }
}