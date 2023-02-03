
import axios from "axios";

const baseURL = 'http://localhost:9901';

export function getData() {
  return axios.get(baseURL + "/data")
}