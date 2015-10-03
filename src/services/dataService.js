import config from 'util/config';
import axios from 'axios';


export default {

    fetchPadList: () => {
        return axios.get(`${config.API_URL}/pads`)
            .then(res => res.data);
    },

    fetchPad: (id) => {
        return axios.get(`${config.API_URL}/pads/${id}`)
            .then(res => res.data);
    },

    createItem: (item) => {
        return axios.post(`${config.API_URL}/items`, item);
    },

    updateItem: (item) => {
        return axios.put(`${config.API_URL}/items/${item._id}`, item);
    },

    deleteItem: (item) => {
        return axios.delete(`${config.API_URL}/pads/${item._id}`);
    }

};