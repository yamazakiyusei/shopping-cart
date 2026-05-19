/**
 * URLからサイトの情報を解析するユーティリティ
 */

// サポートするサイトの定義
const SITE_DEFINITIONS = [
  {
    name: 'Amazon',
    domains: ['amazon.co.jp', 'amazon.com', 'amzn.to'],
    color: 'var(--color-amazon)',
    logoText: 'Amazon'
  },
  {
    name: '楽天',
    domains: ['rakuten.co.jp', 'item.rakuten.co.jp'],
    color: 'var(--color-rakuten)',
    logoText: 'Rakuten'
  },
  {
    name: 'Yahoo!ショッピング',
    domains: ['shopping.yahoo.co.jp', 'store.shopping.yahoo.co.jp'],
    color: 'var(--color-yahoo)',
    logoText: 'Yahoo!'
  }
];

export const parseUrl = (urlStr) => {
  try {
    const url = new URL(urlStr);
    const domain = url.hostname.replace(/^www\./, '');
    
    // サイト定義から検索
    const site = SITE_DEFINITIONS.find(s => s.domains.some(d => domain.includes(d)));
    
    if (site) {
      return {
        siteName: site.name,
        color: site.color,
        logoText: site.logoText,
        domain
      };
    }
    
    // 未知のサイトの場合
    return {
      siteName: domain,
      color: 'var(--color-other)',
      logoText: 'WEB',
      domain
    };
  } catch (e) {
    // URLが無効な場合
    return {
      siteName: 'Unknown',
      color: 'var(--color-other)',
      logoText: '?',
      domain: ''
    };
  }
};

/**
 * 簡易的なOGP取得モック (実際はバックエンドや専用APIが必要)
 * 今回はフリーAPI (例: microlink API) を使ってタイトルと画像を取得してみる
 */
export const fetchUrlInfo = async (urlStr) => {
  try {
    // 1. Microlink APIを利用してタイトルや画像などのメタデータを取得
    const apiUrl = `https://api.microlink.io/?url=${encodeURIComponent(urlStr)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    let result = {
      title: '',
      image: '',
      description: '',
      price: ''
    };

    if (data.status === 'success') {
      result.title = data.data.title || '';
      result.image = data.data.image?.url || data.data.logo?.url || '';
      result.description = data.data.description || '';
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch URL info:", error);
    return null;
  }
};
