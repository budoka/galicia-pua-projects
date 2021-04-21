import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ApiRequest, RequestConfig } from './types/types';
import { buildAxiosRequestConfig, parseVerb } from './utils';

@Injectable()
export class ApiService {
  /*  
 @Inject()
  private readonly logger: LoggingService;

  @Inject()
  private readonly galiciaHttpService: GaliciaHttpService;
 */
  async request(apiRequest: ApiRequest) {
    const { verb, api, version, resource, params, query, data } = apiRequest;

    try {
      /* const response = await this.galiciaHttpService.get(request.url).toPromise(); */

      const config: RequestConfig = { verb: parseVerb(verb), params, query, data };
      const axiosConfig = buildAxiosRequestConfig(api, version, resource, config);
      const response = await axios.request(axiosConfig);

      return response;
    } catch (error) {
      return error.response;
    }
  }
}
