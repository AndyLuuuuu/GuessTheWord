const prev_guess_box = document.getElementById("prev_guess_box");
const word_box = document.getElementById("word_box");
const combo_num = document.getElementById("combo_num");

let previous_guesses = [];
let guessWord = null;
let placeholder = [];
let comboMultiplier = 1;

combo_num.textContent = `${comboMultiplier}x`;

const getWord = () => {
  fetch("https://simplehangman.herokuapp.com/random").then(res =>
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

getWord();

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

const keyevent = event => {
  if (event.keyCode >= 65) {
    if (event.keyCode <= 90) {
      let key = String.fromCharCode(event.keyCode).toLowerCase();
      let lastCorrectLetter = "";
      if (!previous_guesses.includes(key)) {
        previous_guesses.push(key);
        for (let i = 0; i < guessWord.length; i++) {
          if (guessWord[i] == key) {
            placeholder[i] = key.toUpperCase();
            lastCorrectLetter = key.toUpperCase();
          }
        }
        if (!guessWord.includes(key)) {
          document.getElementById(`letter_${key}`).classList.add("wrong");
          let guesses_num = document.getElementById("guesses_num");
          let wrongs = guesses_num.textContent;
          guesses_num.textContent = parseInt(wrongs) + 1;
          if (comboMultiplier > 0) {
            comboMultiplier = 1;
          }
          previous_guesses.push(key);
        } else {
          previous_guesses.push(key);
          document.getElementById(`letter_${key}`).classList.add("right");
          let score_num = document.getElementById("score_num");
          let score = score_num.textContent;
          score_num.textContent = parseInt(score) + 10 * comboMultiplier;
          if (comboMultiplier < 4) {
            comboMultiplier += 1;
          }
        }

        updatePlaceholder(lastCorrectLetter);
        combo_num.textContent = `${comboMultiplier}x`;
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
      comboMultiplier = 1;
      combo_num.textContent = `${comboMultiplier}x`;
    }, 3000);
  }
};

const init = () => {
  setupGuessAlphabet();
  document.addEventListener("keyup", keyevent);
  updatePlaceholder();
};
