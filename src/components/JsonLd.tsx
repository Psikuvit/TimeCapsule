export default function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "TimeCapsule",
    "description": "Create and schedule time capsule messages to your future self. Capture moments, set goals, and reflect on your journey over time.",
    "url": "https://time-capsule-xi.vercel.app",
    "applicationCategory": "Productivity",
    "operatingSystem": "Web Browser",
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Plan",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Up to 10 time capsule messages"
      },
      {
        "@type": "Offer",
        "name": "Premium Plan",
        "description": "Unlimited time capsule messages and priority support"
      }
    ],
    "author": {
      "@type": "Organization",
      "name": "TimeCapsule",
      "email": "nacer.msi1@gmail.com"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "nacer.msi1@gmail.com",
      "contactType": "Customer Support"
    },
    "featureList": [
      "Create time capsule messages",
      "Schedule delivery to future self",
      "Secure message storage",
      "User authentication",
      "Premium unlimited plans"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
