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

const levels = {
    1: {
        title: "Level 1: Network Scan",
        objective: "Identify the active server on the network.",
        story: "A mysterious message appeared on your screen: 'They are watching. Find the source.' Your first task: scan the local network.",
        interaction: [
            { type: "button", text: "Scan Network (Slow)", action: () => displayMessage("Scanning... (takes a moment)", () => checkNetworkScan(['192.168.1.10', '192.168.1.15', '192.168.1.20'], '192.168.1.15')) },
            { type: "button", text: "Quick Scan (Risky)", action: () => checkNetworkScan(['192.168.1.12', '192.168.1.15', '192.168.1.25'], '192.168.1.15', true) }
        ],
        reward: 20,
        nextLevelMessage: "You've identified the active server. It might hold the key to the message."
    },
    2: {
        title: "Level 2: Port Exploitation",
        objective: "Exploit the vulnerable port on the target server.",
        story: "The scan revealed an open port 23 (Telnet) on 192.168.1.15. It's an old and often vulnerable protocol. Try to exploit it.",
        interaction: [
            { type: "button", text: "Attempt Exploit (Port 21 - FTP)", action: () => displayMessage("Attempting...", () => checkPortExploit(21, false)) },
            { type: "button", text: "Attempt Exploit (Port 23 - Telnet)", action: () => displayMessage("Attempting...", () => checkPortExploit(23, true)) },
            { type: "button", text: "Attempt Exploit (Port 80 - HTTP)", action: () => displayMessage("Attempting...", () => checkPortExploit(80, false)) }
        ],
        reward: 30,
        nextLevelMessage: "You've gained a foothold! There might be valuable data inside."
    },
    3: {
        title: "Level 3: File System Navigation",
        objective: "Locate the 'secret.txt' file.",
        story: "You've managed to get a basic shell access. Now, navigate the file system to find any interesting files. Legend has it, important information is often hidden in plain sight.",
        interaction: [
            { type: "terminal", commands: ["ls", "cd home", "ls user", "cd documents", "ls", "cat secret.txt"] },
            { type: "hiddenFile", name: "important_log.txt", content: "Just some system logs..." },
            { type: "hiddenFile", name: "personal_notes.doc", content: "Meeting at 3 PM..." },
            { type: "hiddenFile", name: "secret.txt", content: "The next clue is: LOOK FOR THE WEB." }
        ],
        reward: 40,
        nextLevelMessage: "You found a clue! 'LOOK FOR THE WEB'... What could it mean?"
    }
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

    levelTitleElement.textContent = `Level ${levelNumber}: ${level.title}`;
    objectiveElement.textContent = level.objective;
    interactionAreaElement.innerHTML = ''; // Clear previous interactions
    nextLevelButton.style.display = 'none';

    if (level.story) {
        displayMessage(level.story);
    }

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
            } else if (item.type === "terminal") {
                createTerminal(item.commands);
            }
            // We'll handle 'hiddenFile' logic within the terminal simulation for Level 3
        });
    }
}

function checkNetworkScan(networkAddresses, targetAddress, isRisky = false) {
    if (networkAddresses.includes(targetAddress)) {
        const message = `Scan complete. Active server found at ${targetAddress}.`;
        if (isRisky) {
            displayMessage(message + " (Quick scan might have alerted the target!)", () => levelComplete(levels[currentLevel].reward, levels[currentLevel].nextLevelMessage));
        } else {
            displayMessage(message, () => levelComplete(levels[currentLevel].reward, levels[currentLevel].nextLevelMessage));
        }
    } else {
        displayMessage("Scan complete. No active server found at the expected addresses. Try again.");
    }
}

function checkPortExploit(port, isCorrect) {
    if (isCorrect) {
        displayMessage(`Exploit successful on port ${port}! Access gained.`, () => levelComplete(levels[currentLevel].reward, levels[currentLevel].nextLevelMessage));
    } else {
        displayMessage(`Exploit failed on port ${port}. The server seems secure on this port.`);
    }
}

function createTerminal(commands) {
    const terminalDiv = document.createElement('div');
    terminalDiv.classList.add('terminal');
    const outputArea = document.createElement('pre');
    outputArea.classList.add('terminal-output');
    const inputArea = document.createElement('input');
    inputArea.type = 'text';
    inputArea.classList.add('terminal-input');
    let commandIndex = 0;

    inputArea.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const command = inputArea.value.trim().toLowerCase();
            outputArea.textContent += `> ${command}\n`;
            inputArea.value = '';

            if (commandIndex < commands.length && command === commands[commandIndex].toLowerCase()) {
                if (command === 'ls') {
                    outputArea.textContent += "important_log.txt\npersonal_notes.doc\nsecret.txt\n";
                } else if (command.startsWith('cd ')) {
                    const directory = command.substring(3).trim();
                    outputArea.textContent += `Navigating to ${directory}...\n`;
                } else if (command.startsWith('cat ')) {
                    const filename = command.substring(4).trim();
                    const hiddenFile = levels[currentLevel].interaction.find(f => f.type === 'hiddenFile' && f.name === filename);
                    if (hiddenFile) {
                        outputArea.textContent += hiddenFile.content + '\n';
                        if (filename === 'secret.txt') {
                            displayMessage("You found the secret!", () => levelComplete(levels[currentLevel].reward, levels[currentLevel].nextLevelMessage));
                        }
                    } else {
                        outputArea.textContent += `Error: ${filename} not found.\n`;
                    }
                } else {
                    outputArea.textContent += "Command successful.\n";
                }
                commandIndex++;
                if (commandIndex >= commands.length && !levels[currentLevel].interaction.some(i => i.type === 'hiddenFile' && i.name === 'secret.txt')) {
                    // Level might complete based on reaching the end of commands if no specific file to find
                    if (!levels[currentLevel].nextLevelMessage) {
                        levelComplete(levels[currentLevel].reward);
                    } else {
                        displayMessage("Terminal exploration complete.", () => levelComplete(levels[currentLevel].reward, levels[currentLevel].nextLevelMessage));
                    }
                }
            } else if (commandIndex < commands.length) {
                outputArea.textContent += "Incorrect command. Try again.\n";
            }
        }
    });

    terminalDiv.appendChild(outputArea);
    terminalDiv.appendChild(inputArea);
    interactionAreaElement.appendChild(terminalDiv);
}

function levelComplete(reward, nextLevelMessage = "Level completed!") {
    playerData += reward;
    updateHUD();
    showMessage(nextLevelMessage, () => nextLevelButton.style.display = 'block');
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

function displayMessage(text, onCloseCallback = null) {
    messageText.textContent = text;
    messageArea.style.display = 'block';
    const existingCallback = messageCloseButton.onclick; // Store any previous callback

    messageCloseButton.onclick = () => {
        messageArea.style.display = 'none';
        if (onCloseCallback) {
            onCloseCallback();
        } else if (existingCallback) {
            existingCallback(); // Restore previous callback
        }
    };
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
