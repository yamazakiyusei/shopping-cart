import React, { useState } from 'react';
import { ShoppingCart, Calculator, Save } from 'lucide-react';
import CartItem from './CartItem';
import './CartList.css';

const CartList = ({ items, onUpdateQuantity, onRemove, onSaveCart }) => {
  const [cartName, setCartName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const formattedTotal = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(totalAmount);

  const handleSave = (e) => {
    e.preventDefault();
    if (!cartName.trim()) {
      alert('カートの名前を入力してください');
      return;
    }
    onSaveCart(cartName, items, totalAmount);
    setCartName('');
    setIsSaving(false);
  };

  if (items.length === 0) {
    return (
      <div className="glass-panel empty-state">
        <ShoppingCart size={48} className="empty-icon" />
        <p>カートは空です。</p>
        <p className="empty-subtext">URLを入力して商品を追加してください。</p>
      </div>
    );
  }

  return (
    <div className="cart-list-container">
      {isSaving && (
        <div className="glass-panel save-dialog fade-in">
          <form onSubmit={handleSave} className="save-form">
            <label>このカートに名前を付けて保存</label>
            <div className="input-group">
              <input 
                type="text" 
                className="input-field" 
                placeholder="例：夏キャンプ用機材リスト" 
                value={cartName}
                onChange={(e) => setCartName(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn btn-primary">保存</button>
              <button type="button" className="btn" onClick={() => setIsSaving(false)}>キャンセル</button>
            </div>
          </form>
        </div>
      )}

      <div className="cart-items">
        {items.map(item => (
          <CartItem 
            key={item.id} 
            item={item} 
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>
      
      <div className="glass-panel summary-panel">
        <div className="summary-header">
          <h3 className="summary-title">
            <Calculator size={20} />
            お見積り合計
          </h3>
          <button className="btn btn-primary btn-save-cart" onClick={() => setIsSaving(true)}>
            <Save size={16} /> カートを保存する
          </button>
        </div>
        <div className="summary-total">
          {formattedTotal}
        </div>
        <div className="summary-meta">
          <span>商品数: {items.reduce((sum, item) => sum + item.quantity, 0)}点</span>
        </div>
      </div>
    </div>
  );
};

export default CartList;
