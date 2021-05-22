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
// var nameText = document.getElementById('name-text');
// var avatar = document.getElementById('avatar');
var loginBtn = document.getElementById('login-btn');
var logoutBtn = document.getElementById('logout-btn');
var dataLoading = document.getElementById('data-loading-container');

loginBtn.onclick = () => firebase.auth().signInWithPopup(provider);
logoutBtn.onclick = () => firebase.auth().signOut();

//Get data
var db = firebase.firestore();
var vocabularyList = [];

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        db.collection("vocabulary").get()
        .then((data) => {
            vocabularyList = data;

            // nameText.innerHTML = user.displayName;
            // avatar.src = user.photoURL;
            whenLogout.style.display = 'none';
            whenLogin.style.display = 'block';
            searchInput.focus();
            createRandomCard();
            dataLoading.style.display = 'none';
        })
        .catch((error) => {

        })
    } else {
        whenLogout.style.display = 'block';
        whenLogin.style.display = 'none';
        dataLoading.style.display = 'none';
    }
});


// db.collection("vocabulary").get().then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//         // doc.data() is never undefined for query doc snapshots
//         console.log(doc.id, " => ", doc.data());
//     });
// });

//Search
var searchInput = document.getElementById('search-input');
var searchResultContainer = document.getElementById('search-result-container');
var searchResult = document.getElementById('search-result');
var searchClearBtn = document.getElementById('search-clear-btn');
var searchBar = document.getElementById('search-bar');
var searchFirstResult = null;
 
searchInput.oninput = () => {
    var word = searchInput.value;
    searchClearBtn.style.visibility = word == '' ? 'hidden' : 'visible';
    let wordTrim = word.trim();

    if(wordTrim){
        let vocabularyListFiltered = vocabularyList.docs.filter((doc) => {
            let {english} = doc.data();
            return english.includes(wordTrim) && doc;
        });

        searchResult.innerHTML = '';

        if(vocabularyListFiltered.length > 0){
            vocabularyListFiltered.forEach((doc) => {
                let searchItem = document.createElement('div');
                let englishText = document.createElement('p');
                let vietnameseText = document.createElement('p');
                let {english, vietnamese, sentence} = doc.data();

                englishText.innerHTML = english;
                englishText.classList = "english";
                vietnameseText.innerHTML = vietnamese;
                vietnameseText.classList = "vietnamese";

                searchItem.appendChild(englishText);
                searchItem.appendChild(vietnameseText);
                searchItem.onclick = () => handleClickSearchItem(doc);
                searchItem.classList = "search-item";
                searchResult.appendChild(searchItem);
            });

            searchFirstResult = vocabularyListFiltered[0];
        }else{
            let noResult = document.createElement('div');
            noResult.innerHTML = "Từ điển của bạn chưa có từ này <span id='add-btn'>Thêm</span>";
            noResult.classList = "no-result";
            searchResult.appendChild(noResult);

            searchFirstResult = null;
        }

        searchResultContainer.style.display = 'block';
        searchBar.classList = "hide-border-radius";
    }else{
        searchResultContainer.style.display = 'none';
        searchBar.classList -= "hide-border-radius";
    }
}

searchInput.onkeypress = (event) => {
    if(event.keyCode == 13){
        if(searchFirstResult != null){
            // let englishText = document.getElementById('english');
            // let vietnameseText = document.getElementById('vietnamese');
            // let sentenceText = document.getElementById('sentence');

            const id = searchFirstResult.id;
            const {english, vietnamese, sentence} = searchFirstResult.data();

            // englishText.innerHTML = english;
            // vietnameseText.innerHTML = vietnamese;
            // sentenceText.innerHTML = sentence ?? '';
            createCard({id, english, vietnamese, sentence});
        }else{
            if(searchInput.value != ''){
                openForm();
            }
        }

        searchResultContainer.style.display = 'none';
        searchBar.classList -= "hide-border-radius";
        searchClearBtn.style.visibility = 'hidden';
        searchInput.value = '';
    }
}

