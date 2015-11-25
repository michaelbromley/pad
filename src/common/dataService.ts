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

    public fetchPad(uuid: string): Observable<Pad> {
        return this.http.get(`${config.API_URL}/pads/${uuid}`)
            .map((res: Response) => res.json());
    }

    public createPad(pad: Pad): Observable<Pad> {
        return this.http.post(`${config.API_URL}/pads`, JSON.stringify(pad))
            .map((res:Response) => res.json());
    }

    public updatePad(pad: Pad): Observable<any> {
        return this.http.put(`${config.API_URL}/pads/${pad.uuid}`, JSON.stringify(pad));
    }

    public deletePad(padUuid: string): Observable<any> {
        return this.http.delete(`${config.API_URL}/pads/${padUuid}`);
    }
}

export default DataService;