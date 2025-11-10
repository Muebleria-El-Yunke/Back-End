export function formatFullName(input: string): string {
	// Limpiar y formatear
	const cleaned = substitutionAccents(input)
		.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ´\s]/g, "") // solo letras válidas
		.replace(/\s+/g, " ") // normalizar espacios
		.trim()
		.toLowerCase();

	// Capitalizar
	return cleaned
		.split(" ")
		.map((word) => word.charAt(0).toLocaleUpperCase("es-ES") + word.slice(1))
		.join(" ");
}

export function formatWords(input: string): string {
	const normalizeSpaces = (text: string) => text.replace(/\s+/g, " ").trim();

	const formatPunctuationSpacing = (text: string) => {
		return (
			text
				// Espacio después de puntuaciones (excepto puntos suspensivos)
				.replace(/([.,;:!?])(?=\S)/g, "$1 ")
				// Quitar espacio antes de puntuaciones
				.replace(/\s+([.,;:!?])/g, "$1")
				// Manejo correcto de paréntesis y signos de apertura
				.replace(/([¿¡([{])\s+/g, "$1")
				// Espacio después de signos de cierre (si no es fin de párrafo)
				.replace(/([?!.,;])(?=\w)/g, "$1 ")
				// Espacio después de paréntesis de cierre (si no es fin)
				.replace(/([)\]}])(?=\w)/g, "$1 ")
				// Limpia espacio antes de cierre
				.replace(/\s+([)\]}])/g, "$1")
				// Espacios antes de apertura
				.replace(/\s+([¿¡])/g, "$1")
				// Espacios innecesarios entre símbolos
				.replace(/([¿¡])\s+/g, "$1")
				.replace(/\s+([?!])/g, "$1")
		);
	};

	const capitalizeAfterPunctuation = (text: string) => {
		return text.replace(/(?:^|[.!?]\s+)(\p{Ll})/gu, (match, p1) =>
			match.replace(p1, p1.toUpperCase()),
		);
	};
	const cleanQuotes = (text: string) => text.replace(/\s*(['"“”‘’])\s*/g, "$1");
	const formatUnits = (text: string) => text.replace(/(\d)\s+(kg|m|°C|cm|km|g|ml)/gi, "$1 $2");

	let result = input;

	result = substitutionAccents(result);
	result = normalizeSpaces(result);
	result = formatPunctuationSpacing(result);
	result = capitalizeAfterPunctuation(result);
	result = cleanQuotes(result);
	result = formatUnits(result);

	return result.trim();
}

function substitutionAccents(input: string) {
	const accentFix: Record<string, string> = {
		À: "Á",
		È: "É",
		Ì: "Í",
		Ò: "Ó",
		Ù: "Ú",
		à: "á",
		è: "é",
		ì: "í",
		ò: "ó",
		ù: "ú",
	};

	// Reemplazar caracteres incorrectos por los correctos
	const replaced = input.replace(/[ÀÈÌÒÙàèìòù]/g, (char) => accentFix[char] || "");
	return replaced;
}