searchClearBtn.onclick = () => {
    searchInput.value = '';
    searchInput.focus();

    searchClearBtn.style.visibility = 'hidden';
    searchResultContainer.style.display = 'none';
    searchBar.classList -= "hide-border-radius";
}

function hideSearchResult(){
    let searchResultContainer = document.getElementById('search-result-container');
    let searchBar = document.getElementById('search-bar');

    searchBar.classList -= "hide-border-radius";
    searchResultContainer.style.display = 'none';
}

function handleClickSearchItem(doc){
    const {english, vietnamese, sentence} = doc.data();
    createCard({id: doc.id, english, vietnamese, sentence});
    searchInput.value = '';
    searchInput.focus();
    hideSearchResult();
}

//Form
var formAddBtn = document.getElementById("form-add-btn");
var formCloseBtn = document.getElementById("form-close-btn");
var formContainer = document.getElementById("form-container");
var formIdInput = document.getElementById("form-id-input");
var formEnglishInput = document.getElementById("form-english-input");
var formVietnameseInput = document.getElementById("form-vietnamese-input");
var formSentenceInput = document.getElementById("form-sentence-input");
var formTitle = document.getElementById("form-title");
var formAddError = document.getElementById("form-add-error");
var formEnglishError = document.getElementById("form-english-error");
var formVietnameseError = document.getElementById("form-vietnamese-error");
var formLoading = document.getElementById("form-loading");

formCloseBtn.onclick = closeForm;

function closeForm(){
    formContainer.style.display = 'none';
}

function closeDeleteForm(){
    deleteFormContainer.style.display = 'none';
}

function clearForm(){
    formEnglishInput.value = '';
    formVietnameseInput.value = '';
    formSentenceInput.value = '';
    clearError();
    formLoading.style.display = 'none';
}

function clearError(){
    formAddError.innerHTML = '';
    formEnglishError.innerHTML = '';
    formVietnameseError.innerHTML = '';
}

function checkForm(){
    clearError();

    let error = true;
    if(formEnglishInput.value == ''){
        formEnglishError.innerHTML = "Vui lòng nhập từ tiếng Anh";
        error = false;
    }

    if(formVietnameseInput.value == ''){
        formVietnameseError.innerHTML = "Vui lòng nhập nghĩa tiếng Việt";
        error = false;
    }

    return error;
}

function openForm(doc){
    console.log(doc);
    let id = doc ? doc.id : null;

    clearForm();
    if(id){
        // let {english, vietnamese, sentence} = doc.data();
        let {english, vietnamese, sentence} = doc;

        formEnglishInput.value = english;
        formVietnameseInput.value = vietnamese;
        formSentenceInput.value = sentence ?? '';
        formIdInput.value = id;

        formTitle.innerHTML = "Cập nhật từ vựng";
        formAddBtn.innerHTML = "Cập nhật";
        formContainer.style.display = 'flex';
        formEnglishInput.focus();
        formAddBtn.onclick = updateVocabulary;
    }else{
        formEnglishInput.value = searchInput.value;

        formTitle.innerHTML = "Thêm từ vựng mới";
        formAddBtn.innerHTML = "Thêm";
        formContainer.style.display = 'flex';
        formVietnameseInput.focus();
        formAddBtn.onclick = addVocabulary;
    }
}

function addVocabulary(){
    if(!checkForm()) return;

    formLoading.style.display = 'inline';
    let english = formEnglishInput.value;
    let vietnamese = formVietnameseInput.value;
    let sentence = formSentenceInput.value;
    let data = {};

    if(sentence){
        data = {english, vietnamese, sentence};
    }else{
        data = {english, vietnamese};
    }
    
    db.collection("vocabulary").add(data)
    .then((docRef) => {
        closeForm();
    })
    .catch((error) => {
        formLoading.style.display = 'none';
        formAddError.innerHTML = "Thêm thất bại. Vui lòng thử lại";
    });
}

