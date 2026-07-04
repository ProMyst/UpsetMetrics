import { NextResponse } from "next/server";

/**
 * Email signup endpoint for the Monday Edition.
 *
 * Two behaviors:
 *   1. If KIT_API_KEY is set → POST subscriber to Kit v4 API with the
 *      configured tag from KIT_TAG_MONDAY_EDITION.
 *   2. If not set → log the signup server-side and return success. The
 *      frontend shows the same success state either way, so we can
 *      collect intent even before Kit is wired.
 *
 * Miller will wire the KIT_API_KEY + KIT_TAG_MONDAY_EDITION in Vercel
 * env vars when the second Kit account is set up.
 */
export async function POST(req: Request) {
  let email = "";
  let source = "unknown";

  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const body = await req.json();
      email = String(body?.email || "").trim();
      source = String(body?.source || "newsletter-page").trim();
    } else {
      const form = await req.formData();
      email = String(form.get("email") || "").trim();
      source = String(form.get("source") || "newsletter-page").trim();
    }
  } catch {
    // fall through — invalid body
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }

  const key = process.env.KIT_API_KEY;
  const tagId = process.env.KIT_TAG_MONDAY_EDITION;

  if (!key) {
    console.warn(
      `[subscribe] KIT_API_KEY not set — stubbing signup ${email} from ${source}`,
    );
    return NextResponse.json({ ok: true, stubbed: true });
  }

  try {
    const res = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": key,
      },
      body: JSON.stringify({
        email_address: email,
        state: "active",
        fields: { signup_source: source },
      }),
    });

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("[subscribe] Kit rejected:", res.status, err);
      return NextResponse.json({ ok: false, error: "signup failed" }, { status: 502 });
    }

    const body = await res.json().catch(() => ({}));
    const subscriberId = body?.subscriber?.id;

    if (tagId && subscriberId) {
      await fetch(
        `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
        { method: "POST", headers: { "X-Kit-Api-Key": key } },
      ).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[subscribe] error:", e);
    return NextResponse.json({ ok: false, error: "server error" }, { status: 500 });
  }
}
