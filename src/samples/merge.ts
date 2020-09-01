import ILovePDFApi from "..";
import MergeTask from '@ilovepdf/ilovepdf-core/tasks/MergeTask';
import { createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('merge') as MergeTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process();
})
.then(() => {
    return task.download();
})
.then((data) => {
    const url = createObjectUrl(data, 'application/pdf');
    console.log(url);
    // You can create a download request opening a new window.
    window.open(url);
});