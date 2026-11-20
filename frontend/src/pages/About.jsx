import { useEffect, useState } from 'react';
import { api } from '../api/client';
import campusAbout from '../assets/campus-about.jpg';

export default function About() {
  const [college, setCollege] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCollege()
      .then(setCollege)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading...</div>;
  if (!college) return null;

  return (
    <div className="fade-in">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">About {college.fullName}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Learn more about our institution, our mission, and our commitment to students.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="rounded-2xl overflow-hidden h-64">
          <img src={campusAbout} alt="Campus" className="w-full h-full object-cover" />
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-900">Who We Are</h2>
          <p className="text-gray-600 leading-relaxed">{college.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="module-card">
          <div className="icon-box">
            <svg className="w-5 h-5" style={{ color: '#1FA86B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Mission</h3>
          <p className="text-sm text-gray-500">{college.mission}</p>
        </div>
        <div className="module-card">
          <div className="icon-box">
            <svg className="w-5 h-5" style={{ color: '#1FA86B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Vision</h3>
          <p className="text-sm text-gray-500">{college.vision}</p>
        </div>
        <div className="module-card">
          <div className="icon-box">
            <svg className="w-5 h-5" style={{ color: '#1FA86B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Goals</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            {(college.goals || []).map((g, i) => (
              <li key={i}>{i + 1}. {g}</li>
            ))}
          </ul>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4 text-gray-900">Contact Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="icon-box !mb-0">
            <svg className="w-5 h-5" style={{ color: '#1FA86B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-sm">Address</div>
            <div className="text-sm text-gray-500">{college.address}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="icon-box !mb-0">
            <svg className="w-5 h-5" style={{ color: '#1FA86B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-sm">Email</div>
            <div className="text-sm text-gray-500">{college.email}</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="icon-box !mb-0">
            <svg className="w-5 h-5" style={{ color: '#1FA86B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <div>
            <div className="font-medium text-sm">Phone</div>
            <div className="text-sm text-gray-500">{college.phone}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
