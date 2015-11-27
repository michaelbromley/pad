import {Pad} from "../app/common/model";
import {Observable} from 'angular2/angular2';
import {Action} from "../app/common/model";
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
    public getPads(): Observable<Pad[]> {
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
    public createPad(item: Pad): Observable<Pad> {
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
    public getPad(uuid: string): Observable<Pad> {
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
    public updatePad(pad: Pad): Observable<Pad> {
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
    public deletePad(uuid: string): Observable<string> {
        return Rx.Observable.create(observer => {
            this.db.remove({uuid: uuid}, () => {
                observer.onNext(uuid);
                observer.onCompleted();
            });
        });
    }

    /**
     * Push an action onto the pad's history array
     */
    public addActionToPad(padUuid: string, action: Action): Observable<string> {
        return Rx.Observable.create(observer => {
            this.db.update({uuid: padUuid},
                {
                    $push: { history: action },
                    $inc: { historyPointer: 1 }
                }, () => {
                    observer.onNext(padUuid);
                    observer.onCompleted();
                });
        });
    }
}