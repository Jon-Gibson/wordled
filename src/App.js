import React, { useState, useEffect } from "react";
import wordList from "./words_6.js";
import answerList from "./answers_6.js";
import "./App.css";

const words = wordList.split(" ");
const answers = answerList
  .split("\n")
  .filter((answer) => words.includes(answer));

const Answer = (props) => {
  const { shouldShow, answer } = props;

  return shouldShow ? <div className="answer">{answer}</div> : null;
};

const NotAWord = (props) => {
  const { shouldShow, word } = props;

  return shouldShow ? (
    <div className="answer">{word} is not a known 6 letter word</div>
  ) : null;
};

const WinModal = () => {
  return <div className="winModal">Congrats</div>;
};

const Guess = (props) => {
  let { letters, wordLength, grade, animation } = props;

  if (!letters) {
    letters = [];
  }

  if (letters.length < wordLength) {
    for (let i = letters.length; i < wordLength; i++) {
      letters[i] = " ";
    }
  } else if (letters.length > wordLength) {
    letters = letters.slice(0, wordLength);
  }

  const getClassName = (index) => {
    if (!grade?.[index]) {
      return "letter";
    } else if (grade[index] === "correct") {
      return "correct letter";
    } else if (grade[index] === "misplaced") {
      return "misplaced letter";
    } else {
      return "wrong letter";
    }
  };

  const getAnimation = (index) => {
    return animation?.name;
  };

  return (
    <div className="guess">
      {letters.map((l, i) => (
        <div
          key={`${l}${i}`}
          className={getClassName(i)}
          data-animation={getAnimation(i)}
        >
          {l}
        </div>
      ))}
    </div>
  );
};

const Keyboard = (props) => {
  const { mapping, clickHandler, enterHandler, backspaceHandler } = props;

  const getClassName = (l) => {
    const letter = l.toLowerCase();
    if (mapping[letter] === "correct") {
      return "correct key";
    } else if (mapping[letter] === "misplaced") {
      return "misplaced key";
    } else if (mapping[letter] === "wrong") {
      return "wrong key";
    } else {
      return "key";
    }
  };

  return (
    <div>
      <div className="keyRow">
        {"QWERTYUIOP".split("").map((l) => {
          return (
            <button onClick={() => clickHandler(l)} className={getClassName(l)}>
              {l}
            </button>
          );
        })}
      </div>
      <div className="keyRow row2">
        {"ASDFGHJKL".split("").map((l) => {
          return (
            <button onClick={() => clickHandler(l)} className={getClassName(l)}>
              {l}
            </button>
          );
        })}
      </div>
      <div className="keyRow row3">
        <button className="enter key" onClick={() => enterHandler()}>
          Enter
        </button>
        {"ZXCVBNM".split("").map((l) => {
          return (
            <button
              onClick={() => clickHandler(l)}
              className={getClassName(l)}
              key={l}
            >
              {l}
            </button>
          );
        })}
        <button className="backspace key" onClick={() => backspaceHandler()}>
          Delete
        </button>
      </div>
    </div>
  );
};

