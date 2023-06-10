import { Injectable } from '@nestjs/common';
import axiosInstance from 'src/utils/axios';

@Injectable()
export class ProvinceService {
  async getProvinces(): Promise<any[]> {
    return (await axiosInstance.get('?depth=2')).data;
  }
}
