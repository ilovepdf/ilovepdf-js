import ILovePDFApi from "..";

const instance = new ILovePDFApi('<PUBLIC_KEY>');

const task = instance.newTask('extract');

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    // Get an array with all the added files.
    // This array is ordered from older to newest.
    const file = task.getFiles()[0];
    // You get the object. This means that you can
    // set its properties directly.
    file.params.rotate = 90;

    console.log(file);
});