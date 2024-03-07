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

    async function convertPdfToImages(pdfPath, opts) {
        try {
            const options = {
                density: 100,
                savename: opts.outputFileMask,
                savedir: opts.outputFolder,
                format: "png",
                width: 800,
                height: 600
            };
            const convert = fromPath(pdfPath, options);
            const pages = opts.pagesToProcess || [1];
            const output = await Promise.all(pages.map(page => convert(page)));
            return output.map(item => item.path);
        } catch (err) {
            console.error('Error converting PDF to images:', err);
            return [];
        }
    }

    async function extractTextFromImages(files) {
        let allText = '';
        for (const file of files) {
            const text = await Tesseract.recognize(
                file,
                'eng',
                { logger: m => console.log(m) }
            );
            allText += text.data.text;
            fs.unlinkSync(file); 
        }
        return allText;
    }

    function findAndCreateDirectories(text, baseDirectory, keywordsArray) {
        const regex = new RegExp(keywordsArray.join('|'), 'g');
        const matches = text.match(regex);
        const uniqueDirs = [...new Set(matches)];
        uniqueDirs.forEach(dir => {
            const dirPath = path.join(baseDirectory, dir);
            if (!fs.existsSync(dirPath)) {
                fs.mkdirpSync(dirPath);
            }
        });
        return uniqueDirs;
    }

    try {
        const files = fs.readdirSync(directory).filter(file => path.extname(file).toLowerCase() === '.pdf');
        for (const file of files) {
            const pdfPath = path.join(directory, file);
            const opts = {
                disableFontFace: false,
                useSystemFonts: false,
                enableXfa: false,
                viewportScale: 2.0,
                outputFolder: path.resolve(directory, 'temp_images'),
                outputFileMask: 'page_{pageNumber}',
                pagesToProcess: [1],
                strictPagesToProcess: false,
                verbosityLevel: 0
            };
            const imagePaths = await convertPdfToImages(pdfPath, opts);
            const text = await extractTextFromImages(imagePaths);
            const directories = findAndCreateDirectories(text, directory, keywordsArray);
            directories.forEach(dir => {
                if (text.includes(dir)) {
                    const destPath = path.join(directory, dir, file);
                    fs.moveSync(pdfPath, destPath, { overwrite: true });
                }
            });
        }
        fs.removeSync(path.resolve(directory, 'temp_images')); // Deletes the temporary images directory
        return { success: true, message: 'Script executed successfully' };
    } catch (err) {
        console.error('Script execution error:', err);
        return { success: false, message: `Error: ${err.message}` };
    }
});
