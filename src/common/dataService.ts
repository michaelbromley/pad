import config from '../common/config';
import {Http, HTTP_PROVIDERS, Response} from 'angular2/http';
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
        return this.http.post(`${config.API_URL}/items`, item);
    }

    public updateItem(item) {
        return this.http.put(`${config.API_URL}/items/${item._id}`, item);
    }

    public deleteItem(item) {
        return this.http.delete(`${config.API_URL}/pads/${item._id}`);
    }

}

export default DataService;