const App = (props) => {
  const { wordLength, maxGuesses, answer } = props;

  const [currentGuess, setCurrentGuess] = useState(0);
  const [currentLetter, setCurrentLetter] = useState(0);
  const [guesses, setGuesses] = useState(
    new Array(maxGuesses).fill().map(() => [])
  );
  const [grades, setGrades] = useState(
    new Array(maxGuesses).fill().map(() => [])
  );
  const [letterMapping, setLetterMapping] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [showNotAWord, setShowNotAWord] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [animations, setAnimations] = useState(
    new Array(maxGuesses).fill().map(() => {})
  );

  const offsetLetter = (offset) => {
    const result = currentLetter + offset;
    if (result > wordLength || result < 0) {
      return;
    }

    setCurrentLetter(result);
  };

  const grade = (letters, answer) => {
    letters = letters.map((l) => l.toLowerCase());

    for (let i = 0; i < letters.length; i++) {
      if (letters[i] === answer[i]) {
        const newAnswer = answer.split("");
        newAnswer[i] = "*"; // Replace so it isn't matched later
        answer = newAnswer.join("");
        letterMapping[letters[i]] = "correct";
        grades[currentGuess][i] = "correct";
      } else if (!answer.includes(letters[i])) {
        grades[currentGuess][i] = "wrong";
        if (!letterMapping[letters[i]]) {
          letterMapping[letters[i]] = "wrong";
        }
      }
    }

    for (let i = 0; i < letters.length; i++) {
      if (grades[currentGuess][i]) continue; // Already determined

      if (!answer.includes(letters[i])) {
        grades[currentGuess][i] = "wrong";

        if (!letterMapping[letters[i]]) {
          letterMapping[letters[i]] = "wrong";
        }
      } else {
        const newAnswer = answer.split("");
        newAnswer[answer.indexOf(letters[i])] = "*"; // Replace so it isn't matched later
        answer = newAnswer.join("");
        if (letterMapping[letters[i]] !== "correct") {
          letterMapping[letters[i]] = "misplaced";
        }
        grades[currentGuess][i] = "misplaced";
      }
    }

    setGrades([...grades]);
  };

  const isAWord = (letters) => {
    return words.includes(letters.join(""));
  };

  const enterHandler = () => {
    if (isWon) {
      return;
    }

    if (
      currentGuess < guesses.length &&
      currentLetter === wordLength &&
      isAWord(guesses[currentGuess])
    ) {
      setCurrentGuess(currentGuess + 1);
      setCurrentLetter(0);
      grade(guesses[currentGuess], answer);
    } else {
      animations[currentGuess] = { name: "shake" };
      setAnimations([...animations]);
      setTimeout(() => {
        resetAnimation();
      }, 700);

      setShowNotAWord(true);
      setTimeout(() => {
        setShowNotAWord(false);
      }, 3000);
    }
    return;
  };

  const resetAnimation = () => {
    animations[currentGuess] = { name: "" };
    setAnimations([...animations]);
  };

  const backspaceHandler = () => {
    if (isWon) {
      return;
    }

    animations[currentGuess] = { name: "" };
    setAnimations([...animations]);
    guesses[currentGuess][currentLetter - 1] = undefined;
    offsetLetter(-1);
    return;
  };

  const handleKeyDown = (event) => {
    if (isWon) {
      return;
    }

    const { key } = event;
    if (key === "Backspace") {
      backspaceHandler();
    } else if (key === "Enter") {
      enterHandler();
    }

    if (
      !key.match(/^[a-zA-Z]{1}$/) ||
      currentLetter >= wordLength ||
      currentGuess >= guesses.length
    ) {
      animations[currentGuess] = { name: "shake" };
      return;
    }

    animations[currentGuess] = { name: "" };
    guesses[currentGuess][currentLetter] = event.key.toLowerCase();
    offsetLetter(1);
  };

  const clickHandler = (key) => {
    if (isWon) {
      return;
    }
    guesses[currentGuess][currentLetter] = key.toLowerCase();
    offsetLetter(1);
  };

  useEffect(() => {
    if (currentGuess >= guesses.length) {
      setShowAnswer(true);
    }
  }, [currentGuess]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    // cleanup this component
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentLetter, currentGuess, handleKeyDown, isWon]);

  useEffect(() => {
    if (
      grades?.[currentGuess - 1]?.length === wordLength &&
      grades[currentGuess - 1].every((grade) => grade === "correct")
    ) {
      setShowAnswer(true);
      setIsWon(true);
    }
  }, [grades, currentGuess]);

  return (
    <div className="App">
      <h1 className="title">WORDLED</h1>
      <div className="board">
        <div>
          {guesses.map((g, i) => (
            <Guess
              key={`${g.join("")}${i}`}
              letters={g}
              wordLength={wordLength}
              grade={grades[i]}
              animation={animations[i]}
            />
          ))}
        </div>
      </div>
      <Keyboard
        mapping={letterMapping}
        clickHandler={clickHandler}
        enterHandler={enterHandler}
        backspaceHandler={backspaceHandler}
      />
      <Answer shouldShow={showAnswer} answer={answer} />
      <NotAWord shouldShow={showNotAWord} word={guesses[currentGuess]} />
      {isWon && <WinModal />}
    </div>
  );
};

App.defaultProps = {
  wordLength: 6,
  maxGuesses: 7,
  answer: answers[Math.floor(Math.random() * answers.length)],
};

export default App;
