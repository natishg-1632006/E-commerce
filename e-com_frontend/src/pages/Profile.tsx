import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store';
import { setProfile } from '../store/authSlice';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/Button';
import { 
  User, 
  MapPin, 
  Trash2, 
  Plus, 
  Phone, 
  Home, 
  Briefcase, 
  AlertCircle,
  ArrowLeft,
  Edit2
} from 'lucide-react';
import { cn } from '../lib/cn';
import toast from 'react-hot-toast';
import { addressService } from '../services/address.service';

interface Address {
  id: string;
  label: string; // 'Home Address' | 'Work Address' | etc
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateName: string;
  pincode: string;
  phone: string;
  isDefault: boolean;
}

export const Profile: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile } = useSelector((state: RootState) => state.auth);

  // Profile fields state
  const [fullNameState, setFullNameState] = useState('');
  const [phoneState, setPhoneState] = useState('');
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [personalErrors, setPersonalErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Load profile and address from backend on mount
  useEffect(() => {
    const loadProfileAndAddress = async () => {
      setIsLoading(true);
      try {
        const fullProfile = await addressService.getProfile();
        // Sync profile to Redux
        dispatch(setProfile({
          email: fullProfile.email,
          fullName: fullProfile.fullName,
          phone: fullProfile.phone,
          profileImage: fullProfile.profileImage,
          role: fullProfile.role,
        }));
        
        setFullNameState(fullProfile.fullName || '');
        setPhoneState(fullProfile.phone || '');

        if (fullProfile.address) {
          const addr = fullProfile.address;
          const parts = (addr.address || '').split(', ');
          const addressList: Address[] = [{
            id: 'addr-profile',
            label: 'Home Address',
            fullName: addr.fullName || fullProfile.fullName || '',
            addressLine1: parts[0] || '',
            addressLine2: parts.slice(1).join(', ') || '',
            city: addr.city || '',
            stateName: addr.state || '',
            pincode: addr.pincode || '',
            phone: addr.phone || fullProfile.phone || '',
            isDefault: true,
          }];
          setAddresses(addressList);
        } else {
          setAddresses([]);
        }
      } catch (err) {
        console.error('Error loading profile from backend:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileAndAddress();
  }, [dispatch]);

  // Handle personal details save
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!fullNameState.trim()) errs.fullName = 'Full name is required';
    if (!phoneState.trim()) errs.phone = 'Phone number is required';
    
    if (Object.keys(errs).length > 0) {
      setPersonalErrors(errs);
      return;
    }

    setPersonalErrors({});
    setIsLoading(true);
    try {
      const updated = await addressService.updateProfile(fullNameState, phoneState);
      dispatch(setProfile({
        ...profile,
        email: updated.email,
        fullName: updated.fullName,
        phone: updated.phone,
        profileImage: updated.profileImage,
        role: updated.role,
      }));
      toast.success('Personal details updated successfully!');
      setIsEditingPersonal(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to update personal details.';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto flex flex-col items-stretch space-y-8 select-none text-left animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="flex items-center space-x-2 text-[10.5px] font-bold text-slate-455">
            <div className="h-3.5 w-10 bg-slate-200 rounded" />
            <div className="h-3.5 w-3 bg-slate-300/50" />
            <div className="h-3.5 w-12 bg-slate-200 rounded" />
            <div className="h-3.5 w-3 bg-slate-300/50" />
            <div className="h-3.5 w-24 bg-slate-200 rounded" />
          </div>

          {/* Header Title */}
          <div className="border-b border-slate-100 pb-4">
            <div className="h-7 w-48 bg-slate-300 rounded" />
            <div className="h-3.5 w-80 bg-slate-200 rounded mt-2" />
          </div>

          {/* Profile Card Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Avatar Panel Left */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm shimmer-sweep">
              <div className="w-20 h-20 rounded-full bg-slate-200" />
              <div className="space-y-1 flex flex-col items-center">
                <div className="h-4 w-28 bg-slate-300 rounded" />
                <div className="h-3 w-16 bg-slate-200 rounded mt-1.5" />
              </div>
              <div className="pt-2 border-t border-slate-100 w-full flex justify-center">
                <div className="h-3 w-32 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Personal Info Right */}
            <div className="md:col-span-2 bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm space-y-5 shimmer-sweep">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="h-4 w-32 bg-slate-300 rounded" />
                <div className="h-3.5 w-16 bg-slate-200 rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-14 bg-slate-100 rounded-2xl border border-slate-100/80 p-3" />
                <div className="h-14 bg-slate-100 rounded-2xl border border-slate-100/80 p-3" />
              </div>
              <div className="h-14 bg-slate-100 rounded-2xl border border-slate-100/80 p-3" />
            </div>
          </div>

          {/* Shipping Addresses Section */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-slate-300 rounded" />
                <div className="h-3.5 w-64 bg-slate-200 rounded" />
              </div>
              <div className="h-9 w-28 bg-slate-200 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="p-5 rounded-3xl border border-slate-200 bg-white space-y-4 shadow-sm shimmer-sweep">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-20 bg-slate-300 rounded" />
                    <div className="h-3.5 w-12 bg-slate-300 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-28 bg-slate-300 rounded" />
                    <div className="h-3 w-48 bg-slate-200 rounded" />
                    <div className="h-3 w-40 bg-slate-200 rounded" />
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between">
                    <div className="h-3.5 w-24 bg-slate-200 rounded" />
                    <div className="flex space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-200" />
                      <div className="w-7 h-7 rounded-lg bg-slate-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Handle address delete
  const handleDeleteAddress = async (_id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      await addressService.deleteAddress();
      setAddresses([]);
      if (profile) {
        dispatch(setProfile({ ...profile, address: '' }));
      }
      toast.success('Address removed successfully!');
    } catch (err: any) {
      console.error('Error deleting address:', err);
      toast.error('Failed to remove address.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle default status directly from card click
  const handleSetDefault = (_id: string) => {
    // Only one address is supported by the backend, which is default by definition
    toast.success('Address is set as default.');
  };

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto flex flex-col items-stretch space-y-8 select-none text-left">
        
        {/* Navigation Breadcrumb & Back row */}
        <div className="flex items-center space-x-2 text-[10.5px] font-bold text-slate-455">
          <button 
            onClick={() => navigate('/')} 
            className="hover:text-blue-650 transition-colors flex items-center space-x-1 border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
          <span>&gt;</span>
          <span className="text-slate-800">Account</span>
          <span>&gt;</span>
          <span className="text-blue-600">Personal Details</span>
        </div>

        {/* Header Title */}
        <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-855 tracking-tight">Personal Details</h1>
            <p className="text-[11px] text-slate-455 font-bold mt-0.5">Manage your personal settings, email address, and shipping layouts.</p>
          </div>
        </div>

        {/* Profile Card & Personal Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          
          {/* Avatar Panel Left */}
          <div className="bg-white border border-slate-200/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                <User className="w-10 h-10 stroke-[2.2px]" />
              </div>
              <button 
                className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center border-2 border-white shadow hover:bg-blue-700 transition-all cursor-pointer active:scale-90"
                aria-label="Edit Profile Picture"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none">{profile?.fullName || 'User Profile'}</h3>
              <span className="text-[10px] text-slate-455 font-bold tracking-wide uppercase">{profile?.role || 'Valued Customer'}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 w-full text-center">
              <span className="text-[10.5px] font-bold text-slate-400">Account Active since 2026</span>
            </div>
          </div>

          {/* Personal Info fields Right */}
          <div className="md:col-span-2 bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Account Information</h2>
              {!isEditingPersonal && (
                <button
                  onClick={() => setIsEditingPersonal(true)}
                  className="text-[10px] font-black text-blue-600 hover:text-blue-800 flex items-center space-x-1 cursor-pointer bg-transparent border-none"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  <span>Edit Info</span>
                </button>
              )}
            </div>

            {isEditingPersonal ? (
              <form onSubmit={handleSavePersonal} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      value={fullNameState}
                      onChange={(e) => setFullNameState(e.target.value)}
                      className={cn(
                        "w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all",
                        personalErrors.fullName && "border-red-500 bg-red-50/10 focus:border-red-500"
                      )}
                      placeholder="e.g. Natish G"
                    />
                    {personalErrors.fullName && (
                      <span className="text-[9.5px] font-bold text-red-550 flex items-center space-x-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{personalErrors.fullName}</span>
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Phone Number</label>
                    <input
                      type="text"
                      value={phoneState}
                      onChange={(e) => setPhoneState(e.target.value)}
                      className={cn(
                        "w-full h-10 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 transition-all",
                        personalErrors.phone && "border-red-500 bg-red-50/10 focus:border-red-500"
                      )}
                      placeholder="e.g. +91 98765 43210"
                    />
                    {personalErrors.phone && (
                      <span className="text-[9.5px] font-bold text-red-550 flex items-center space-x-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{personalErrors.phone}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Email Address (Primary)</label>
                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full h-10 px-3.5 bg-slate-100/75 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-455 cursor-not-allowed text-left"
                  />
                  <span className="text-[9px] text-slate-400 font-bold leading-relaxed">Email address is locked for account verification.</span>
                </div>

                <div className="flex items-center space-x-3.5 pt-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 rounded-lg"
                    onClick={() => {
                      if (profile) {
                        setFullNameState(profile.fullName || '');
                        setPhoneState(profile.phone || '');
                      }
                      setIsEditingPersonal(false);
                    }}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs h-9 rounded-lg px-5"
                    type="submit"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4.5 text-left text-xs font-bold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Full Name</span>
                    <span className="text-slate-800 font-extrabold">{profile?.fullName || 'Not Configured'}</span>
                  </div>
                  <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider block">Phone Number</span>
                    <span className="text-slate-800 font-extrabold">{profile?.phone || 'Not Configured'}</span>
                  </div>
                </div>
                <div className="space-y-1 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[9px] font-black text-slate-455 uppercase tracking-wider block">Email Address (Locked)</span>
                  <span className="text-slate-800 font-extrabold">{profile?.email}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Shipping Addresses Section */}
        <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-black text-slate-855 tracking-tight">Saved Shipping Addresses</h2>
              <p className="text-[10px] text-slate-450 font-bold mt-0.5">Manage default destination routes for express shipping.</p>
            </div>
            <button
              onClick={() => navigate('/profile/address/new')}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-[10.5px] uppercase tracking-wider shadow flex items-center justify-center space-x-1 border-none cursor-pointer active:scale-95 transition-all self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Address</span>
            </button>
          </div>

          {/* Addresses Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                onClick={() => handleSetDefault(addr.id)}
                className={cn(
                  "p-5 rounded-3xl border text-left flex flex-col justify-between space-y-4 transition-all duration-350 cursor-pointer shadow-sm relative group hover:shadow-md",
                  addr.isDefault 
                    ? "border-blue-600 bg-blue-50/5" 
                    : "border-slate-200/60 bg-white hover:border-slate-300"
                )}
              >
                {/* Header info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-blue-650 tracking-wider uppercase flex items-center space-x-1">
                      {addr.label === 'Work Address' ? <Briefcase className="w-3.5 h-3.5 mr-1" /> : <Home className="w-3.5 h-3.5 mr-1" />}
                      <span>{addr.label}</span>
                    </span>
                    
                    {addr.isDefault && (
                      <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-sm">
                        Default
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs font-black text-slate-800 pt-1.5">{addr.fullName}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed pt-1">
                    {addr.addressLine1},<br />
                    {addr.addressLine2 && `${addr.addressLine2}, `}
                    {addr.city}, {addr.stateName} - <span className="font-bold text-slate-700">{addr.pincode}</span>
                  </p>
                  <p className="text-[10px] font-bold text-slate-455 pt-1.5 flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{addr.phone}</span>
                  </p>
                </div>

                {/* Bottom Actions footer */}
                <div className="border-t border-slate-100/80 pt-3 flex items-center justify-between">
                  <span className="text-[9.5px] font-bold text-slate-450">
                    {addr.isDefault ? 'Default Destination' : 'Click to Set as Default'}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/address/edit/${addr.id}`);
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-blue-50 text-slate-455 hover:text-blue-650 transition-colors border border-slate-100 cursor-pointer"
                      aria-label="Edit address"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    
                    <button
                      onClick={(e) => handleDeleteAddress(addr.id, e)}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-455 hover:text-red-550 transition-colors border border-slate-100 cursor-pointer"
                      aria-label="Delete address"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {addresses.length === 0 && (
              <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-3xl space-y-3">
                <MapPin className="w-10 h-10 text-slate-300" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800">No Saved Addresses</h4>
                  <p className="text-[10px] text-slate-455 font-bold">Add shipping routes to speed up your checkout process.</p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default Profile;
