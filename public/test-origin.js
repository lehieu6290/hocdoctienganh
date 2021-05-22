var vietnameseList = [];
var correctAnswerNumber = 0;
var wrongAnswerNumber = 0;
var isClickAnswer = false;
var questionOrder = 1;
var totalQuestion = 0;

function createTest(vocabularyList){
    vietnameseList = vocabularyList.map(doc => {
        return doc.data.vietnamese;
    });

    totalQuestion = vocabularyList.length;

    document.getElementById('next-question').onclick = (event) => {
        questionOrder++;
        createQuestion();
        if(questionOrder == totalQuestion){
            event.target.style.display = 'none';
        }
    };

    createQuestion();
}

function clearAnswer(){
    let answerDOM = [...document.getElementsByClassName('answer')];
    let correctAnswer = document.getElementById('correct-answer');
    let nextQuestion = document.getElementById('next-question');
    answerDOM.forEach(answer => {
        answer.classList = 'answer';
    });

    if(correctAnswer) correctAnswer.id = '';

    nextQuestion.setAttribute('disabled', '');
    nextQuestion.classList = 'next-question-disable';
}

function createQuestion(){
    isClickAnswer = false;
    clearAnswer();
    displayQuestionNumber();

    //Lấy ngẩu nhiên từ vựng trong từ điển và xóa nó ra khỏi từ điển
    let randomVocabularyIndex = Math.floor(Math.random() * vocabularyList.length);
    let vocabularyTest = vocabularyList[randomVocabularyIndex];
    let {english, vietnamese} = vocabularyTest.data;
    vocabularyList.splice(randomVocabularyIndex, 1);

    //Hiển thị từ tiếng Anh để hỏi
    let englishTest = document.getElementById('english-test');
    englishTest.innerHTML = english;

    //Lấy ngẫu nhiên 1 trong 4 answer DOM để hiển thị nghĩa đúng
    let answerDOM = [...document.getElementsByClassName('answer')];
    let randomAnswerIndex = Math.floor(Math.random() * answerDOM.length);
    let correctAnswer = answerDOM[randomAnswerIndex];
    answerDOM.splice(randomAnswerIndex, 1);
    
    //Hiển thị nghĩa đúng ra answer DOM đúng
    correctAnswer.innerHTML = vietnamese;
    correctAnswer.id = "correct-answer";
    correctAnswer.onclick = handleClickCorrectAnswer;

    //Lấy ngẫu nhiên 3 nghĩa sai từ danh sách nghĩa
    let wrongAnswerList = [];
    while(wrongAnswerList.length < 3){
        let randomWrongAnswerIndex = Math.floor(Math.random() * vietnameseList.length);
        let wrongAnswer = vietnameseList[randomWrongAnswerIndex];
        if(!wrongAnswerList.includes(wrongAnswer) && wrongAnswer != vietnamese){
            wrongAnswerList.push(wrongAnswer);
        }
    }

    //Hiển thị các đáp án sai ở các answer DOM còn lại
    for(let i = 0; i < wrongAnswerList.length; i++){
        answerDOM[i].innerHTML = wrongAnswerList[i];
        answerDOM[i].onclick = handleClickWrongAnswer;
    }
}

function handleClickCorrectAnswer(){
    if(!isClickAnswer){
        displayCorrectAnswer();
        correctAnswerNumber++;
        isClickAnswer = true;
        document.getElementById('correct-number').innerHTML = correctAnswerNumber;
        displayNextQuestion();
    }
}

function handleClickWrongAnswer(){
    if(!isClickAnswer){
        displayCorrectAnswer();
        wrongAnswerNumber++;
        isClickAnswer = true;
        document.getElementById('wrong-number').innerHTML = wrongAnswerNumber;
        displayNextQuestion();
        this.classList += ' wrong-answer';
    }
}

function displayNextQuestion(){
    let nextQuestion = document.getElementById('next-question');
    nextQuestion.removeAttribute('disabled');
    nextQuestion.classList = 'next-question';
}

function displayCorrectAnswer(){
    let correctAnswer = document.getElementById('correct-answer');
    correctAnswer.classList += ' correct-answer';
}

function displayQuestionNumber(){
    document.getElementById('question-order').innerHTML = questionOrder + "/" + totalQuestion;
}

