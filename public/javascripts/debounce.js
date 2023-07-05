export default (func, delay) => {
  let timeout;
  return (...args) => {
    if (timeout) { clearTimeout(timeout) } // If they start typing again, reset clock
    timeout = setTimeout(() => func.apply(null, args), delay)
  }
}