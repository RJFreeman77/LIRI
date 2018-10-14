require("dotenv").config();
const request = require("request");
const moment = require('moment');
const Spotify = require('node-spotify-api');
const keys = require("./keys.js");
const spotify = new Spotify(keys.spotify);
const tmdb = keys.tmdb;

let command = process.argv[2];
switch (command) {
    case "concert-this":
        console.log("concert");
        break;
    case "spotify-this-song":
        console.log("spotify");
        break;
    case "movie-this":
        console.log("tmdb");
        break;
    case "do-what-it-says":
        console.log("do this");
        break;
    default: 
        console.log("invalid command");
} 

