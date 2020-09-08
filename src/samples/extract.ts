import ILovePDFApi from "..";
import ExtractTask from '@ilovepdf/ilovepdf-js-core/tasks/ExtractTask';
import { createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('extract') as ExtractTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ detailed: true });
})
.then(() => {
    return task.download();
})
.then((data) => {
    // Plain text.
    const url = createObjectUrl(data, 'text/plain');
    console.log(url);
    // You can create a download request opening a new window.
    window.open(url);
});