import ILovePDFApi from "..";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('merge');

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    return task.process({ webhook: '<WEBHOOK_URL>' });
});