import Head from 'next/head';
import Image from 'next/image';

import Header from '../components/Header';
import TopCards from '../components/TopCards';
import BarChart from '../components/BarChart';
import RecentOrders from '../components/RecentOrders';

export default function Patient() {
  return (
    <>     
        <Header
        titlePage='Acolhidos'
      />
        <TopCards />
        <div className='p-4 grid xl:grid-cols-3 grid-cols-1 gap-4'>
          <BarChart />
          <RecentOrders />
        </div>
      
    </>
  );
}
