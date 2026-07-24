const STELLAR_ADDRESS = /^G[A-Z2-7]{55}$/;

export async function GET() {
	const SHEET_URL = process.env.FEEDBACK_SHEET_URL;
	if (!SHEET_URL) return Response.json({ ok: true, items: [] });

	try {
		const res = await fetch(SHEET_URL, { cache: "no-store" });
		if (!res.ok) throw new Error(`Sheet responded ${res.status}`);

		const data = (await res.json()) as {
			items?: Array<Record<string, unknown>>;
		};

		// Strip the private `contact` field before returning to the browser.
		const items = (data.items ?? []).map((i) => ({
			at: String(i.at ?? ""),
			role: String(i.role ?? ""),
			rating: Number(i.rating ?? 0),
			liked: String(i.liked ?? ""),
			improve: String(i.improve ?? ""),
			wallet: String(i.wallet ?? ""),
		}));

		return Response.json({ ok: true, items });
	} catch (error) {
		return Response.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Failed to load",
				items: [],
			},
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	const SHEET_URL = process.env.FEEDBACK_SHEET_URL;

	try {
		const data = await request.json();
		const wallet = String(data.wallet ?? "").trim();

		if (!STELLAR_ADDRESS.test(wallet)) {
			return Response.json(
				{ ok: false, error: "Connect a valid Stellar wallet to leave feedback." },
				{ status: 400 }
			);
		}

		const payload = {
			at: new Date().toISOString(),
			role: String(data.role ?? ""),
			rating: Number(data.rating ?? 0),
			liked: String(data.liked ?? ""),
			improve: String(data.improve ?? ""),
			contact: String(data.contact ?? ""),
			wallet,
		};

		if (!SHEET_URL) {
			console.warn("FEEDBACK_SHEET_URL not set — feedback not stored:", payload);
			return Response.json(
				{ ok: false, error: "Feedback storage is not configured yet." },
				{ status: 503 }
			);
		}

		const res = await fetch(SHEET_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!res.ok) throw new Error(`Sheet responded ${res.status}`);

		return Response.json({ ok: true });
	} catch (error) {
		return Response.json(
			{
				ok: false,
				error: error instanceof Error ? error.message : "Failed to save feedback",
			},
			{ status: 500 }
		);
	}
}