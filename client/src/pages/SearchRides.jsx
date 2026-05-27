import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { rideService, adService } from '../services/api';
import HeroSearchForm from '../components/ride/HeroSearchForm';
import FilterSidebar from '../components/ride/FilterSidebar';
import RideCard from '../components/ride/RideCard';
import SkeletonCard from '../components/common/SkeletonCard';
import EmptyState from '../components/common/EmptyState';
import { Car, MapPin, Eye } from 'lucide-react';

export default function SearchRides() {
  const [searchParams] = useSearchParams();
  const [rides, setRides] = useState([]);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [maxPrice, setMaxPrice] = useState(1500);
  const [womenOnly, setWomenOnly] = useState(false);
  const [instant, setInstant] = useState(false);
  const [sort, setSort] = useState('price_low');

  const source = searchParams.get('source') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  const seats = Number(searchParams.get('seats')) || 1;

  const fetchResults = async () => {
    setLoading(true);
    try {
      const results = await rideService.search({
        source,
        destination,
        date,
        seats,
        maxPrice,
        womenOnly,
        instant,
        sort
      });
      setRides(results);

      // Fetch ads for display
      const activeAds = await adService.getAds();
      setAds(activeAds.filter(a => a.position === 'search'));
    } catch (err) {
      console.error('[SearchRides] Search query failed', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [searchParams, maxPrice, womenOnly, instant, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Search Refinement Row */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-[28px] shadow-lg">
        <HeroSearchForm initialValues={{ source, destination, date, seats }} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar */}
        <FilterSidebar 
          maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          womenOnly={womenOnly} setWomenOnly={setWomenOnly}
          instant={instant} setInstant={setInstant}
          sort={sort} setSort={setSort}
        />

        {/* Search Results Listing */}
        <div className="flex-grow space-y-6">
          <div className="flex justify-between items-center bg-white border border-slate-100 px-6 py-4.5 rounded-2xl shadow-premium">
            <div>
              <h2 className="font-outfit font-extrabold text-slate-800 text-lg">Available Rides</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {source && destination ? `${source} → ${destination}` : 'All active routes'} 
                {date ? ` on ${date}` : ''}
              </p>
            </div>
            <span className="bg-brand-50 text-brand-600 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              {rides.length} {rides.length === 1 ? 'ride' : 'rides'} found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : rides.length === 0 ? (
            <EmptyState 
              title="No Matching Rides Found"
              description="No rides are matching your search parameters. Try adjusting filters or offering a ride if you plan to drive."
              action={
                <Link to="/publish" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition-all duration-200">
                  <Car className="w-4 h-4" />
                  <span>Offer a Ride Instead</span>
                </Link>
              }
            />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {rides.map((ride) => (
                  <RideCard key={ride.id} ride={ride} />
                ))}
              </div>
              
              {/* Sponsored Banner Slot */}
              {ads.length > 0 && (
                <a 
                  href={ads[0].linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block bg-slate-50 border border-slate-150 rounded-3xl p-5 hover:shadow-md transition-all relative overflow-hidden group"
                >
                  <div className="absolute right-0 top-0 bg-amber-400 text-white text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-widest">Sponsored</div>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={ads[0].imageUrl} 
                      alt={ads[0].title}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-800 group-hover:text-brand-600 transition-colors">{ads[0].title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1 leading-normal">Click to see exclusive travel packages and deals for your commute route.</p>
                    </div>
                  </div>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
