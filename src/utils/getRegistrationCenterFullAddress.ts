import { IRegistrationCenter } from 'src/interfaces/registrationCenter.interface';
import { RegistrationCenter } from 'src/schemas/registration-center.schema';

function getRegistrationCenterFullAddress(
  registrationCenter: RegistrationCenter | IRegistrationCenter,
  provinceInfos: any,
): string {
  const province = provinceInfos.find(
    (province) => province.code === registrationCenter.provinceCode,
  );
  const district = province.districts.find(
    (district) => district.code === registrationCenter.districtCode,
  );
  return `${province.name}, ${district.name}, ${registrationCenter.location}`;
}

export default getRegistrationCenterFullAddress;
