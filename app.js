var fs       = require("fs");
var lame     = require('lame');
var Speaker  = require('speaker');
var stream   = require("stream");

var decoder;
var speaker;


function connectAndPlay(){

    decoder = null;
    decoder = new lame.Decoder();
    speaker = null;
    speaker = new Speaker();
    stream = null;
    stream = fs.createReadStream('audio.mp3')

    stream.pipe( decoder )
        .pipe(speaker)
        .on("finish", function(){
            console.log("finish");
            nextPlay();
        })
}


function nextPlay(){
    connectAndPlay();
}

connectAndPlay();