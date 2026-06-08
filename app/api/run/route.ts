import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { source_code, language_id } = await req.json();

  const response = await fetch(
    `${process.env.JUDGE0_URL}/submissions?base64_encoded=false&wait=true`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source_code,
        language_id,
      }),
    }
  );

  const result = await response.json();

  return NextResponse.json(result);
}