  // Initialize Firebase

  var config = {
    apiKey: "AIzaSyDHNIjVU3N-noFomiarsHvdh7IcGk_FHc8",
    authDomain: "rps-database-33456.firebaseapp.com",
    databaseURL: "https://rps-database-33456.firebaseio.com",
    projectId: "rps-database-33456",
    storageBucket: "rps-database-33456.appspot.com",
    messagingSenderId: "699960990417"
  };
  
  /*
  var config = {
    apiKey: "AIzaSyAl0SXm8kPmwFsU9Md0ATISsc_1Iyj9N9c",
    authDomain: "rockpaper-cfdde.firebaseapp.com",
    databaseURL: "https://rockpaper-cfdde.firebaseio.com",
    projectId: "rockpaper-cfdde",
    storageBucket: "rockpaper-cfdde.appspot.com",
    messagingSenderId: "37242376355"
    }; */
    
    // Assign the reference to the database to a variable named 'database'
    // var database = ...
    firebase.initializeApp(config);
    
    var database = firebase.database();
    var connectedRef = firebase.database().ref(".info/connected");
    var name = "";
    var choice = "";
    var ties = 0;
    var wins = 0;
    var losses = 0;
    var players = 0;
    var mePlayer = 0;
    var youPlayer = 0;
    var turn = 1;
    var userRef = database.ref("/user/");
    var userArray = [];
    var choiceInProgress = false;
    var setUp = true;
    var playGame = false;
    var processingFlag = false;

    $(document).ready(function()
    {
        console.log("Document ready");

        $("#score1").html("<br>Wins: 0     Losses: 0");
        $("#score2").html("<br>Wins: 0     Losses: 0");

        $("#chat-input").prop('disabled', true);

        // User hit the Start, so this function process is it here
        $("#start").on("click", function(event)
        {
            event.preventDefault();  // Keeps from refreshing the page
        
            console.log("Clicked start");
            name = $("#name").val().trim();
        
            console.log("name", name);
            if (players < 2)
            {     
                // Can play the game 
                stuffIt();
            }
            else 
            {
                // Print an error
                $("#playerMsg").text("No player spots available.  Try again later.");
                return;
            }
       
        }); // End of Start

        // User hit the Chat, so we process that here
        $("#chat-entry").on("click", function(event)
        {
            var chat = "";
            var userRef = "";

            console.log("chat")
            event.preventDefault();  // Keeps from refreshing the page
            
            // Can only chat it there are two players
            if (userArray == null || userArray[1] == null || userArray[2] == null)
            {
                console.log("can't chat");
                $("#chat-input").prop('disabled', true);
                return;
            }

            chat = $("#chat-input").val().trim();
            console.log("Clicked chat", chat);
            chat = userArray[mePlayer].name + ": " + chat;
            let chatRef = database.ref("/chat");
            chatRef.onDisconnect().remove();
            database.ref("/chat").push(chat);

            $('#input-form')[0].reset();
        
        }); // End of Chat

        // This function deals with adding chats to the Firebase
        database.ref("/chat").on("child_added", function(snapshot) 
        {
            console.log(snapshot.val());
            chat = snapshot.val();
            console.log("In child added ", chat);

            // Put chat into the box
            $("#chatty").append(chat + "<br>");
        });

        ////  This function handles a change in /turn
        database.ref("/turn").on("value", function(snapshot) {
            console.log("In /turn");
            console.log(snapshot.val());
            console.log("User array in /turn ", userArray);

            if (snapshot.val() == null) // Not set up yet
                return;

            turn = snapshot.val();
            console.log("Turn = ", turn);
            console.log("MePlayer = ", mePlayer, "YouPlayer = ", youPlayer);

            if (mePlayer == turn)
            {
                console.log("My turn");
                $("#playerMsg").text("Your turn -- rock, paper or scissors? (Click to select)");
            }
            else
            {
                // Not my turn
                $("#playerMsg").text("Waiting for " + userArray[youPlayer].name);
            }

        // If any errors are experienced, log them to console.
        }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        ////  This function handles all the changes in /user
        database.ref("/user").on("value", function(snapshot) 
        {
            console.log("In change in /user");
            console.log(snapshot.val());
            userArray = snapshot.val();  // Save the new changes

            if (userArray == null)
            {
                $("#player1").text("Waiting for Player 1");
                $("#player2").text("Waiting for Player 2");
                return;
            }

            if (userArray[1] == null)
            {
                $("#player1").text("Waiting for Player 1");
                $("#score1").html("<br>Wins: 0     Losses: 0");


                if (playGame)
                {
                    choiceInProgress = true;
                    $("#playerMsg").text("Lost Player");
                }

                playGame = false;
                $("#chat-input").prop('disabled', true);
            }
            else   
                $("#player1").text(userArray[1].name);

            if (userArray[2] == null)
            {
                $("#player2").text("Waiting for Player 2");
                $("#score2").html("<br>Wins: 0     Losses: 0");

                if (playGame)
                {
                    choiceInProgress = true;
                    $("#playerMsg").text("Lost Player");
                }

                playGame = false;
                $("#chat-input").prop('disabled', true);
            }
            else   
                $("#player2").text(userArray[2].name);
            
                
            if(!playGame)
                setUpGame();

            if (!processingFlag)
                $("#winbox").html("<img src='assets/images/ezgif.com-crop.gif'>");

            if (playGame)
            {
                console.log("Player ", mePlayer);
                console.log("choice ", userArray[1].choice);
                console.log("choice ", userArray[2].choice);

                $("#score1").html("<br>Wins: " + userArray[1].wins + "    Losses: " + userArray[1].losses);
                $("#score2").html("<br>Wins: " + userArray[2].wins + "    Losses: " + userArray[2].losses);

                if (processingFlag)
                {
                    return;
                }

                if (userArray[1].choice != "" && userArray[2].choice != "")
                {   // Got some choices
                    console.log("In checking results")

                    let winflag = checkResults();

                    if (winflag == 0)
                    {
                        $("#winbox").html("Tie Game!!");
                        var imgchoice = "assets/images/" + choice;
                        $("#player1Pick").html("<img src='assets/images/" + userArray[1].choice + "1.jpg'>");
                        $("#player2Pick").html("<img src='assets/images/" + userArray[2].choice + "2.jpg'>");
                    }
                    else
                    {
                        let winner = userArray[winflag].name;
            
                        console.log("winner ", winflag);
            
                        $("#winbox").html(winner + "<br>WINS!!");
                        $("#player1Pick").html("<img src='assets/images/" + userArray[1].choice + "1.jpg'>");
                        $("#player2Pick").html("<img src='assets/images/" + userArray[2].choice + "2.jpg'>");
                    }

                    processingFlag = true;

                    // ** DEBUG **
                    updateUser();

                    // Need to wait and on next update, update the scores
                    setTimeout(continueProcessing, 4000);
                }
            } 

        // If any errors are experienced, log them to console.
        }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        // We clean up here so we can start the next game
        function continueProcessing()
        {
            processingFlag = false;

            console.log("Finish processing")

            $("#winbox").html("<img src='assets/images/ezgif.com-crop.gif'>");

            // Clear the choice for the next game
            choice = "";
            updateUser();

            // Clear the choices from the screen
            $("#player1Pick").html("");
            $("#player2Pick").html("");

            // Reset user to start another round
            choiceInProgress = false;
            turn = 1;
            database.ref("/turn").set(turn);
        }

        // This function sets up the game.  Sets the number players so we limit to 2
        // and game in progress flag
        // Also sets chat so we can't chat unless there are two people.
        function setUpGame()
        {
            console.log("In SetUpGame");

            if (userArray == null) // No player array
            {
                players = 0;
                console.log("No player array");
            }
            else   
            {
                console.log("array length ", userArray.length);

                // number of users is array - 1
                if (userArray.length == null)
                {
                    players = 1;
                }
                else
                {
                    players = userArray.length;
                    players = players - 1;

                    if (players == 2)
                    {  // second player added - time to play!!
                        console.log("Added player 2");

                        playGame = true;  // Set to pick choices
                        $("#chat-input").prop('disabled', false);  // Enable chat
                        choiceInProgress = false;  // Turn "on" choice flag
                        database.ref("/turn").set(turn);
                    }
                }
            }
            console.log("Players ", players);
        }
    
        // This just sets up the player data to be pushed into the Firebase /user
        function stuffIt()
        {
            // Push into the DB
            // Save the new price in Firebase
            players++;
            console.log("UserArray", userArray);

            if ((userArray == null) || (userArray[1] == null))
            {
                mePlayer = 1;
                youPlayer = 2;
            }
            else  
            {
                mePlayer = 2;
                youPlayer = 1;
                console.log("UserArray Name 1", userArray[1].name);
            }  

            console.log("going to stuff DB with ", name);
            console.log("Player # ", mePlayer);

            updateUser();

        } // end StuffIt

        // Checks to see who wins/loses.  Returns the player who won.
        function checkResults()
        {
            var winflag = 0;
            if (userArray[mePlayer].choice === userArray[youPlayer].choice) {
                ties++;
                winflag = 0; // no winner
            } else if (userArray[mePlayer].choice === 'rock' && userArray[youPlayer].choice === 'paper') {
                losses++;
                winflag = youPlayer;
            } else if (userArray[mePlayer].choice === 'rock' && userArray[youPlayer].choice === 'scissors') {
                wins++;
                winflag = mePlayer;
            } else if (userArray[mePlayer].choice === 'paper' && userArray[youPlayer].choice === 'rock') {
                wins++;
                winflag = mePlayer;
            } else if (userArray[mePlayer].choice === 'paper' && userArray[youPlayer].choice === 'scissors') {
                losses++;
                winflag = youPlayer;           
            } else if (userArray[mePlayer].choice === 'scissors' && userArray[youPlayer].choice === 'paper') {
                wins++;
                winflag = mePlayer;
            } else if (userArray[mePlayer].choice === 'scissors' && userArray[youPlayer].choice === 'rock') {
                losses++;
                winflag = youPlayer;
            }

            return winflag;
        }

        // They clicked a choice. 
        // If there are two players, it will set turn in Firebase to toggle to other player
        $(document).on("click", ".rpsChoice", function()
        {   
            if (turn == mePlayer) // My Turn
            {
                if (choiceInProgress) // I only get one choice
                    return;

                choice = $(this).attr("value");
                console.log("I clicked ", choice);

                // Update my choice
                updateUser();

                // Give the other guy a turn, if he's player 2
                if (mePlayer == 1)
                {
                    console.log("switching to player ", youPlayer);
                    database.ref("/turn").set(youPlayer);
                }
 
                choiceInProgress = true; // Can't pick again

                renderCenter();
            }
            
        });

        // Updates the Firebase for /user
        function updateUser()
        {
            path = "/user/" + mePlayer;
            console.log(path);

            if (setUp)  // only need to do this on set up
            {
                userRef = database.ref(path);
                userRef.onDisconnect().remove();
                userRef = database.ref("/turn");
                userRef.onDisconnect().remove()
                setUp = false;
            }

            let user = {
                name: name,
                choice: choice,
                wins: wins,
                losses: losses
            }

            database.ref(path).set(user);
        }   

        // Render the center box
        function renderCenter()
        {
            var imgchoice = "assets/images/" + choice;


            if (mePlayer == 1)
            {
                imgchoice = imgchoice + "1" + ".jpg";
                console.log("imgchoice", imgchoice);
                $("#player1Pick").html(`<img src="${imgchoice}" >`)
            }
            else
            {
                imgchoice = imgchoice + "2" + ".jpg";
                console.log("imgchoice", imgchoice);
                $("#player2Pick").html(`<img src="${imgchoice}" >`)
            }

        }
    
    }); // End on document ready