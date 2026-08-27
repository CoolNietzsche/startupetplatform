import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { certificateService } from "@/lib/services/certificate.service";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      startupName,
      certificateLevel,
      startDate,
      endDate,
      qrCodeDataUrl,
      ministryLogoUrl,
      companyLogoUrl,
      certificateType,
    } = body;

    if (!startupName || !certificateLevel || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const pdfBuffer = await certificateService.generatePDF({
      startupName,
      certificateLevel,
      startDate,
      endDate,
      qrCodeDataUrl,
      ministryLogoUrl,
      companyLogoUrl,
      certificateType,
    });

    const filename = `certificate-${startupName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF", details: (error as Error).message },
      { status: 500 },
    );
  }
}
