import React, { useState } from 'react';

interface Props {
  filters: any;
  categories: string[];
  brands: string[];
  onChange: (key: string, value: string) => void;
  onClearAll: () => void;
}

const Collapsible: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b last:border-b-0 pb-3 mb-3">
      <button
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 mb-2"
      >
        <span>{title}</span>
        <span className="text-gray-400">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="text-sm text-gray-700">{children}</div>}
    </div>
  );
};

const FilterSidebar: React.FC<Props> = ({ filters, categories, brands, onChange, onClearAll }) => {
  return (
    <aside className="w-full lg:w-72">
      <div className="sticky top-20">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          <button onClick={onClearAll} className="text-sm text-gray-500 hover:text-gray-700">Clear</button>
        </div>

        <div className="mb-3">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <button onClick={() => onChange('search', '')} className="px-2 py-1 bg-gray-100 rounded text-sm">{filters.search} ×</button>
            )}
            {filters.brand && (
              <button onClick={() => onChange('brand', '')} className="px-2 py-1 bg-gray-100 rounded text-sm">{filters.brand} ×</button>
            )}
            {filters.category && (
              <button onClick={() => onChange('category', '')} className="px-2 py-1 bg-gray-100 rounded text-sm">{filters.category} ×</button>
            )}
          </div>
        </div>

        <Collapsible title="Category">
          <div className="flex flex-col gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => onChange('category', c)}
                className={`text-left px-2 py-1 rounded text-sm ${filters.category === c ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </Collapsible>

        <Collapsible title="Brand">
          <div className="flex flex-col gap-2">
            <input
              placeholder="Filter by brand"
              value={filters.brand}
              onChange={(e) => onChange('brand', e.target.value)}
              className="px-2 py-2 border rounded-md text-sm"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {brands.slice(0, 8).map((b) => (
                <button key={b} onClick={() => onChange('brand', b)} className="px-2 py-1 bg-gray-100 rounded text-sm">{b}</button>
              ))}
            </div>
          </div>
        </Collapsible>

        <Collapsible title="Price">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => onChange('minPrice', e.target.value)}
              className="w-1/2 px-2 py-2 border rounded-md text-sm"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => onChange('maxPrice', e.target.value)}
              className="w-1/2 px-2 py-2 border rounded-md text-sm"
            />
          </div>
        </Collapsible>

        <Collapsible title="Tags">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onChange('tag', 'new')} className="px-2 py-1 bg-gray-100 rounded text-sm">New</button>
            <button onClick={() => onChange('tag', 'popular')} className="px-2 py-1 bg-gray-100 rounded text-sm">Popular</button>
            <button onClick={() => onChange('tag', 'limited')} className="px-2 py-1 bg-gray-100 rounded text-sm">Limited</button>
          </div>
        </Collapsible>
      </div>
    </aside>
  );
};

export default FilterSidebar;
