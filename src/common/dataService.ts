import config from '../common/config';
import {Http, HTTP_PROVIDERS, Headers, Response} from 'angular2/http';
import {Injectable} from 'angular2/angular2';

@Injectable()
class DataService {

    constructor(private http: Http) {}

    public fetchPadList() {
        return this.http.get(`${config.API_URL}/pads`)
            .map((res: Response) => res.json());
    }

    public fetchPad(uuid) {
        return this.http.get(`${config.API_URL}/pads/${uuid}`)
            .map((res: Response) => res.json());
    }

    public createPad(pad) {
        return this.http.post(`${config.API_URL}/pads`, JSON.stringify(pad))
            .map((res:Response) => res.json());
    }

    public updatePad(pad) {
        return this.http.put(`${config.API_URL}/pads/${pad.uuid}`, JSON.stringify(pad));
    }

    public deletePad(pad) {
        return this.http.delete(`${config.API_URL}/pads/${pad.uuid}`);
    }
}

export default DataService;