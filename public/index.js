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
    let wordTrim = word.trim().toLowerCase();

    if(wordTrim){

        let vocabularyListFiltered = vocabularyList.filter((doc) => {
            let {english} = doc.data;
            return english.toLowerCase().startsWith(wordTrim) && doc;
        });

        searchResult.innerHTML = '';

        if(vocabularyListFiltered.length > 0){
            vocabularyListFiltered.forEach((doc) => {
                let searchItem = document.createElement('div');
                let englishText = document.createElement('p');
                let vietnameseText = document.createElement('p');
                let {english, vietnamese, sentence} = doc.data;

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
            document.getElementById('add-btn').onclick = openForm;
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
            const id = searchFirstResult.id;
            const {english, vietnamese, sentence} = searchFirstResult.data;

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
    const {english, vietnamese, sentence} = doc.data;
    createCard({id: doc.id, english, vietnamese, sentence});
    searchInput.value = '';
    searchInput.focus();
    searchClearBtn.style.visibility = 'hidden';
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
formContainer.onkeypress = (event) => {
    if(event.keyCode == 13){
        formAddBtn.click();
    }
}
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

function checkForm(oldEnglish){
    clearError();

    let error = true;
    let english = formEnglishInput.value.trim();
    let vietnamese = formVietnameseInput.value.trim();
    oldEnglish ??= '';

    if(english == ''){
        formEnglishError.innerHTML = "Vui lòng nhập từ tiếng Anh";
        error = false;
    }

    if(vietnamese == ''){
        formVietnameseError.innerHTML = "Vui lòng nhập nghĩa tiếng Việt";
        error = false;
    }

    //Kiểm tra có tồn tại trong từ điển chưa
    vocabularyList.forEach(doc => {
        if(english != oldEnglish && english == doc.data.english){
            formEnglishError.innerHTML = "Từ này đã có trong từ điển";
            error = false;
        }
    })

    return error;
}

function openForm(doc){
    let id = doc ? doc.id : null;

    clearForm();
    if(id){
        let {english, vietnamese, sentence} = doc;

        formEnglishInput.value = english;
        formVietnameseInput.value = vietnamese;
        formSentenceInput.value = sentence ?? '';
        formIdInput.value = id;

        formTitle.innerHTML = "Cập nhật từ vựng";
        formAddBtn.innerHTML = "Cập nhật";
        formContainer.style.display = 'flex';
        formEnglishInput.focus();
        formAddBtn.onclick = () => updateVocabulary(english);
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
    let english = formEnglishInput.value.trim();
    let vietnamese = formVietnameseInput.value.trim();
    let sentence = formSentenceInput.value.trim();
    let data = {};

    if(sentence){
        data = {english, vietnamese, sentence};
    }else{
        data = {english, vietnamese};
    }
    
    db.collection("vocabulary").add(data)
    .then((docRef) => {
        addList({id: docRef.id, data});
        closeForm();
    })
    .catch((error) => {
        formLoading.style.display = 'none';
        formAddError.innerHTML = "Thêm thất bại. Vui lòng thử lại";
    });

    searchInput.focus();
}

function updateVocabulary(oldEnglish){
    if(!checkForm(oldEnglish)) return;
    
    formLoading.style.display = 'inline';
    let id = formIdInput.value;
    let english = formEnglishInput.value.trim();
    let vietnamese = formVietnameseInput.value.trim();
    let sentence = formSentenceInput.value.trim();
    let doc = {};

    if(sentence){
        doc = {english, vietnamese, sentence};
    }else{
        doc = {english, vietnamese};
    }

    db.collection("vocabulary").doc(id).set(doc)
    .then(() => {
        updateList({id, data: doc});
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
        deleteList(id);
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
        let randomIndex = Math.floor(Math.random() * vocabularyList.length);
        let doc = vocabularyList[randomIndex];
        let id = doc.id;
        let {english, vietnamese, sentence} = doc.data;

        createCard({id, english, vietnamese, sentence});
    }
}

let notificationTime = document.getElementById('notification-time-input').value * 60000;
let interval;
function showNotification() {
    if(vocabularyList != null){
        let randomIndex = Math.floor(Math.random() * vocabularyList.length);
        let doc = vocabularyList[randomIndex];
        let {english, vietnamese} = doc.data;

        var notification = new Notification(english, {
            body: vietnamese,
            icon: './images/logo.png',
        });
    }
}

if (Notification.permission === "granted") {
    interval = setInterval(showNotification, notificationTime);
} else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
        if(permission == 'granted'){
            interval = setInterval(showNotification, notificationTime);
        }
    });
}

function addList(doc){
    vocabularyList.push(doc);
}

function updateList(doc){
    vocabularyList.forEach(d => {
        if(d.id == doc.id){
            d.data = doc.data;
            return;
        }
    });
}

function deleteList(id){
    vocabularyList = vocabularyList.filter(d => {
        return d.id != id;
    });
}

//Setting
var settingBtn = document.getElementById('setting-icon');
var isOpenSetting = 'none';

settingBtn.onclick = () => {
    isOpenSetting = isOpenSetting == 'none' ? 'block' : 'none';
    document.getElementById('setting').style.display = isOpenSetting;
}

document.getElementById('notification-time-input').onchange = () => {
    clearInterval(interval);
    notificationTime = document.getElementById('notification-time-input').value * 60000;
    interval = setInterval(showNotification, notificationTime);
}