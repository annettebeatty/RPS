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
    var name = "";
    var choice = "";
    var wins = 0;
    var losses = 0;
    var players = 0;
    var mePlayer = 0;
    var turn = 1;

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

        database.ref("/turn").on("value", function(snapshot) {
            console.log("In change player value");
            console.log(snapshot.val());
         //   console.log(snapshot.val().number)

        });

        database.ref("/user").on("value", function(snapshot) {
            console.log("In change in /user");
            console.log(snapshot.val());

            if (snapshot.val() == null) // No player array
            {
                players = 0;
            }
            else   
            {
                // number of users is array - 1
                players = snapshot.val().length;
                players = players - 1;
            }
            
            console.log("Players ", players);

        });
        // At the initial load and subsequent value changes, get a snapshot of the stored data.
        // This function allows you to update your page in real-time when the firebase database changes.
        database.ref().on("child_added", function(snapshot) {

            console.log("In child added");
            console.log(snapshot.val());

            // Check if we have any players
            if (snapshot.child("players").exists()) 
            {   // We have at least one player
                players = snapshot.val().players.number;  // Get the number of players
                console.log("Number of players ", players);

                if (players >= 2)
                {
                    // This guy can't play
                    $("#turnmsg").text("Game already in progress.  Try again later.")

                    // Delete his session
                    return;
                }

                // This guy is player #2
                player = 2;
            }
            else // This guy is the first player
                player = 1;
        
        // If any errors are experienced, log them to console.
        }, function(errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    
        function stuffIt()
        {
            // Push into the DB
            // Save the new price in Firebase
            players++;   
            mePlayer = players;

            console.log("going to stuff DB with ", name);
            console.log("Player # ", mePlayer);

            // database.ref("/turn").set({ // Set the clickCount variable in the DB to the clickCounter
            //    turn
            // });

            let path = "/user/" + players;

            let user = {
                name: name,
                choice: choice,
                wins: wins,
                losses: losses
            }

            database.ref(path).set(user);

        } // end StuffIt

        // They clicked a choice
        $(document).on("click", ".rpsChoice", function()
        {
            choice = $(this).attr("value");
            console.log("They clicked ", choice);
            $("#winbox").html("<img src='assets/images/ezgif.com-crop.gif'>");
            renderCenter();
        });

        // Render the center box
        function renderCenter()
        {
            var imgchoice = "assets/images/" + choice;

            if (player == 1)
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