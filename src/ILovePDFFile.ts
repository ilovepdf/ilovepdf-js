import BaseFile, { BaseFileParams } from "@ilovepdf/ilovepdf-js-core/tasks/BaseFile";

export default class ILovePDFFile extends BaseFile {
    private file: File;

    constructor(file: File, params?: BaseFileParams) {
        const filename = file.name;
        super('', '', filename, params);

        // Keep data.
        this.file = file;
    }

    get data(): FormData {
        // Create each time due to 'task'
        // property could change previously.
        const formData = new FormData();
        formData.append('task', this.taskId);
        formData.append('file', this.file);
        if (this.info) { // Get information if required.
            formData.append('pdfinfo', '1');
        }

        return formData;
    }

}