function updateVocabulary(){
    if(!checkForm()) return;
    
    formLoading.style.display = 'inline';
    let id = formIdInput.value;
    let english = formEnglishInput.value;
    let vietnamese = formVietnameseInput.value;
    let sentence = formSentenceInput.value;
    let doc = {};

    if(sentence){
        doc = {english, vietnamese, sentence};
    }else{
        doc = {english, vietnamese};
    }

    db.collection("vocabulary").doc(id).set(doc)
    .then(() => {
        // db.collection("vocabulary").doc(id).get()
        // .then((doc) => {
        //     createCard(doc);
        //     closeForm();
        // })
        // .catch((error) => {
        //     console.error("Error writing document: ", error);
        // });

        createCard({id, ...doc});
        closeForm();
    })
    .catch((error) => {
        formLoading.style.display = 'none';
        formAddError.innerHTML = "Cập nhật thất bại. Vui lòng thử lại";
    });
}

var deleteFormContainer = document.getElementById("delete-form-container");
var deleteFormCloseBtn = document.getElementById("delete-form-close-btn");
var formDeleteBtn = document.getElementById("form-delete-btn");
var deleteFormLoading = document.getElementById("delete-form-loading");
var formDeleteError = document.getElementById("form-delete-error");

deleteFormCloseBtn.onclick = closeDeleteForm;

function openDeleteForm(id){
    deleteFormContainer.style.display = 'flex';
    deleteFormLoading.style.display = 'none';
    formDeleteError.innerHTML = '';
    formDeleteBtn.onclick = () => deleteVocabulary(id);
}

function deleteVocabulary(id){
    deleteFormLoading.style.display = 'inline';

    db.collection("vocabulary").doc(id).delete()
    .then(() => {
        deleteFormContainer.style.display = 'none';
        createRandomCard();
    })
    .catch((error) => {
        deleteFormLoading.style.display = 'none';
        formDeleteError.innerHTML = "Xóa thất bại. Vui lòng thử lại";
    });
}

//Card
function createCard(doc){
    let cardContainer = document.getElementById('card-container');
    let card = document.createElement('div');
    // let {english, vietnamese, sentence} = doc.data();
    let {english, vietnamese, sentence} = doc;
    sentence ??= '';

    card.innerHTML = `<p id="english">${english}</p>
                        <p id="vietnamese">${vietnamese}</p>
                        <p id="sentence">${sentence}</p>
                        <div id="action-container">
                            <div id="card-overlay"></div>
                            <div id="action">
                                <div id="action-edit" class="action-image-container edit">
                                    <img src="./images/edit.png" >
                                </div>
                                <div id="action-delete" class="action-image-container delete">
                                    <img src="./images/delete.png">
                                </div>
                            </div>
                        </div>`;
    
    card.id = 'card';
    cardContainer.innerHTML = '';
    cardContainer.appendChild(card);
    document.getElementById('action-edit').onclick = () => {openForm(doc)}
    document.getElementById('action-delete').onclick = () => {openDeleteForm(doc.id)}
}

//System
window.onfocus = createRandomCard;

function createRandomCard(){
    if(vocabularyList != null){
        let randomIndex = Math.floor(Math.random() * vocabularyList.size);
        let doc = vocabularyList.docs[randomIndex];
        let id = doc.id;
        let {english, vietnamese, sentence} = doc.data();

        createCard({id, english, vietnamese, sentence});
    }
}

let notificationTime = 300000;
function showNotification() {
    if(vocabularyList != null){
        let randomIndex = Math.floor(Math.random() * vocabularyList.size);
        let doc = vocabularyList.docs[randomIndex];
        let {english, vietnamese} = doc.data();

        var notification = new Notification(english, {
            body: vietnamese,
            icon: './images/logo.png',
        });
    }
}

if (Notification.permission === "granted") {
    setInterval(showNotification, notificationTime);
} else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
        if(permission == 'granted'){
            setInterval(showNotification, notificationTime);
        }
    });
}

function addList(){

}