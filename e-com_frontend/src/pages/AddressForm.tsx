import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { RootState } from '../store';
import { setProfile } from '../store/authSlice';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/Button';
import { 
  MapPin, 
  AlertCircle, 
  ArrowLeft
} from 'lucide-react';
import { cn } from '../lib/cn';
import toast from 'react-hot-toast';

interface Address {
  id: string;
  label: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateName: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export const AddressForm: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { profile } = useSelector((state: RootState) => state.auth);

  // Form states
  const [addrLabel, setAddrLabel] = useState('Home Address');
  const [addrFullName, setAddrFullName] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrStateName, setAddrStateName] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Load existing addresses list and populate if in Edit mode
  useEffect(() => {
    const savedAddr = localStorage.getItem('natcart_addresses');
    let loadedAddresses: Address[] = [];
    
    if (savedAddr) {
      loadedAddresses = JSON.parse(savedAddr);
      setAddresses(loadedAddresses);
    }

    if (id) {
      // Edit Mode
      const matched = loadedAddresses.find((a) => a.id === id);
      if (matched) {
        setAddrLabel(matched.label);
        setAddrFullName(matched.fullName);
        setAddrLine1(matched.addressLine1);
        setAddrLine2(matched.addressLine2);
        setAddrCity(matched.city);
        setAddrStateName(matched.stateName);
        setAddrPincode(matched.pincode);
        setAddrPhone(matched.phone);
        setAddrIsDefault(matched.isDefault);
      } else {
        toast.error('Address not found!');
        navigate('/profile');
      }
    } else {
      // Add Mode
      setAddrFullName(profile?.fullName || '');
      setAddrPhone(profile?.phone || '');
      setAddrIsDefault(loadedAddresses.length === 0); // default if first address
    }
  }, [id, profile, navigate]);

  // Handle Save Address Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};

    if (!addrFullName.trim()) errs.fullName = 'Contact name is required';
    if (!addrLine1.trim()) errs.line1 = 'Address line 1 is required';
    if (!addrCity.trim()) errs.city = 'City is required';
    if (!addrStateName.trim()) errs.stateName = 'State is required';

    // Pincode validation: must be exactly 6 digits
    const pinDigits = addrPincode.replace(/\D/g, '');
    if (pinDigits.length !== 6 || isNaN(Number(pinDigits))) {
      errs.pincode = 'Pincode must be exactly 6 digits';
    }

    if (!addrPhone.trim()) {
      errs.phone = 'Phone number is required';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setErrors({});

    let updatedAddresses = [...addresses];

    // If set as default, clear other default states
    if (addrIsDefault) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
    }

    const addressData: Address = {
      id: id ? id : `addr-${Date.now()}`,
      label: addrLabel,
      fullName: addrFullName,
      addressLine1: addrLine1,
      addressLine2: addrLine2,
      city: addrCity,
      stateName: addrStateName,
      pincode: pinDigits,
      phone: addrPhone,
      isDefault: addrIsDefault || addresses.length === 0, // always default if only address
    };

    if (id) {
      // Update
      updatedAddresses = updatedAddresses.map((a) => (a.id === id ? addressData : a));
      toast.success('Address updated successfully!');
    } else {
      // Create
      updatedAddresses.push(addressData);
      toast.success('New address added successfully!');
    }

    // Sync default address to redux profile
    const defaultAddress = updatedAddresses.find((a) => a.isDefault);
    if (defaultAddress && profile) {
      dispatch(setProfile({ ...profile, address: JSON.stringify(defaultAddress) }));
    }

    localStorage.setItem('natcart_addresses', JSON.stringify(updatedAddresses));
    navigate('/profile');
  };

  return (
    <MainLayout>
      <div className="max-w-xl mx-auto flex flex-col items-stretch space-y-8 select-none text-left">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-[10.5px] font-bold text-slate-455">
          <Link to="/" className="hover:text-blue-650 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link to="/profile" className="hover:text-blue-650 transition-colors">Profile</Link>
          <span>&gt;</span>
          <span className="text-blue-600">{id ? 'Edit Address' : 'Add New Address'}</span>
        </div>

        {/* Back link option button */}
        <div>
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center space-x-1.5 text-xs font-black text-slate-655 hover:text-slate-800 transition-colors border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Profile</span>
          </button>
        </div>

        {/* Header Title */}
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-xl md:text-2xl font-black text-slate-855 tracking-tight flex items-center space-x-2">
            <MapPin className="w-5.5 h-5.5 text-blue-600" />
            <span>{id ? 'Modify Shipping Address' : 'Register New Address'}</span>
          </h1>
          <p className="text-[11px] text-slate-455 font-bold mt-0.5">
            {id ? 'Modify your shipping coordinates for checkout.' : 'Add a new shipping route for express checkout.'}
          </p>
        </div>

        {/* Form panel */}
        <div className="bg-white border border-slate-200/50 rounded-[32px] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Address Label buttons */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Address Label</label>
              <div className="flex items-center space-x-3">
                {['Home Address', 'Work Address', 'Other Address'].map((lbl) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setAddrLabel(lbl)}
                    className={cn(
                      "h-8 px-4 rounded-xl border text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                      addrLabel === lbl 
                        ? "border-blue-600 bg-blue-50/5 text-blue-600" 
                        : "border-slate-200 text-slate-500 hover:border-slate-350 bg-white"
                    )}
                  >
                    {lbl.replace(' Address', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Recipient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  value={addrFullName}
                  onChange={(e) => setAddrFullName(e.target.value)}
                  className={cn(
                    "w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all",
                    errors.fullName && "border-red-500 bg-red-50/10 focus:border-red-500"
                  )}
                  placeholder="Recipient's name"
                />
                {errors.fullName && (
                  <span className="text-[9.5px] font-bold text-red-550 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.fullName}</span>
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Phone Number</label>
                <input
                  type="text"
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value)}
                  className={cn(
                    "w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all",
                    errors.phone && "border-red-500 bg-red-50/10 focus:border-red-500"
                  )}
                  placeholder="e.g. +91 98765 43210"
                />
                {errors.phone && (
                  <span className="text-[9.5px] font-bold text-red-550 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.phone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Address Line 1</label>
              <input
                type="text"
                value={addrLine1}
                onChange={(e) => setAddrLine1(e.target.value)}
                className={cn(
                  "w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all",
                  errors.line1 && "border-red-500 bg-red-50/10 focus:border-red-500"
                )}
                placeholder="Flat No., House Name, Building, Apartment"
              />
              {errors.line1 && (
                <span className="text-[9.5px] font-bold text-red-550 flex items-center space-x-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.line1}</span>
                </span>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Address Line 2 (Optional)</label>
              <input
                type="text"
                value={addrLine2}
                onChange={(e) => setAddrLine2(e.target.value)}
                className="w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all"
                placeholder="Street Address, Area, Landmark"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">City</label>
                <input
                  type="text"
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className={cn(
                    "w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all",
                    errors.city && "border-red-500 bg-red-50/10 focus:border-red-500"
                  )}
                  placeholder="City"
                />
                {errors.city && (
                  <span className="text-[9.5px] font-bold text-red-550 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.city}</span>
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">State</label>
                <input
                  type="text"
                  value={addrStateName}
                  onChange={(e) => setAddrStateName(e.target.value)}
                  className={cn(
                    "w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all",
                    errors.stateName && "border-red-500 bg-red-50/10 focus:border-red-500"
                  )}
                  placeholder="State"
                />
                {errors.stateName && (
                  <span className="text-[9.5px] font-bold text-red-550 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.stateName}</span>
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Pincode</label>
                <input
                  type="text"
                  value={addrPincode}
                  maxLength={6}
                  onChange={(e) => setAddrPincode(e.target.value.replace(/\D/g, ''))}
                  className={cn(
                    "w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all",
                    errors.pincode && "border-red-500 bg-red-50/10 focus:border-red-500"
                  )}
                  placeholder="6-digit Pincode"
                />
                {errors.pincode && (
                  <span className="text-[9.5px] font-bold text-red-550 flex items-center space-x-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.pincode}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Set as Default checkbox */}
            <div className="flex items-center space-x-2.5 pt-2">
              <input
                type="checkbox"
                id="addr-default-check"
                checked={addrIsDefault}
                onChange={(e) => setAddrIsDefault(e.target.checked)}
                disabled={addresses.length === 0}
                className="w-4.5 h-4.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed"
              />
              <label htmlFor="addr-default-check" className="text-xs font-bold text-slate-700 cursor-pointer disabled:cursor-not-allowed">
                Set as my default shipping address
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end space-x-3.5 pt-4 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-10 rounded-xl px-5"
                onClick={() => navigate('/profile')}
                type="button"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="text-xs h-10 rounded-xl px-6"
                type="submit"
              >
                Save Address
              </Button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddressForm;
