import { NextResponse } from "next/server";

let excludedSites = ["youtube.com"];

export async function POST(request: Request) {
  let { question } = await request.json();

  const finalQuestion = `what is ${question}`;

  const JINA_API_KEY = process.env["JINA_API_KEY"];
  if (!JINA_API_KEY) {
    throw new Error("JINA_API_KEY is required");
  }

  const res = await fetch(
    `https://s.jina.ai/${encodeURIComponent(finalQuestion)}`,
    {
      headers: {
        Authorization: `Bearer ${JINA_API_KEY}`,
        Accept: "application/json",
      },
    },
  );

  if (!res.ok) {
    throw new Error(`Jina search failed: ${res.status} ${res.statusText}`);
  }

  const { data } = (await res.json()) as {
    data: { title: string; url: string; content: string }[];
  };

  let mappedResults = data
    .filter(
      (result) =>
        !excludedSites.some((site) => result.url.includes(site)),
    )
    .slice(0, 9)
    .map((result) => ({
      name: result.title,
      url: result.url,
      content: result.content.slice(0, 10000),
    }));

  return NextResponse.json(mappedResults);
}
