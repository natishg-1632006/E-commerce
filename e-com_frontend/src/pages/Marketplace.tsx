import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card } from '../components/ui/Card';
import { Checkbox } from '../components/ui/Checkbox';
import { Button } from '../components/ui/Button';
import { Rating } from '../components/ui/Rating';
import { Price } from '../components/ui/Price';

import { Search } from '../components/ui/Search';
import { Pagination } from '../components/ui/Pagination';
import { Drawer } from '../components/ui/Drawer';
import { ShoppingCart, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, Laptop, Headphones, Watch, Sparkles, Star, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useClickOutside } from '../hooks/useClickOutside';
import { cn } from '../lib/cn';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';

import macbookImg from '../assets/products/macbook.jpg';
import rogImg from '../assets/products/rog.jpg';
import dellImg from '../assets/products/dell.jpg';
import guideImg from '../assets/products/guide.jpg';
import heroBannerImg from '../assets/future_tech_banner.jpg';

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

const SkeletonProductCard: React.FC = () => {
  return (
    <div className="p-3.5 rounded-[28px] border border-slate-200/50 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.02)] flex flex-col justify-between items-stretch overflow-hidden shimmer-sweep select-none">
      {/* Thumbnail image placeholder */}
      <div className="relative w-full aspect-[4/3] rounded-[22px] bg-slate-200 overflow-hidden flex-shrink-0" />

      {/* Content Container */}
      <div className="flex flex-col flex-grow justify-between text-left mt-4">
        <div className="space-y-2 mb-2">
          {/* Brand */}
          <div className="h-3 w-12 bg-slate-300 rounded" />
          {/* Name */}
          <div className="h-4 w-3/4 bg-slate-300 rounded mt-1.5" />
          {/* Rating */}
          <div className="flex items-center space-x-1.5 pt-1">
            <div className="h-3.5 w-16 bg-slate-200 rounded" />
            <div className="h-3.5 w-6 bg-slate-200 rounded" />
          </div>
          {/* Specs */}
          <div className="flex space-x-1.5 pt-1">
            <div className="h-4.5 w-10 bg-slate-200 rounded-[5px]" />
            <div className="h-4.5 w-10 bg-slate-200 rounded-[5px]" />
          </div>
        </div>

        <div className="border-t border-slate-100/80 my-3" />

        {/* Pricing & Cart Button */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div className="flex flex-col space-y-1">
            <div className="h-4 w-16 bg-slate-300 rounded" />
            <div className="h-3 w-10 bg-slate-200 overflow-hidden" />
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-300" />
        </div>
      </div>
    </div>
  );
};

export const Marketplace: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Reset shop grid view and filters when route location changes (e.g. clicking Home link/Logo)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brand = params.get('brand');
    const search = params.get('search');

    if (brand || search) {
      if (brand) {
        setSelectedBrands([brand]);
      } else {
        setSelectedBrands([]);
      }
      if (search) {
        setSearchQuery(search);
      } else {
        setSearchQuery('');
      }
      setSelectedRam([]);
      setSelectedStorage([]);
      setMinPrice(0);
      setMaxPrice(400000);
      setShowShopGrid(true);
    } else {
      setShowShopGrid(false);
      setSelectedBrands([]);
      setSelectedRam([]);
      setSelectedStorage([]);
      setMinPrice(0);
      setMaxPrice(400000);
      setSearchQuery('');
    }
  }, [location]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRam, setSelectedRam] = useState<string[]>([]);
  const [selectedStorage, setSelectedStorage] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [showShopGrid, setShowShopGrid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Price filter states
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(400000);

  // Trigger simulated loading skeleton state on filter/sorting modifications
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [selectedBrands, selectedRam, selectedStorage, minPrice, maxPrice, sortBy, searchQuery, currentPage]);

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

  const renderHomeLanding = !showShopGrid && !hasActiveFilters;

  // Scroll to top when transitioning between landing page and shop grid catalog view
  useEffect(() => {
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
      document.body.scrollTop = 0;
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
      }
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [renderHomeLanding]);

  if (renderHomeLanding) {
    return (
      <MainLayout>
        <div className="w-full flex flex-col items-stretch space-y-12 select-none">
          
          {/* Hero Banner Section (Screenshot 3 & 4) */}
          <section className="bg-slate-50/50 rounded-[32px] border border-slate-200/50 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-left">
            <div className="flex-1 space-y-6">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight max-w-lg">
                Discover the <span className="text-blue-600 italic">Future</span> of Technology
              </h1>
              
              {/* Dynamic Description based on Mobile/Desktop */}
              <p className="text-xs sm:text-sm text-slate-500 font-semibold leading-relaxed max-w-md hidden sm:block">
                Explore premium gadgets, laptops, gaming gear, and smart devices powered by innovation. Curated by experts, delivered by intelligence.
              </p>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed max-w-sm block sm:hidden">
                Curated AI-driven recommendations for enthusiasts and professionals alike.
              </p>

              <div className="flex items-center space-x-3.5 pt-2">
                <button
                  onClick={() => setShowShopGrid(true)}
                  className="h-11 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider shadow hover:shadow-lg active:scale-95 transition-all cursor-pointer border-none"
                >
                  View Products
                </button>
                <button
                  onClick={() => setShowShopGrid(true)}
                  className="h-11 px-6 rounded-full border border-slate-200 bg-white text-slate-800 text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer active:scale-95 shadow-sm"
                >
                  View Brands
                </button>
              </div>
            </div>

            <div className="flex-1 w-full max-w-xl lg:max-w-none">
              <img
                src={heroBannerImg}
                alt="Discover the Future of Technology"
                className="w-full aspect-[16/9] object-cover rounded-3xl border border-slate-200 shadow-sm"
              />
            </div>
          </section>

          {/* Shop by Category / Shop Categories (Screenshot 1 & 4) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  <span className="hidden sm:inline">Shop by Category</span>
                  <span className="inline sm:hidden">Shop Categories</span>
                </h2>
                <p className="text-xs text-slate-400 font-bold mt-0.5 hidden sm:block">
                  Find exactly what you're looking for in our specialized collections.
                </p>
              </div>
              <button
                onClick={() => setShowShopGrid(true)}
                className="text-xs font-black text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer bg-transparent border-none"
              >
                <span>View all</span>
                <span>&rarr;</span>
              </button>
            </div>

            {/* Categories circle grid */}
            <div className="grid grid-cols-3 gap-3.5 sm:gap-6">
              {[
                { label: 'Computing', icon: Laptop, brandFilter: 'Apple' },
                { label: 'Audio', icon: Headphones, brandFilter: 'ASUS' },
                { label: 'Wearables', icon: Watch, brandFilter: 'Dell' }
              ].map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.label}
                    onClick={() => {
                      setSelectedBrands([cat.brandFilter]);
                      setShowShopGrid(true);
                    }}
                    className="p-4 sm:p-6 bg-white border border-slate-200/60 rounded-[24px] sm:rounded-[32px] flex flex-col items-center justify-center space-y-3 hover:border-blue-300 hover:shadow-md transition-all active:scale-98 cursor-pointer select-none"
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                      <IconComponent className="w-5.5 h-5.5 sm:w-7 sm:h-7 text-slate-800" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-slate-800 tracking-tight">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Gray Brand Names logos list (Screenshot 1) */}
          <section className="py-2 border-t border-b border-slate-100 flex flex-wrap items-center justify-around gap-y-4 gap-x-6 text-[10px] sm:text-[11px] font-black text-slate-350 tracking-[0.2em] uppercase select-none">
            <span>Techcore</span>
            <span>Quantum</span>
            <span>Nexus</span>
            <span>Aether</span>
            <span>Zenith</span>
            <span>Omega</span>
          </section>

          {/* Trending Today (Screenshot 1) */}
          <section className="space-y-5 text-left">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Trending Today</h2>
            
            {/* Mobile View: Row Cards (Screenshot 1 replica) */}
            <div className="grid grid-cols-1 gap-3.5 block sm:hidden">
              {isLoading ? (
                Array.from({ length: 2 }).map((_, idx) => (
                  <div
                    key={`skeleton-mobile-${idx}`}
                    className="bg-white border border-slate-200/60 rounded-3xl p-3.5 flex items-center justify-between shadow-sm shimmer-sweep text-left"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-18 h-18 bg-slate-100 rounded-2xl flex-shrink-0" />
                      <div className="space-y-1 text-left">
                        <div className="h-3 w-10 bg-slate-200/60 rounded" />
                        <div className="h-4 w-28 bg-slate-200/60 rounded mt-1.5" />
                        <div className="h-3.5 w-16 bg-slate-100 rounded mt-1.5" />
                      </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-200/60 flex-shrink-0" />
                  </div>
                ))
              ) : (
                [
                  {
                    id: '2',
                    name: 'SonicPro Wireless X2',
                    category: 'ACOUSTICS',
                    price: 24900,
                    listPrice: 29900,
                    image: rogImg,
                  },
                  {
                    id: '3',
                    name: 'Vanguard Health Smartwatch Pro',
                    category: 'WEARABLES',
                    price: 38900,
                    image: guideImg,
                  }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/product/${item.id}`)}
                    className="bg-white border border-slate-200/60 rounded-3xl p-3.5 flex items-center justify-between shadow-sm hover:shadow transition-all cursor-pointer"
                  >
                    <div className="flex items-center space-x-3.5 min-w-0">
                      <div className="w-18 h-18 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center p-1.5 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0 text-left">
                        <span className="text-[9px] font-black text-blue-650 tracking-wider uppercase">{item.category}</span>
                        <h4 className="text-[11.5px] font-extrabold text-slate-855 truncate mt-0.5">{item.name}</h4>
                        <div className="flex items-baseline space-x-2 mt-1">
                          <Price value={item.price} className="text-xs font-black text-blue-600" />
                          {item.listPrice && (
                            <Price value={item.listPrice} className="text-[10px] text-slate-455 line-through font-bold" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(
                          addToCart({
                            id: item.id,
                            name: item.name,
                            brand: item.category,
                            price: item.price,
                            image: item.image,
                            ram: 'Standard',
                            storage: 'Standard'
                          })
                        );
                      }}
                      className="w-9 h-9 rounded-full bg-blue-50/70 hover:bg-blue-600 text-slate-800 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm flex-shrink-0"
                    >
                      <ShoppingCart className="w-4 h-4 stroke-[2.2px]" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Desktop View: Standard Product Cards (5-in-a-row) */}
            <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonProductCard key={`skeleton-trending-${idx}`} />
                ))
              ) : (
                products.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => navigate(`/product/${prod.id}`)}
                    className="group relative bg-white border border-slate-200/60 rounded-[30px] p-4 flex flex-col justify-between hover:shadow-[0_24px_50px_rgba(15,23,42,0.04)] hover:-translate-y-1 transition-all duration-350 select-none text-left cursor-pointer"
                  >
                    <div className="relative aspect-[4/3] w-full rounded-[22px] overflow-hidden bg-slate-50 flex items-center justify-center mb-4">
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

                    <div className="flex flex-col flex-grow justify-between text-left">
                      <div className="space-y-1">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest leading-none block">{prod.brand}</span>
                        <h3 className="text-[13.5px] font-black text-slate-905 tracking-tight leading-snug mt-1 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[36px]">
                          {prod.name}
                        </h3>
                        <div className="flex items-center space-x-1 mt-1.5 flex-wrap gap-y-1">
                          <span className="px-2 py-0.5 rounded bg-slate-50 text-[9px] font-bold text-slate-455 border border-slate-100/80">
                            {prod.ram}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-50 text-[9px] font-bold text-slate-455 border border-slate-100/80">
                            {prod.storage}
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
                            dispatch(
                              addToCart({
                                id: prod.id,
                                name: prod.name,
                                brand: prod.brand,
                                price: prod.price,
                                image: prod.image,
                                ram: prod.ram,
                                storage: prod.storage
                              })
                            );
                          }}
                          className="w-9 h-9 rounded-full bg-blue-50/70 hover:bg-blue-600 text-slate-800 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm"
                        >
                          <ShoppingCart className="w-4 h-4 stroke-[2.2px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* The NatCart Edge (Screenshot 2) */}
          <section className="bg-slate-50/20 rounded-[32px] border border-slate-100 p-6 sm:p-10 text-center space-y-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">The NatCart Edge</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                {
                  title: 'AI-Powered Insights',
                  desc: 'Personalized tech recommendations tailored to your unique workflow.',
                  icon: Sparkles
                },
                {
                  title: 'Certified Authenticity',
                  desc: 'Every product is verified and covered by our premium global warranty.',
                  icon: Check
                },
                {
                  title: 'Rapid Delivery',
                  desc: 'Free worldwide shipping on all orders over $150 with real-time tracking.',
                  icon: Truck
                }
              ].map((feat, idx) => {
                const IconComponent = feat.icon;
                return (
                  <div key={idx} className="bg-white border border-slate-200/60 rounded-3xl p-5 flex items-start space-x-4 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-5 h-5 stroke-[2.2px]" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase">{feat.title}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trusted by Creators (Screenshot 2) */}
          <section className="bg-blue-50/30 rounded-[32px] border border-blue-100/50 p-6 sm:p-10 flex flex-col items-center justify-center text-center space-y-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Trusted by Creators</h2>
            
            <div className="max-w-xl bg-white border border-slate-200/50 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col items-center space-y-4">
              {/* Star review icons */}
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-blue-600 text-blue-600" />
                ))}
              </div>

              {/* Quote text */}
              <p className="text-xs sm:text-sm text-slate-650 font-bold italic leading-relaxed">
                "The AI curation on NatCart is genuinely impressive. It found exactly the workstation components I needed without me having to dig through hundreds of pages."
              </p>

              {/* Creator info */}
              <div className="flex items-center space-x-3 mt-2 select-none">
                <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                  <span className="text-[10px] font-black text-slate-500 uppercase">SJ</span>
                </div>
                <div className="text-left space-y-0.5">
                  <div className="text-xs font-black text-slate-800">Sarah Jenkins</div>
                  <div className="text-[9.5px] text-slate-455 font-bold">Lead Designer, TechFlow</div>
                </div>
              </div>
            </div>

            {/* Slider dots indicators */}
            <div className="flex items-center space-x-2 pt-2 select-none">
              <span className="w-6 h-1 rounded-full bg-blue-600" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-350" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-350" />
            </div>
          </section>

        </div>
      </MainLayout>
    );
  }

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {isLoading ? (
                Array.from({ length: itemsPerPage }).map((_, idx) => (
                  <SkeletonProductCard key={`skeleton-catalog-${idx}`} />
                ))
              ) : (
                currentItems.map((prod) => (
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
                ))
              )}

              {!isLoading && currentItems.length === 0 && (
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
