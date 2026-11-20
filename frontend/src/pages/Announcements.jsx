import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return d;
  }
}

const images = [campus1, campus2, campusHero];

const filters = [
  { value: 'all', label: 'All' },
  { value: 'News', label: 'News' },
  { value: 'Event', label: 'Events' },
  { value: 'Announcement', label: 'School Information' },
];

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter !== 'all') params.category = filter;
    if (search) params.search = search;

    api.getAnnouncements(params)
      .then((res) => setItems(res.data || res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filter, search]);

  return (
    <div className="fade-in">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Announcements & Updates</h1>
      <p className="text-sm text-gray-500 mb-6">
        Stay informed with the latest news, events and updates from our college.
      </p>

      <div className="relative mb-5 max-w-2xl">
        <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search announcements..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          style={{ borderColor: '#B8DCC4' }}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f.value
                ? 'text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
            style={filter === f.value ? { background: '#1FA86B' } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-400">No announcements found.</div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {items.map((a, i) => (
            <Link
              key={a.id}
              to={`/announcements/${a.id}`}
              className="bg-white rounded-xl border p-4 flex gap-4 transition block hover:shadow-md"
              style={{ borderColor: '#B8DCC4' }}
            >
              <img
                src={images[i % images.length]}
                alt=""
                className="w-28 h-24 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 mb-1.5">
                  <span className={`inline-block px-2 py-0.5 ${badgeColor(a.category)} text-xs font-medium rounded-full`}>
                    {a.category?.toUpperCase()}
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                    {a.status || 'PUBLISHED'}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 truncate">{a.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-1">{a.summary}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{formatDate(a.date)}</span>
                  <span className="text-sm font-medium" style={{ color: '#1FA86B' }}>Read More →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
