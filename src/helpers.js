export function formatDate(dateStr) {
	if (dateStr) {
		let date = new Date(dateStr);
		return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
	}
	return '';
}