import { Injectable } from '@nestjs/common';
import axiosInstance from './utils/axios';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getProvinces(): Promise<any[]> {
    return (await axiosInstance.get('?depth=2')).data;
  }
}
