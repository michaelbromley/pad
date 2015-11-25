import config from '../common/config';
import {Http, HTTP_PROVIDERS, Headers, Response} from 'angular2/http';
import {Injectable, Observable} from 'angular2/angular2';
import {Pad} from "./model";

@Injectable()
class DataService {

    constructor(private http: Http) {}

    public fetchPadList(): Observable<Pad[]> {
        return this.http.get(`${config.API_URL}/pads`)
            .map((res: Response) => res.json());
    }

    public fetchPad(uuid): Observable<Pad> {
        return this.http.get(`${config.API_URL}/pads/${uuid}`)
            .map((res: Response) => res.json());
    }

    public createPad(pad): Observable<Pad> {
        return this.http.post(`${config.API_URL}/pads`, JSON.stringify(pad))
            .map((res:Response) => res.json());
    }

    public updatePad(pad): Observable<any> {
        return this.http.put(`${config.API_URL}/pads/${pad.uuid}`, JSON.stringify(pad));
    }

    public deletePad(pad): Observable<any> {
        return this.http.delete(`${config.API_URL}/pads/${pad.uuid}`);
    }
}

export default DataService;