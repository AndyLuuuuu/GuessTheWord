const prev_guess_box = document.getElementById("prev_guess_box");
const pause_overlay = document.getElementById("pause_overlay");
const gameover_overlay = document.getElementById("gameover_overlay");
const score_list = document.getElementById("score_list");
const score_name = document.getElementById("score_name");
const submit_btn = document.getElementById("submit");
const scores_btn = document.getElementById("scores_btn");
const final_score = document.getElementById("final_score");
const word_box = document.getElementById("word_box");
const combo_num = document.getElementById("combo_num");
const begin_btn = document.getElementById("begin_btn");
const instructions = document.getElementById("instructions");
const timer = document.getElementById("timer_num");
const countdown = document.getElementById("countdown");
let score_num = document.getElementById("score_num");

let gameStart = false;
let paused = false;
let time = {
  minute: 10,
  second: 0
};
let previous_guesses = [];
let guessWord = null;
let placeholder = [];
let comboMultiplier = 0;
let currentScore = 0;

combo_num.textContent = `${comboMultiplier}x`;

const herokuGetWord = "https://guessthewordgame.herokuapp.com/random";
const herokuGetScores = "https://guessthewordgame.herokuapp.com/highscores";
const herokuSubmitScore = "https://guessthewordgame.herokuapp.com/submitscore";

begin_btn.addEventListener("click", e => {
  instructions.classList.add("hideInstructions");
  getWord();
});

const getWord = () => {
  fetch(herokuGetWord).then(res =>
    res
      .text()
      .then(word => {
        guessWord = word.split("");
        placeholder = [];
        previous_guesses = [];
        guessWord.map(char => {
          placeholder.push("__");
        });
      })
      .then(() => {
        init();
      })
  );
};

const setupGuessAlphabet = () => {
  prev_guess_box.innerHTML = "";
  for (let i = 65; i <= 90; i++) {
    let p = document.createElement("p");
    p.classList.add("prev_guess");
    p.id = `letter_${String.fromCharCode(i).toLowerCase()}`;
    let letter = document.createTextNode(String.fromCharCode(i));
    p.appendChild(letter);
    prev_guess_box.appendChild(p);
  }
};

const setupUI = () => {
  const bottom_section = document.getElementById("bottom_section");
  bottom_section.classList.add("visible");
};

const keyevent = event => {
  if (event.keyCode === 32) {
    console.log("spacebar");
    paused = !paused;
    pause_overlay.classList.toggle("visible");
  } else if (event.keyCode >= 65) {
    if (event.keyCode <= 90) {
      if (!paused) {
        let key = String.fromCharCode(event.keyCode).toLowerCase();
        let lastCorrectLetter = "";
        if (!previous_guesses.includes(key)) {
          if (!guessWord.includes(key)) {
            document.getElementById(`letter_${key}`).classList.add("wrong");
            let guesses_num = document.getElementById("guesses_num");
            let wrongs = guesses_num.textContent;
            guesses_num.textContent = parseInt(wrongs) + 1;
            if (comboMultiplier >= 0) {
              comboMultiplier = 0;
            }
          } else {
            if (comboMultiplier < 4) {
              comboMultiplier += 1;
            }
            document.getElementById(`letter_${key}`).classList.add("right");
          }
          previous_guesses.push(key);
          for (let i = 0; i < guessWord.length; i++) {
            if (guessWord[i] == key) {
              placeholder[i] = key.toUpperCase();
              lastCorrectLetter = key.toUpperCase();
              console.log(guessWord[i], key);
              let score = score_num.textContent;
              console.log(parseInt(score) + 10 * comboMultiplier);
              currentScore = parseInt(score) + 10 * comboMultiplier;
              score_num.textContent = currentScore;
            }
          }
          updatePlaceholder(lastCorrectLetter);
          combo_num.textContent = `${comboMultiplier}x`;
        }
      }
    }
  }
};

const updatePlaceholder = lastCorrectLetter => {
  word_box.innerHTML = "";
  placeholder.map(temp => {
    const h2 = document.createElement("h2");
    h2.classList.add("character");
    if (temp == lastCorrectLetter) {
      h2.classList.add("revealed");
    }
    const char = document.createTextNode(temp);
    h2.appendChild(char);
    word_box.appendChild(h2);
  });
  checkWin();
};

