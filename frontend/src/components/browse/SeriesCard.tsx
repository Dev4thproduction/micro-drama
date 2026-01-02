import Link from 'next/link';
import { Play } from 'lucide-react';

interface SeriesProps {
  _id: string;
  title: string;
  posterUrl: string;
  coverImage?: string;
  category?: {
    _id: string;
    name: string;
  };
  episodeCount?: number;
  seasonCount?: number;
}

export default function SeriesCard({ series }: { series: SeriesProps }) {
  // Use episodeCount if available, otherwise fallback to seasonCount or 0
  const count = series.episodeCount || series.seasonCount || 0;
  const label = series.episodeCount ? 'Eps' : 'Seasons';

  return (
    <Link 
      href={`/series/${series._id}`} 
      className="group relative block bg-[#161b22] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-white/5 hover:ring-primary/50"
    >
      <div className="aspect-[2/3] relative overflow-hidden">
        {/* Image */}
        <img 
          src={series.coverImage || series.posterUrl || '/placeholder.jpg'} 
          alt={series.title} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent opacity-90" />
        
        {/* Play Icon (Hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[1px]">
             <div className="p-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                <Play fill="white" className="text-white" size={20} />
             </div>
        </div>

        {/* Info Content */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-bold text-sm md:text-base leading-tight truncate drop-shadow-md group-hover:text-primary transition-colors">
            {series.title}
          </h3>
          
          <div className="flex items-center gap-2 mt-1.5">
            {/* Category Badge */}
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded text-gray-300 border border-white/5">
               {series.category?.name || 'Series'}
            </span>
            
            {/* Episode Count */}
            <span className="text-[10px] text-gray-400 font-medium">
               • {count} {label}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}