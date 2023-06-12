function excelJsonChecker(data) {
  if (
    !data.licensePlate ||
    !data.vehicleType ||
    !data.vin ||
    !data.manufacturer ||
    !data.model ||
    !data.version ||
    !data.registrationNumber ||
    !data.registrationDate ||
    !data.registrationCenterId ||
    !data.purpose ||
    !data.width ||
    !data.length ||
    !data.wheelBase ||
    !data.emission ||
    !data.mileage ||
    !data.vehicleOwnerCid ||
    !data.ownerName ||
    !data.ownerAddress ||
    !data.ownerType ||
    !data.ownerDob ||
    !data.ownerPhoneNumber
  ) {
    return false;
  }
  return true;
}

export default excelJsonChecker;
