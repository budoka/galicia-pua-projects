import { All, Controller, HttpException, HttpStatus, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiService } from './api.service';
import { ApiRequest } from './types/types';

@Controller()
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @All(['/:api/:version/:resource/*?', '/:api/:version/:resource', '/:api/:resource/*?', '/:api/:resource'])
  async handleRoute(@Req() req: Request, @Res() res: Response) {
    const request: ApiRequest = {
      verb: req.method,
      api: req.params.api,
      version: req.params.version,
      resource: req.params.resource,
      params: req.params[0],
      query: req.query,
      data: req.body,
    };

    try {
      const response = await this.apiService.request(request);
      // Se parsea la respuesta si es number para que express no lo interprete como un código de estado (status).
      const parsedData = typeof response.data === 'number' ? `${response.data}` : response.data;
      res.status(response.status).send(parsedData);
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
