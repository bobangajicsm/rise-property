interface SocialIconProps {
  className?: string;
}

export function InstagramIcon({ className = "h-4 w-4" }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className = "h-4 w-4" }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.5 21v-7h2.3l.4-3h-2.7V9.1c0-.9.3-1.6 1.6-1.6H16V4.8c-.3 0-.9-.1-1.8-.1-2.7 0-4.2 1.6-4.2 4.5V11H7.5v3H10v7h3.5Z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "h-4 w-4" }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M6.9 8.4a1.9 1.9 0 1 1 0-3.8 1.9 1.9 0 0 1 0 3.8ZM5.2 9.8h3.3V20H5.2V9.8Zm5.2 0h3.1v1.4h.1c.4-.8 1.5-1.7 3.2-1.7 3.4 0 4 2.2 4 5.1V20h-3.3v-4.7c0-1.1 0-2.5-1.5-2.5s-1.8 1.2-1.8 2.4V20h-3.3V9.8Z" />
    </svg>
  );
}

export function XIcon({ className = "h-4 w-4" }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.9 3H22l-6.8 7.8L23 21h-6.2l-4.9-6.4L6.3 21H3.2l7.3-8.4L1 3h6.3l4.4 5.8L18.9 3Zm-1.1 16h1.7L6.3 4.9H4.5L17.8 19Z" />
    </svg>
  );
}

export function RedditIcon({ className = "h-4 w-4" }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20 11.2a2.2 2.2 0 0 0-3.8-1.5 8.3 8.3 0 0 0-3.9-1.3l.8-3.6 2.5.6a1.8 1.8 0 1 0 .3-1.2l-3-.7a.6.6 0 0 0-.7.5l-.9 4.2a8.7 8.7 0 0 0-4 1.4 2.2 2.2 0 1 0-1 4 4.4 4.4 0 0 0 0 .6c0 3 3.4 5.4 7.7 5.4s7.7-2.4 7.7-5.4a4.2 4.2 0 0 0 0-.6A2.2 2.2 0 0 0 20 11.2ZM8.9 13.1A1.2 1.2 0 1 1 10 12a1.2 1.2 0 0 1-1.1 1.1Zm6.9 3.2a4.8 4.8 0 0 1-3.8 1.5 4.8 4.8 0 0 1-3.8-1.5.6.6 0 1 1 .9-.8 3.8 3.8 0 0 0 2.9 1.1 3.8 3.8 0 0 0 2.9-1.1.6.6 0 1 1 .9.8Zm-.6-3.2a1.2 1.2 0 1 1 1.1-1.1 1.2 1.2 0 0 1-1.1 1.1Z" />
    </svg>
  );
}

export function TikTokIcon({ className = "h-4 w-4" }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M15.9 3c.3 1.8 1.4 3.4 3.1 4.2v2.5a7 7 0 0 1-3.1-.8v5.4a5.1 5.1 0 1 1-5.1-5.1h.4v2.6a2.6 2.6 0 1 0 2.2 2.5V3h2.5Z" />
    </svg>
  );
}
