const fs = require("fs");
const commander = require("commander");
const PNG = require("pngjs").PNG;

const color_entry = new color(0,255,0);
const color_exit = new color(255,0,0);
const color_background = new color(255,255,255);
const color_path = new color(0,0,0);
const color_blockade = new color(127,127,127);

const color_push = new color(0,0,255);
const color_dup = new color(127,127,255);
const color_add = new color(38,127,0);
const color_sub = new color(87,0,124);
const color_mul = new color(124,24,0);
const color_div = new color(0,99,124);

const color_in = new color(255,216,0);
const color_out = new color(255,106,0);
const color_to_char = new color(255,206,127);

// const operation_push = 1;
// const operation_add = 2;
// const operation_sub = 3;
// const operation_mul = 4;
// const operation_div = 5;

function color(R, G, B){
    this.R = R;
    this.G = G;
    this.B = B;
    this.equals = function(color){
        if(R == color.R && G == color.G && B == color.B)
            return true;
        return false;
    }
    this.toNumber = function(){
        return (this.R << 16) + (this.G << 8) + this.B;
    }
}

function colorFromPixel(data, index){
    return new color(data[index], data[index+1], data[index+2]);
}

commander.
    option("-d, --debug","Debug mode").
    parse(process.argv);


console.log(commander.args[0]);
if(commander.args[0]) {
    fs.createReadStream(commander.args[0]).pipe(new PNG({
        colorType : 2,
        inputColorType: 2,
        inputHasAlpha: false,

    })).on("parsed",function(){
        console.log(this.data.length);
        interpret(this);
    }).on("error",function(error){
        console.error(error);
    });
}else{
    console.error("Missing input file.");
}


function interpret(img){
    var w = new walker(img);
    w.start();
}

function findEntry(img){
    for (let y = 0; y < img.height; y++) {
        for (let x = 0; x < img.width; x++) {
            var idx = (img.width * y + x) << 2;
            var pixel = colorFromPixel(img.data, idx);
            if(pixel.equals(color_entry)){
                return {x,y};
            }
        }
    }
    return null;
}


var neighborTiles  = [{x:-1,y:0},{x:0,y:1},{x:1,y:0},{x:0,y:-1},{x:-1,y:0},{x:0,y:1},{x:1,y:0},{x:0,y:-1}];


function walker(img) {
    this.img = img;
    this.current;
    this.lastDirection = 0;
    this.finished = false;
    this.stack = [];
    this.push = false;
    this.start = function(){
        this.current = findEntry(this.img);
        if(this.current == null) console.error("No entry point found.");

        console.log("ENTRY");

        while(!this.finished) this.nextTile();
    };
    this.nextTile = function() {
        var blockade = false;
        var next;
        var direction;
        if(this.lastDirection > 5) this.lastDirection -= 4;
        else if(this.lastDirection < 1) this.lastDirection += 4;
        for (var i of [0,-1,1,2]){
            var neighbor = neighborTiles[i+this.lastDirection];
            var pos = {x: this.current.x + neighbor.x, y:this.current.y + neighbor.y};
            var idx = (this.img.width * pos.y + pos.x) << 2;
            var pixel = colorFromPixel(this.img.data, idx);
            if (!pixel.equals(color_background)) {
                if(blockade && i==2) break;
                if (pixel.equals(color_blockade)) {
                    if(!blockade) {
                        next = pos;
                        direction = i+this.lastDirection;
                        blockade = true;
                    }
                } else {
                    this.current = pos;
                    this.lastDirection = i+this.lastDirection;
                    if(commander.debug)console.log("[" + this.current.x + " | " + this.current.y + "] STACK: " + this.stack);
                    this.onColor(pixel);
                    return;
                }
            }
        }
        this.current = next;
        this.lastDirection = direction;
        if(commander.debug)console.log("[" + this.current.x + " | " + this.current.y + "] STACK: " + this.stack);
    };
    this.onColor = function(color){
        // if parameters
        if (this.push) {

            if (commander.debug) console.log("NUMBER: " + color.toNumber());
            this.stack.push(color.toNumber());

            this.push = false;
        }
        else {
            if (color.equals(color_path)) return;


            if (color.equals(color_push)) {
                if (commander.debug) console.log("PUSH");
                this.push = true;
            }
            else if (color.equals(color_dup)) {
                if (commander.debug) console.log("DUP");
                this.stack.push(this.stack[this.stack.length-1]);
            }


            else if (color.equals(color_add)) {
                if (commander.debug) console.log("ADD");
                this.stack.push(this.stack.pop() + this.stack.pop());
            }
            else if (color.equals(color_sub)) {
                if (commander.debug) console.log("SUB");
                this.stack.push(-this.stack.pop() + this.stack.pop());
            }
            else if (color.equals(color_mul)) {
                if (commander.debug) console.log("MUL");
                this.stack.push(this.stack.pop() * this.stack.pop());
            }
            else if (color.equals(color_div)) {
                if (commander.debug) console.log("DIV");
                this.stack.push(1 / this.stack.pop() * this.stack.pop());
            }

            else if (color.equals(color_in)) {
                if (commander.debug) console.log("IN");
                console.error("IN is not yet implemented.")
            }
            else if (color.equals(color_out)) {
                if (commander.debug) console.log("OUT");
                console.log(this.stack.pop());
            }
            else if (color.equals(color_to_char)) {
                if (commander.debug) console.log("TO_CHAR");
                this.stack.push(String.fromCharCode(this.stack.pop()));
            }



            else if (color.equals(color_exit)) {
                if (commander.debug) console.log("EXIT");
                this.finished = true;
            }
        }
    };
}
