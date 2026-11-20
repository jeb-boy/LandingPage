import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import ModuleCard from '../components/ModuleCard';
import campusHero from '../assets/campus-hero.jpg';
import campus1 from '../assets/campus-1.jpg';
import campus2 from '../assets/campus-2.jpg';

function badgeColor(cat) {
  if (cat === 'Event') return 'bg-blue-500 text-white';
  if (cat === 'News') return 'bg-amber-500 text-white';
  return 'bg-emerald-500 text-white';
}

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
}

// Map announcement index to campus photos
const announceImages = [campus1, campus2, campusHero];

export default function Home() {
  const [college, setCollege] = useState(null);
  const [modules, setModules] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [c, m, a] = await Promise.all([
          api.getCollege(),
          api.getModules(),
          api.getAnnouncements(),
        ]);
        setCollege(c);
        setModules(m);
        setAnnouncements(a.data || a);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 font-medium mb-2">Cannot connect to backend</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <code className="text-xs bg-gray-100 px-3 py-1 rounded">
          cd backend && npm install && npm start
        </code>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-56 md:h-64">
        <img
          src={campusHero}
          alt="IDSC Campus"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(90deg, rgba(10,61,42,0.92) 0%, rgba(10,61,42,0.75) 45%, rgba(10,61,42,0.4) 100%)' }}
        />
        <div className="relative h-full flex flex-col justify-center px-8 md:px-12 text-white">
          <p className="text-green-200 text-sm mb-1">Welcome to</p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide mb-2 leading-tight">
            INFOTECH DEVELOPMENT<br />SYSTEM COLLEGE
          </h1>
          <p className="text-green-100 text-sm mb-5 max-w-md">
            {college?.tagline || 'Building better futures through quality education.'}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/modules"
              className="px-5 py-2.5 text-sm font-medium rounded-lg text-white"
              style={{ background: '#1FA86B' }}
            >
              Explore Modules
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur text-white text-sm font-medium rounded-lg border border-white/40"
            >
              Student Login
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Quick Access</h2>
        <p className="text-sm text-gray-500 mb-4">
          Access the services and systems available in the College Management System.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => (
            <ModuleCard key={m.id} module={m} />
          ))}
        </div>
      </div>

      {/* Latest Announcements */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Latest Announcements</h2>
          <Link to="/announcements" className="text-sm font-medium" style={{ color: '#1FA86B' }}>
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {announcements.slice(0, 3).map((a, i) => (
            <Link
              key={a.id}
              to={`/announcements/${a.id}`}
              className="announce-card block"
            >
              <div className="mb-3 rounded-lg overflow-hidden h-28">
                <img
                  src={announceImages[i % announceImages.length]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`inline-block px-2.5 py-1 ${badgeColor(a.category)} text-xs font-medium rounded-full mb-2`}>
                {a.category?.toUpperCase()}
              </span>
              <h3 className="font-semibold text-gray-900 mb-1 text-[15px]">{a.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{a.summary}</p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-400">{formatDate(a.date)}</span>
                <span className="text-sm font-medium" style={{ color: '#1FA86B' }}>Read More →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
