import { HeaderConfig } from "@otl-core/cms-types";
import Link from "next/link";

interface LogoProps {
  navigation: HeaderConfig;
  siteName: string;
  logoTextColor?: string;
}

export function Logo({ navigation, siteName, logoTextColor }: LogoProps) {
  return (
    <Link href="/" className="flex-shrink-0">
      {navigation.logo?.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={navigation.logo.url}
          alt={navigation.logo.alt || siteName}
          width={navigation.logo.width}
          height={navigation.logo.height}
          className="h-auto w-auto"
          style={{
            height: navigation.logo.height
              ? `${navigation.logo.height}px`
              : "40px",
          }}
        />
      ) : navigation.logo?.alt ? (
        <span
          className="text-xl font-bold"
          style={logoTextColor ? { color: logoTextColor } : undefined}
        >
          {navigation.logo.alt}
        </span>
      ) : (
        <span
          className="text-xl font-bold"
          style={logoTextColor ? { color: logoTextColor } : undefined}
        >
          {siteName}
        </span>
      )}
    </Link>
  );
}
