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

    public fetchPad(id) {
        return this.http.get(`${config.API_URL}/pads/${id}`)
            .map((res: Response) => res.json());
    }

    public createItem(item) {
        delete item._id;
        return this.http.post(`${config.API_URL}/items`, JSON.stringify(item))
            .map((res: Response) => res.json());
    }

    public updateItem(item) {
        return this.http.put(`${config.API_URL}/items/${item._id}`, JSON.stringify(item));
    }

    public deleteItem(item) {
        return this.http.delete(`${config.API_URL}/items/${item._id}`);
    }
}

export default DataService;