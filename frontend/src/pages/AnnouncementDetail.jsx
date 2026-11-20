import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import campus1 from '../assets/campus-1.jpg';
import campus2 from '../assets/campus-2.jpg';
import campusHero from '../assets/campus-hero.jpg';

function badgeColor(cat) {
  if (cat === 'Event') return 'bg-blue-500 text-white';
  if (cat === 'News') return 'bg-amber-500 text-white';
  return 'bg-emerald-500 text-white';
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
}

const images = [campus1, campus2, campusHero];

export default function AnnouncementDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getAnnouncement(id)
      .then(setItem)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!item) return null;

  // Pick image based on id hash
  const imgIndex = (id?.charCodeAt(id.length - 1) || 0) % images.length;

  return (
    <div className="fade-in max-w-3xl">
      <Link to="/announcements" className="flex items-center gap-1 text-sm font-medium mb-6" style={{ color: '#1FA86B' }}>
        ← Back to Announcement
      </Link>

      <h1 className="text-2xl font-semibold mb-3 text-gray-900">{item.title}</h1>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className={`inline-block px-3 py-1 ${badgeColor(item.category)} text-xs font-medium rounded-full`}>
          {item.category?.toUpperCase()}
        </span>
        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
          {item.status || 'PUBLISHED'}
        </span>
      </div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {formatDate(item.date)}
      </div>
      <img
        src={images[imgIndex]}
        alt=""
        className="w-full h-64 object-cover rounded-2xl mb-6"
      />
      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line leading-relaxed">
        {item.content}
      </div>
    </div>
  );
}
