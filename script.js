let variables = {};
let codeEditorActive = false;
let codeBuffer = [];
let programRunning = false;
let programQueue = [];
let currentInputVariable = null;

const outputDiv = document.getElementById("output");
const inputField = document.getElementById("input");

function appendOutput(text) {
    outputDiv.textContent += text + "\n";
    outputDiv.scrollTop = outputDiv.scrollHeight;
}

function processLine(line) {
    if (line.startsWith("print")) {
        const match = /print\s*\(\s*'(.*)'\s*\)\s*\(?\s*(\w+)?\s*\)?$/.exec(line);
        if (match) {
            const text = match[1];
            const variableName = match[2];
            const variableValue = variableName ? variables[variableName] || "" : "";
            appendOutput(text + variableValue);
        }
    } else if (line.startsWith("var")) {
        const match = /^var\s+(\w+)$/.exec(line);
        if (match) {
            variables[match[1]] = null;
        }
    } else if (line.startsWith("input")) {
        const match = /^input\s*\(\s*(\w+)\s*\)$/.exec(line);
        if (match) {
            const varName = match[1];
            if (variables.hasOwnProperty(varName)) {
                appendOutput(`Enter value for ${varName}:`);
                currentInputVariable = varName;
                return false; // Wait for user input
            }
        }
    }
    return true; // Proceed to the next line
}

function runProgram() {
    if (programQueue.length === 0) {
        programRunning = false;
        appendOutput("Program finished.");
        return;
    }

    const line = programQueue.shift();
    const shouldProceed = processLine(line);
    if (shouldProceed) {
        runProgram();
    }
}

inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const input = inputField.value.trim();
        inputField.value = "";

        if (programRunning) {
            if (currentInputVariable) {
                variables[currentInputVariable] = input;
                currentInputVariable = null;
                runProgram(); // Resume program execution
            }
        } else if (codeEditorActive) {
            if (input === "exit") {
                codeEditorActive = false;
                appendOutput("Exiting code editor. Running program...");
                programQueue = [...codeBuffer];
                codeBuffer = [];
                programRunning = true;
                runProgram();
            } else {
                codeBuffer.push(input);
            }
        } else {
            if (input === "code") {
                codeEditorActive = true;
                appendOutput("Entering code editor. Type 'exit' to run the program.");
            } else {
                appendOutput(`Unknown command: ${input}`);
            }
        }
    }
});
