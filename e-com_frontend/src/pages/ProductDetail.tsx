import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/cartSlice';
import { MainLayout } from '../layouts/MainLayout';
import { Price } from '../components/ui/Price';
import { Rating } from '../components/ui/Rating';
import { Badge } from '../components/ui/Badge';
import {
  ChevronRight,
  Sparkles,
  Heart,
  ShoppingCart,
  Calendar,
  Check,
  MessageSquare,
  ThumbsUp,
  Cpu,
  HardDrive,
  Monitor,
  Battery,
  Layers,
  Wifi
} from 'lucide-react';
import { cn } from '../lib/cn';
import toast from 'react-hot-toast';

// Import local images
import macbookImg from '../assets/products/macbook.jpg';
import rogImg from '../assets/products/rog.jpg';
import dellImg from '../assets/products/dell.jpg';
import ssdImg from '../assets/products/samsung_t7_ssd.jpg';
import sleeveImg from '../assets/products/laptop_sleeve_leather.jpg';
import matImg from '../assets/products/premium_desk_mat.jpg';
import guideImg from '../assets/products/guide.jpg';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Selected product options
  const [selectedColor, setSelectedColor] = useState('Space Black');
  const [selectedMemory, setSelectedMemory] = useState('32GB');
  const [selectedStorage, setSelectedStorage] = useState('1TB');




  // Fallback to product '1' details if not matched
  const isMacbook = id === '1' || !id;

  // Set page data based on Macbook or other products
  const productData = isMacbook
    ? {
        id: '1',
        name: 'MacBook Pro M3 Max',
        brand: 'APPLE',
        basePrice: 349900,
        listPrice: 379900,
        rating: 4.9,
        reviewsCount: 124,
        description: 'Designed for creators, engineers, and developers. The Apple M3 Max chip packs extreme performance capabilities to power through the most demanding professional workflows.',
        colors: ['Space Black', 'Silver'],
        memories: [
          { value: '32GB', label: '32GB Unified Memory', desc: 'Standard Configuration', extra: 0 },
          { value: '64GB', label: '64GB Unified Memory', desc: 'Add ₹40,000', extra: 40000 },
          { value: '96GB', label: '96GB Unified Memory', desc: 'Add ₹80,000', extra: 80000 },
        ],
        storages: [
          { value: '1TB', label: '1TB Superfast SSD', extra: 0 },
          { value: '2TB', label: '2TB Superfast SSD', extra: 20000 },
          { value: '4TB', label: '4TB Superfast SSD', extra: 60000 },
        ],
        mainImage: macbookImg,
        thumbnails: [macbookImg, guideImg, dellImg, rogImg]
      }
    : {
        id: id || '2',
        name: id === '2' ? 'ROG Zephyrus G16' : 'Dell XPS 15 Plus',
        brand: id === '2' ? 'ASUS' : 'DELL',
        basePrice: id === '2' ? 219990 : 189900,
        listPrice: id === '2' ? 249990 : 219900,
        rating: id === '2' ? 4.7 : 4.8,
        reviewsCount: id === '2' ? 89 : 215,
        description: 'Premium thin and light performance laptop. Designed for creators and power users who demand computing horsepower in a sleek, metal enclosure.',
        colors: ['Graphite Gray', 'Platinum Silver'],
        memories: [
          { value: '16GB', label: '16GB High-Speed RAM', desc: 'Standard Configuration', extra: 0 },
          { value: '32GB', label: '32GB High-Speed RAM', desc: 'Add ₹15,000', extra: 15000 },
          { value: '64GB', label: '64GB High-Speed RAM', desc: 'Add ₹35,000', extra: 35000 },
        ],
        storages: [
          { value: '512GB', label: '512GB NVMe SSD', extra: 0 },
          { value: '1TB', label: '1TB NVMe SSD', extra: 10000 },
          { value: '2TB', label: '2TB NVMe SSD', extra: 25000 },
        ],
        mainImage: id === '2' ? rogImg : dellImg,
        thumbnails: [id === '2' ? rogImg : dellImg, guideImg, macbookImg]
      };

  // Thumbnail selection
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Price calculations based on options
  const selectedMemoryExtra = productData.memories.find(m => m.value === selectedMemory)?.extra || 0;
  const selectedStorageExtra = productData.storages.find(s => s.value === selectedStorage)?.extra || 0;
  const currentPrice = productData.basePrice + selectedMemoryExtra + selectedStorageExtra;
  const currentListPrice = productData.listPrice ? productData.listPrice + selectedMemoryExtra + selectedStorageExtra : null;
  const emiCost = Math.round(currentPrice / 24);

  // Accessory bundles (Frequently Bought Together)
  const bundleItems = [
    { id: 'acc-mouse', name: 'Magic Mouse', price: 7900, listPrice: 9900, image: matImg, specs: 'Bluetooth • Wireless' },
    { id: 'acc-sleeve', name: 'Pro Leather Sleeve', price: 12900, listPrice: 15900, image: sleeveImg, specs: '16-inch • Leather' },
    { id: 'acc-cable', name: 'MagSafe 3 Cable (2m)', price: 4900, listPrice: 5900, image: ssdImg, specs: '2-meter • Braided' },
    { id: 'acc-pods', name: 'AirPods Pro (2nd Gen)', price: 24900, listPrice: 26900, image: guideImg, specs: 'Active Noise Cancelling' },
  ];

  // Reviews Data
  const reviews = [
    {
      id: 'rev-1',
      author: 'Jason D.',
      initials: 'JD',
      rating: 5,
      verified: true,
      text: `"The M3 Max is a beast for video editing. Rendering 8K footage feels like working with 1080p. The Space Black finish is surprisingly fingerprint-resistant. Best purchase of the year."`,
      helpfulCount: 34,
      date: '2 weeks ago',
    },
    {
      id: 'rev-2',
      author: 'Sarah L.',
      initials: 'SL',
      rating: 5,
      verified: true,
      text: `"Upgraded from an Intel Mac and the difference is night and day. The screen is breathtaking, and the thermal management is so much better. Worth every penny for creative work."`,
      helpfulCount: 18,
      date: '1 month ago',
    }
  ];

  const handleAddToCartAction = () => {
    dispatch(
      addToCart({
        id: productData.id,
        name: productData.name,
        brand: productData.brand,
        price: currentPrice,
        image: productData.mainImage,
        ram: selectedMemory,
        storage: selectedStorage,
      })
    );
  };

  const handleBuyNowAction = () => {
    handleAddToCartAction();
    navigate('/cart');
  };

  const handleAddBundleItem = (item: typeof bundleItems[0]) => {
    dispatch(
      addToCart({
        id: item.id,
        name: item.name,
        brand: 'PREMIUM ACCESSORIES',
        price: item.price,
        image: item.image,
        ram: item.id === 'acc-mouse' ? 'Wireless' : item.id === 'acc-sleeve' ? '16 Inch' : 'Standard',
        storage: item.id === 'acc-cable' ? '2m' : 'Default',
      })
    );
  };



  return (
    <MainLayout>
      <div className="w-full flex flex-col items-stretch space-y-6 select-none text-left">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-400">
          <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3 text-slate-350" />
          <Link to="/" className="hover:text-blue-600 transition-colors">Laptops</Link>
          <ChevronRight className="w-3 h-3 text-slate-350" />
          <span className="text-slate-800">{productData.name}</span>
        </div>

        {/* Revamped Hero Showcase Card */}
        <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.01)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Vertical visual showcase & thumbnails */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            {/* Main Stage Image Display */}
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-3xl bg-slate-50/50 overflow-hidden border border-slate-100/70 flex items-center justify-center group">
              {/* Premium Glow Aura backplate */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full bg-gradient-to-tr from-blue-500/12 to-indigo-500/6 blur-3xl group-hover:scale-110 transition-transform duration-700" />
              
              <img
                src={productData.thumbnails[activeImageIdx]}
                alt={productData.name}
                className="w-full h-full object-contain p-6 relative z-10 transition-transform duration-500 group-hover:scale-103"
              />


            </div>

            {/* Gallery Thumbnails List (Horizontal below the stage) */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              {productData.thumbnails.map((thumb, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIdx(idx);
                  }}
                  className={cn(
                    "w-16 h-16 rounded-2xl border-2 overflow-hidden bg-slate-50/50 transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center p-1.5",
                    activeImageIdx === idx ? "border-blue-650 shadow" : "border-slate-100 hover:border-slate-250"
                  )}
                >
                  <img src={thumb} alt="thumbnail" className="w-full h-full object-contain rounded-lg" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Customizer & Action panels */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Header branding block */}
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 tracking-widest uppercase">{productData.brand}</span>
                
                {/* Rating Badge */}
                <div className="bg-blue-50/60 border border-blue-100/50 rounded-full px-3 py-1 flex items-center space-x-1.5">
                  <Rating value={Math.round(productData.rating)} readOnly size="sm" />
                  <span className="text-[10px] text-blue-700 font-black mt-0.5">{productData.rating} ({productData.reviewsCount} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-xl md:text-2xl font-black text-slate-855 tracking-tight leading-none mt-1">
                {productData.name}
              </h1>

              {/* Availability Badges */}
              <div className="flex items-center space-x-2.5 pt-2">
                <Badge variant="success" size="sm" className="font-bold rounded-lg px-2 shadow-sm">
                  In Stock
                </Badge>
                <span className="text-[10.5px] font-bold text-slate-455">Ships within 24 hours</span>
              </div>
            </div>

            {/* Description Paragraph */}
            <p className="text-xs text-slate-550 leading-relaxed font-sans mt-2">
              {productData.description}
            </p>

            {/* Price Card Info Block */}
            <div className="p-4.5 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-baseline space-x-3">
                  <Price value={currentPrice} className="text-xl md:text-2xl font-black text-slate-900" />
                  {currentListPrice && (
                    <Price value={currentListPrice} className="text-xs text-slate-400 line-through font-bold" />
                  )}
                </div>
                
                {/* EMI options */}
                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-450 tracking-wide uppercase">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>As low as <Price value={emiCost} className="text-[10px] text-slate-700" />/mo with EMI. <span className="text-blue-600 cursor-pointer hover:underline">Learn More</span></span>
                </div>
              </div>
            </div>

            {/* Color selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Color: {selectedColor}</span>
              <div className="flex items-center space-x-3.5">
                {productData.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "w-7.5 h-7.5 rounded-full border-2 cursor-pointer transition-all duration-200 active:scale-90 flex items-center justify-center p-[2px]",
                      selectedColor === color ? "border-blue-600 shadow" : "border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "w-full h-full rounded-full border border-slate-100/50",
                        color === 'Space Black' || color === 'Graphite Gray'
                          ? "bg-slate-850"
                          : "bg-slate-200"
                      )}
                    />
                  </button>
                ))}
              </div>
                  {/* Premium Memory blocks Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Unified Memory</span>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {productData.memories.map((mem) => (
                  <button
                    key={mem.value}
                    onClick={() => setSelectedMemory(mem.value)}
                    className={cn(
                      "p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 transition-all duration-300 cursor-pointer active:scale-98",
                      selectedMemory === mem.value
                        ? "border-blue-600 bg-blue-50/5 text-blue-650"
                        : "border-slate-100 bg-slate-50/30 hover:border-slate-250"
                    )}
                  >
                    <Cpu className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] sm:text-xs font-black text-slate-800 leading-none">{mem.value}</div>
                      <div className="text-[8.5px] sm:text-[10px] text-slate-455 font-bold mt-0.5 whitespace-nowrap">
                        {mem.desc === 'Standard Configuration' ? 'Base' : mem.desc.replace('Add ', '+')}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Storage blocks Selector */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Storage Capacity</span>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {productData.storages.map((storeOption) => (
                  <button
                    key={storeOption.value}
                    onClick={() => setSelectedStorage(storeOption.value)}
                    className={cn(
                      "p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start space-y-1 sm:space-y-0 sm:space-x-3 transition-all duration-300 cursor-pointer active:scale-98",
                      selectedStorage === storeOption.value
                        ? "border-blue-600 bg-blue-50/5 text-blue-650"
                        : "border-slate-100 bg-slate-50/30 hover:border-slate-250"
                    )}
                  >
                    <HardDrive className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                    <div className="text-center sm:text-left">
                      <div className="text-[10px] sm:text-xs font-black text-slate-800 leading-none">{storeOption.value}</div>
                      <div className="text-[8.5px] sm:text-[10px] text-slate-455 font-bold mt-0.5 whitespace-nowrap">
                        {storeOption.extra > 0 ? `+₹${storeOption.extra.toLocaleString('en-IN')}` : 'Base'}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>          </div>

            {/* Actions button blocks */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                className="flex-grow bg-slate-900 hover:bg-slate-800 text-white rounded-full font-black text-[11px] uppercase tracking-widest h-12 shadow cursor-pointer active:scale-98 transition-all flex items-center justify-center border-none"
                onClick={handleAddToCartAction}
              >
                Add to Cart
              </button>
              
              <button
                className="flex-grow border-2 border-slate-900 text-slate-900 bg-white hover:bg-slate-50 rounded-full font-black text-[11px] uppercase tracking-widest h-12 cursor-pointer active:scale-98 transition-all flex items-center justify-center"
                onClick={handleBuyNowAction}
              >
                Buy Now
              </button>

              <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-450 hover:text-rose-500 hover:border-rose-200 transition-all cursor-pointer active:scale-90 shadow-sm bg-white">
                <Heart className="w-5 h-5" />
              </button>
            </div>



          </div>
        </div>

        {/* Technical Specifications Section [NEW] */}
        <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.01)] space-y-6">
          <div className="pb-3.5 border-b border-slate-100 text-left">
            <h2 className="text-base font-black text-slate-855 tracking-tight">Technical Specifications</h2>
            <p className="text-[11px] text-slate-450 font-bold mt-0.5">Hardware specifications and details for {productData.name}.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            {/* Display */}
            <div className="p-4.5 bg-slate-50/40 rounded-2xl border border-slate-100/70 flex items-start space-x-3 text-left">
              <Monitor className="w-5.5 h-5.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 tracking-tight">Display</h4>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  {isMacbook 
                    ? '16.2-inch Liquid Retina XDR display (3024 x 1964) with ProMotion technology up to 120Hz' 
                    : '16.0-inch OLED QHD+ display (2560 x 1600) with 240Hz refresh rate'}
                </p>
              </div>
            </div>

            {/* Processor */}
            <div className="p-4.5 bg-slate-50/40 rounded-2xl border border-slate-100/70 flex items-start space-x-3 text-left">
              <Cpu className="w-5.5 h-5.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 tracking-tight">Processor</h4>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  {isMacbook 
                    ? 'Apple M3 Max chip with 16-core CPU, 40-core GPU, and 16-core Neural Engine' 
                    : 'Intel Core i9-13900H Processor (14 cores, 20 threads, up to 5.4GHz)'}
                </p>
              </div>
            </div>

            {/* Graphics */}
            <div className="p-4.5 bg-slate-50/40 rounded-2xl border border-slate-100/70 flex items-start space-x-3 text-left">
              <Layers className="w-5.5 h-5.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 tracking-tight">Graphics</h4>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  {isMacbook 
                    ? '40-core hardware-accelerated ray tracing GPU with dynamic caching architecture' 
                    : 'NVIDIA GeForce RTX 4070 Laptop GPU with 8GB GDDR6 Dedicated memory'}
                </p>
              </div>
            </div>

            {/* Battery & Power */}
            <div className="p-4.5 bg-slate-50/40 rounded-2xl border border-slate-100/70 flex items-start space-x-3 text-left">
              <Battery className="w-5.5 h-5.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 tracking-tight">Battery & Power</h4>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  {isMacbook 
                    ? 'Up to 22 hours Apple TV app movie playback, 140W USB-C Power Adapter support' 
                    : '90Whr high-capacity Lithium-ion battery, 240W fast-charging AC adapter'}
                </p>
              </div>
            </div>

            {/* Ports & Expansion */}
            <div className="p-4.5 bg-slate-50/40 rounded-2xl border border-slate-100/70 flex items-start space-x-3 text-left">
              <HardDrive className="w-5.5 h-5.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 tracking-tight">I/O Ports</h4>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  {isMacbook 
                    ? '3x Thunderbolt 4 (USB-C) ports, HDMI port, SDXC card slot, MagSafe 3 port' 
                    : '2x USB 3.2 Gen 2 Type-A, 1x Thunderbolt 4, 1x USB-C, 1x HDMI 2.1, Audio Combo jack'}
                </p>
              </div>
            </div>

            {/* Wireless & Connectivity */}
            <div className="p-4.5 bg-slate-50/40 rounded-2xl border border-slate-100/70 flex items-start space-x-3 text-left">
              <Wifi className="w-5.5 h-5.5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="font-black text-slate-800 tracking-tight">Connectivity</h4>
                <p className="text-slate-500 font-semibold leading-relaxed">
                  {isMacbook 
                    ? 'Wi-Fi 6E (802.11ax), Bluetooth 5.3 wireless technologies built-in' 
                    : 'Intel Killer Wi-Fi 6E AX1675, Bluetooth 5.3, Gigabit Ethernet port'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.01)] space-y-6">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="space-y-1 text-left">
              <h2 className="text-base font-black text-slate-850 tracking-tight">Customer Reviews</h2>
              <p className="text-[11px] text-slate-455 font-bold">Verified feedback from our tech community.</p>
            </div>
            
            <button className="h-[34px] px-4 border border-blue-150 hover:bg-blue-50/30 text-blue-650 text-xs font-black rounded-full flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Write a Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl border border-slate-150/70 bg-white hover:border-slate-350 hover:shadow-sm transition-all duration-300 text-left space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 text-xs font-black">
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">{rev.author}</h4>
                      {rev.verified && (
                        <div className="flex items-center space-x-1 mt-0.5">
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3.5px]" />
                          <span className="text-[9px] text-emerald-655 font-bold">Verified Buyer</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Rating value={rev.rating} readOnly size="sm" />
                </div>

                <p className="text-xs text-slate-550 leading-relaxed font-sans italic">{rev.text}</p>
                
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] font-bold text-slate-400">
                  <button className="flex items-center space-x-1.5 hover:text-slate-700 transition-colors active:scale-90 cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Helpful ({rev.helpfulCount})</span>
                  </button>
                  <span>{rev.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frequently Bought Together (Bottom Section) */}
        <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 md:p-8 shadow-[0_4px_30px_rgba(15,23,42,0.01)] space-y-6">
          <div className="flex items-center space-x-2 pb-3.5 border-b border-slate-100">
            <h2 className="text-base font-black text-slate-850 tracking-tight">Frequently Bought Together</h2>
            <div className="bg-blue-50 text-blue-700 border border-blue-100/50 rounded-full px-2.5 py-0.5 text-[9px] font-black tracking-wide flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>Recommendation</span>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
            {bundleItems.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="p-3.5 rounded-[28px] border border-slate-200/50 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.02)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-350 flex flex-col justify-between items-stretch overflow-hidden group cursor-pointer"
              >
                {/* Thumbnail image */}
                <div className="relative w-full aspect-[4/3] rounded-[22px] bg-slate-50/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-103"
                  />
                </div>

                {/* Content Container */}
                <div className="flex flex-col flex-grow justify-between text-left mt-3">
                  <div className="space-y-1 mb-2">
                    <span className="text-[10px] font-black text-blue-655 tracking-wider uppercase">ACCESSORIES</span>
                    <h4 className="text-[13.5px] font-extrabold text-slate-800 tracking-tight leading-tight mt-1 truncate w-full">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-1 pt-1">
                      <Rating value={5} readOnly size="sm" />
                      <span className="text-[10.5px] text-slate-800 font-bold ml-1.5">(48)</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <span className="text-[9.5px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-[5px]">
                        {item.specs}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100/80 my-3" />

                  <div className="flex items-center justify-between flex-shrink-0">
                    <div className="flex flex-col text-left">
                      <Price value={item.price} className="text-[14.5px] font-black text-slate-900 leading-none" />
                      {item.listPrice && (
                        <Price value={item.listPrice} className="text-[10.5px] text-slate-400 line-through font-bold mt-1" />
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddBundleItem(item);
                        toast.success(`${item.name} added to cart!`, { icon: '🛒' });
                      }}
                      className="w-9 h-9 rounded-full bg-blue-50/70 hover:bg-blue-600 text-slate-800 hover:text-white flex items-center justify-center cursor-pointer active:scale-95 transition-all shadow-sm"
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <ShoppingCart className="w-4 h-4 stroke-[2.2px]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default ProductDetail;
