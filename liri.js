//declaring variables
var inquirer = require("inquirer");
var imdb = require('imdb-api');
var spotify = require('spotify');
var Twitter = require('twitter');
var moment = require('moment');
var fs = require("fs");
var twitterKeys = require("./keys.js");

//Main menu list of choices
inquirer.prompt([
    {
        type: "list",
        message: "Hello! What can I help you with?",
        choices: ["Display my most recent Tweets", "Search Spotify for a song", "Search for a movie", "Exit"],
        name: "mainMenu"
    },
]).then(function(user) {
    //if the user chooses Twitter
    if (user.mainMenu == "Display my most recent Tweets") {
        console.log("Here are your most recent Tweets!");
        //pulls in the twitter keys for the Twitter app
        fs.readFile("keys.js", "utf8", function(error, data) {
            var client = new Twitter(twitterKeys.twitterKeys);
            var params = { chuck_rapp: 'nodejs' };
            client.get('statuses/user_timeline', params, function(error, tweets, response) {
                //as long as theres not an error
                if (!error) {
                    // pass in the 'created_at' string returned from twitter
                    // and formats the time to be more readable and correct time zone
                    function parseTwitterDate(text) {
                        return moment(new Date(Date.parse(text.replace(/( +)/, ' UTC$1')))).format("ddd, MMM Do YYYY • hh:mm a");
                    };
                    //if the number of tweets i greater than 20...
                    if (tweets.length >= 20) {
                        //loop through the first 20 and return timestamp and tweet
                        for (var i = 0; i < 20; i++) {
                            console.log("------------------------------");
                            console.log(" " + parseTwitterDate(tweets[i].created_at));
                            console.log("    " + tweets[i].text);
                            console.log("-------------------------------");
                        }
                        //or else it will pull all the tweets
                    } else {
                        for (var i = 0; i < tweets.length; i++) {
                            console.log("-------------------------------");
                            console.log(" " + parseTwitterDate(tweets[i].created_at));
                            console.log("    " + tweets[i].text);
                        }
                        console.log("-------------------------------");
                    }
                }
            });
        });
        //if the user chooses Spotify
    } else if (user.mainMenu == "Search Spotify for a song") {
        //asking the user what song to search for and stores it as var "song"
        inquirer.prompt([{
            type: "input",
            message: "What song would you like me to search for?",
            name: "song"
        }]).then(function(user) {
            //if user leaves choice blank, assign it to Ace of Base - The Sign
            if (user.song == "") {
                user.song = "Ace of Base - The Sign";
            };
            //searches spotify for track name
            spotify.search({ type: 'track', query: user.song }, function(err, data) {
                if (err) {
                    console.log('Error occurred: ' + err);
                    return;
                }
                //variable to shorten further code and make more readable
                var items = data.tracks.items;
                //if it returns more than 1 result -> push choices to an array
                if (items.length > 1) {
                    var choices = [];
                    for (var i = 0; i < items.length; i++) {
                        //pushes artist name and track name
                        choices.push(items[i].album.artists[0].name + " - " + items[i].name);
                    }
                    //takes the array and asks the user which they want results for - and assigns it to var "artistList"
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "I found multiple results. Which one are you looking for?",
                            choices: choices,
                            name: "artistList"
                        },
                    ]).then(function(finalChoice) {
                        //takes the result of the choice and assigns it to var "song"
                        var song = choices.indexOf(finalChoice.artistList);
                        //grabs the length of the song in milliseconds
                        var durationMS = items[song].duration_ms;
                        //converts it into minutes/seconds format
                        var convertTime = moment.duration(durationMS);
                        var durationSec = convertTime.minutes() + ":" + convertTime.seconds();
                        //returns: song aartist and name, album title, track number, length of the song, and a preview link
                        console.log("----------");
                        console.log(items[song].album.artists[0].name + " - " + items[song].name);
                        console.log("----------");
                        console.log("  Artist: " + items[song].album.artists[0].name);
                        console.log("  Track: " + items[song].name);
                        console.log("  Album: " + items[song].album.name);
                        console.log("  Track Number: " + items[song].track_number);
                        console.log("  Duration: " + durationSec);
                        console.log("----------");
                        console.log("  Preview Link: " + items[song].preview_url);
                        console.log("----------");
                    })
                }

            });
        });
        //if user chooses Movies
    } else if (user.mainMenu == "Search for a movie") {
        //asks the user what movie they want to search and stores it as var "movie"
        inquirer.prompt([{
            type: "input",
            message: "What movie would you like me to search for?",
            name: "movie"
        }]).then(function(user) {
            //if user leave input blank -> assign movie to "Mr. Nobody"
            if (user.movie == "") {
                user.movie = "Mr. Nobody";
            }
            //
            imdb.getReq({ name: user.movie }, (err, things) => {
                movie = things;
                //if no errors, display: movie title, year of release, Metacritic score, awards it won, 
                //country it was produced in and directors names, actors, and a plot summary
                if (!err) {
                    console.log("----------");
                    console.log(movie.title);
                    console.log("----------");
                    console.log("  - Released in " + movie._year_data);
                    console.log("  - Rated " + movie.rating + " by IMBD");
                    console.log("  - A Metacritic score of " + movie.metascore);
                    console.log("  - " + movie.awards);
                    console.log("  - Produced in " + movie.country + " by " + movie.director);
                    console.log("  - Available languages are " + movie.languages);
                    console.log("  - Actors: " + movie.actors);
                    console.log("----------");
                    console.log("  - Plot: " + movie.plot);
                    console.log("----------");
                } else {
                    //if error returns, tell user to search a different title
                    console.log("Hmm.. I couldn't seem to find that one. Try a different title!")
                }
            });
        });
        //exits the app and says good bye to the user
    } else if (user.mainMenu == "Exit") {
        console.log("Bye for now!");
    }
});