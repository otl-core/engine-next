import type { Author, BlockComponentProps } from "@otl-core/cms-types";
import Image from "next/image";

interface AuthorInfoData extends Author {
  current_locale?: string;
}

interface AuthorInfoConfig extends Record<string, unknown> {
  title?: string;
  showAvatar?: boolean;
  showBio?: boolean;
  showSocial?: boolean;
  showCustomFields?: boolean;
  data?: AuthorInfoData;
}

interface AuthorInfoProps extends BlockComponentProps<AuthorInfoConfig> {
  config: AuthorInfoConfig;
}

function resolveLocalized(
  value: Record<string, string> | undefined,
  locale: string,
): string | undefined {
  if (!value) return undefined;
  return value[locale] ?? value["en"] ?? Object.values(value)[0];
}

export function AuthorInfoBlock({ config }: AuthorInfoProps) {
  const {
    title = "About the Author",
    showAvatar = true,
    showBio = true,
    showSocial = true,
    showCustomFields = false,
    data: author,
  } = config;

  const locale = author?.current_locale || "en";

  if (!author) return null;

  const bio = resolveLocalized(author.bio, locale);

  return (
    <div className="about-author border-t border-b border-border py-8 my-8">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>

      <div className="flex gap-4">
        {showAvatar && author.avatar_url && (
          <Image
            src={author.avatar_url}
            alt={author.name}
            width={80}
            height={80}
            className="rounded-full"
          />
        )}

        <div className="flex-1">
          <p className="font-bold text-lg">{author.name}</p>

          {showBio && bio && (
            <p className="text-muted-foreground mt-2">{bio}</p>
          )}

          {showSocial &&
            author.social_links &&
            author.social_links.length > 0 && (
              <div className="flex gap-4 mt-4">
                {author.social_links.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    className="text-primary hover:underline capitalize"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            )}

          {showCustomFields &&
            author.custom_fields &&
            Object.keys(author.custom_fields).length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {Object.entries(author.custom_fields).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
        </div>
      </div>
    </div>
  );
}
