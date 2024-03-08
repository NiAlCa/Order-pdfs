[![Nombre del video](https://img.youtube.com/vi/72o6v-fVuuY/0.jpg)](https://youtu.be/72o6v-fVuuY)


# PDF Processor with Electron

This project is a desktop application built with Electron that allows users to automatically organize PDF files into directories based on keywords. It utilizes Tesseract.js for Optical Character Recognition (OCR) and pdf2pic to convert PDF pages into images that can be processed by OCR.

## Features

- **OCR on PDFs**: Extracts text from PDF files for processing.
- **Automatic Organization**: Moves PDF files into directories based on found keywords.
- **Simple User Interface**: Provides a graphical user interface for selecting the PDF directory and specifying keywords.

## Setup

To run this project on your local machine, you'll need Node.js, npm, and GraphicsMagick. Follow these steps to set it up:

1. Clone this repository to your local machine.
2. Open a terminal and navigate to the project directory.
3. Install GraphicsMagick on your system. Refer to the [GraphicsMagick website](http://www.graphicsmagick.org/) for installation instructions.
4. Run `npm install` to install the necessary dependencies.
5. Once the installation is complete, run `npm start` to launch the application.

## Usage

To use the application, follow these steps:

1. Open the application. You will see a window with fields to enter keywords and select the PDF file directory.
2. Enter the keywords, separated by commas, in the designated field.
3. Use the directory picker to choose the directory containing your PDF files.
4. Click "Execute Script" to start the process. The application will move the PDF files into the respective directories based on the keywords found.

## Dependencies

This project makes use of the following libraries and tools:

- [Electron](https://electronjs.org/) for creating desktop applications with web technologies.
- [Tesseract.js](https://tesseract.projectnaptha.com/) for optical character recognition.
- [pdf2pic](https://www.npmjs.com/package/pdf2pic) for converting PDFs to images.
- [fs-extra](https://www.npmjs.com/package/fs-extra) for advanced file operations.
- [path](https://nodejs.org/api/path.html) for handling and transforming file paths.
- [GraphicsMagick](http://www.graphicsmagick.org/) for image processing, required for the pdf2pic library.

## Credits

This project was inspired by the need to automate the organization of PDF files based on specific content. We acknowledge the authors and contributors of the dependencies used.

## License

This project is licensed under the [MIT License](LICENSE).

---

Feel free to contribute to the project or suggest improvements. If you encounter any issues or have questions, please feel free to open an issue in the GitHub repository.
