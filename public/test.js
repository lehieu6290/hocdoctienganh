var vietnameseList = [];
var englishList = [];
var questionList = [];
var correctAnswerNumber = 0;
var wrongAnswerNumber = 0;
var isClickAnswer = false;
var questionOrder = 1;
var totalQuestion = 0;
var testType = true;

function init(){
    correctAnswerNumber = 0;
    wrongAnswerNumber = 0;
    isClickAnswer = false;
    questionOrder = 1;
    totalQuestion = vocabularyList.length;

    document.getElementById('correct-number').innerHTML = correctAnswerNumber;
    document.getElementById('wrong-number').innerHTML = wrongAnswerNumber;
    questionList = [...vocabularyList];
}

function createTest(){
    init();
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
    let randomVocabularyIndex = Math.floor(Math.random() * questionList.length);
    let vocabularyTest = questionList[randomVocabularyIndex];
    let {english, vietnamese} = vocabularyTest.data;
    questionList.splice(randomVocabularyIndex, 1);

    //Hiển thị từ để hỏi
    let wordAsk = document.getElementById('english-test');
    wordAsk.innerHTML = testType ? english : vietnamese;

    //Lấy ngẫu nhiên 1 trong 4 answer DOM để hiển thị đáp án đúng
    let answerDOM = [...document.getElementsByClassName('answer')];
    let randomAnswerIndex = Math.floor(Math.random() * answerDOM.length);
    let correctAnswer = answerDOM[randomAnswerIndex];
    answerDOM.splice(randomAnswerIndex, 1);
    
    //Hiển thị đáp án đúng ra answer DOM đúng
    correctAnswer.innerHTML = testType ? vietnamese : english;
    correctAnswer.id = "correct-answer";
    correctAnswer.onclick = handleClickCorrectAnswer;

    //Lấy ngẫu nhiên 3 từ sai từ danh sách từ vựng
    let wrongAnswerList = [];
    while(wrongAnswerList.length < 3){
        let randomWrongAnswerIndex = Math.floor(Math.random() * vocabularyList.length);
        let wrongAnswer = vocabularyList[randomWrongAnswerIndex];
        let wrongAnswerEnglish = wrongAnswer.data.english;
        let wrongAnswerVietnamese = wrongAnswer.data.vietnamese;

        if(testType){
            if(!wrongAnswerList.includes(wrongAnswerVietnamese) && wrongAnswerVietnamese!= vietnamese){
                wrongAnswerList.push(wrongAnswerVietnamese);
            }
        }else{
            if(!wrongAnswerList.includes(wrongAnswerEnglish) && wrongAnswerVietnamese != vietnamese){
                wrongAnswerList.push(wrongAnswerEnglish);
            }
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

document.getElementById('next-question').onclick = (event) => {
    questionOrder++;
    createQuestion();
    if(questionOrder == totalQuestion){
        event.target.style.display = 'none';
    }
};

document.getElementById('change-icon').onclick = () => {
    testType = !testType;
    init();
    createQuestion();
}