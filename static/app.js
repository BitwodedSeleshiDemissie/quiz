let currentQuestionIndex = 0;
let questions = [];
let correctAnswer = "";
let userAnswer = "";
let isQuestionAnswered = false;
let unansweredQuestions = [];
let totalQuestions = parseInt(document.getElementById('tque').innerText);
let answeredQuestions = {}; // Track answered questions

// Fetch all questions at the start
function fetchQuestions() {
  console.log("Fetching all questions...");
  loadQuestion(currentQuestionIndex);
}

// Load a specific question, either from cache or by fetching from the server
function loadQuestion(questionId, fromBack = false) {
  resetQuestionState(fromBack); // Reset the state properly if navigating back

  if (questions[questionId]) {
    console.log(`Question ${questionId} already loaded, displaying from cache.`);
    displayQuestion(fromBack);
  } else {
    console.log(`Fetching question ${questionId} from server...`);
    fetch(`/get_question/${questionId}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Question fetched from server:", data);
        if (data.question) {
          questions[questionId] = data;
          displayQuestion(fromBack);
        } else {
          alert("No more questions available!");
        }
      })
      .catch((error) => console.error("Error fetching question:", error));
  }
}

// Reset the state of the question display and options
function resetQuestionState(fromBack) {
  console.log("Resetting question state...");
  if (!fromBack) {
    userAnswer = "";  // Clear the previous answer if moving forward
    isQuestionAnswered = false;  // Mark the question as unanswered
  }

  document.getElementById("question-options").innerHTML = "";  // Clear the options
  const explanationElement = document.getElementById("explanation");
  explanationElement.style.display = "none";  // Hide explanation initially
  explanationElement.innerHTML = "";  // Clear any previous explanation
}

// Display the current question and its options
function displayQuestion(fromBack = false) {
  const questionObj = questions[currentQuestionIndex];
  console.log(`Displaying question ${currentQuestionIndex}:`, questionObj);

  const questionElement = document.getElementById("question");
  const qidElement = document.getElementById("qid");
  const optionsContainer = document.getElementById("question-options");
  const explanationElement = document.getElementById("explanation");

  questionElement.textContent = questionObj.question;
  qidElement.textContent = `${currentQuestionIndex + 1}.`;

  // Show the correct icon for unanswered, answered with N/A, or other answers
  const savedAnswer = answeredQuestions[currentQuestionIndex]?.answer;
  if (savedAnswer === "N/A") {
    qidElement.innerHTML += ' <span class="icon-unknown">?</span>'; // Change to "?" for "N/A" answers
  } else if (unansweredQuestions.includes(currentQuestionIndex)) {
    qidElement.innerHTML += ' <span class="icon-wrong">❌</span>';
  }

  correctAnswer = questionObj.correct_answer;
  console.log("Correct Answer:", correctAnswer);

  // Clear previous options before adding new ones
  optionsContainer.innerHTML = '';

  // Display the options and handle user interactions
  Object.entries(questionObj.options).forEach(([key, value]) => {
    const optionDiv = document.createElement("div");
    optionDiv.classList.add("option-block");
    optionDiv.textContent = `${key}) ${value}`;

    // If the answer was already provided, highlight it in yellow if navigating back
    if (savedAnswer !== undefined && savedAnswer !== "N/A") {
      if (savedAnswer === key) {
        optionDiv.style.backgroundColor = "yellow";  // Highlight in yellow if this is the saved answer
      }
      optionDiv.style.pointerEvents = "none";  // Disable further interaction with the option
    } else if (savedAnswer === "N/A") {
      // For questions with "N/A" answer, show what was clicked previously if revisiting
      if (fromBack) {
        if (savedAnswer === key) {
          optionDiv.style.backgroundColor = "yellow";  // Highlight previously clicked answer in yellow
        }
      }
      optionDiv.style.pointerEvents = "none";  // Disable further interaction if the answer was "N/A"
    } else {
      // If the answer was not provided yet, enable interaction
      optionDiv.addEventListener("click", function () {
        checkAnswer(key, optionDiv);
      });
    }

    optionsContainer.appendChild(optionDiv);
  });

  // Show explanation after an attempt is made (either by selecting an answer or coming back)
  if (savedAnswer !== undefined) {
    explanationElement.style.display = "block";  // Show explanation after answer is selected

    // For "N/A" answered questions, highlight all options green and display the explanation
    if (savedAnswer === "N/A") {
      explanationElement.innerHTML = `There is no answer: "N/A". ${questionObj.comment}`;
      const optionBlocks = optionsContainer.querySelectorAll(".option-block");
      optionBlocks.forEach((block) => {
        block.style.backgroundColor = "green";  // Highlight all options green for "N/A" answered questions
      });
    } else {
      // For non-"N/A" answers, show the explanation with the selected answer
      explanationElement.innerHTML = `${correctAnswer} is the correct answer, ${savedAnswer} was your selected answer. ${questionObj.comment}`;
    }
  } else {
    // For unanswered questions, show the message "There is no answer for this"
    explanationElement.style.display = "none";  // Do not show the explanation until an answer is clicked
  }

  // When going back, ensure the explanation is visible for "N/A" answers or any previously answered question
  if (fromBack && savedAnswer === "N/A") {
    explanationElement.style.display = "block";  // Show explanation when navigating back to "N/A" answered questions
  } else if (fromBack && savedAnswer !== undefined) {
    explanationElement.style.display = "block";  // Show explanation for other answered questions
  }
}



// Normalize answer to handle formatting inconsistencies
function normalizeAnswer(answer) {
  return answer.replace(')', '').trim();  // Remove the closing parenthesis if it exists
}

// Check the user's selected answer and provide feedback
function checkAnswer(selectedOptionKey, selectedDiv) {
  console.log("Checking answer...");
  console.log("Selected Option Key:", selectedOptionKey);
  console.log("Correct Answer Key:", correctAnswer);

  const explanationElement = document.getElementById("explanation");
  const optionsContainer = document.getElementById("question-options");

  // Disable further interaction with options after an answer is selected
  const optionBlocks = optionsContainer.querySelectorAll(".option-block");
  optionBlocks.forEach((block) => {
    block.style.pointerEvents = "none";  // Disable clicking after selection
  });

  // If correct_answer is null, just show the explanation without highlighting options
  if (correctAnswer === null) {
    explanationElement.style.display = "block";
    explanationElement.innerHTML = questions[currentQuestionIndex].comment;
  } else {
    const normalizedSelectedKey = normalizeAnswer(selectedOptionKey);
    const normalizedCorrectAnswer = normalizeAnswer(correctAnswer);

    // Highlight options based on whether they are correct or wrong
    optionBlocks.forEach((block) => {
      const optionKey = block.textContent.trim().substring(0, 2); // Get the option key (e.g., 'B)')
      const normalizedOptionKey = normalizeAnswer(optionKey);  // Normalize the option key

      if (normalizedOptionKey === normalizedCorrectAnswer) {
        block.classList.add("correct");  // Highlight correct answer
      } else if (normalizedOptionKey === normalizedSelectedKey) {
        block.classList.add("wrong");   // Highlight wrong answer if selected
      }
    });

    // Store the user's answer and explanation
    userAnswer = selectedOptionKey;
    answeredQuestions[currentQuestionIndex] = {
      answer: selectedOptionKey,
      explanation: questions[currentQuestionIndex].comment,
    };

    // Add "correct" or "wrong" class to the selected answer
    if (normalizedSelectedKey === normalizedCorrectAnswer) {
      selectedDiv.classList.add("correct");
      isQuestionAnswered = true;
      unansweredQuestions = unansweredQuestions.filter(q => q !== currentQuestionIndex);
    } else {
      selectedDiv.classList.add("wrong");
      if (!unansweredQuestions.includes(currentQuestionIndex)) {
        unansweredQuestions.push(currentQuestionIndex);
      }
    }

    // Show the explanation for the answer
    explanationElement.style.display = "block";
    explanationElement.innerHTML = (normalizedSelectedKey === normalizedCorrectAnswer)
      ? "Correct! " + questions[currentQuestionIndex].comment
      : "Wrong! " + questions[currentQuestionIndex].comment;
  }

  // Move to the next question after a brief delay
  setTimeout(() => {
    loadNextQuestion();
  }, 2000);
}

// Handle "Next" button click to move to the next question
document.getElementById("next").addEventListener("click", () => {
  if (isQuestionAnswered || answeredQuestions[currentQuestionIndex]) {
    loadNextQuestion();
  } else {
    alert("Please answer the question correctly before moving to the next one.");
  }
});

// Handle "Previous" button click to go back to the previous question
document.getElementById("previous").addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion(currentQuestionIndex, true);  // Pass 'true' to indicate going back
  }
});

// Load the next question if available
function loadNextQuestion() {
  if (currentQuestionIndex < totalQuestions - 1) {
    currentQuestionIndex++;
    resetQuestionState();  // Reset before loading the next question
    loadQuestion(currentQuestionIndex);
  } else {
    reviewUnansweredQuestions();
  }
}

// Review all unanswered questions after completing the quiz
function reviewUnansweredQuestions() {
  alert("You have completed the quiz! Now, reviewing unanswered questions.");

  unansweredQuestions.forEach((questionIndex) => {
    currentQuestionIndex = questionIndex;
    loadQuestion(currentQuestionIndex);
  });
}

// Fetch the first question to start the quiz
fetchQuestions();
