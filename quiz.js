class User {
    constructor(username) {
        this.username = username;
        this.score = 0;
    }

    increaseScore() {
        this.score++;
    }
}

class Question {
    constructor(text, choices, correctAnswer) {
        this.text = text;
        this.choices = choices;
        this.correctAnswer = correctAnswer;
    }

    checkAnswer(userAnswer) {
        // Only allow one checkbox to be checked
        return this.correctAnswer === userAnswer;
    }
}

class Quiz {
    constructor(user) {
        this.user = user;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.difficulty = 'easy';
        this.questionsPerFetch = 5;
        this.lastFiveAnswers = []; // Array to store the last 5 answers
        this.initializeUI();
    }

    async fetchQuestions() {
        const response = await fetch(`https://opentdb.com/api.php?amount=${this.questionsPerFetch}&difficulty=${this.difficulty}`);
        const data = await response.json();
        return data.results.map(result => {
            const choices = [...result.incorrect_answers, result.correct_answer];
            return new Question(result.question, choices, result.correct_answer);
        });
    }

    async initializeUI() {
        this.questions = await this.fetchQuestions();
        this.displayQuestion();
    }

    displayQuestion() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const questionContainer = document.getElementById('question-container');
        const choicesContainer = document.getElementById('choices-container');
        const nextButton = document.getElementById('next-btn');
        const userScoreElement = document.getElementById('user-score');
        const usernameContainer = document.getElementById('username-container');
        const difficultyContainer = document.getElementById('difficulty-container');

        difficultyContainer.innerHTML = `Difficulty: ${this.difficulty?.toUpperCase()}`;

        usernameContainer.innerHTML = `Username: ${this.user.username}`;

        questionContainer.innerHTML = `<p>${currentQuestion.text}</p>`;
        choicesContainer.innerHTML = currentQuestion.choices.map((choice, index) => `
            <li>
                <input type="checkbox" id="choice-${index}" value="${choice}" class="choice-checkbox">
                <label for="choice-${index}">${choice}</label>
            </li>
        `).join('');

        nextButton.disabled = true;
        choicesContainer.addEventListener('change', () => {
            nextButton.disabled = document.querySelectorAll('.choice-checkbox:checked').length !== 1;
        });
        userScoreElement.innerText = this.user.score;
    }

    handleAnswer() {
        const userAnswer = document.querySelector('.choice-checkbox:checked').value;
        const currentQuestion = this.questions[this.currentQuestionIndex];
        const isCorrect = currentQuestion.checkAnswer(userAnswer);

        this.lastFiveAnswers.push(isCorrect);
        if (this.lastFiveAnswers.length > 5) {
            this.lastFiveAnswers.shift();
        }

        if (isCorrect) {
            this.user.increaseScore();
            alert('Correct!');
        } else {
            alert('Incorrect!');
        }

        if ((this.currentQuestionIndex + 1) % this.questionsPerFetch === 0) {
            this.checkAndFetchNewQuestions();
        } else {
            this.nextQuestion();
        }
    }

    async checkAndFetchNewQuestions() {
        const correctAnswersCount = this.lastFiveAnswers.filter(answer => answer).length;

        if (correctAnswersCount >= 4) {
            this.difficulty = 'hard';
        } else if (correctAnswersCount >= 2) {
            this.difficulty = 'medium';
        } else {
            this.difficulty = 'easy';
        }

        this.questions = await this.fetchQuestions();
        this.currentQuestionIndex = 0;
        this.displayQuestion();
    }

    nextQuestion() {
        this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.questions.length;
        this.displayQuestion();
    }
}

const username = prompt("Enter your username:");
const user = new User(username);
const quiz = new Quiz(user);

document.getElementById('next-btn').addEventListener('click', function () {
    this.handleAnswer();
}.bind(quiz));
