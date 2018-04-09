var currentScore;

initApp = function () {
    document.getElementById('sign-out').addEventListener('click', function () {
        firebase.auth().signOut();
        window.location.href = "index.html";
    });
    firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
            // User is signed in.
            var loggedIn = true;
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var uid = user.uid;
            var phoneNumber = user.phoneNumber;
            var providerData = user.providerData;
            var dbRef = firebase.database().ref('/users/' + user.uid + '/');

            document
                .getElementById("userName")
                .innerHTML = 'Hello ' + displayName;

            updateHighScore();
            
            dbRef.on("value", function (snapshot) {
                updateHighScore();
            });

            // Listener for the highscore var in game.js
            Object.defineProperty(window, "highScore", {
                set: function (value) {
                    currentScore = value;
                    compareScores();
                }
            });

            //Compare current score to oldscore. Only updates score if new score is higher than old.
            function compareScores() {
                dbRef.child('score').on("value", function(snapshot) {
                var oldScore = snapshot.val();
                    if (loggedIn && currentScore > oldScore) {
                        updateScore(currentScore, displayName);
                    }
                });
            }

            //Updates score to firebase
            function updateScore(score, userId) {
                dbRef.update({username: user.displayName, score: currentScore});
            }

            //Updates leaderboards
            function updateHighScore() {
                var i = 5;
                var ref = firebase.database().ref("users/");
                ref.orderByChild("score").limitToLast(10).on("child_added", function (snapshot) {
                        var scores = snapshot.val().username + " - " + snapshot.val().score;
                        var entry = document.getElementById("s" + i);
                        entry.innerHTML = scores;
                        i--;
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
