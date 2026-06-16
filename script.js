const timerText = document.querySelector("#timer-text");
const startButton = document.querySelector(".timer-button");
const modeButtons = document.querySelectorAll(".timer-mode");

const MODE_DURATIONS = {
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

    startButton.disabled = false;
    startButton.textContent = "Start";
}

function finishTimer() {
    stopTimer();

    if (activeMode === "study") {
        activeMode = "short-break";
        remainingSeconds = MODE_DURATIONS["short-break"];

    } else {
        activeMode = "study";
        remainingSeconds = MODE_DURATIONS[activeMode];
    }

    updateModeButtons();
    renderTimer();
}

function startTimer() {
    if (intervalId !== null) {
        return;
    }

    if (remainingSeconds <= 0) {
        remainingSeconds = MODE_DURATIONS[activeMode];
        renderTimer();
    }

    startButton.disabled = true;
    startButton.textContent = "Running";

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
        stopTimer();

        remainingSeconds = MODE_DURATIONS[button.dataset.mode];
        renderTimer();
    });
});

startButton.addEventListener("click", startTimer);

renderTimer();
updateModeButtons();