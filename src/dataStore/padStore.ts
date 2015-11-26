import {Pad} from "../app/common/model";
let Rx: Rx = require('rx');

/**
 * Performs CRUD on the NEDB data store that is passed to it in the constructor.
 */
export class PadStore {

    constructor(private db: nedb.NeDBDataStore) {
    }

    /**
     * List Pads
     */
    public getPads(): Rx.Observable<Pad[]> {
        return Rx.Observable.create(observer => {
            this.db.find({}).sort({ order: 1}).exec((err, pads) => {
                observer.onNext(pads);
                observer.onCompleted();
            });
        });
    }


    /**
     * Create Pad
     */
    public createPad(item: Pad): Rx.Observable<Pad> {
        return Rx.Observable.create(observer => {
            this.db.insert(item, () => {
                observer.onNext(item);
                observer.onCompleted();
            });
        });
    }

    /**
     * Read Pad
     */
    public getPad(uuid: string): Rx.Observable<Pad> {
        return Rx.Observable.create(observer => {
            this.db.findOne({uuid: uuid}, (err, item) => {
                observer.onNext(item);
                observer.onCompleted();
            });
        });
    }

    /**
     * Update Pad
     */
    public updatePad(pad: Pad): Rx.Observable<Pad> {
        return Rx.Observable.create(observer => {
            this.db.update({uuid: pad.uuid}, pad, () => {
                observer.onNext(pad);
                observer.onCompleted();
            });
        });
    }

    /**
     * Delete Pad
     */
    public deletePad(uuid: string): Rx.Observable<string> {
        return Rx.Observable.create(observer => {
            this.db.remove({uuid: uuid}, () => {
                observer.onNext(uuid);
                observer.onCompleted();
            });
        });
    }
}