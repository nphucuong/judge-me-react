import axios from "axios";
import { get } from 'lodash'

export const DEFAULT_TIMEOUT = 10 * 1000

const buildRequestConfig = async (config: any) => {
  config.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:3001/'

  return { ...config }
}

const requestBuilder = (options: Object = {}) => {
  const timeout = get(options, "timeout", DEFAULT_TIMEOUT);

  let request = axios.create({
    timeout,
  });

  request.interceptors.request.use(buildRequestConfig);

  return request;
};

export const request = requestBuilder();
