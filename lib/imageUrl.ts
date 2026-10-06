// Image addresses allowed in posts: a path on this site ("/media/..", "/blog/..") or an https URL.
// Anything else (javascript:, data:, protocol-relative "//host") is refused.
export const isImageUrl = (u: string) => /^\/(?!\/)[\w\-./%]+$/.test(u) || /^https:\/\/[^\s"'<>]+$/.test(u);
