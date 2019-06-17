# PIPES
PIPES is a image-based 2D programming "language". It follows "pipes" and executes operations when reaching pipes with specific colors.
Most operations work on the stack, but you can save and load from memory.

## Features
* Drawing programs
* No more writing programs
* Input characters
* Output numbers and characters
* Basic arithmetic operations
* Comparisons
* Saving and loading to/from memory

## Planned
* Better input processing
* Custom palettes
* Better debugging
* Better editing (custom IDE?)

## Install PIPES:  
```shell
$ npm install pipes-lang -g
```

You can use this [palette file](https://github.com/XBagon/PIPES/blob/master/PIPES_PAINT_NET_PALETTE.txt) for Paint.NET.

# Usage

```shell
  Usage: pipes [options]

  Options:

    -V, --version       output the version number
    -d, --debug         Debug mode
    -s, --strict        Strict mode
    -i, --input [args]  Input arguments
    -p, --stepwise      NOT YET IMPLEMENTED! Stepwise execution
    -h, --help          output usage information
```


## Pipes

**The program will always try to go _straight_, then _right_ and then _left_**.

**Pipes aren't allowed to touch the image borders!**

This is the standard palette, in the future I want to make it easy to use custom palettes.


### Meta Pipes
|Color|Code|Name|Meaning|
|-|-|-|-|
|White|0,0,0|background|is ignored|
|Black|255,255,255|default pipe|guides program|
|Grey|127,127,127|blockade|low priority(only enters if there's no other way)|
|Green|0,255,0|entry|program starts here|
|Red|255,0,0|exit|program stops here|

### Stack Operation Pipes
|Color|Code|Name|Meaning|
|-|-|-|-|
|Blue|0,0,255|push|the only pipe that needs an parameter *afterwards*, pushes the following pixel color number to the stack|
|Yellow|255,255,0|remove|removes the top element from the stack|
|Gray|127,127,127|blockade|low priority(only enters if there's no other way)|
|Spring Green|0,255,144|stack to memory|saves the second element on the stack to the adress provided by the first element, the first element is removed|
|Cyan|0,225,255|memory to stack|pushes the element at the adress provided by the top element on the stack and removes the adress element|
|Malibu|127,127,255|duplicate|duplicates the top element on the stack|
|Electric Violet|178,0,255|swap|swaps the top two elements|

### Arithmetic Pipes
|Color|Code|Name|Meaning|
|-|-|-|-|
|Japanese Laurel|37,127,0|add|removes E1, E2 and pushes E1+E2|
|Pigment Indigo|87,0,124|subtract|removes E1, E2 and pushes E2-E1|
|Cedar Wood Finish|124,24,0|multiply|removes E1, E2 and pushes E1*E2|
|Orient|37,127,0|divide|removes E1, E2 and pushes E2/E1|

### Control Flow Pipes
|Color|Code|Name|Meaning|
|-|-|-|-|
|Pumpkin Skin|168,97,11|compare|compares E2 to E1, and changes direction depending on the result. equal: straight, greater: right, less: left|
|Blue Chalk|248,214,255|teleport absolute|program jumps to position x = E2 y = E1|
|Baja White|255,251,214|teleport relative|program jumps on position x = x+E2 y = y+E1|

### I/O Pipes
|Color|Code|Name|Meaning|
|-|-|-|-|
|School Bus Yellow|255,216,0|input|no effect (yet)|
|Blaze Orange|255,106|output|removes the top element from the stack and prints it|
|Chardonnay|255,206,127|char output|removes the top element from the stack and prints the char with the char code provided|

All the color names are only the names of the nearest named colors.

## Examples

# Basic I/O

![Basic I/O](/examples/IO.png?row=true)

When you input "r" it will output "right",
when you input "l" it will output "left,
otherwise it will return "-1".

# Loop

![Loop](/examples/loop.png?raw=true)

# Not Strict

![Not Strict](/examples/loop.png?raw=true)

# Fibonacci

![Fibonacci](/examples/fibonacci.png?raw=true)

