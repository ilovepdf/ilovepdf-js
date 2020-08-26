import Auth from "@ilovepdf/ilovepdf-core/dist/auth/Auth";
import JWT from "@ilovepdf/ilovepdf-core/dist/auth/JWT";
import ILovePDFCoreApi, { UpdateSignerData } from '@ilovepdf/ilovepdf-core/dist/ILovePDFCoreApi';
import { TaskParams } from "@ilovepdf/ilovepdf-core/dist/tasks/Task";
import TaskFactory, { TaskFactoryI } from "@ilovepdf/ilovepdf-core/dist/tasks/TaskFactory";
import TaskI from "@ilovepdf/ilovepdf-core/dist/tasks/TaskI";
import ILovePDFTool from "@ilovepdf/ilovepdf-core/dist/types/ILovePDFTool";
import GetSignerResponse from "@ilovepdf/ilovepdf-core/dist/types/responses/GetSignerResponse";
import XHRInterface from "@ilovepdf/ilovepdf-core/dist/utils/XHRInterface";
import XHRPromise from "./XHRPromise";
import GetSignatureTemplateResponse from "@ilovepdf/ilovepdf-core/dist/types/responses/GetSignatureTemplateResponse";

export interface ILovePDFApiI {
    /**
     * Creates a new task for a specific tool.
     * @param taskType - Task to run.
     */
    newTask: (taskType: ILovePDFTool) => TaskI;
    /**
     * Updates a signer that was also the requester in a signature process.
     * @param signerToken - Signer token of the signer that has to be updated.
     * @param data - Object with values to change.
     */
    updateSigner: (signerToken: string, data: UpdateSignerData) => Promise<GetSignerResponse>;
    /**
     * Updates a signer email in a signature process.
     * @param requesterToken - Request token of the signer that has to be updated.
     * @param email - New email.
     */
    updateSignerEmail: (requesterToken: string, email: string) => Promise<GetSignerResponse>;
    /**
     * Updates a signer phone in a signature process.
     * @param requesterToken - Request token of the signer that has to be updated.
     * @param phone - New phone.
     */
    updateSignerPhone: (requesterToken: string, phone: string) => Promise<GetSignerResponse>;
    /**
     * Gets a template previously created.
     * @param taskId - Task id of the task that created the template.
     */
    getSignatureTemplate: (taskId: string) => Promise<GetSignatureTemplateResponse>;
}

export type ILovePDFApiParams = {
    file_encryption_key?: string
};

export default class ILovePDFApi implements ILovePDFApiI {
    private auth: Auth;
    private xhr: XHRInterface;
    private taskFactory: TaskFactoryI;

    constructor(publicKey: string, params: ILovePDFApiParams = {}) {
        this.xhr = new XHRPromise;
        this.auth = new JWT(this.xhr, publicKey, undefined, params);
        this.taskFactory = new TaskFactory();
    }

    public newTask(taskType: ILovePDFTool): TaskI {
        return this.taskFactory.newTask(taskType, this.auth, this.xhr);
    }

    public async updateSigner(signerToken: string, data: UpdateSignerData) {
        return ILovePDFCoreApi.updateSigner(this.auth, this.xhr, signerToken, data);
    }

    public async updateSignerEmail(requesterToken: string, email: string) {
        return ILovePDFCoreApi.updateSignerEmail(this.auth, this.xhr, requesterToken, email);
    }

    public async updateSignerPhone(requesterToken: string, phone: string) {
        return ILovePDFCoreApi.updateSignerPhone(this.auth, this.xhr, requesterToken, phone);
    }

    public async getSignatureTemplate(taskId: string) {
        return ILovePDFCoreApi.getSignatureTemplate(this.auth, this.xhr, taskId);
    }

}
