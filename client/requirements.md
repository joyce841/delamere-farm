## Packages
framer-motion | Page transitions, entry animations, and hover effects
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging tailwind classes without conflicts

## Notes
- Using JWT authentication stored in localStorage.
- All API requests use `apiFetch` wrapper to attach the `Authorization: Bearer <token>` header.
- Images are primarily Unsplash stock photos relevant to agriculture and farming.
- `kenyanCounties` is imported from `@shared/schema` to populate select dropdowns.
- `buildUrl` and `api` contracts are imported from `@shared/routes`.
