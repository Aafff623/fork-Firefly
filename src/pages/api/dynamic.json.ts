import { loadDynamicEntries } from "@/utils/load-dynamic-entries";

export async function GET(): Promise<Response> {
	const data = await loadDynamicEntries();
	return new Response(JSON.stringify(data), {
		headers: {
			"Content-Type": "application/json; charset=utf-8",
		},
	});
}
