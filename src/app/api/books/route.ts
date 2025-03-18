import { NextResponse } from 'next/server';
import { Book } from '@/app/types';
import { fetchDouban } from '../utils/douban';

async function fetchDoubanWishlist(userId: string): Promise<Book[]> {
  try {
    // 首先获取第一页以获取总数
    const firstPage$ = await fetchDouban(`https://book.douban.com/people/${userId}/wish`);

    // 获取总数
    const totalText = firstPage$('h1').text();
    const totalMatch = totalText.match(/(\d+)/);
    if (!totalMatch) {
      throw new Error('Could not find total book count');
    }
    const total = parseInt(totalMatch[1]);
    const perPage = 15; // 豆瓣每页显示15本书
    const totalPages = Math.ceil(total / perPage);

    // 随机选择要获取的页面
    const selectedPages = new Set<number>();
    while (selectedPages.size < RANDOM_BOOK_COUNT) {
      selectedPages.add(Math.floor(Math.random() * totalPages));
    }

    // 获取所有选定页面的图书
    const books: Book[] = [];
    const fetchPromises = Array.from(selectedPages).map(async (page) => {
      const start = page * perPage;
      const $ = await fetchDouban(`https://book.douban.com/people/${userId}/wish?start=${start}&sort=time&rating=all&filter=all&mode=grid`);
      const items = $('.subject-item').toArray();

      for (const item of items) {
        const $item = $(item);
        const b: Book = {
          id: '',
          link: '',
          title: '',
          pic: '',
          author: '',
          publisher: '',
          year: '',
          addedAt: ''
        };
        const title = $item.find('h2')
        const link = title.find('a').attr('href');
        b.id = link?.match(/\d+/)?.[0] || '';
        b.link = link || '';
        b.title = title.find('a').attr('title') || '';
        b.pic = $item.find('.pic img').attr('src') || '';
        const intro = $item.find('.pub').text().trim();
        const publisherMatch = intro.match(/[^/]+(出版社|出版集团|印书馆|Press|Publishers)[^/]*/i);
        b.publisher = publisherMatch ? publisherMatch[0].trim() : '';
        const authorPart = b.publisher ? intro.split(b.publisher)[0].trim().replace(/\/$/, '') : '';
        b.author = authorPart;
        const yearMatch = intro.match(/(19|20)\d{2}[^\d]*/);        
        b.year = yearMatch ? yearMatch[0].trim().match(/\d+/)?.[0] || '' : '';
        b.addedAt = $item.find('.date').text().trim().split(' ')[0] || '';
        books.push(b);
      }
    });

    await Promise.all(fetchPromises);

    if (books.length === 0) {
      throw new Error('No books found or page structure changed');
    }

    return books;
  } catch (error) {
    console.error('Error fetching Douban wishlist:', error);
    throw new Error('Failed to fetch Douban wishlist');
  }
}

function getRandomBooks(books: Book[], count: number): Book[] {
  const shuffled = [...books].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const RANDOM_BOOK_COUNT = 3;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const wishlist = await fetchDoubanWishlist(userId);
    const randomBooks = getRandomBooks(wishlist, RANDOM_BOOK_COUNT);
    return NextResponse.json(randomBooks);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch books' },
      { status: 500 }
    );
  }
}