import ILovePDFApi from "..";
import PdfJpgTask from '@ilovepdf/ilovepdf-js-core/tasks/PdfJpgTask';
import { createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('pdfjpg') as PdfJpgTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ pdfjpg_mode: 'pages' });
})
.then(() => {
    return task.download();
})
.then((data) => {
    // Zip file.
    const url = createObjectUrl(data, 'application/zip');
    console.log(url);
    // You can create a download request opening a new window.
    window.open(url);
});