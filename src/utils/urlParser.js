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

    // 2. プロキシAPI (allorigins) を使ってHTMLを直接取得し、価格の抽出を試みる
    // ※注意: Amazonなどの大手サイトはbot対策でプロキシ経由のアクセスを弾く場合があるためベストエフォートです。
    try {
      const htmlResponse = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(urlStr)}`);
      const htmlData = await htmlResponse.json();
      
      if (htmlData.contents) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlData.contents, "text/html");

        let extractedPrice = '';

        // ドメイン別の価格抽出ロジック
        if (urlStr.includes('amazon')) {
          // Amazonの価格要素
          const amzPrice = doc.querySelector('.a-price-whole') || doc.querySelector('#priceblock_ourprice') || doc.querySelector('.a-color-price');
          if (amzPrice) extractedPrice = amzPrice.textContent;
        } else if (urlStr.includes('rakuten')) {
          // 楽天の価格要素
          const rakutenPrice = doc.querySelector('.price2') || doc.querySelector('[itemprop="price"]');
          if (rakutenPrice) extractedPrice = rakutenPrice.getAttribute('content') || rakutenPrice.textContent;
        } else if (urlStr.includes('yahoo')) {
          // Yahoo!ショッピングの価格要素
          const yahooPrice = doc.querySelector('.Price__value') || doc.querySelector('.elPriceValue');
          if (yahooPrice) extractedPrice = yahooPrice.textContent;
        }

        // 共通: OGPメタタグからの抽出
        if (!extractedPrice) {
          const metaPrice = doc.querySelector('meta[property="product:price:amount"]') || doc.querySelector('meta[name="twitter:data1"]');
          if (metaPrice) extractedPrice = metaPrice.getAttribute('content');
        }

        // 余計な文字（￥、カンマ、円など）を取り除いて数字のみにする
        if (extractedPrice) {
          const numericPrice = extractedPrice.replace(/[^0-9]/g, '');
          if (numericPrice) {
            result.price = numericPrice;
          }
        }

        // もしMicrolinkでタイトルが取れなかった場合、HTMLから直接補完
        if (!result.title) {
          const titleTag = doc.querySelector('title');
          if (titleTag) result.title = titleTag.textContent;
        }
      }
    } catch (e) {
      console.log('Price scraping failed (Proxy blocked or network error):', e);
    }

    return result;
  } catch (error) {
    console.error("Failed to fetch URL info:", error);
    return null;
  }
};
