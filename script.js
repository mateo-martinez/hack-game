const levelTitleElement = document.getElementById('level-title');
const objectiveElement = document.getElementById('objective');
const interactionAreaElement = document.getElementById('interaction-area');
const nextLevelButton = document.getElementById('next-level-button');
const levelNumberElement = document.getElementById('level-number');
const playerDataElement = document.getElementById('player-data');
const messageArea = document.getElementById('message-area');
const messageText = document.getElementById('message-text');
const messageCloseButton = document.getElementById('message-close-button');

let currentLevel = 1;
let playerData = 0;
const totalLevels = 100;
let gameData = loadGame(); // Load saved data

// Sample level data (expand this significantly!)
const levels = {
    1: {
        title: "Level 1: Initial Scan",
        objective: "Identify the open port.",
        interaction: [
            { type: "button", text: "Scan Port 21", action: () => checkPort(21, false) },
            { type: "button", text: "Scan Port 22", action: () => checkPort(22, true) },
            { type: "button", text: "Scan Port 80", action: () => checkPort(80, false) }
        ],
        reward: 10
    },
    2: {
        title: "Level 2: Simple Password",
        objective: "Try to guess the password.",
        interaction: [
            { type: "input", placeholder: "Enter Password", submit: checkPassword, answer: "password" }
        ],
        reward: 15
    },
    // ... more levels up to 100
};

function initGame() {
    if (gameData) {
        currentLevel = gameData.level;
        playerData = gameData.data;
    }
    loadLevel(currentLevel);
    updateHUD();

    nextLevelButton.addEventListener('click', nextLevel);
    messageCloseButton.addEventListener('click', hideMessage);
}

function loadLevel(levelNumber) {
    const level = levels[levelNumber];
    if (!level) {
        showMessage("Congratulations! You've completed all levels.");
        return;
    }

    levelTitleElement.textContent = level.title;
    objectiveElement.textContent = level.objective;
    interactionAreaElement.innerHTML = ''; // Clear previous interactions
    nextLevelButton.style.display = 'none';

    if (level.interaction) {
        level.interaction.forEach(item => {
            if (item.type === "button") {
                const button = document.createElement('button');
                button.textContent = item.text;
                button.addEventListener('click', item.action);
                interactionAreaElement.appendChild(button);
            } else if (item.type === "input") {
                const input = document.createElement('input');
                input.type = "text";
                input.placeholder = item.placeholder;
                const submitButton = document.createElement('button');
                submitButton.textContent = "Submit";
                submitButton.addEventListener('click', () => item.submit(input.value, item.answer));
                interactionAreaElement.appendChild(input);
                interactionAreaElement.appendChild(submitButton);
            }
            // Add more interaction types (e.g., for file systems, code input)
        });
    }
}

function checkPort(port, isCorrect) {
    if (isCorrect) {
        showMessage(`Port ${port} is open! Vulnerability found.`);
        levelComplete(levels[currentLevel].reward);
    } else {
        showMessage(`Port ${port} is closed. Try again.`);
    }
}

function checkPassword(guess, answer) {
    if (guess.toLowerCase() === answer) {
        showMessage("Password cracked! Access granted.");
        levelComplete(levels[currentLevel].reward);
    } else {
        showMessage("Incorrect password. Try again.");
    }
}

function levelComplete(reward) {
    playerData += reward;
    updateHUD();
    nextLevelButton.style.display = 'block';
    saveGame();
}

function nextLevel() {
    currentLevel++;
    loadLevel(currentLevel);
    updateHUD();
}

function updateHUD() {
    levelNumberElement.textContent = currentLevel;
    playerDataElement.textContent = playerData;
}

function showMessage(text) {
    messageText.textContent = text;
    messageArea.style.display = 'block';
}

function hideMessage() {
    messageArea.style.display = 'none';
}

function saveGame() {
    const data = {
        level: currentLevel,
        data: playerData
    };
    localStorage.setItem('cipherpunk_save', JSON.stringify(data));
}

function loadGame() {
    const savedData = localStorage.getItem('cipherpunk_save');
    return savedData ? JSON.parse(savedData) : null;
}

// Initialize the game when the page loads
window.onload = initGame;
