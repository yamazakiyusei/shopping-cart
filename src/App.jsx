import React, { useState, useEffect } from 'react';
import './App.css';
import AddItemForm from './components/AddItemForm';
import CartList from './components/CartList';
import SavedCartsList from './components/SavedCartsList';
import { ShoppingCart, Archive } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

function App() {
  // LocalStorageから初期データを取得
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('multi-cart-items');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [savedCarts, setSavedCarts] = useState(() => {
    const saved = localStorage.getItem('multi-cart-saved-lists');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState('cart'); // 'cart' or 'saved'

  // ステートが変更されるたびにLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('multi-cart-items', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('multi-cart-saved-lists', JSON.stringify(savedCarts));
  }, [savedCarts]);

  // カートの操作
  const handleAddToCart = (item) => {
    setCartItems(prev => [item, ...prev]);
    setActiveTab('cart');
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    setCartItems(prev => 
      prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    if (window.confirm('現在のカートの中身をすべて削除しますか？')) {
      setCartItems([]);
    }
  };

  // カート全体の保存操作
  const handleSaveCart = (name, items, total) => {
    const newSavedCart = {
      id: uuidv4(),
      name,
      items: [...items], // コピーを保存
      total,
      savedAt: Date.now()
    };
    
    setSavedCarts(prev => [newSavedCart, ...prev]);
    alert(`「${name}」を保存しました`);
    setActiveTab('saved');
  };

  const handleRemoveSavedCart = (id) => {
    if (window.confirm('この保存済みカートを削除してもよろしいですか？')) {
      setSavedCarts(prev => prev.filter(cart => cart.id !== id));
    }
  };

  const handleRestoreCart = (cart) => {
    if (cartItems.length > 0) {
      if (!window.confirm('現在のカートの中身が上書きされます。よろしいですか？（現在のカートは消去されます）')) {
        return;
      }
    }
    
    // itemsのidを新しく振り直す（重複防止）
    const restoredItems = cart.items.map(item => ({
      ...item,
      id: uuidv4(),
      addedAt: Date.now()
    }));
    
    setCartItems(restoredItems);
    alert(`「${cart.name}」をカートに復元しました`);
    setActiveTab('cart');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Multi-Cart Estimator</h1>
        <p>複数のECサイトの商品をまとめて予算を見積もる</p>
      </header>

      <main className="main-grid">
        <div className="main-content">
          <AddItemForm onAdd={handleAddToCart} />
          
          <div className="tabs" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              className={`btn ${activeTab === 'cart' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('cart')}
              style={{ flex: 1, backgroundColor: activeTab !== 'cart' && 'rgba(255,255,255,0.1)' }}
            >
              <ShoppingCart size={18} /> 現在のカート ({cartItems.length})
            </button>
            <button 
              className={`btn ${activeTab === 'saved' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('saved')}
              style={{ flex: 1, backgroundColor: activeTab !== 'saved' && 'rgba(255,255,255,0.1)' }}
            >
              <Archive size={18} /> 保存済みリスト ({savedCarts.length})
            </button>
          </div>

          {activeTab === 'cart' ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title"><ShoppingCart size={20} /> カート一覧</h2>
                {cartItems.length > 0 && (
                  <button className="btn btn-danger" onClick={handleClearCart} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    すべてクリア
                  </button>
                )}
              </div>
              <CartList 
                items={cartItems} 
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemoveFromCart}
                onSaveCart={handleSaveCart}
              />
            </>
          ) : (
            <SavedCartsList 
              savedCarts={savedCarts}
              onRemoveCart={handleRemoveSavedCart}
              onRestoreCart={handleRestoreCart}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
