export function truncateString(str, maxLength = 40) {
    if (str == null)
        return str;
    return str.length > maxLength ? str.substring(0, maxLength) : str;
}
//# sourceMappingURL=string.js.map