const checkWin = () => {
  if (!placeholder.includes("__")) {
    document.removeEventListener("keyup", keyevent);
    setTimeout(() => {
      const wordLetter = document.getElementsByClassName("character");
      for (let i = wordLetter.length - 1; i >= 0; i--) {
        wordLetter[i].classList.remove("revealed");
        setTimeout(() => {
          wordLetter[i].classList.add("unrevealed");
        }, i * 100 + 100);
      }
    }, 1000);
    setTimeout(() => {
      getWord();
      document.getElementById("guesses_num").textContent = 0;
      combo_num.textContent = `${comboMultiplier}x`;
    }, 3000);
  }
};

const setTimer = () => {
  const timerInterval = setInterval(() => {
    if (!paused) {
      if (time.second === 0) {
        time.minute -= 1;
        time.second = 59;
      } else if (time.second <= 59) {
        time.second -= 1;
      }
      if (time.minute === 0) {
        if (time.second === 0) {
          time.second = 0;
          clearInterval(timerInterval);
          gameover();
        }
      }
      timer.textContent = `${time.minute}:${
        time.second <= 9 ? `0${time.second}` : time.second
      }`;
    }
  }, 1000);
};

const setCountdown = () => {
  let count = 2;
  const createCountMessage = text => {
    countdown.innerHTML = "";
    let p = document.createElement("p");
    let countText = document.createTextNode(text);
    p.appendChild(countText);
    p.classList.add("revealed");
    countdown.appendChild(p);
  };
  const countdownTimer = setInterval(() => {
    countdown.classList.toggle("revealed");
    switch (count) {
      case 2:
        createCountMessage("READY");
        count -= 1;
        break;
      case 1:
        createCountMessage("SET");
        count -= 1;
        break;
      case 0:
        createCountMessage("GO!");
        beginGame();
        gameStart = true;
        clearInterval(countdownTimer);
        break;
      default:
        break;
    }
  }, 1000);
};

const beginGame = () => {
  setTimeout(() => {
    word_box.classList.add("visible");
    document.addEventListener("keyup", keyevent);
    setTimer();
    countdown.innerHTML = "";
  }, 1000);
};

const gameover = () => {
  document.removeEventListener("keyup", keyevent);
  gameover_overlay.classList.add("visible");
  final_score.textContent = `Your score: ${currentScore}`;
};

const getScores = () => {
  fetch(herokuGetScores)
    .then(res => res.json())
    .then(data => {
      data.map((score, idx) => {
        let div = document.createElement("div");
        div.classList.add("score_row");
        let name_p = document.createElement("p");
        name_p.classList.add("score_name");
        let score_p = document.createElement("p");
        score_p.classList.add("score_score");
        let userName = document.createTextNode(`${idx + 1}. ${score.name}`);
        let userScore = document.createTextNode(`Score: ${score.score}`);
        name_p.appendChild(userName);
        score_p.appendChild(userScore);
        div.appendChild(name_p);
        div.appendChild(score_p);
        score_list.appendChild(div);
      });
    });
};

submit_btn.addEventListener("click", e => {
  e.preventDefault();
  console.log("submit");
  console.log(score_name.value);
  if (score_name.value.trim() === "") {
    document.getElementById("submit_message").textContent = "Enter a name!";
  } else if (score_name.value.trim().length < 2) {
    document.getElementById("submit_message").textContent =
      "Minimum 2 letter name!";
  } else {
    fetch(herokuSubmitScore, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: score_name.value.trim(),
        score: currentScore
      })
    }).then(res => {
      if (res.status === 200) {
        document.getElementById("submit_message").textContent =
          "Score submitted!";
        document
          .getElementById("submit_score")
          .classList.add("hideInstructions");
      } else {
        document.getElementById("submit_message").textContent =
          "Oh no! Something went wrong...";
      }
    });
  }
});

scores_btn.addEventListener("click", () => {
  document.getElementById("submit_score").classList.add("hideInstructions");
  document.getElementById("highscore").classList.add("visible");
  getScores();
});

const init = () => {
  setupUI();
  setupGuessAlphabet();
  updatePlaceholder();
  if (!gameStart) {
    setCountdown();
  } else {
    document.addEventListener("keyup", keyevent);
  }
};
