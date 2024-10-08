export function debounce(func: Function, delay: number) {
  let timeout: any;
  return function (...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
