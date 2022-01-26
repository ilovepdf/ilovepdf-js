import Auth from "@ilovepdf/ilovepdf-js-core/auth/Auth";
import JWT from "@ilovepdf/ilovepdf-js-core/auth/JWT";
import TaskFactory, { TaskFactoryI } from "@ilovepdf/ilovepdf-js-core/tasks/TaskFactory";
import ILovePDFCoreApi, { GetReceiverInfoResponse, GetSignatureStatus } from '@ilovepdf/ilovepdf-js-core/ILovePDFCoreApi';
import TaskI from "@ilovepdf/ilovepdf-js-core/tasks/TaskI";
import ILovePDFTool from "@ilovepdf/ilovepdf-js-core/types/ILovePDFTool";
import XHRInterface from "@ilovepdf/ilovepdf-js-core/utils/XHRInterface";
import XHRPromise from "./XHRPromise";

export interface ILovePDFApiI {
    /**
     * Creates a new task for a specific tool.
     * @param taskType - Task to run.
     */
    newTask: (taskType: ILovePDFTool) => TaskI;
    /**
     * Returns the signature identified by `signatureToken`.
     * @param signatureToken token_requester property from a created signature.
     * @returns Signature.
     */
    getSignatureStatus: (signatureToken: string) => Promise<GetSignatureStatus>;
    /**
     * Returns a list of the created signatures.
     * A pagination system is used to limit the response length.
     * @param page
     * @param pageLimit Limit of objects per page.
     * @returns List of signatures.
     */
    getSignatureList: (page: number, pageLimit: number) => Promise<Array<GetSignatureStatus>>;
    /**
     * Voids a non-completed signature.
     * @param signatureToken token_requester property from a created signature.
     */
    voidSignature: (signatureToken: string) => Promise< void >;
    /**
     * Increases the expiration days limit from a signature.
     * @param signatureToken token_requester property from a created signature.
     * @param daysAmount Days to increase.
     */
    increaseSignatureExpirationDays: (signatureToken: string, daysAmount: number) => Promise<void>;
    /**
     * Sends reminders to all the receivers to sign, validate or witness a document.
     * @param signatureToken token_requester property from a created signature.
     */
    sendReminders: (signatureToken: string) => Promise<void>;
    /**
     * Returns a PDF or ZIP file with the original files, uploaded
     * at the beginning of the signature creation.
     * @param signatureToken token_requester property from a created signature.
     * @returns PDF or ZIP file with the original files.
     */
    downloadOriginalFiles: (signatureToken: string) => Promise<Uint8Array>;
    /**
     * Returns a PDF or ZIP file with the signed files.
     * @param signatureToken token_requester property from a created signature.
     * @returns PDF or ZIP file with the signed files.
     */
    downloadSignedFiles: (signatureToken: string) => Promise<Uint8Array>;
    /**
     * Returns a PDF or ZIP file with the audit files that inform about
     * files legitimity.
     * @param signatureToken token_requester property from a created signature.
     * @returns PDF or ZIP file with the audit files.
     */
    downloadAuditFiles: (signatureToken: string) => Promise<Uint8Array>;
    /**
     * Returns a receiver information related to a specific sign process.
     * @param receiverTokenRequester token_requester from a receiver.
     * @returns Receiver information.
     */
    getReceiverInfo: (receiverTokenRequester: string) => Promise<GetReceiverInfoResponse>;
    /**
     * Fixes a receiver's email.
     * @param receiverTokenRequester token_requester from a receiver.
     * @param email New email.
     */
    fixReceiverEmail: (receiverTokenRequester: string, email: string) => Promise< void >;
    /**
     * Fixes a receiver's phone.
     * @param receiverTokenRequester token_requester from a receiver.
     * @param phone New phone.
     */
    fixReceiverPhone: (receiverTokenRequester: string, phone: string) => Promise< void >;
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

    /**
     * @inheritdoc
     */
    public newTask(taskType: ILovePDFTool): TaskI {
        return this.taskFactory.newTask(taskType, this.auth, this.xhr);
    }

    /**
     * @inheritdoc
     */
     async getSignatureStatus(signatureToken: string): Promise<GetSignatureStatus> {
        return ILovePDFCoreApi.getSignatureStatus(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async getSignatureList(page: number = 0, pageLimit: number = 20): Promise<Array<GetSignatureStatus>> {
        return ILovePDFCoreApi.getSignatureList(this.auth, this.xhr, page, pageLimit);
    }

    /**
     * @inheritdoc
     */
    async voidSignature(signatureToken: string): Promise< void > {
        return ILovePDFCoreApi.voidSignature(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async increaseSignatureExpirationDays(signatureToken: string, daysAmount: number): Promise<void> {
        return ILovePDFCoreApi.increaseSignatureExpirationDays(this.auth, this.xhr, signatureToken, daysAmount);
    }

    /**
     * @inheritdoc
     */
    async sendReminders(signatureToken: string): Promise<void> {
        return ILovePDFCoreApi.sendReminders(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async downloadOriginalFiles(signatureToken: string): Promise<Uint8Array> {
        return ILovePDFCoreApi.downloadOriginalFiles(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async downloadSignedFiles(signatureToken: string): Promise<Uint8Array> {
        return ILovePDFCoreApi.downloadSignedFiles(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async downloadAuditFiles(signatureToken: string): Promise<Uint8Array> {
        return ILovePDFCoreApi.downloadAuditFiles(this.auth, this.xhr, signatureToken);
    }

    /**
     * @inheritdoc
     */
    async getReceiverInfo(receiverTokenRequester: string): Promise<GetReceiverInfoResponse> {
        return ILovePDFCoreApi.getReceiverInfo(this.auth, this.xhr, receiverTokenRequester);
    }

    /**
     * @inheritdoc
     */
    async fixReceiverEmail(receiverTokenRequester: string, email: string): Promise< void > {
        return ILovePDFCoreApi.fixReceiverEmail(this.auth, this.xhr, receiverTokenRequester, email);
    }

    /**
     * @inheritdoc
     */
    async fixReceiverPhone(receiverTokenRequester: string, phone: string): Promise< void > {
        return ILovePDFCoreApi.fixReceiverPhone(this.auth, this.xhr, receiverTokenRequester, phone);
    }

}
