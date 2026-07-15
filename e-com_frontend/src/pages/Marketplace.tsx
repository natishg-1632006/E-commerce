import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';
import { Price } from '../components/ui/Price';

import { Search } from '../components/ui/Search';
import { Pagination } from '../components/ui/Pagination';
import { Drawer } from '../components/ui/Drawer';
import { ShoppingCart, SlidersHorizontal, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClickOutside } from '../hooks/useClickOutside';
import { cn } from '../lib/cn';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

import macbookImg from '../assets/products/macbook.jpg';
import rogImg from '../assets/products/rog.jpg';
import dellImg from '../assets/products/dell.jpg';
import guideImg from '../assets/products/guide.jpg';

interface Product {
  id: string;
  name: string;
  brand: 'Apple' | 'Dell' | 'ASUS';
  price: number;
  listPrice?: number;
  saleBadge?: string;
  rating: number;
  reviews: number;
  image: string;
  // Specifications
  ram: '16GB' | '32GB' | '64GB';
  storage: '512GB' | '1TB' | '2TB';
}

export const Marketplace: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  
  // Price filter states
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(400000);

  // Responsive Drawer state
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Custom sort dropdown state
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(sortRef, () => setIsSortOpen(false));

  const products: Product[] = [
    {
      id: '1',
      name: 'MacBook Pro M3 Max',
      brand: 'Apple',
      price: 349900,
      rating: 5,
      reviews: 124,
      image: macbookImg,
      ram: '64GB',
      storage: '1TB',
    },
    {
      id: '2',
      name: 'ROG Zephyrus G16',
      brand: 'ASUS',
      price: 219990,
      listPrice: 249990,
      saleBadge: 'Sale -12%',
      rating: 4,
      reviews: 89,
      image: rogImg,
      ram: '32GB',
      storage: '2TB',
    },
    {
      id: '3',
      name: 'Dell XPS 15 Plus',
      brand: 'Dell',
      price: 189900,
      rating: 5,
      reviews: 215,
      image: dellImg,
      ram: '16GB',
      storage: '512GB',
    },
    {
      id: '4',
      name: 'MacBook Air M3 Slim',
      brand: 'Apple',
      price: 114900,
      rating: 5,
      reviews: 64,
      image: guideImg,
      ram: '16GB',
      storage: '512GB',
    },
    {
      id: '5',
      name: 'ASUS TUF Gaming A15',
      brand: 'ASUS',
      price: 104900,
      listPrice: 119900,
      saleBadge: 'Sale -12%',
      rating: 4,
      reviews: 43,
      image: rogImg,
      ram: '16GB',
      storage: '1TB',
    },
    {
      id: '6',
      name: 'Dell Latitude Enterprise',
      brand: 'Dell',
      price: 139900,
      rating: 4,
      reviews: 31,
      image: dellImg,
      ram: '32GB',
      storage: '512GB',
    },
    {
      id: '7',
      name: 'Mac Studio Developer Pro',
      brand: 'Apple',
      price: 289900,
      rating: 5,
      reviews: 78,
      image: macbookImg,
      ram: '64GB',
      storage: '2TB',
    },
    {
      id: '8',
      name: 'ASUS ProArt Creator',
      brand: 'ASUS',
      price: 229900,
      rating: 5,
      reviews: 19,
      image: guideImg,
      ram: '32GB',
      storage: '2TB',
    },
    {
      id: '9',
      name: 'Dell Precision Workstation',
      brand: 'Dell',
      price: 209900,
      listPrice: 229900,
      saleBadge: 'Sale -8%',
      rating: 5,
      reviews: 57,
      image: dellImg,
      ram: '64GB',
      storage: '1TB',
    },
    {
      id: '10',
      name: 'iPhone 15 Pro Max',
      brand: 'Apple',
      price: 149900,
      rating: 5,
      reviews: 98,
      image: guideImg,
      ram: '16GB',
      storage: '512GB',
    },
    {
      id: '11',
      name: 'ASUS ROG Phone 8',
      brand: 'ASUS',
      price: 94900,
      rating: 5,
      reviews: 34,
      image: rogImg,
      ram: '16GB',
      storage: '512GB',
    },
    {
      id: '12',
      name: 'Dell Inspiron 16 Premium',
      brand: 'Dell',
      price: 84900,
      rating: 4,
      reviews: 41,
      image: dellImg,
      ram: '16GB',
      storage: '1TB',
    },
  ];

  // Reset page number on filter parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedBrands, selectedRam, selectedStorage, searchQuery, minPrice, maxPrice, itemsPerPage]);

  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleRamChange = (ram: string) => {
    setSelectedRam((prev) =>
      prev.includes(ram) ? prev.filter((r) => r !== ram) : [...prev, ram]
    );
  };

  const handleStorageChange = (storage: string) => {
    setSelectedStorage((prev) =>
      prev.includes(storage) ? prev.filter((s) => s !== storage) : [...prev, storage]
    );
  };

  const handleClearAll = () => {
    setSelectedBrands([]);
    setSelectedRam([]);
    setSelectedStorage([]);
    setMinPrice(0);
    setMaxPrice(400000);
    setSearchQuery('');
    toast.success('All filters cleared!');
  };

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image,
        ram: product.ram,
        storage: product.storage,
      })
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesBrand = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    const matchesPrice = product.price >= minPrice && product.price <= maxPrice;
    const matchesRam = selectedRam.length === 0 || selectedRam.includes(product.ram);
    const matchesStorage = selectedStorage.length === 0 || selectedStorage.includes(product.storage);
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBrand && matchesPrice && matchesRam && matchesStorage && matchesSearch;
  });

  // Sort list
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return b.id.localeCompare(a.id); // Default newest arrivals
  });

  // Paginated chunk parameters
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  const sortOptions = [
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
  ];

  const pageSizeOptions = [4, 8, 12, 16];



  const hasActiveFilters =
    selectedBrands.length > 0 ||
    selectedRam.length > 0 ||
    selectedStorage.length > 0 ||
    searchQuery !== '' ||
    minPrice > 0 ||
    maxPrice < 400000;

  const renderFilters = () => (
    <div className="flex flex-col items-stretch space-y-5.5">
      {/* Brand Filters */}
      <div className="flex flex-col items-start space-y-2.5">
        <span className="text-[11px] font-bold text-slate-800 tracking-tight">Brand</span>
        <Checkbox
          id="brand-apple"
          checked={selectedBrands.includes('Apple')}
          onChange={() => handleBrandChange('Apple')}
          label="Apple"
        />
        <Checkbox
          id="brand-dell"
          checked={selectedBrands.includes('Dell')}
          onChange={() => handleBrandChange('Dell')}
          label="Dell"
        />
        <Checkbox
          id="brand-asus"
          checked={selectedBrands.includes('ASUS')}
          onChange={() => handleBrandChange('ASUS')}
          label="ASUS"
        />
      </div>

      {/* Price Range Slider Filter */}
      <div className="flex flex-col items-stretch space-y-2.5 w-full">
        <span className="text-[11px] font-bold text-slate-800 tracking-tight">Price Range</span>
        
        {/* Min / Max Inputs */}
        <div className="flex items-center space-x-2">
          <div className="relative flex-1 h-[34px]">
            <input
              type="number"
              min="0"
              max="400000"
              value={minPrice}
              onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value)))}
              placeholder="Min"
              className="w-full h-full text-[11px] font-semibold border border-slate-300 rounded-[10px] px-2.5 text-slate-700 outline-none focus:border-blue-600 transition-colors bg-slate-50/50"
            />
          </div>
          <span className="text-slate-400 text-xs font-bold">-</span>
          <div className="relative flex-1 h-[34px]">
            <input
              type="number"
              min="0"
              max="400000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Math.min(400000, Number(e.target.value)))}
              placeholder="Max"
              className="w-full h-full text-[11px] font-semibold border border-slate-300 rounded-[10px] px-2.5 text-slate-700 outline-none focus:border-blue-600 transition-colors bg-slate-50/50"
            />
          </div>
        </div>

        {/* Dual slider visual track */}
        <div className="pt-2 flex flex-col space-y-2">
          <div className="relative w-full h-5 select-none">
            {/* Base track */}
            <div className="absolute top-2 left-0 right-0 h-1 bg-slate-200 rounded-lg"></div>
            {/* Colored active range track */}
            <div
              className="absolute top-2 h-1 bg-blue-600 rounded-lg"
              style={{
                left: `${(minPrice / 400000) * 100}%`,
                right: `${100 - (maxPrice / 400000) * 100}%`,
              }}
            ></div>
            {/* Min Slider Input */}
            <input
              type="range"
              min="0"
              max="400000"
              value={minPrice}
              onChange={(e) => {
                const val = Math.min(Number(e.target.value), maxPrice - 50);
                setMinPrice(val);
              }}
              className="absolute top-0 left-0 w-full h-5 appearance-none bg-transparent pointer-events-none cursor-pointer outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
              style={{ zIndex: minPrice > 200000 ? 5 : 4 }}
            />
            {/* Max Slider Input */}
            <input
              type="range"
              min="0"
              max="400000"
              value={maxPrice}
              onChange={(e) => {
                const val = Math.max(Number(e.target.value), minPrice + 50);
                setMaxPrice(val);
              }}
              className="absolute top-0 left-0 w-full h-5 appearance-none bg-transparent pointer-events-none cursor-pointer outline-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-blue-600 [&::-moz-range-thumb]:border [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
            />
          </div>
          <div className="flex justify-between text-[9.5px] text-slate-450 font-bold pt-0.5">
            <span className="flex items-center">Min:&nbsp;<Price value={minPrice} /></span>
            <span className="flex items-center">Max:&nbsp;<Price value={maxPrice} /></span>
          </div>
        </div>
      </div>

      {/* Memory RAM Specifications */}
      <div className="flex flex-col items-start space-y-2.5">
        <span className="text-[11px] font-bold text-slate-800 tracking-tight">Memory (RAM)</span>
        <Checkbox
          id="ram-16gb"
          checked={selectedRam.includes('16GB')}
          onChange={() => handleRamChange('16GB')}
          label="16 GB"
        />
        <Checkbox
          id="ram-32gb"
          checked={selectedRam.includes('32GB')}
          onChange={() => handleRamChange('32GB')}
          label="32 GB"
        />
        <Checkbox
          id="ram-64gb"
          checked={selectedRam.includes('64GB')}
          onChange={() => handleRamChange('64GB')}
          label="64 GB"
        />
      </div>

      {/* Storage Specifications */}
      <div className="flex flex-col items-start space-y-2.5">
        <span className="text-[11px] font-bold text-slate-800 tracking-tight">Storage Space</span>
        <Checkbox
          id="storage-512gb"
          checked={selectedStorage.includes('512GB')}
          onChange={() => handleStorageChange('512GB')}
          label="512 GB SSD"
        />
        <Checkbox
          id="storage-1tb"
          checked={selectedStorage.includes('1TB')}
          onChange={() => handleStorageChange('1TB')}
          label="1 TB SSD"
        />
        <Checkbox
          id="storage-2tb"
          checked={selectedStorage.includes('2TB')}
          onChange={() => handleStorageChange('2TB')}
          label="2 TB SSD"
        />
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="w-full flex flex-col items-stretch space-y-8 select-none">
        
        {/* Mobile/Tablet Filter & Search Toggle row */}
        <div className="flex lg:hidden items-center justify-between gap-3 mb-2">
          <div className="flex-grow">
            <Search value={searchQuery} onChange={setSearchQuery} placeholder="Search hardware..." />
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-[42px] px-3 sm:px-4 font-bold flex items-center justify-center sm:space-x-1.5 rounded-xl border-slate-200 cursor-pointer active:scale-95 bg-white text-slate-700 hover:bg-slate-50 transition-all"
            onClick={() => setIsFilterDrawerOpen(true)}
            aria-label="Toggle Filters"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
        </div>

        {/* Content Layout */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Left Column: Filter Sidebar - Sticky on Desktop/Laptop, hidden on Mobile/Tablet */}
          <aside className="hidden lg:block lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto col-span-1 select-none">
            <Card variant="simple" className="p-6 border-slate-200 text-left bg-white rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] font-bold text-blue-655 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              {renderFilters()}
            </Card>
          </aside>

          {/* Right Column: Products Content Area */}
          <section className="col-span-1 lg:col-span-3 flex flex-col space-y-6">
            
            {/* List Header controls */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              {/* Sleeker results tag info */}
              <div className="text-left flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900 tracking-tight">Technology Catalog</span>
                <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5 shadow-sm">
                  {filteredProducts.length} Results
                </span>
              </div>

              {/* Custom Selector controls */}
              <div className="flex items-center space-x-3">
                {/* Premium custom Sort dropdown button */}
                <div className="relative inline-block text-left" ref={sortRef}>
                  <button
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className="h-[34px] px-2.5 sm:px-3.5 bg-blue-50/50 hover:bg-blue-50 text-blue-700 border border-blue-100 rounded-[12px] text-xs font-black transition-all flex items-center justify-center sm:space-x-1.5 cursor-pointer select-none active:scale-95"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="hidden sm:inline">{sortOptions.find((opt) => opt.value === sortBy)?.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-500 hidden sm:inline" />
                  </button>
                  {isSortOpen && (
                    <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200/50 shadow-[0_12px_30px_rgba(15,23,42,0.06)] rounded-[14px] overflow-hidden py-1 z-[1000]">
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setIsSortOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-between cursor-pointer"
                        >
                          <span>{opt.label}</span>
                          {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3px]" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Redesigned 4-in-a-Row Product Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
              {currentItems.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => navigate(`/product/${prod.id}`)}
                  className="p-3.5 rounded-[28px] border border-slate-200/50 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-350 flex flex-col justify-between items-stretch overflow-hidden group cursor-pointer"
                >
                  {/* Thumbnail image */}
                  <div className="relative w-full aspect-[4/3] rounded-[22px] bg-slate-50/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    {prod.saleBadge && (
                      <div className="absolute top-3 left-3 bg-white border border-red-500/80 text-red-550 font-black text-[9.5px] tracking-wide uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                        {prod.saleBadge}
                      </div>
                    )}
                  </div>

                  {/* Content Container */}
                  <div className="flex flex-col flex-grow justify-between text-left mt-3">
                    <div className="space-y-1 mb-2">
                      <span className="text-[10px] font-black text-blue-650 tracking-wider uppercase">{prod.brand}</span>
                      <h4 className="text-[13.5px] font-extrabold text-slate-800 tracking-tight leading-tight mt-1 truncate w-full">
                        {prod.name}
                      </h4>
                      <div className="flex items-center space-x-1 pt-1">
                        <Rating value={prod.rating} readOnly size="sm" />
                        <span className="text-[10.5px] text-slate-800 font-bold ml-1.5">({prod.reviews})</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                          {prod.ram.includes('RAM') || prod.ram.includes('GB') ? (prod.ram.includes('RAM') ? prod.ram : `${prod.ram} RAM`) : `${prod.ram} RAM`}
                        </span>
                        <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                          {prod.storage.includes('SSD') ? prod.storage : `${prod.storage} SSD`}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100/80 my-3" />

                    <div className="flex items-center justify-between flex-shrink-0">
                      <div className="flex flex-col text-left">
                        <Price value={prod.price} className="text-[14.5px] font-black text-slate-900 leading-none" />
                        {prod.listPrice && (
                          <Price value={prod.listPrice} className="text-[10.5px] text-slate-400 line-through font-bold mt-1" />
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(prod);
                        }}
                        className="w-9 h-9 rounded-full bg-blue-50/70 hover:bg-blue-600 text-slate-800 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm"
                        aria-label={`Add ${prod.name} to cart`}
                      >
                        <ShoppingCart className="w-4 h-4 stroke-[2.2px]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {currentItems.length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                  <p className="text-sm font-semibold text-slate-400">No products found matching your search filters.</p>
                </div>
              )}
            </div>

            {/* Pagination Component & Custom Page Size inline selector */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 w-full select-none">
              {/* Pagination info tag */}
              <span className="text-[11px] font-bold text-slate-450">
                Page {currentPage} of {totalPages} ({filteredProducts.length} items found)
              </span>

              {/* Standard Pagination button blocks */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

              {/* Inline Page Size selector list */}
              <div className="flex items-center space-x-2 text-[11px] font-bold text-slate-450">
                <span>Show:</span>
                {pageSizeOptions.map((size) => (
                  <button
                    key={size}
                    onClick={() => setItemsPerPage(size)}
                    className={cn(
                      "px-2.5 py-1 rounded-[8px] transition-colors cursor-pointer",
                      itemsPerPage === size
                        ? "bg-slate-200 text-slate-800"
                        : "hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Tablet / Mobile Drawer Filter panel */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filters"
        position="left"
      >
        <div className="p-5 text-left flex flex-col h-full overflow-y-auto select-none">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  handleClearAll();
                  setIsFilterDrawerOpen(false);
                }}
                className="text-[10px] font-bold text-blue-655 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>
          {renderFilters()}
          
          <Button
            variant="primary"
            size="sm"
            className="w-full mt-8 text-xs h-[40px] rounded-xl"
            onClick={() => setIsFilterDrawerOpen(false)}
          >
            Apply & Close
          </Button>
        </div>
      </Drawer>

    </MainLayout>
  );
};

export default Marketplace;
