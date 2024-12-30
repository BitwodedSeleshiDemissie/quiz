const fs = require('fs');

// Function to recursively traverse and replace null values with "N/A"
function refactorAnswers(json) {
  if (Array.isArray(json)) {
    // If it's an array, traverse each element
    return json.map(refactorAnswers);
  } else if (typeof json === 'object' && json !== null) {
    // If it's an object, check for 'correct_answer' and replace null with "N/A"
    for (const key in json) {
      if (json.hasOwnProperty(key)) {
        if (key === 'correct_answer' && json[key] === null) {
          json[key] = "N/A";  // Replace null with string "N/A"
          console.log(`Replaced null with "N/A" at exercise ${json.exercise}`);
        } else {
          json[key] = refactorAnswers(json[key]);  // Recursively process nested objects
        }
      }
    }
    return json;
  }
  return json;  // Return the value if it's not an object or array
}

// Read your JSON file (replace with your actual file path)
fs.readFile('questions.json', 'utf8', (err, data) => {
  if (err) {
    console.log('Error reading file:', err);
    return;
  }

  // Parse the JSON data
  let questionsData = JSON.parse(data);

  console.log("Before refactor:");
  console.log(JSON.stringify(questionsData, null, 2));  // Log original content

  // Refactor the answers in the data
  const refactoredData = refactorAnswers(questionsData);

  console.log("After refactor:");
  console.log(JSON.stringify(refactoredData, null, 2));  // Log updated content

  // Save the modified data back to the file (overwrite)
  fs.writeFile('questions.json', JSON.stringify(refactoredData, null, 2), (err) => {
    if (err) {
      console.log('Error writing file:', err);
    } else {
      console.log('File successfully updated!');
    }
  });
});
