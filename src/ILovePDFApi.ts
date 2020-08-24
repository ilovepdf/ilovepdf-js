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

export interface ILovePDFApiI {
    /**
     * Creates a new task for a specific tool.
     * @param taskType - Task to run.
     * @param params - Parameters for the tool.
     */
    newTask: (taskType: ILovePDFTool, params?: TaskParams) => TaskI;
    /**
     * Updates a signer that was processed and it is inside ILovePDF servers.
     * @param signerToken - Token of the signer that has to be updated.
     * @param data - Object with values to change.
     */
    updateSigner: (signerToken: string, data: UpdateSignerData) => Promise<GetSignerResponse>;
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

    public newTask(taskType: ILovePDFTool, params: TaskParams = {}): TaskI {
        return this.taskFactory.newTask(taskType, this.auth, this.xhr, params);
    }

    public async updateSigner(signerToken: string, data: UpdateSignerData) {
        return ILovePDFCoreApi.updateSigner(this.auth, this.xhr, signerToken, data);
    }

}
