//Firebase init
var firebaseConfig = {
    apiKey: "AIzaSyBlli_KHptayZNJplRHFCd10fDAkVIBLx0",
    authDomain: "hocdoctienganh.firebaseapp.com",
    projectId: "hocdoctienganh",
    storageBucket: "hocdoctienganh.appspot.com",
    messagingSenderId: "547790383588",
    appId: "1:547790383588:web:c7ef3cda1af23292a2bff1",
    measurementId: "G-KQ8HMZYES1"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

//Firebase authentication
var provider = new firebase.auth.GoogleAuthProvider();
var whenLogin = document.getElementById('when-login');
var whenLogout = document.getElementById('when-logout');
var loginBtn = document.getElementById('login-btn');
var logoutBtn = document.getElementById('logout-btn');
var dataLoading = document.getElementById('data-loading-container');
var dataLoadingError = document.getElementById('data-loading-error-container');

loginBtn.onclick = () => firebase.auth().signInWithPopup(provider);
logoutBtn.onclick = () => firebase.auth().signOut();

//Get data
var db = firebase.firestore();
var vocabularyList = [];

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        vocabularyList = [];
        db.collection("vocabulary").get()
        .then((data) => {
            // vocabularyList = data;

            data.forEach((doc) => {
                let docFiltered = {
                    id: doc.id,
                    data: doc.data(),
                };
                vocabularyList.push(docFiltered);
            })

            if(window.location.pathname == "/test.html"){
                createTest();
            }
            
            if(window.location.pathname == "/"){
                document.getElementById('search-input').focus();
                createRandomCard();
            }
            
            whenLogout.style.display = 'none';
            whenLogin.style.display = 'block';
            dataLoading.style.display = 'none';
        })
        .catch((error) => {
            dataLoadingError.style.display = 'block';
        })
    } else {
        whenLogout.style.display = 'block';
        whenLogin.style.display = 'none';
        dataLoading.style.display = 'none';
    }
});