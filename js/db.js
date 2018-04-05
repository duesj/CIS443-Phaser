var global_user;
var global_score;

 initApp = function () {
            document.getElementById('sign-out').addEventListener('click', function () {
                firebase.auth().signOut();
                window.location.href = "login.html";
            });
            firebase.auth().onAuthStateChanged(function (user) {
                if (user) {
                    // User is signed in.
                    var GameAwake = true;
                    var displayName = user.displayName;
                    var email = user.email;
                    var emailVerified = user.emailVerified;
                    var photoURL = user.photoURL;
                    var uid = user.uid;
                    var phoneNumber = user.phoneNumber;
                    var providerData = user.providerData;
                    var dbRef = firebase.database().ref('/users/' + user.uid + '/');
                    dbRef.update({
                        username: user.displayName,
                        score: 0,
                    });
                    document.getElementById("userName").innerHTML = 'Hello ' + displayName;

                    dbRef.on("value", function (snapshot) {
                        updateHighScore();
                    });

                    // Listener for the Playerscore var in game.js
                    Object.defineProperty(window, "playerScore", {
                        set: function (value) {
                            global_score = value;
                            //We don't want it to update until log in 
                           // if (GameAwake) {
                                updateScore(global_score, user.displayName);
                           // }
                        }
                    });

                    //Updates score to firebase
                    function updateScore(score, userId) {
                        firebase.database().dbRef.update({
                                username: userId,
                                score: score
                            });
                    }

                    // Calling this function repeatedly just wipes the inner HTML and replaces it
                    // with the specified napshot value. Firebase sorts it for us automatically for
                    // efficiency
                    function updateHighScore() {
                        var i = 10;
                        dbRef.orderByChild("score").limitToLast(10).on("child_added", function (snapshot) {
                                var score = snapshot.val().score + " " + snapshot.val().username;
                                var entry = document.getElementById("s" + i);

                                //Sets color of leaderboard usernames

                                entry.innerHTML = score;
                                i--;
                                // Activate below for troubleshooting console.log(snapshot.val());
                                // console.log(i);
                            });
                    }

                } else {
                    console.log('User is signed out.');
                }
            }, function (error) {
                console.log(error);
            });
            
        };
        window.addEventListener('load', function () {
            initApp()
        });

