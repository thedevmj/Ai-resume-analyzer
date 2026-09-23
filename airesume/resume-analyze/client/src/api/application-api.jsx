import axios from "axios";
import { API_URL } from "../config";

const login_url=`${API_URL}/auth/`;

export const createuser=(data)=>{
return axios.post(`${login_url}register`,data);
}
export const loginuser=(data)=>{
return axios.post(`${login_url}login`,data);
}