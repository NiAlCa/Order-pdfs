
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs-extra');
const path = require('path');
const Tesseract = require('tesseract.js');
const { fromPath } = require("pdf2pic");

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('execute-script', async (event, { keywords, directory }) => {
    const keywordsArray = keywords.split(',').map(keyword => keyword.trim());
    const imageFolder = path.resolve(directory, 'temp_images');


    if (!fs.existsSync(imageFolder)) {
        fs.mkdirpSync(imageFolder);
    }

    async function convertPdfToImages(pdfPath, opts) {
        const options = {
            density: 300,
            quality: 100,
            savename: opts.outputFileMask,
            savedir: imageFolder,
            format: "png",
            width: 1920,
            height: 1080
        };
        const convert = fromPath(pdfPath, options);
        const pages = opts.pagesToProcess || [1];
        const output = await Promise.all(pages.map(page => convert(page)));
        return output.map(item => item.path);
    }

    async function extractTextFromImages(files) {
        let allText = '';
        for (const file of files) {
            const text = await Tesseract.recognize(
                file,
                'spa', 
                { logger: m => console.log(m) }
            );
            allText += text.data.text;
            fs.unlinkSync(file); 
        }
        return allText;
    }

    function findAndCreateDirectories(text, baseDirectory, keywordsArray) {
        const regex = new RegExp(keywordsArray.join('|'), 'gi');
        const matches = text.match(regex);
        if (matches) {
            const uniqueDirs = [...new Set(matches)];
            uniqueDirs.forEach(dir => {
                const dirPath = path.join(baseDirectory, dir);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirpSync(dirPath);
                }
            });
            return uniqueDirs;
        } else {
            return [];
        }
    }

    try {
        const files = fs.readdirSync(directory).filter(file => path.extname(file).toLowerCase() === '.pdf');
        for (const file of files) {
            const pdfPath = path.join(directory, file);
            const opts = {
                outputFolder: imageFolder, 
                outputFileMask: 'page_{pageNumber}',
                pagesToProcess: [1] 
            };
            const imagePaths = await convertPdfToImages(pdfPath, opts);
            const text = await extractTextFromImages(imagePaths);
            const directories = findAndCreateDirectories(text, directory, keywordsArray);
            let fileMoved = false; 
            directories.forEach(dir => {
                if (text.includes(dir) && !fileMoved) {
                    const destPath = path.join(directory, dir, file);
                    fs.moveSync(pdfPath, destPath, { overwrite: true });
                    fileMoved = true; 
                }
            });


            if (fileMoved) {
                console.log(`Archivo ${file} movido con éxito.`);
                continue;
            }
        }
    } catch (err) {
        console.error('Script execution error:', err);
        return { success: false, message: `Error: ${err.message}` };
    }
 finally {
      
        fs.removeSync(imageFolder);
    }

    return { success: true, message: 'Script executed successfully' };
});
