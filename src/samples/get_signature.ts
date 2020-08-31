import ILovePDFApi from "..";
import SignatureFile from "@ilovepdf/ilovepdf-core/dist/tasks/sign/SignatureFile";
import Signer from "@ilovepdf/ilovepdf-core/dist/tasks/sign/Signer";
import SignTask from "@ilovepdf/ilovepdf-core/dist/tasks/sign/SignTask";

const api = new ILovePDFApi('<PUBLIC_KEY>');

const task = api.newTask('sign') as SignTask;

task.start()
.then(() => {
    return task.addFile('<FILE_URL>');
})
.then(() => {
    // Requester is the person who sends the document to sign.
    task.requester = {
        name: 'Diego',
        email: 'emailto@test.com'
    };

    const file = task.getFiles()[0];
    // You can associate to files elements such as
    // signatures, initials, text and more.
    const signatureFile = new SignatureFile(file, [{
        type: 'signature',
        position: '300 -100',
        pages: '1',
        size: 28,
        color: '#000000',
        font: '',
        content: ''
    }]);

    // Signer is the person who signs. Requester and signer can be the
    // same person.
    const signer = new Signer('Diego', 'emailto@test.com', {
        type: 'signer',
        force_signature_type: 'all'
    });
    signer.addFile(signatureFile);
    task.addSigner(signer);

    return task.process({
        mode: 'multiple',
        custom_int: 0,
        custom_string: '0'
    });
})
.then(async () => {
    // You can get the signature to check or fill some wrong information
    // only if it is allowed.
    const createdSignTask = await api.getSignature(task.id);
    // Check task status and signer statuses.
    const status = await createdSignTask.getStatus();
    console.log(status);
    // Update some information.
    const signer = createdSignTask.signers[0];
    await signer.updatePhone('654654654');
    const updatedStatus = await createdSignTask.getStatus();
    console.log(updatedStatus);
});