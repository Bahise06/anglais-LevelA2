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

    document.getElementById('level-selection').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'block';
    document.getElementById('quiz-area').innerHTML = `
        <div id="question-card">
            <p id="question"></p>
            <div id="answer-options"></div>
            <input type="text" id="text-answer" style="display: none;" placeholder="Ta réponse...">
        </div>
        <button onclick="checkAnswer()">Valider</button>
        <p id="feedback"></p>`;
    displayQuestion();
}

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const questionData = questions[currentQuestionIndex];
        document.getElementById('question').innerText = `Question ${currentQuestionIndex + 1}/30 : Comment dit-on "${questionData.francais}" en anglais ?`;
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
                button.innerText = option;
                button.onclick = () => checkAnswer(option);
                answerOptionsContainer.appendChild(button);
            });
            document.querySelector('#quiz-area > button').style.display = 'none';
        } else {
            textAnswerInput.style.display = 'block';
            document.querySelector('#quiz-area > button').style.display = 'inline-block';
        }
    } else {
        endQuiz();
    }
}

function checkAnswer(selectedOption = null) {
    let userAnswer;
    let correctAnswer = questions[currentQuestionIndex].anglais;

    if (currentLevel === 1) {
        userAnswer = selectedOption;
        document.querySelectorAll('#answer-options button').forEach(btn => btn.disabled = true);
    } else {
        userAnswer = document.getElementById('text-answer').value.trim();
    }

    if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        document.getElementById('feedback').innerText = "Bonne réponse !";
        score++;
    } else {
        document.getElementById('feedback').innerText = `Dommage ! La bonne réponse était "${correctAnswer}".`;
    }

    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

async function endQuiz() {
    document.getElementById('quiz-area').innerHTML = `<h2>Quiz terminé !</h2><p>Ton score est de ${score} sur ${questions.length}.</p><p>Enregistrement du score...</p>`;
    await saveHistory(score, questions.length);
    document.getElementById('quiz-area').innerHTML = `<h2>Quiz terminé !</h2><p>Ton score est de ${score} sur ${questions.length}.</p><p>Score enregistré !</p><button onclick="showHistory()">Voir l'historique</button>`;
}

// === Fonctions utilisant Firebase ===

async function saveHistory(score, total) {
    try {
        // La variable "db" vient du fichier index.html qui initialise Firebase
        await db.collection("scores").add({
            user: currentUser,
            score: score,
            total: total,
            level: currentLevel,
            date: new Date() // Firestore gère très bien les objets Date
        });
    } catch (error) {
        console.error("Erreur lors de l'enregistrement du score : ", error);
        alert("Impossible d'enregistrer le score. Vérifiez la connexion internet.");
    }
}

async function showHistory() {
    document.getElementById('level-selection').style.display = 'none';
    document.getElementById('quiz-area').style.display = 'none';
    document.getElementById('history-area').style.display = 'block';

    const historyList = document.getElementById('history-list');
    historyList.innerHTML = "<li>Chargement des résultats...</li>";

    try {
        const querySnapshot = await db.collection("scores")
                                      .where("user", "==", currentUser)
                                      .orderBy("date", "desc")
                                      .get();
        
        historyList.innerHTML = ""; // Vider la liste
        
        if (querySnapshot.empty) {
            historyList.innerHTML = "<li>Aucun résultat pour le moment.</li>";
        } else {
            querySnapshot.forEach(doc => {
                const item = doc.data();
                const li = document.createElement('li');
                li.innerText = `${item.date.toDate().toLocaleDateString('fr-FR')} - Niveau ${item.level} : ${item.score}/${item.total}`;
                historyList.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Erreur de lecture de l'historique : ", error);
        historyList.innerHTML = "<li>Impossible de charger l'historique. Vérifiez la connexion internet et la configuration Firebase.</li>";
    }
}

async function resetHistory() {
    if (confirm(`Es-tu sûr de vouloir effacer tout l'historique de ${currentUser} ? Cette action est irréversible.`)) {
        try {
            const querySnapshot = await db.collection("scores")
                                          .where("user", "==", currentUser)
                                          .get();
            
            // On supprime chaque document un par un
            const batch = db.batch();
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();

            // On rafraîchit l'affichage
            showHistory();
            alert(`L'historique de ${currentUser} a été effacé.`);

        } catch (error) {
            console.error("Erreur lors de la suppression de l'historique : ", error);
            alert("Une erreur est survenue. Impossible de supprimer l'historique.");
        }
    }
}
