import ILovePDFApi from "..";
import SplitTask from '@ilovepdf/ilovepdf-core/dist/tasks/SplitTask';
import { createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('split') as SplitTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    // Be sure that your PDF has minimum 2 pages.
    return task.process({ split_mode: 'ranges', ranges: '1-2,1-2,1' });
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