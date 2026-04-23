import React from 'react';
import { ExternalLink, Trash2, BookmarkPlus, Minus, Plus } from 'lucide-react';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove, onBookmark, isBookmarkView }) => {
  const { title, price, imageUrl, url, siteInfo, quantity } = item;

  const formattedPrice = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price);
  
  return (
    <div className="glass-panel cart-item">
      <div className="cart-item-image">
        {imageUrl ? (
          <img src={imageUrl} alt={title} />
        ) : (
          <div className="no-image">{siteInfo.logoText}</div>
        )}
      </div>
      
      <div className="cart-item-content">
        <div className="cart-item-header">
          <span className="site-badge" style={{ backgroundColor: siteInfo.color }}>
            {siteInfo.siteName}
          </span>
          <a href={url} target="_blank" rel="noopener noreferrer" className="external-link">
            商品ページ <ExternalLink size={14} />
          </a>
        </div>
        
        <h3 className="cart-item-title" title={title}>{title}</h3>
        <div className="cart-item-price">{formattedPrice}</div>
        
        <div className="cart-item-actions">
          {!isBookmarkView && (
            <div className="quantity-control">
              <button 
                className="btn-icon small" 
                onClick={() => onUpdateQuantity(item.id, Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                <Minus size={14} />
              </button>
              <span className="quantity">{quantity}</span>
              <button 
                className="btn-icon small" 
                onClick={() => onUpdateQuantity(item.id, quantity + 1)}
              >
                <Plus size={14} />
              </button>
            </div>
          )}
          
          <div className="action-buttons">
            {!isBookmarkView && onBookmark && (
              <button 
                className="btn-icon" 
                onClick={() => onBookmark(item)}
                title="ブックマークに保存"
              >
                <BookmarkPlus size={18} />
              </button>
            )}
            <button 
              className="btn-icon danger" 
              onClick={() => onRemove(item.id)}
              title="削除"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
