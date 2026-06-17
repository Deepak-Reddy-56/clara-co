import { verifyAuth, unauthorized, forbidden } from "@/lib/authUtils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 🔐 Authenticate and verify user is admin
  const auth = await verifyAuth(req);
  if (!auth) return unauthorized();
  if (!auth.isAdmin) return forbidden();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dc2a3idlt";
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || "unsigned_preset";

    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudinaryFormData,
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Cloudinary upload failed:", errorData);
      return NextResponse.json(
        { error: errorData.error?.message || "Failed to upload image" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ secure_url: data.secure_url });
  } catch (error: any) {
    console.error("Error in upload-image API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
