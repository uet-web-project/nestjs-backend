function isIsoString(str: string): boolean {
  return /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/.test(
    str,
  );
}

export default isIsoString;
