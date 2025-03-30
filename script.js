document.addEventListener('DOMContentLoaded', () => {
    const wordList = [
        "ability", "able", "about", "above", "accept", "according", "account", "across", "act", "action",
        "admiral", "anchor", "armament", "arsenal", "assault", "attack", "battalion", "battleship", "beacon", "berth",
        "brigade", "buoy", "cadet", "carrier", "chart", "chief", "coast", "commander", "compass", "convoy",
        "corvette", "cruiser", "deck", "defense", "destroyer", "dive", "dock", "duty", "ensign", "escort",
        "explorer", "fathom", "fleet", "frigate", "galley", "garrison", "gear", "harbor", "helm", "horizon",
        "hull", "hydrography", "insignia", "intelligence", "jetty", "knot", "launch", "log", "lookout", "maneuver",
        "marine", "mariner", "mast", "midshipman", "mine", "missile", "mooring", "navigation", "navy", "officer",
        "operation", "outpost", "patrol", "periscope", "pilot", "port", "propeller", "quay", "radar", "ranks",
        "reconnaissance", "rescue", "rigging", "rudder", "sail", "sailor", "salvage", "scout", "seafaring", "seaman",
        "search", "ship", "shore", "signal", "sonar", "squadron", "starboard", "submarine", "supply", "surveillance",
        "tactical", "torpedo", "training", "transmission", "underwater", "vessel", "veteran", "warfare", "watch", "weapon",
        "yacht", "yard", "zone", "academy", "airbase", "armory", "barracks", "base", "brig", "canteen", "clinic",
        "command", "communication", "control", "cybercell", "defense", "depot", "dockyard", "drydock", "embassy", "engineering",
        "facility", "fleet", "foreshore", "fort", "garrison", "headquarters", "hospital", "hostel", "institute", "intelligence",
        "laboratory", "lighthouse", "logistics", "marine", "medical", "mess", "museum", "naval", "navigation", "office",
        "officers", "outpost", "patrol", "port", "quarters", "radar", "range", "reconnaissance", "refit", "rehabilitation", "rescue",
        "alpha", "bravo", "charlie", "delta", "echo", "foxtrot", "golf", "hotel", "india", "juliett",
        "kilo", "lima", "mike", "november", "oscar", "papa", "quebec", "romeo", "sierra", "tango",
        "uniform", "victor", "whiskey", "x-ray", "yankee", "zulu",
        "KN", "AAA", "DU", "MIM", "KK", "XE"
    ];
    const specialCharacters = {
        "KN": "(", 
        "AAA": ".", 
        "DU": "-", 
        "MIM": ",", 
        "KK": ")", 
        "XE": "/"
    };
    const wordsPerSentence = 3;
    const defaultCPM = 60;
    const minCPM = 10;
    const maxCPM = 150;
    const imagePath = 'images/';
    const neutralImage = 'neutral.jpg';
    const speedValueSpan = document.getElementById('speed-value');
    const decreaseSpeedButton = document.getElementById('decrease-speed');
    const increaseSpeedButton = document.getElementById('increase-speed');
    const semaphoreImage = document.getElementById('semaphore-image');
    const playPauseButton = document.getElementById('play-pause-button');
    const newSentenceButton = document.getElementById('new-sentence-button');
    const answerInput = document.getElementById('answer-input');
    const checkButton = document.getElementById('check-button');
    const feedbackMessageDiv = document.getElementById('feedback-message');
    let currentSentence = '';
    let currentCPM = defaultCPM;
    let charDisplayInterval = 60000 / defaultCPM;
    let displayTimeoutId = null;
    let isPlaying = false;
    let isPaused = false;
    let currentIndex = 0;

    function generateSentence() {
        stopDisplay();
        let selectedWords = [];
        for (let i = 0; i < wordsPerSentence; i++) {
            let randomIndex = Math.floor(Math.random() * wordList.length);
            selectedWords.push(wordList[randomIndex]);
        }
        currentSentence = selectedWords.map(word => specialCharacters[word.toUpperCase()] || word).join(' ').toLowerCase();
        answerInput.value = '';
        feedbackMessageDiv.textContent = '';
        feedbackMessageDiv.className = '';
        semaphoreImage.src = imagePath + neutralImage;
        console.log("New sentence:", currentSentence);
        enableControls();
    }

    function updateSpeed() {
        charDisplayInterval = 60000 / currentCPM;
        speedValueSpan.textContent = currentCPM;
        decreaseSpeedButton.disabled = isPlaying || currentCPM <= minCPM;
        increaseSpeedButton.disabled = isPlaying || currentCPM >= maxCPM;
    }

    function changeSpeed(delta) {
        if (isPlaying) return;
        let newCPM = currentCPM + delta;
        if (newCPM >= minCPM && newCPM <= maxCPM) {
            currentCPM = newCPM;
            updateSpeed();
        }
    }

    function displayCharacter() {
        if (currentIndex >= currentSentence.length) {
            stopDisplay();
            return;
        }
        if (isPaused || !isPlaying) {
            return;
        }
        const char = currentSentence[currentIndex];
        let imageSrc = '';
        if (char === ' ') {
            imageSrc = imagePath + neutralImage;
        } else if (char >= 'a' && char <= 'z') {
            imageSrc = imagePath + char + '.jpg';
        } else if (specialCharacters[char.toUpperCase()]) {
            imageSrc = imagePath + char.toUpperCase() + '.jpg';
        } else {
            imageSrc = imagePath + neutralImage;
            console.warn(`Unexpected character: ${char} at index ${currentIndex}`);
        }
        semaphoreImage.src = imageSrc;
        semaphoreImage.onerror = () => {
            console.error(`Failed to load image: ${imageSrc}`);
            semaphoreImage.src = imagePath + neutralImage;
        };
        currentIndex++;
        displayTimeoutId = setTimeout(displayCharacter, charDisplayInterval);
    }

    function handlePlayPauseResume() {
        if (!currentSentence) return;
        if (!isPlaying) {
            isPlaying = true;
            isPaused = false;
            currentIndex = 0;
            playPauseButton.textContent = '❚❚ Pause';
            disableControlsForPlayback();
            displayCharacter();
        } else if (isPlaying && !isPaused) {
            isPaused = true;
            clearTimeout(displayTimeoutId);
            playPauseButton.textContent = '▶ Resume';
            enableControlsForPause();
        } else if (isPlaying && isPaused) {
            isPaused = false;
            playPauseButton.textContent = '❚❚ Pause';
            disableControlsForPlayback();
            displayCharacter();
        }
    }

    function stopDisplay() {
        clearTimeout(displayTimeoutId);
        isPlaying = false;
        isPaused = false;
        currentIndex = 0;
        semaphoreImage.src = imagePath + neutralImage;
        playPauseButton.textContent = '▶ Start';
        enableControls();
    }

    function disableControlsForPlayback() {
        newSentenceButton.disabled = true;
        checkButton.disabled = true;
        answerInput.disabled = true;
        decreaseSpeedButton.disabled = true;
        increaseSpeedButton.disabled = true;
    }

    function enableControls() {
        playPauseButton.disabled = !currentSentence;
        newSentenceButton.disabled = false;
        checkButton.disabled = isPlaying;
        answerInput.disabled = isPlaying;
        decreaseSpeedButton.disabled = isPlaying || currentCPM <= minCPM;
        increaseSpeedButton.disabled = isPlaying || currentCPM >= maxCPM;
    }

    function enableControlsForPause() {
        newSentenceButton.disabled = false;
        checkButton.disabled = false;
        answerInput.disabled = false;
    }

    function checkAnswer() {
        const userAnswer = answerInput.value.trim();
        if (userAnswer === currentSentence) {
            alert("Correct! Your answer matches the sentence.");
        } else {
            alert(`Incorrect! The correct answer is: "${currentSentence}".`);
        }
    }

    newSentenceButton.addEventListener('click', generateSentence);
    playPauseButton.addEventListener('click', handlePlayPauseResume);
    decreaseSpeedButton.addEventListener('click', () => changeSpeed(-10));
    increaseSpeedButton.addEventListener('click', () => changeSpeed(10));
    checkButton.addEventListener('click', checkAnswer);
});