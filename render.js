const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

document.addEventListener('DOMContentLoaded', () => {
    const executeButton = document.getElementById('executeButton');

    executeButton.addEventListener('click', () => {
        const keywords = document.getElementById('keywordsInput').value;
        const directoryElement = document.getElementById('directoryPicker');
        let directory = directoryElement.files.length > 0 ? directoryElement.files[0].path : null;

        if (!keywords || !directory) {
            console.log('Please, fill in all the fields.');
            return;
        }

        document.getElementById('loadingIndicator').style.display = 'block';

        fs.stat(directory, (err, stats) => {
            if (err) {
                console.error('Error checking the file:', err);
                document.getElementById('loadingIndicator').style.display = 'none'; 
                return;
            }

            if (stats.isFile()) {
                console.log('The selected path is a file.');
                directory = path.dirname(directory);
            } else {
                console.log('The selected path is a directory.');
            }

            ipcRenderer.invoke('execute-script', { keywords, directory })
                .then(response => {
                    console.log(response.message);
                    document.getElementById('loadingIndicator').style.display = 'none';
                })
                .catch(err => {
                    console.error('Error executing the script:', err);
                    document.getElementById('loadingIndicator').style.display = 'none';
                });
        });
    });
});
