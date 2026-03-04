import { fetchConfigs, isValidSite } from "@otl-core/engine-next-utils";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * security.txt - Security contact information (RFC 9116)
 * Provides a standard way for security researchers to report vulnerabilities.
 * Uses structured security_txt config fields, with fallback to organization email.
 */
export async function GET() {
  try {
    const configs = await fetchConfigs();

    const lines: string[] = ["# Security Policy (RFC 9116)"];
    let languagesLine = "Preferred-Languages: en";

    if (isValidSite(configs)) {
      const secTxt = configs.website.security_txt;
      const orgEmail = configs.website.organization?.email;

      // Contact: use security_txt.contact_email, fallback to org email
      const contactEmail = secTxt?.contact_email || orgEmail;
      if (contactEmail) {
        lines.push(`Contact: mailto:${contactEmail}`);
      } else {
        lines.push(
          "# Contact: Not configured -- set security contact or organization email in CMS",
        );
      }

      // Policy
      if (secTxt?.policy_url) {
        lines.push(`Policy: ${secTxt.policy_url}`);
      }

      // Encryption
      if (secTxt?.encryption_url) {
        lines.push(`Encryption: ${secTxt.encryption_url}`);
      }

      // Hiring
      if (secTxt?.hiring_url) {
        lines.push(`Hiring: ${secTxt.hiring_url}`);
      }

      // Acknowledgments
      if (secTxt?.acknowledgments_url) {
        lines.push(`Acknowledgments: ${secTxt.acknowledgments_url}`);
      }

      // Preferred-Languages from supported locales
      const locales = configs.site.supported_locales;
      if (locales && locales.length > 0) {
        languagesLine = `Preferred-Languages: ${locales.join(", ")}`;
      }
    } else {
      lines.push("# Contact: Not configured -- set organization email in CMS");
    }

    // Expires: 1 year from now (required by RFC 9116)
    const expires = new Date(
      Date.now() + 365 * 24 * 60 * 60 * 1000,
    ).toISOString();

    lines.push(`Expires: ${expires}`);
    lines.push(languagesLine);

    const securityTxt = lines.join("\n") + "\n";

    return new NextResponse(securityTxt, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("[ERROR] Failed to generate security.txt:", error);
    return new NextResponse("# Security contact not available\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }
}
