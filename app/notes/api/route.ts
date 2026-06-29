import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  console.log("this is the request", request);
  return NextResponse.json({ message: "Done" });
}
