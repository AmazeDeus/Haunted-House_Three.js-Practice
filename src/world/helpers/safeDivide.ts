/**
 * Divides two numbers, returning a fallback value if the denominator is near zero.
 * @param {number} numerator The number to be divided.
 * @param {number} denominator The number to divide by.
 * @param [fallback=0] The value to return if denominator is near zero.
 * @returns The result of the division or the fallback value.
 */
const safeDivide = (numerator: number, denominator: number, fallback = 0) => {
    // Check if the absolute value of the denominator is very small/close to zero
    // 1e-6 is shorthand for 0.000001 - a common small threshold
    if (Math.abs(denominator) < 1e-6) {
        return fallback // Return the fallback value
    } else {
        return numerator / denominator // Perform the normal division
    }
}

export { safeDivide }