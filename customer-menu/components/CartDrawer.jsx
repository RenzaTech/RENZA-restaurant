'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Bell,
  CheckCircle2,
  Sparkles,
  Receipt,
  Utensils,
} from 'lucide-react';
import { getDishImagePair } from './DishDetailModal';

function VegBadge({ isVeg }) {
  if (isVeg === true || isVeg === 1 || isVeg === 'veg') {
    return (
      <span
        title="Vegetarian"
        className="w-3.5 h-3.5 rounded-sm border border-emerald-600 flex items-center justify-center shrink-0 bg-white"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
      </span>
    );
  }

  return (
    <span
      title="Non-Vegetarian"
      className="w-3.5 h-3.5 rounded-sm border border-rose-600 flex items-center justify-center shrink-0 bg-white"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
    </span>
  );
}

function formatPrice(price) {
  if (price === undefined || price === null) return '';
  const num = Number(price);
  if (isNaN(num)) return price;
  return num % 1 === 0 ? `₹${num}` : `₹${num.toFixed(2)}`;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart = {},
  onUpdateQuantity,
  onClearCart,
  tableNumber = 'Table 1',
}) {
  const [cookingNotes, setCookingNotes] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);

  if (!isOpen) return null;

  const cartEntries = Object.entries(cart);
  const totalItemCount = cartEntries.reduce((sum, [, item]) => sum + item.quantity, 0);
  const subtotal = cartEntries.reduce(
    (sum, [, item]) => sum + (Number(item.dish.price) || 0) * item.quantity,
    0
  );
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;

  const handleNotifyWaiter = () => {
    setOrderSubmitted(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-200/90 animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#FFBB17]/15 border border-[#FFBB17]/40 flex items-center justify-center text-[#92400E]">
              <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900 font-sans tracking-tight">
                  Your Order Cart
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFBB17] text-gray-950">
                  {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-sans mt-0.5 font-bold">
                {tableNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cartEntries.length > 0 && !orderSubmitted && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-2 py-1 rounded-lg hover:bg-rose-50 transition"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        {orderSubmitted ? (
          <div className="p-8 text-center flex flex-col items-center justify-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-[#FFBB17]/20 border-2 border-[#FFBB17] flex items-center justify-center text-gray-950 animate-bounce">
              <Bell className="w-8 h-8 fill-[#FFBB17]" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-gray-900">
                Waiter Notified!
              </h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed font-sans">
                Your order of <strong>{totalItemCount} items ({formatPrice(grandTotal)})</strong> has been sent to the service staff for <strong>{tableNumber}</strong>. A waiter will confirm it shortly.
              </p>
            </div>

            <div className="w-full pt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setOrderSubmitted(false);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black transition shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        ) : cartEntries.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center my-auto space-y-3">
            <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400">
              <Utensils className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800 font-sans">
                Your cart is empty
              </h3>
              <p className="text-xs text-gray-400 mt-1 font-sans">
                Browse our categories and tap &ldquo;+ Add&rdquo; to add delicious items.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 py-2.5 px-5 rounded-xl bg-[#FFBB17] text-gray-950 font-bold text-xs hover:bg-[#E5A710] transition shadow-sm"
            >
              Explore Menu
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {/* Items List */}
            <div className="space-y-3">
              {cartEntries.map(([key, item]) => {
                const dish = item.dish;
                const isVeg = dish.isVeg === true || dish.isVeg === 1 || dish.dietary === 'veg';
                const image = getDishImagePair(dish).sideView;
                const itemTotal = (Number(dish.price) || 0) * item.quantity;

                return (
                  <div
                    key={key}
                    className="p-3 bg-white border border-gray-200/90 rounded-2xl flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200/80">
                      <img
                        src={image}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <VegBadge isVeg={isVeg} />
                        <h4 className="text-xs font-bold text-gray-900 truncate font-sans">
                          {dish.name}
                        </h4>
                      </div>
                      <span className="text-[11px] text-gray-500 font-sans">
                        {formatPrice(dish.price)} each
                      </span>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-2 bg-[#FFF8E7] border border-[#FFBB17]/40 rounded-xl px-2 py-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(key, -1)}
                        className="w-6 h-6 rounded-lg bg-white shadow-xs flex items-center justify-center text-gray-800 hover:bg-gray-100 transition active:scale-90"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <span className="text-xs font-bold text-gray-900 w-4 text-center font-sans">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(key, 1)}
                        className="w-6 h-6 rounded-lg bg-[#FFBB17] text-gray-950 shadow-xs flex items-center justify-center hover:bg-[#E5A710] transition active:scale-90"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right w-14 shrink-0">
                      <span className="text-xs font-bold text-gray-900 font-sans">
                        {formatPrice(itemTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Instructions */}
            <div className="p-3 bg-white border border-gray-200/90 rounded-2xl space-y-1.5">
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider font-sans">
                Kitchen Note <span className="text-gray-400 font-normal lowercase">(optional)</span>
              </label>
              <input
                type="text"
                value={cookingNotes}
                onChange={(e) => setCookingNotes(e.target.value)}
                placeholder="e.g., Less spicy, no ice in juice, extra napkins..."
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#FFBB17] transition"
              />
            </div>

            {/* Bill Details Summary */}
            <div className="p-4 bg-white border border-gray-200/90 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wider font-sans block">
                Bill Summary
              </span>

              <div className="flex items-center justify-between text-xs text-gray-600 font-sans">
                <span>Item Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600 font-sans">
                <span className="flex items-center gap-1">
                  <span>Taxes (5% GST)</span>
                </span>
                <span>{formatPrice(gst)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold font-sans">
                <span>Dine-In Service</span>
                <span>FREE</span>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between font-bold text-sm text-gray-900 font-sans">
                <span>Grand Total</span>
                <span className="text-base text-gray-900 font-sans">
                  {formatPrice(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Action Footer */}
        {!orderSubmitted && cartEntries.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-white shrink-0 space-y-2">
            <button
              type="button"
              onClick={handleNotifyWaiter}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#FFBB17] hover:bg-[#E5A710] text-gray-950 font-bold text-sm tracking-wide transition shadow-md flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Bell className="w-4 h-4 fill-gray-950" />
              <span>Notify Waiter with Order ({formatPrice(grandTotal)})</span>
            </button>
            <p className="text-[10.5px] text-center text-gray-400 font-sans">
              A waiter will come to your table to take your final order confirmation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
