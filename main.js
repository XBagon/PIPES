const fs = require("fs");
const commander = require("commander");
const PNG = require("pngjs").PNG;

const color_entry = new color(0,255,0);
const color_exit = new color(255,0,0);
const color_background = new color(255,255,255);
const color_path = new color(0,0,0);
const color_blockade = new color(127,127,127);

const color_push = new color(0,0,255);
const color_add = new color(38,127,0);
const color_sub = new color(87,0,124);
const color_mul = new color(124,24,0);
const color_div = new color(0,99,124);

const operation_push = 1;
const operation_add = 2;
const operation_sub = 3;
const operation_mul = 4;
const operation_div = 5;

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

commander.parse(process.argv);


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

//TODO: 4 neighbors instead of 8
//TODO: maybe straight, right then left for cooler looks
var neighborTiles = [{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1},{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1},{x:-1,y:-1},{x:-1,y:0},{x:-1,y:1},{x:0,y:1},{x:1,y:1},{x:1,y:0},{x:1,y:-1},{x:0,y:-1}];



function walker(img) {
    this.img = img;
    this.current;
    this.lastNeighbor = 0;
    this.finished = false;
    this.stack = [];
    this.operation = 0;
    this.start = function(){
        this.current = findEntry(img);
        if(this.current == null) console.error("No entry point found.");

        console.log("ENTRY");

        while(!this.finished) this.nextTile();
    };
    this.nextTile = function() {
        var blockade = false;
        var next;
        var offset = (this.lastNeighbor + 1) % 8;
        for (let i = offset; i < 8 + offset; i++) {
            var neighbor = neighborTiles[i];
            var pos = {x: this.current.x + neighbor.x, y:this.current.y + neighbor.y};
            var idx = (img.width * pos.y + pos.x) << 2;
            var pixel = colorFromPixel(img.data, idx);
            if (!pixel.equals(color_background)) {
                if(blockade && i==7+offset) break;
                if (pixel.equals(color_blockade)) {
                    if(!blockade) {
                        next = pos;
                        this.lastNeighbor = i + 4;
                        blockade = true;
                    }
                } else {
                    next = pos;
                    this.lastNeighbor = i+4;
                    this.onColor(pixel);
                    break;
                }
            }
        }

        this.current = next;
    };
    this.onColor = function(color){
        // if parameters
        if(this.operation == 0) {
            if (color.equals(color_path)) return;

            console.log(this.current + this.stack);

            if (color.equals(color_push)) {
                console.log("PUSH");
                this.operation = operation_push;
            }


            else if (color.equals(color_add)) {
                console.log("ADD");
                this.stack.push(this.stack.pop() + this.stack.pop());
            }
            else if (color.equals(color_sub)) {
                console.log("SUB");
                this.stack.push(-this.stack.pop() + this.stack.pop());
            }
            else if (color.equals(color_mul)) {
                console.log("MUL");
                this.stack.push(this.stack.pop() * this.stack.pop());
            }
            else if (color.equals(color_div)) {
                console.log("DIV");
                this.stack.push(1/this.stack.pop() * this.stack.pop());
            }

            else if (color.equals(color_exit)) {
                console.log("EXIT");
                this.finished = true;
            }
        }
        else{
            switch(this.operation){
                case operation_push:
                    console.log("NUMBER: " + color.toNumber());
                    this.stack.push(color.toNumber());
                    break;
                case operation_add:

                    break;
                case operation_sub:

                    break;
                case operation_mul:

                    break;
                case operation_div:

                    break;
            }
            //console.log("color: { R: " + color.R + ", G: " + color.G + ", B: " + color.B + " }; number: " + color.toNumber() + "; operation: " + this.operation + "; stack: " + this.stack);
            this.operation = 0;
        }
    };
}
