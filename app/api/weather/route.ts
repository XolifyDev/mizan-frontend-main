"use server";

import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
        return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const response = await fetch(
    `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${q}&aqi=yes`
    );

    const data = await response.json();

    return NextResponse.json(data);
}