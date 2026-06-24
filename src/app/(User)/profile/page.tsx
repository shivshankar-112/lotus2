'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfilePage, { WalletProfileSection } from '@/components/auth/profile-page';
import { fetchUserProfile } from '@/app/store/features/userSlice';
import type { RootState, AppDispatch } from '@/app/store/store';
import { fetchWallet } from '@/app/store/features/walletSlice';



const Page = () => {

  const dispatch = useDispatch<AppDispatch>();

  const { data, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const { data: walletData } = useSelector(
    (state: RootState) => state.wallet
  );

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchWallet());
  }, [dispatch]);

  return (
    <div
      className="min-h-screen flex flex-col max-w-md mx-auto pb-8"
      style={{ background: "#080b12", fontFamily: "'DM Sans', sans-serif", color: "#fff" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {loading && <p>Loading...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && data && (
        <ProfilePage user={{ ...data, balance: walletData?.balance }} wallet={walletData} />
      )}

      {
        walletData && <WalletProfileSection wallet={walletData} />
      }



    </div>
  );
};

export default Page;