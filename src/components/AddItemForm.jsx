import React, { useState } from 'react';
import { Plus, Link2, Loader2, Info } from 'lucide-react';
import { parseUrl, fetchUrlInfo } from '../utils/urlParser';
import { v4 as uuidv4 } from 'uuid';
import './AddItemForm.css'; // Add minimal CSS for the form

const AddItemForm = ({ onAdd }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  
  // フォームのステート
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [siteInfo, setSiteInfo] = useState(null);

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    
    // 1. URLからサイト情報を解析
    const parsedSiteInfo = parseUrl(url);
    setSiteInfo(parsedSiteInfo);
    
    // 2. OGP情報を取得 (モックAPI)
    const urlInfo = await fetchUrlInfo(url);
    
    if (urlInfo) {
      setTitle(urlInfo.title || '');
      setImageUrl(urlInfo.image || '');
    }
    
    setIsLoading(false);
    setShowManualForm(true); // 詳細入力フォームを表示
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    
    if (!title || !price) {
      alert("商品名と価格を入力してください");
      return;
    }
    
    const newItem = {
      id: uuidv4(),
      url,
      title,
      price: parseInt(price, 10),
      imageUrl,
      siteInfo: siteInfo || parseUrl(url),
      quantity: 1,
      addedAt: Date.now()
    };
    
    onAdd(newItem);
    
    // フォームリセット
    setUrl('');
    setTitle('');
    setPrice('');
    setImageUrl('');
    setSiteInfo(null);
    setShowManualForm(false);
  };

  return (
    <div className="glass-panel form-container">
      <h2 className="section-title">
        <Plus size={20} />
        商品をカートに追加
      </h2>
      
      {!showManualForm ? (
        <form onSubmit={handleUrlSubmit} className="url-form">
          <p className="form-help">
            <Info size={16} />
            商品のURLを入力してください。サイト名や画像が自動取得されます。
          </p>
          <div className="input-group">
            <div className="input-with-icon">
              <Link2 size={18} className="input-icon" />
              <input
                type="url"
                className="input-field"
                placeholder="https://amazon.co.jp/... または https://rakuten.co.jp/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading || !url}>
              {isLoading ? <Loader2 className="spin" size={18} /> : '次へ'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleFinalSubmit} className="manual-form fade-in">
          <div className="site-badge-preview" style={{ backgroundColor: siteInfo?.color }}>
            {siteInfo?.siteName}
          </div>
          
          <div className="form-group">
            <label>商品名 <span className="required">*</span></label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>価格 (円) <span className="required">*</span></label>
            <input
              type="number"
              className="input-field"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              required
              placeholder="例: 1500"
            />
          </div>
          
          <div className="form-group">
            <label>画像URL (任意)</label>
            <input
              type="url"
              className="input-field"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          
          {imageUrl && (
            <div className="image-preview">
              <img src={imageUrl} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowManualForm(false)}>
              戻る
            </button>
            <button type="submit" className="btn btn-primary">
              カートに追加
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddItemForm;
