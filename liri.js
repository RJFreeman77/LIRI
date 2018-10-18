require("dotenv").config();
const request = require("request");
const moment = require('moment');
const Spotify = require('node-spotify-api');
const keys = require("./keys.js");
const inquirer = require("inquirer");
const spotify = new Spotify(keys.spotify);
const tmdb = keys.tmdb;
const bands = keys.bands;

function requestInput() {
    inquirer.prompt([
        {
            type: "list",
            name: "command",
            message: "Please choose one from the following",
            choices: ["Search Concert", "Search Song with Spotify", "Search a movie", "Do what the text file says"]
        }
    ]).then(function (res) {
        let command = res.command;
        switch (command) {
            case "Search Concert":
                console.log("concert");
                bandsInTown();
                break;
            case "Search Song with Spotify":
                console.log("spotify");
                spotifySearch();
                // spotify function
                break;
            case "Search a movie":
                // tmdb function
                console.log("tmdb");
                break;
            case "Do what the text file says":
                console.log("do the thing");
                // do what it says function
                break;
            default:
                console.log("invalid command");
        }
    });
}

function askAnotherQuestion() {
    inquirer.prompt([
        {
            type: "list",
            name: "confirm",
            message: "Would you like to exit, or do something else?",
            choices: ["Exit", "Do something else"]
        }
    ]).then(function (res) {
        if (res.confirm === "Exit") {
            process.exit();
        } else {
            requestInput();
        }
    });
}

function spotifySearch() {
    inquirer.prompt([
        {
            name: "song",
            message: "Type a song title"
        }
    ]).then(function (res) {
        let songTitle = res.song;
        spotify.search({ type: "track", query: songTitle, limit: 10 }, function (err, data) {
            if (err) { console.log('Error occurred: ' + err); }
            data.tracks.items.forEach(function (index) {
                let artist = index.artists[0].name;
                let name = index.name;
                let link = index.artists[0].external_urls.spotify;
                let album = index.album.name;

                console.log("=".repeat(30));
                console.log(`Artist: ${artist}\nTitle: ${name}\nLink: ${link}\nAlbum: ${album}`);
                console.log("=".repeat(30) + "\n");
            });

            askAnotherQuestion();
        });
    });
}

function bandsInTown() {
    inquirer.prompt([
        {
            name: "artist",
            message: "Name a Band"
        }
    ]).then(function (res) {
        let artist = res.artist.replace(/\s+/g, '%20');
        let QUERY_URL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=${bands.id}`;
        request(QUERY_URL, function (err, res, body) {
            if (!err && res.statusCode === 200) {
                let bodyParsed = JSON.parse(body);
                for (let i = 0; i < bodyParsed.length; i++) {
                    let venue = bodyParsed[i].venue.name;
                    let venueLocation = bodyParsed[i].venue.city + " " + bodyParsed[i].venue.region;
                    let dateRaw = bodyParsed[i].datetime;
                    let dateFormatted = moment(dateRaw).format("MM/DD/YYYY");
                    let available = bodyParsed[i].offers[0].status;
                    console.log("=".repeat(30));
                    console.log(`Venue: ${venue}\nLocation: ${venueLocation}\nDate: ${dateFormatted}\nStill Tickets? ${available}`);
                    console.log("=".repeat(30) + "\n");
                }
            } else if (err) {
                console.error(`Error: ${err}`);
            }
        });
    });
}


requestInput(); 