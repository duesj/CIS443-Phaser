var global_user;
var global_score;

initApp = function () {
    document
        .getElementById('sign-out')
        .addEventListener('click', function () {
            firebase
                .auth()
                .signOut();
            window.location.href = "index.html";
        });
    firebase
        .auth()
        .onAuthStateChanged(function (user) {
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
                var dbRef = firebase
                    .database()
                    .ref('/users/' + user.uid + '/');

                document
                    .getElementById("userName")
                    .innerHTML = 'Hello ' + displayName;

                dbRef.on("value", function (snapshot) {
                    updateHighScore();
                });

                // Listener for the highscore var in game.js
                Object.defineProperty(window, "highScore", {
                    set: function (value) {
                        global_score = value;
                        //We don't want it to update until log in
                        if (loggedIn) {
                            updateScore(global_score, displayName);
                        }
                    }
                });

                //Updates score to firebase
                function updateScore(score, userId) {
                    dbRef.update({username: user.displayName, score: global_score});
                    console.log(global_score);
                }

                //Updates leaderboards
                function updateHighScore() {
                    var i = 5;
                    var ref = firebase
                        .database()
                        .ref("users/");
                    ref
                        .orderByChild("score")
                        .limitToLast(10)
                        .on("child_added", function (snapshot) {
                            var scores = snapshot
                                .val()
                                .score + " " + snapshot
                                .val()
                                .username;
                            var entry = document.getElementById("s" + i);
                            console.log(scores)
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
