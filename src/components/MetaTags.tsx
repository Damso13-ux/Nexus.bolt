import { useEffect } from 'react';

interface Props {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export default function MetaTags({ title, description, image, type = 'article' }: Props) {
  useEffect(() => {
    const prefix = 'Nexus -- Tech & Finance';
    const fullTitle = title ? `${title} | ${prefix}` : prefix;
    const desc = description || 'Le media premium de la tech et de la finance en France.';

    document.title = fullTitle;

    function setMeta(property: string, content: string) {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        if (property.startsWith('og:') || property.startsWith('twitter:')) {
          el.setAttribute('property', property);
        } else {
          el.setAttribute('name', property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    setMeta('og:title', fullTitle);
    setMeta('og:description', desc);
    setMeta('og:type', type);
    setMeta('description', desc);
    setMeta('twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('twitter:title', fullTitle);
    setMeta('twitter:description', desc);

    if (image) {
      setMeta('og:image', image);
      setMeta('twitter:image', image);
    }

    return () => {
      document.title = prefix;
    };
  }, [title, description, image, type]);

  return null;
}
