  // Initialize Firebase

  var config = {
    apiKey: "AIzaSyAl0SXm8kPmwFsU9Md0ATISsc_1Iyj9N9c",
    authDomain: "rockpaper-cfdde.firebaseapp.com",
    databaseURL: "https://rockpaper-cfdde.firebaseio.com",
    projectId: "rockpaper-cfdde",
    storageBucket: "rockpaper-cfdde.appspot.com",
    messagingSenderId: "37242376355"
    };
    
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
    var childchange = 0;

    $(document).ready(function()
    {
        console.log("Document ready");

        // User hit the Start
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
                $("#playerMsg").text("Your turn - choose rock, paper or scissors?");
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

        ////  This function handles a change in /user
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
                return;
            }

            if (userArray[2] == null)
            {
                $("#player2").text("Waiting for Player 2");
            }

            if (!playGame)
                setUpPlayers();

            $("#winbox").html("<img src='assets/images/ezgif.com-crop.gif'>");

            if (playGame)
            {
                console.log("Player ", mePlayer);
                console.log("child change ", childchange++);
                console.log("choice ", userArray[1].choice);
                console.log("choice ", userArray[2].choice);

                if (userArray[1].choice != "" && userArray[2].choice != "")
                {   // Got some choices
                    console.log("In checking results")
                    checkResults();

                    //setTimeout(updateUser, 4000);
                    // Clear out the choices  **** I need to come back to this **
                    // choice = "";

                    //updateUser();

                    // Reset user to start another round
                    //turn = 1;
                   // database.ref("/turn").set(turn);

                }
            } 
  

        // If any errors are experienced, log them to console.
        }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        });

        function setUpPlayers()
        {
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
                    if (players == 1)
                        $("#player1").text(userArray[1].name);
                    else
                    {  // second player added - time to play!!
                        console.log("Added player 2");

                        $("#player2").text(userArray[2].name);
                        playGame = true;  // Set to pick choices
                        database.ref("/turn").set(turn);
                    }
                }
            }
            console.log("Players ", players);
        }

        // At the initial load and subsequent value changes, get a snapshot of the stored data.
        // This function allows you to update your page in real-time when the firebase database changes.
        database.ref().on("child_added", function(snapshot) {

            console.log("In child added");
            console.log(snapshot.val());
        
        // If any errors are experienced, log them to console.
        }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    
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
            } else if (uuserArray[mePlayer].choice === 'scissors' && userArray[youPlayer].choice === 'rock') {
                losses++;
                winflag = youPlayer;
            }

            var winner;

            if (winflag == 0)
            {
                $("#winbox").html("Tie Game!!");
                return;
            }

            winner = userArray[winflag].name;

            console.log("winner ", winflag);

            $("#winbox").html(winner + "<br>WINS!!");
        }

        // They clicked a choice
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

        function updateUser()
        {
            path = "/user/" + mePlayer;
            console.log(path);

            if (setUp)  // only need to do this on set up
            {
                userRef = database.ref(path);
                userRef.onDisconnect().remove();
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