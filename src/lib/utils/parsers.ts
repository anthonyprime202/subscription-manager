export function toCamelCase(str: string) {
	if (typeof str !== "string" || str.trim() === "") {
		return "";
	}

	return str
		.trim()
		.replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
		.replace(/\s+/g, " ") // Normalize multiple spaces
		.toLowerCase() // Make everything lowercase
		.split(" ") // Split into words
		.map((word, index) => {
			if (index === 0) return word;
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join("");
}
