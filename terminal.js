document.addEventListener('DOMContentLoaded', function() {
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const notepadWindow = document.getElementById('notepad-window');  // Reference to the notepad window
    const notepadContent = document.getElementById('notepad-content'); // Reference to the notepad content
    const notepadClose = document.getElementById('notepad-close');     // Reference to the close button

    // Function to scroll the terminal to the bottom
    function scrollToBottom() {
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    terminalInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();  // Prevent form submission or default behavior

            const input = terminalInput.value.trim();  // Get the user input
            terminalInput.value = '';  // Clear the input field

            // Display the command in the output (except for the 'clear' command)
            if (input !== 'clear') {
                terminalOutput.textContent += `\nuser@system:~$ ${input}\n`;
            }

            // Handling different commands
            if (input === 'ls') {
                fetchRepoFiles(); // Fetch .txt files and list them
            } else if (input === 'pwd') {
                terminalOutput.textContent += '/home/user\n';
            } else if (input.startsWith('cat')) {
                const fileName = input.split(' ')[1]; // Get the filename from the command
                if (fileName) {
                    fetchFile(fileName);
                } else {
                    terminalOutput.textContent += 'Error: No file specified\n';
                }
            } else if (input === 'clear') {
                // Clear the terminal output
                terminalOutput.textContent = '';
            } else if (input) {
                terminalOutput.textContent += `Command not found: ${input}\n`;
            }

            // Scroll to the bottom of the terminal output
            scrollToBottom();
        }
    });

    // Call scrollToBottom whenever the page loads to ensure the input is visible
    scrollToBottom();

    // Close notepad when 'x' button is clicked
    notepadClose.addEventListener('click', function() {
        notepadWindow.style.display = 'none';  // Hide the notepad window
    });
});

// Fetch file content from GitHub repository
function fetchFile(fileName) {
    const fileUrl = `https://raw.githubusercontent.com/promithi/promithi.github.io/main/${fileName}`;

    fetch(fileUrl)
        .then(response => {
            if (response.ok) {
                return response.text();
            } else {
                throw new Error("File not found");
            }
        })
        .then(data => {
            openNotepad(fileName, data);  // Open the notepad with the file content
        })
        .catch(error => {
            terminalOutput.textContent += `\nuser@system:~$ cat ${fileName}\nError: ${error.message}`;
        });
}

// Function to open the notepad window with file content
function openNotepad(fileName, content) {
    const notepadWindow = document.getElementById('notepad-window');
    const notepadContent = document.getElementById('notepad-content');

    notepadWindow.style.display = 'block';  // Show the notepad window
    notepadContent.innerHTML = `<strong>${fileName}</strong><pre>${content}</pre>`;  // Populate notepad with file content
    terminalOutput.textContent += `\nuser@system:~$ cat ${fileName}\nOpening ${fileName} in notepad window...`;
}

// Fetch all .txt files in the GitHub repo
function fetchRepoFiles() {
    const repoApiUrl = "https://api.github.com/repos/promithi/promithi.github.io/contents/";

    fetch(repoApiUrl)
        .then(response => response.json())
        .then(files => {
            const txtFiles = files
                .filter(file => file.name.endsWith('.txt')) // Filter .txt files
                .map(file => file.name) // Extract the file names
                .join('  '); // Join the names into a single string

            if (txtFiles) {
                terminalOutput.textContent += `\nuser@system:~$ ls\n${txtFiles}`;
            } else {
                terminalOutput.textContent += `\nuser@system:~$ ls\nNo .txt files found in the repository.`;
            }
        })
        .catch(error => {
            terminalOutput.textContent += `\nuser@system:~$ ls\nError fetching files: ${error.message}`;
        });
}