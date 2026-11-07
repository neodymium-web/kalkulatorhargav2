export const socialSources = {
  sprout: { title: 'Sprout Social API: definisi metrik engagement', url: 'https://api.sproutsocial.com/docs' },
  engagement: { title: 'Hootsuite: engagement menurut reach dan followers', url: 'https://blog.hootsuite.com/calculate-engagement-rate/' },
  growth: { title: 'Socialinsider: rumus pertumbuhan pengikut', url: 'https://www.socialinsider.io/blog/how-to-calculate-follower-growth/' },
  cpm: { title: 'Google Ads: CPM', url: 'https://support.google.com/google-ads/answer/6310?hl=en' },
  cpc: { title: 'Google Ads: average CPC', url: 'https://support.google.com/google-ads/answer/14074?hl=en' },
  cpa: { title: 'Google Ads: average CPA', url: 'https://support.google.com/google-ads/answer/6396841?hl=en' },
  attribution: { title: 'Google Ads: conversion windows', url: 'https://support.google.com/google-ads/answer/3123169?hl=en' },
} as const
export type SocialSourceId = keyof typeof socialSources
