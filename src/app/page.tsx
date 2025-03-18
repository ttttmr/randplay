'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Movie, Book } from '@/app/types';

type TabType = 'movies' | 'books';

export default function Home() {
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const savedTab = localStorage.getItem('doubanActiveTab');
    return (savedTab === 'movies' || savedTab === 'books') ? savedTab : 'movies';
  });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = activeTab === 'movies' ? 'movies' : 'books';
      const response = await fetch(`/api/${endpoint}?userId=${userId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `获取${activeTab === 'movies' ? '电影' : '图书'}失败`);
      }

      if (activeTab === 'movies') {
        setMovies(data);
      } else {
        setBooks(data);
      }
      localStorage.setItem('doubanUserId', userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : `获取${activeTab === 'movies' ? '电影' : '图书'}失败`);
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab]);

  useEffect(() => {
    const savedUserId = localStorage.getItem('doubanUserId');
    if (savedUserId) {
      setUserId(savedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      const event = { preventDefault: () => {} } as React.FormEvent;
      handleSubmit(event);
    }
  }, [userId, handleSubmit]);

  return (
    <main className="min-h-screen p-8 bg-gray-100">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          豆瓣随机推荐
        </h1>

        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => {
              setActiveTab('movies');
              localStorage.setItem('doubanActiveTab', 'movies');
            }}
            className={`px-6 py-2 rounded-lg ${activeTab === 'movies' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
          >
            电影
          </button>
          <button
            onClick={() => {
              setActiveTab('books');
              localStorage.setItem('doubanActiveTab', 'books');
            }}
            className={`px-6 py-2 rounded-lg ${activeTab === 'books' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'}`}
          >
            图书
          </button>
        </div>

        {!userId && (
          <div className="text-center mb-8 text-gray-600">
            从你的豆瓣想看列表中随机推荐{activeTab === 'movies' ? '一部电影' : '一本书'}，帮你解决选择困难症
          </div>
        )}

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
          {activeTab === 'movies' && movies.map((movie) => (
            <a
              key={movie.id}
              href={movie.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="w-48 flex-shrink-0 relative h-72">
                <Image
                  src={`/api/image?url=${encodeURIComponent(movie.pic)}`}
                  alt={movie.title}
                  fill
                  className="object-cover"
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

          {activeTab === 'books' && books.map((book) => (
            <a
              key={book.id}
              href={book.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="w-48 flex-shrink-0 relative h-72">
                <Image
                  src={`/api/image?url=${encodeURIComponent(book.pic)}`}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 p-6">
                <div className="mb-4">
                  <span className="text-xl font-semibold text-gray-900">
                    {book.title}
                  </span>
                </div>
                
                <div className="mb-4 text-sm text-gray-600">
                  {book.author && (
                    <div className="mb-2">
                      <span className="font-semibold">作者：</span>
                      {book.author}
                    </div>
                  )}
                  {book.publisher && (
                    <div className="mb-2">
                      <span className="font-semibold">出版社：</span>
                      {book.publisher}
                    </div>
                  )}
                  {book.year && (
                    <div className="mb-2">
                      <span className="font-semibold">出版日期：</span>
                      {book.year}
                    </div>
                  )}
                  {book.addedAt && (
                    <div className="mb-2">
                      <span className="font-semibold">标记时间：</span>
                      {book.addedAt}
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
