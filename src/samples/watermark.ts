import ILovePDFApi from "..";
import WatermarkTask from '@ilovepdf/ilovepdf-core/tasks/WatermarkTask';
import { createObjectUrl } from "./utils";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('watermark') as WatermarkTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ mode: 'text', text: 'watermark text' });
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