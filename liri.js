require("dotenv").config();
const fs = require("fs");
const request = require("request");
const moment = require('moment');
const Spotify = require('node-spotify-api');
const keys = require("./keys.js");
const inquirer = require("inquirer");
const spotify = new Spotify(keys.spotify);
const omdb = keys.omdb;
const bands = keys.bands;

function requestInput() {
    inquirer.prompt([
        {
            type: "list",
            name: "command",
            message: "Please choose one from the following",
            choices: [
                "Search Concert",
                "Search Song with Spotify",
                "Search a movie",
                "Search song from Txt file"
            ]
        }
    ]).then(function (res) {
        let command = res.command;
        switch (command) {
            case "Search Concert":
                bandsInTown();
                break;
            case "Search Song with Spotify":
                spotifySearch();
                break;
            case "Search a movie":
                omdbSearch();
                break;
            case "Search song from Txt file":
                readFile();
                break;
            default:
                console.log("invalid command");
                askAnotherQuestion();
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
        spotify.search({ type: "track", query: songTitle, limit: 5 }, function (err, data) {
            if (err) { console.log('Error occurred: ' + err); }
            data.tracks.items.forEach(function (index) {
                let artist = index.artists[0].name;
                let name = index.name;
                let link = index.artists[0].external_urls.spotify;
                let album = index.album.name;

                console.log(`
${"=".repeat(30)}
Artist: ${artist}
Title: ${name}
Link: ${link}
Album: ${album}
${"=".repeat(30)}`);
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
            let bodyParsed = JSON.parse(body);
            if (!err && res.statusCode === 200) {
                bodyParsed.forEach(function (bodyIndex) {
                    let venue = bodyIndex.venue.name;
                    let venueLocation = bodyIndex.venue.city + " " + bodyIndex.venue.region;
                    let dateRaw = bodyIndex.datetime;
                    let dateFormatted = moment(dateRaw).format("MM/DD/YYYY");
                    let available = bodyIndex.offers[0].status;

                    console.log(`
${"=".repeat(30)}
Venue: ${venue}
Location: ${venueLocation}
Date: ${dateFormatted}
Still Tickets? ${available}
${"=".repeat(30)}`);
                });
            } else if (err) {
                console.error(`Error: ${err}`);
            }
            askAnotherQuestion();
        });
    });
}

function omdbSearch() {
    inquirer.prompt([
        {
            name: "movie",
            message: "Type in a movie title"
        }
    ]).then(function (res) {
        let movie = res.movie.replace(/\s+/g, '%20');
        let QUERY_URL = `http://www.omdbapi.com/?apikey=${omdb.id}&type=movie&t=${movie}`;

        request(QUERY_URL, function (err, res, body) {
            let JSONBody = JSON.parse(body);
            if (!err && res.statusCode === 200) {
                if (JSONBody.Response.includes("False")) {
                    console.log("No results returned. Please Try again.");
                    return askAnotherQuestion();
                }
                let formatedDate = moment(JSONBody.Released, "DD MMM YYYY").format("YYYY")
                console.log(`
${"=".repeat(30)}
Title: ${JSONBody.Title}
Year: ${formatedDate}
IMDB Rating: ${JSONBody.Ratings[0].Value}
Rotten Tomatos Rating: ${JSONBody.Ratings[1].Value}
Country Produced: ${JSONBody.Country}
Language: ${JSONBody.Language}
Plot: ${JSONBody.Plot}
Actors: ${JSONBody.Actors}
${"=".repeat(30)}`);
            } else if (err) {
                console.error("Error: " + err);
            }

            askAnotherQuestion();
        });
    });
}

function readFile() {
    fs.readFile("random.txt", "utf8", function (err, data) {
        if (err) { return console.error("Error: " + err); }
        let searchTermConverted = data.replace(/\s+/g, '%20');
        spotify.search({ type: "track", query: searchTermConverted, limit: 5 }, function (err, data) {
            if (err) { console.log('Error occurred: ' + err); }
            data.tracks.items.forEach(function (index) {
                let artist = index.artists[0].name;
                let name = index.name;
                let link = index.artists[0].external_urls.spotify;
                let album = index.album.name;

                console.log(`
${"=".repeat(30)}                
Artist: ${artist}
Title: ${name}
Link: ${link}
Album: ${album}
${"=".repeat(30)}`);
            });

            askAnotherQuestion();
        });
    });
}

function askAnotherQuestion() {
    inquirer.prompt([
        {
            type: "list",
            name: "confirm",
            message: "Would you like to exit, or keep going?",
            choices: ["Keep Going", "Exit"]
        }
    ]).then(function (res) {
        if (res.confirm === "Exit") {
            process.exit();
        } else {
            requestInput();
        }
    });
}

requestInput(); 