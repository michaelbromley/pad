import config from '../common/config';
import {Http, HTTP_PROVIDERS, Headers, Response} from 'angular2/http';
import {Injectable, Observable} from 'angular2/angular2';
import {Pad} from "./model";
import {PadStore} from "../../dataStore/padStore";

let NeDBDataStore = require("nedb/browser-version/out/nedb");

export enum StorageStrategy {
    Local,
    Remote
}

@Injectable()
class DataService {

    private padStore: PadStore;
    private localStorage: boolean;

    constructor(private http: Http) {
        let db = new NeDBDataStore({ filename: 'pad', autoload: true });
        this.padStore = new PadStore(db);
        this.localStorage = false;
    }

    public setStorageStrategy(strategy: StorageStrategy) {
        this.localStorage = (strategy === StorageStrategy.Local);
    }

    public fetchPadList(): Observable<Pad[]> {
        if (this.localStorage) {
            return this.padStore.getPads();
        } else {
            return this.http.get(`${config.API_URL}/pads`)
                .map((res:Response) => res.json());
        }
    }

    public fetchPad(uuid: string): Observable<Pad> {
        if (this.localStorage) {
            return this.padStore.getPad(uuid);
        } else {
            return this.http.get(`${config.API_URL}/pads/${uuid}`)
                .map((res:Response) => res.json());
        }
    }

    public createPad(pad: Pad): Observable<Pad> {
        if (this.localStorage) {
            return this.padStore.createPad(pad);
        } else {
            return this.http.post(`${config.API_URL}/pads`, JSON.stringify(pad))
                .map((res:Response) => res.json());
        }
    }

    public updatePad(pad: Pad): Observable<any> {
        if (this.localStorage) {
            return this.padStore.updatePad(pad);
        } else {
            return this.http.put(`${config.API_URL}/pads/${pad.uuid}`, JSON.stringify(pad));
        }
    }

    public deletePad(padUuid: string): Observable<any> {
        if (this.localStorage) {
            return this.padStore.deletePad(padUuid);
        } else {
            return this.http.delete(`${config.API_URL}/pads/${padUuid}`);
        }
    }
}

export default DataService;