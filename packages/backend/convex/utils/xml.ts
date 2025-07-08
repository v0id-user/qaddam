export function objectToXml(obj: any, rootTag = "root"): string {
	function build(value: any, tagName: string): string {
		if (value === null || value === undefined) return `<${tagName}/>`;
		if (typeof value !== "object")
			return `<${tagName}>${escapeXml(String(value))}</${tagName}>`;

		let attributes = "";
		let children = "";

		for (const [key, val] of Object.entries(value)) {
			if (key.startsWith("@")) {
				// Handle attributes like "@id": "123"
				const attrName = key.slice(1);
				attributes += ` ${attrName}="${escapeXml(String(val))}"`;
			} else if (key === "#text") {
				children += escapeXml(String(val));
			} else if (Array.isArray(val)) {
				children += val.map((v) => build(v, key)).join("");
			} else {
				children += build(val, key);
			}
		}

		return `<${tagName}${attributes}>${children}</${tagName}>`;
	}

	function escapeXml(str: string): string {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&apos;");
	}

	return build(obj, rootTag);
}
