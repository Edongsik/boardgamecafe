export const formatNumber = (num) => {
  return new Intl.NumberFormat('ko-KR').format(num);
};