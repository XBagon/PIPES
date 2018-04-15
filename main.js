const fs = require("fs");
// const readline = require("readline");
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
const commander = require("commander");
const PNG = require("pngjs").PNG;

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

commander
    .version("1.0.0")
    .name("pipes-lang")
    .option("-d, --debug","Debug mode")
    .option("-s, --strict","Strict mode")
    .option("-i, --input [args]","Input arguments")
    .option("-p, --stepwise","NOT YET IMPLEMENTED! Stepwise execution")
    .parse(process.argv);



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
    if(commander.input) {
        for (let i = 0; i < commander.input.length; i++) {
            w.stack.unshift(commander.input.charCodeAt(i));
        }
    }
    w.colormandos.push(
        {
            name : "DUP" ,
            color : new color(127,127,255),
            func : function() {
                this.stack.push(this.stack[this.stack.length-1]);
            }
        },
        {
            name : "SWP" ,
            color : new color(178,0,255),
            func : function() {
                var a = this.stack.pop();
                var b = this.stack.pop();
                this.stack.push(a);
                this.stack.push(b);
            }
        },
        {
            name : "ADD" ,
            color : new color(38,127,0),
            func : function() {
                this.stack.push(this.stack.pop() + this.stack.pop());
            }
        },
        {
            name : "SUB" ,
            color : new color(87,0,124),
            func : function() {
                this.stack.push(-this.stack.pop() + this.stack.pop());
            }
        },
        {
            name : "MUL" ,
            color : new color(124,24,0),
            func : function() {
                this.stack.push(this.stack.pop() * this.stack.pop());
            }
        },
        {
            name : "DIV" ,
            color : new color(0,99,124),
            func : function() {
                this.stack.push(1/this.stack.pop() * this.stack.pop());
            }
        },
        {
            name : "CMP" ,
            color : new color(168,97,11),
            func : function() {
                var diff = this.stack[this.stack.length-2] - this.stack[this.stack.length-1];
                if(diff > 0){
                    this.lastDirection--;
                }else if(diff < 0){
                    this.lastDirection++;
                }
            }
        },
        {
            name : "STM" ,
            color : new color(0,255,144),
            func : function() {
                this.memory[this.stack.pop()] = this.stack[this.stack.length-1];
            }
        },
        {
            name : "MTS" ,
            color : new color(0,225,255),
            func : function() {
                this.stack.push(this.memory[this.stack.pop()]);
            }
        },
        {
            name : "IN" ,
            color : new color(255,216,0),
            func : function() {
                console.error("IN is not yet implemented.")
            }
        },
        {
            name : "OUT" ,
            color : new color(255,106,0),
            func : function() {
                console.log(this.stack.pop());
            }
        },
        {
            name : "CHAR_OUT" ,
            color : new color(255,206,127),
            func : function() {
                process.stdout.write(String.fromCharCode(this.stack.pop()));
            }
        },
    );

    w.stepwise = commander.stepwise;
    w.start();


    // if(commander.stepwise){
    //     rl.question("", () => {
    //         w.nextTile();
    //
    //     });
    // }
}




var neighborTiles  = [{x:-1,y:0},{x:0,y:1},{x:1,y:0},{x:0,y:-1},{x:-1,y:0},{x:0,y:1},{x:1,y:0},{x:0,y:-1}];


function walker(img) {
    this.img = img;
    this.current;
    this.lastDirection = 0;
    this.finished = false;
    this.stepwise = false;
    this.stack = [];
    this.memory = [];
    this.push = false;
    this.colormandos = [];
    this.color_entry = new color(0,255,0);
    this.color_exit = new color(255,0,0);
    this.color_background = new color(255,255,255);
    this.color_path = new color(0,0,0);
    this.color_blockade = new color(127,127,127);
    this.color_push = new color(0,0,255);
    this.color_rem = new color(255,255,0);
    this.start = function(){
        this.current = this.findEntry(this.img);
        if(this.current == null) console.error("No entry point found.");

        console.log("ENTRY");

        if(!this.stepwise){
            while (!this.finished) this.nextTile();
        }
    };
    this.findEntry = function(img){
        for (let y = 0; y < img.height; y++) {
            for (let x = 0; x < img.width; x++) {
                var idx = (img.width * y + x) << 2;
                var pixel = colorFromPixel(img.data, idx);
                if(pixel.equals(this.color_entry)){
                    return {x,y};
                }
            }
        }
        return null;
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
            if (!pixel.equals(this.color_background)) {
                if(blockade && i==2) break;
                if (pixel.equals(this.color_blockade)) {
                    if(!blockade) {
                        next = pos;
                        direction = i+this.lastDirection;
                        blockade = true;
                    }
                } else {
                    this.current = pos;
                    this.lastDirection = i+this.lastDirection;
                    if(commander.debug)console.log("[" + this.current.x + " | " + this.current.y + "] STACK: " + this.stack + " MEM: " + this.memory);
                    this.onColor(pixel);
                    return;
                }
            }
        }
        this.current = next;
        this.lastDirection = direction;
        if(commander.debug)console.log("[" + this.current.x + " | " + this.current.y + "] STACK: " + this.stack + " MEM: " + this.memory);
    };
    this.onColor = function(color){
        // if parameters
        if (this.push) {

            if (commander.debug) console.log("NUMBER: " + color.toNumber());
            this.stack.push(color.toNumber());

            this.push = false;
        }
        else {
            if (color.equals(this.color_path)) return;


            if (color.equals(this.color_push)) {
                if (commander.debug) console.log("PUSH");
                this.push = true;
                return;
            }
            if (color.equals(this.color_rem)) {
                if (commander.debug) console.log("REM");
                this.stack.pop();
                return;
            }


            for (cm of this.colormandos){
                if(color.equals(cm.color)){
                    if(commander.debug) console.log(cm.name);
                    cm.func.call(this);
                    return;
                }
            }

            if (color.equals(this.color_exit)) {
                if (commander.debug) console.log("EXIT");
                this.finished = true;
            }
            else{
                if(commander.strict) console.error("Unknown color found.");
            }
        }
    };
}


module.exports = {
    walker,
    color
}
