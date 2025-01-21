import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://BingAI.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://BingAI.vercel.app/settings',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://BingAI.vercel.app/workspace',
      lastModified: new Date(),
      changeFrequency: 'daily', 
      priority: 0.9,
    }
  ]
} 