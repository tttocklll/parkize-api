export function formatData(data: any[], index: string[]) {
  const res = {};
  for (let i = 0; i < index.length; i++) {
    res[index[i]] = data[i];
  }
  return res;
}
