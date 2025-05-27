let currentUser = '';
let currentLevel = 0;
let currentQuestionIndex = 0;
let score = 0;
let questions = [];

function selectUser(name) {
    currentUser = name;
    document.getElementById('user-name').innerText = name;
    document.getElementById('user-selection').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    showMenu();
}

function showMenu() {
    document.getElementById('quiz-area').style.display = 'none';
    document.getElementById('history-area').style.display = 'none';
    document.getElementById('level-selection').style.display = 'block';
}

function startQuiz(level) {
    currentLevel = level;
    score = 0;
    // La variable "vocabulary" vient du fichier mots.js
    questions = [...vocabulary].sort(() => 0.5 - Math.random()).slice(0, 30);
    currentQuestionIndex = 0;

    if (vocabulary.length < 30) {
        alert("Attention : il n'y a pas assez de mots dans la liste (fichier mots.js) pour faire un quiz de 30 questions.");
        return;
    }
    
    // On cache le menu et on affiche la zone de quiz
    document.getElementById('level-selection').style.display = 'none';
    document.getElementById('history-area').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'block';

    // On s'assure que la partie "questions" est visible et le "résumé" est caché
    document.getElementById('quiz-content').style.display = 'block';
    document.getElementById('quiz-summary').style.display = 'none';

    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const questionData = questions[currentQuestionIndex];
        document.getElementById('question').innerText = `Question <span class="math-inline">\{currentQuestionIndex \+ 1\}/30 \: Comment dit\-on "</span>{questionData.francais}" en anglais ?`;
        const answerOptionsContainer = document.getElementById('answer-options');
        const textAnswerInput = document.getElementById('text-answer');
        answerOptionsContainer.innerHTML = '';
        textAnswerInput.style.display = 'none';
        textAnswerInput.value = '';
        document.getElementById('feedback').innerText = '';

        if (currentLevel === 1) {
            let options = [questionData.anglais];
            while (options.length < 4) {
                const randomWord = vocabulary[Math.floor(Math.random() * vocabulary.length)].anglais;
                if (!options.includes(randomWord)) {
                    options.push(randomWord);
                }
            }
            options.sort(() => 0.5 - Math.random());
            options.forEach(option => {
                const button = document.createElement('button');
                button.innerText = option
