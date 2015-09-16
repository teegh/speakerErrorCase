//todo
//raspberryでテスト
//alignment :: command + ctrl + a

var fs       = require("fs");
var request  = require("request");
var express  = require('express');
var CryptoJS = require('crypto-js');
var app      = express();
var url      = "http://localhost:1338";
var AV = require("av");
require("mp3");
var obj;

//サーバーにアクセスする。
function connectAndPlay(){
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        // console.log(JSON.parse(body));
        obj               = JSON.parse(body);
        var cipherParams  = CryptoJS.lib.CipherParams.create({
                ciphertext : CryptoJS.enc.Base64.parse(obj.ct)
        });
        cipherParams.salt = CryptoJS.enc.Hex.parse(obj.s);
        cipherParams.iv   = CryptoJS.enc.Hex.parse(obj.iv);
        var decrypted     = CryptoJS.AES.decrypt(  cipherParams  , "password");
        var u8            = CryptoJS.enc.u8array.stringify(decrypted);
        
        var buffer = new Buffer(u8.length);
        for (var i = 0; i < u8.length; i++) {
            buffer.writeUInt8(u8[i], i);
        }

        var player = new AV.Player.fromBuffer ( buffer );
        player.play();
        player.on('end', function() {
            setTimeout(function() {
                // player.startPlaying();
                // player.seek(0);
                // player.play();
                console.log("play end");
                nextPlay();
            }, 5);
        });
        // fs.writeFileSync("./audio.mp3", buffer);
        
      } else {
        console.log('request error: '+ response.statusCode);
      }
    })
}


function nextPlay(){
    connectAndPlay();
}

//起動時に接続開始
connectAndPlay();


// CryptoJS.encを拡張
CryptoJS.enc.u8array = {
    /**
     * Converts a word array to a Uint8Array.
     *
     * @param {WordArray} wordArray The word array.
     *
     * @return {Uint8Array} The Uint8Array.
     *
     * @static
     *
     * @example
     *
     *     var u8arr = CryptoJS.enc.u8array.stringify(wordArray);
     */
    stringify: function (wordArray) {
        // Shortcuts
        var words = wordArray.words;
        var sigBytes = wordArray.sigBytes;

        // Convert
        var u8 = new Uint8Array(sigBytes);
        for (var i = 0; i < sigBytes; i++) {
            var byte = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            u8[i]=byte;
        }

        return u8;
    },

    /**
     * Converts a Uint8Array to a word array.
     *
     * @param {string} u8Str The Uint8Array.
     *
     * @return {WordArray} The word array.
     *
     * @static
     *
     * @example
     *
     *     var wordArray = CryptoJS.enc.u8array.parse(u8arr);
     */
    parse: function (u8arr) {
        // Shortcut
        var len = u8arr.length;

        // Convert
        var words = [];
        for (var i = 0; i < len; i++) {
            words[i >>> 2] |= (u8arr[i] & 0xff) << (24 - (i % 4) * 8);
        }

        return CryptoJS.lib.WordArray.create(words, len);
    }
};