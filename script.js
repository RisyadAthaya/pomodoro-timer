const timerText = document.querySelector("#timer-text");
const startButton = document.querySelector(".start-timer-button");
const skipButton = document.querySelector(".skip-timer-button");
const settingsButton = document.querySelector(".settings-timer-button");
const modeButtons = document.querySelectorAll(".timer-mode");
const notificationSound = new Audio("public/notification-sound.mp3");

let MODE_DURATIONS = {
    "study": 50 * 60,
    "short-break": 10 * 60,
    "long-break": 25 * 60,
};

let activeMode = "study";
let remainingSeconds = MODE_DURATIONS[activeMode];
let intervalId = null;

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function renderTimer() {
    timerText.textContent = formatTime(remainingSeconds);
}

function stopTimer() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
    }

    // Erase the skip timer button
    skipButton.style.visibility = "hidden";

    startButton.style.backgroundColor = "var(--timer-button-color)";
    startButton.style.color = "var(--text-color)";
}

function changeModeTimer() {
    stopTimer();
    startButton.removeEventListener("click", stopTimer);
    startButton.addEventListener("click", startTimer);

    // Display the settings button
    settingsButton.style.visibility = "visible";
}

function pauseTimer() {
    stopTimer();
    startButton.removeEventListener("click", stopTimer);
    startButton.addEventListener("click", startTimer);
    startButton.textContent = "RESUME";
}

function finishTimer() {
    stopTimer();
    startButton.removeEventListener("click", stopTimer);
    startButton.addEventListener("click", startTimer);
    startButton.textContent = "START";

    if (activeMode === "study") {
        activeMode = "short-break";
        remainingSeconds = MODE_DURATIONS[activeMode];

    } else {
        activeMode = "study";
        remainingSeconds = MODE_DURATIONS[activeMode];
    }

    // Display the settings button
    settingsButton.style.visibility = "visible";

    updateModeButtons();
    renderTimer();
    notificationSound.play();
}

function startTimer() {
    if (intervalId !== null) {
        return;
    }

    if (remainingSeconds <= 0) {
        remainingSeconds = MODE_DURATIONS[activeMode];
        renderTimer();
    }

    // Display the skip button and hide the settings button
    skipButton.style.visibility = "visible";
    settingsButton.style.visibility = "hidden";

    startButton.removeEventListener("click", startTimer);
    startButton.addEventListener("click", pauseTimer);
    startButton.textContent = "PAUSE";

    startButton.style.backgroundColor = "var(--container-bkgd-color-light)";
    startButton.style.color = "var(--text-color-dark)";

    intervalId = window.setInterval(() => {
        remainingSeconds -= 1;
        if (remainingSeconds <= 0) {
            finishTimer();
        }

        renderTimer();
    }, 1000);
}

function updateModeButtons() {
    modeButtons.forEach((button) => {
        const isActive = button.dataset.mode === activeMode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
    });
}

// When a timer mode button is clicked, update the active button and set the timer initial duration
modeButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeMode = button.dataset.mode;
        updateModeButtons();
        changeModeTimer();
        startButton.textContent = "START";

        remainingSeconds = MODE_DURATIONS[button.dataset.mode];
        renderTimer();
    });
});

startButton.addEventListener("click", startTimer);
skipButton.addEventListener("click", finishTimer);

renderTimer();
updateModeButtons();


// Handle settings modal
const settingsModal = document.querySelector(".settings-modal");
const closeSettingsButton = document.querySelector(".close-settings-button");

// Open the settings modal with settings button
settingsButton.addEventListener('click', () => {
    settingsModal.showModal();
});

// Close the modal with the close button
closeSettingsButton.addEventListener('click', () => {
    settingsModal.close();
    renderTimer();
});


// Media query for timer mode buttons
const timerModesText = document.querySelectorAll(".timer-mode");
const mediaQuery = window.matchMedia("(max-width: 480px)");

function handleScreenChange(e) {
    if (e.matches) {
        // Screen is 480px wide or less
        timerModesText[1].textContent = "Short";
        timerModesText[2].textContent = "Long";
    } else {
        // Screen is wider than 480px
        timerModesText[1].textContent = "Short Break";
        timerModesText[2].textContent = "Long Break";
    }
}

mediaQuery.addEventListener("change", handleScreenChange);
handleScreenChange(mediaQuery);


// Handle durations input based on timer mode
const durationInputs = document.querySelectorAll(".timer-duration-input");

// Hard-enforce input range limits
durationInputs.forEach(input => {
    let inputTimerMode;
    switch (input.id) {
        case "timer-duration-study":
            inputTimerMode = "study";
            break;
        case "timer-duration-short-break":
            inputTimerMode = "short-break";
            break;
        case "timer-duration-long-break":
            inputTimerMode = "long-break";
    }

    // Set the default value of the inputs
    input.defaultValue = MODE_DURATIONS[inputTimerMode] / 60;

    const min = parseFloat(input.min);
    const max = parseFloat(input.max);

    input.addEventListener("input", function () {
        if (input.value === '') return;

        let value = parseFloat(input.value);
        if (value < min) {
            input.value = min;
        } else if (value > max) {
            input.value = max;
        }

        MODE_DURATIONS[inputTimerMode] = input.value * 60;
        remainingSeconds = MODE_DURATIONS[activeMode];
    })
});