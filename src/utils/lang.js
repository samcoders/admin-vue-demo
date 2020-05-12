export function generateTitle(title) {
  const hasKey = this.$te('router.' + title);
  if (hasKey) {
    return this.$t('router.' + title)
  }

  return title
}