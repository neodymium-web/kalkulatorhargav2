export const creatorSources = {
  ctr: { title: 'Google Ads: definisi CTR', url: 'https://support.google.com/google-ads/answer/2615875?hl=en' },
  rpm: { title: 'YouTube: RPM kreator dan CPM pengiklan', url: 'https://support.google.com/youtube/answer/9314357?hl=en' },
  watch: { title: 'YouTube Analytics: metrik waktu tonton', url: 'https://developers.google.com/youtube/analytics/metrics' },
  tiktok: { title: 'TikTok Newsroom: pengumuman Creator Rewards 18 Maret 2024 (konteks historis)', url: 'https://newsroom.tiktok.com/introducing-the-new-creator-rewards-program?lang=en' },
  engagement: { title: 'Sprout Social API: definisi metrik analitik', url: 'https://api.sproutsocial.com/docs' },
  margin: { title: 'OpenStax: biaya, harga jual dan rasio margin', url: 'https://openstax.org/books/principles-managerial-accounting/pages/3-1-explain-contribution-margin-and-calculate-contribution-margin-per-unit-contribution-margin-ratio-and-total-contribution-margin' },
} as const
export type CreatorSourceId = keyof typeof creatorSources
