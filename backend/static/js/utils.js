export function validateEmail(email) {
    return email.includes('@');
}

export function validatePassword(password) {
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    return password.length >= 6 && specialCharRegex.test(password);
}