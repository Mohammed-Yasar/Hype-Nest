import React, { useEffect, useState, useRef } from 'react';
import client from '../api/client';
import { Link, useNavigate } from 'react-router-dom';

const popularBrands = ['Nike', 'Adidas', 'Jordan', 'Supreme', 'Yeezy'];
const suggestedCategories = ['sneakers', 'streetwear', 'collectibles'];

const SearchOverlay: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [recent, setRecent] = useState<string[]>(() => JSON.parse(localStorage.getItem('recentSearches') || '[]'));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/') {
        const el = document.activeElement as HTMLElement | null;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };

    const onOpenEvent = () => {
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
    };

    document.addEventListener('keydown', onKey);
    window.addEventListener('openSearch', onOpenEvent as EventListener);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('openSearch', onOpenEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    let mounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await client.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
        if (mounted) setResults(res.data.products || []);
      } catch (err) {
        // ignore
      }
    }, 200);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [query]);

  const close = () => setOpen(false);

  const onSubmit = (q?: string) => {
    const text = q ?? query;
    if (!text) return;
    const updated = [text, ...recent.filter((r) => r !== text)].slice(0, 10);
    setRecent(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    setOpen(false);
    navigate(`/?search=${encodeURIComponent(text)}`);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center animate-fade-in">
      <div className="mt-20 w-[900px] max-w-[95%] bg-white rounded-md shadow-lg p-4">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') setActiveIndex((i) => i + 1);
              if (e.key === 'ArrowUp') setActiveIndex((i) => Math.max(0, i - 1));
              if (e.key === 'Enter') {
                if (results[activeIndex]) {
                  navigate(`/products/${results[activeIndex]._id}`);
                  setOpen(false);
                } else {
                  onSubmit();
                }
              }
              if (e.key === 'Escape') close();
            }}
            placeholder="Search products, brands, categories... (Press / to open)"
            className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button onClick={() => onSubmit()} className="px-4 py-2 bg-gray-900 text-white rounded">Search</button>
          <button onClick={close} className="px-3 py-2 text-gray-600">✕</button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-semibold mb-2">Recent</h4>
            <div className="flex flex-col gap-2">
              {recent.length === 0 && <div className="text-sm text-gray-500">No recent searches</div>}
              {recent.map((r) => (
                <button key={r} onClick={() => onSubmit(r)} className="text-left text-sm px-2 py-1 rounded hover:bg-gray-100">{r}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Popular Brands</h4>
            <div className="flex flex-col gap-2">
              {popularBrands.map((b) => (
                <button key={b} onClick={() => { setQuery(b); onSubmit(b); }} className="text-left text-sm px-2 py-1 rounded hover:bg-gray-100">{b}</button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Suggested Categories</h4>
            <div className="flex flex-col gap-2">
              {suggestedCategories.map((c) => (
                <button key={c} onClick={() => { setQuery(c); onSubmit(c); }} className="text-left text-sm px-2 py-1 rounded hover:bg-gray-100">{c}</button>
              ))}
            </div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Results</h4>
            <ul>
              {results.map((r, idx) => (
                <li key={r._id} className={`p-2 rounded ${idx === activeIndex ? 'bg-gray-100' : ''}`}>
                  <Link to={`/products/${r._id}`} onClick={() => setOpen(false)} className="flex items-center gap-3">
                    <img src={r.images?.[0]} alt={r.title} className="w-10 h-10 object-cover rounded" />
                    <div>
                      <div className="font-medium text-sm">{r.title}</div>
                      <div className="text-xs text-gray-500">{r.brand} · ${r.price}</div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
