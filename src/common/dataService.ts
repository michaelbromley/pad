import config from '../common/config';
import {Http, HTTP_PROVIDERS, Headers, Response} from 'angular2/http';
import {Injectable} from 'angular2/angular2';

@Injectable()
class DataService {

    private busy: boolean = false;

    constructor(private http: Http) {}

    public fetchPadList() {
        return this.http.get(`${config.API_URL}/pads`)
            .map((res: Response) => res.json());
    }

    public fetchPad(id) {
        return this.http.get(`${config.API_URL}/pads/${id}`)
            .map((res: Response) => res.json());
    }

    public createItem(item) {
        this.beginRequest();
        delete item._id;
        return this.http.post(`${config.API_URL}/items`, JSON.stringify(item))
            .map((res:Response) => res.json())
            .do(() => this.endRequest());
    }

    public updateItem(item) {
        return this.http.put(`${config.API_URL}/items/${item._id}`, JSON.stringify(item));
    }

    public deleteItem(item) {
        return this.http.delete(`${config.API_URL}/items/${item._id}`);
    }

    private beginRequest() {
        this.busy = true;
        console.log('starting request');
    }

    private endRequest() {
        this.busy = false;
        console.log('request ended');
    }
}

export default DataService;