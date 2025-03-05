'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types/movie';

export default function Home() {
  const [userId, setUserId] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedUserId = localStorage.getItem('doubanUserId');
    if (savedUserId) {
      setUserId(savedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      handleSubmit(new Event('submit') as React.FormEvent);
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/movies?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取电影失败');
      }

      setMovies(data);
      localStorage.setItem('doubanUserId', userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取电影失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          豆瓣随机电影推荐
        </h1>

        <form onSubmit={handleSubmit} className="mb-8 text-center">
          <input
            type="text"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              localStorage.setItem('doubanUserId', e.target.value);
            }}
            placeholder="请输入豆瓣用户ID"
            className="px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:border-blue-500 text-gray-900"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? '加载中...' : '获取推荐'}
          </button>
        </form>

        {error && (
          <div className="text-red-500 text-center mb-4">{error}</div>
        )}

        <div className="space-y-6">
          {movies.map((movie) => (
            <a
              key={movie.id}
              href={movie.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="w-48 flex-shrink-0">
                <img
                  src={`/api/image?url=${encodeURIComponent(movie.pic)}`}
                  alt={movie.title}
                  className="w-full h-72 object-cover"
                />
              </div>
              <div className="flex-1 p-6">
                <div className="mb-4">
                  <span className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    {movie.title}
                    {movie.playable && (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-blue-500">
                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                      </svg>
                    )}
                  </span>
                  {movie.titleAlias && (
                    <div className="mt-1 text-sm text-gray-500">{movie.titleAlias}</div>
                  )}
                </div>
                
                <div className="mb-4 text-sm text-gray-600">
                  {movie.duration && (
                    <div className="mb-2">
                      <span className="font-semibold">片长：</span>
                      {movie.duration}
                    </div>
                   )}
                  {movie.year && (
                    <div className="mb-2">
                      <span className="font-semibold">年份：</span>
                      {movie.year}
                    </div>
                  )}
                  {movie.rating && (
                    <div className="mb-2">
                      <span className="font-semibold">评分：</span>
                      {movie.rating}
                    </div>
                  )}
                  {movie.addedAt && (
                    <div className="mb-2">
                      <span className="font-semibold">标记时间：</span>
                      {movie.addedAt}
                    </div>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
