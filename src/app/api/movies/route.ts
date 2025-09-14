import { NextResponse } from 'next/server';
import { Movie } from '@/app/types';
import { fetchDouban } from '../utils/douban';

async function fetchDoubanWishlist(userId: string, type: string = 'all'): Promise<Movie[]> {
  try {
    // 首先获取第一页以获取总数
    const firstPage$ = await fetchDouban(`https://movie.douban.com/people/${userId}/wish`)

    // 获取总数
    const totalText = firstPage$('h1').text();
    const totalMatch = totalText.match(/(\d+)/);
    if (!totalMatch) {
      throw new Error('Could not find total movie count');
    }
    const total = parseInt(totalMatch[1]);
    const perPage = 15; // 豆瓣每页显示15个电影
    const totalPages = Math.ceil(total / perPage);

    // 随机选择要获取的页面
    const selectedPages = new Set<number>();
    while (selectedPages.size < RANDOM_MOVIE_COUNT) {
      selectedPages.add(Math.floor(Math.random() * totalPages));
    }

    // 获取所有选定页面的电影
    const movies: Movie[] = [];
    const fetchPromises = Array.from(selectedPages).map(async (page) => {
      const start = page * perPage;
      const $ = await fetchDouban(`https://movie.douban.com/people/${userId}/wish?start=${start}&sort=time&rating=all&mode=grid&type=${type}&filter=all`);

      const items = $('.item.comment-item').toArray();
      
      for (const item of items) {
        const $item = $(item);
        const m: Movie = {
          id: '',
          link: '',
          title: '',
          titleAlias: '',
          pic: '',
          year: '',
          duration: '',
          playable: false,
          rating: '',
          addedAt: ''
        };
        const title = $item.find('.title')
        const link = title.find('a').attr('href');
        m.id = link?.match(/\d+/)?.[0] || '';
        m.link = link || '';
        m.title = title.find('em').text().trim();
        m.pic = $item.find('.pic img').attr('src') || '';
        m.titleAlias = title.find('a').contents().filter((_, el) => el.type === 'text').text().trim().replace(/^\//, '');
        const intro = $item.find('.intro').text();
        m.year = intro.match(/\d{4}/)?.[0] || '';
        m.duration = intro.match(/\d+分钟/)?.[0] || '';
        m.playable = title.find('span').hasClass('playable');
        m.addedAt = $item.find('.date').text().trim();
        movies.push(m);
      }
    });

    await Promise.all(fetchPromises);

    if (movies.length === 0) {
      throw new Error('No movies found or page structure changed');
    }

    return movies;
  } catch (error) {
    console.error('Error fetching Douban wishlist:', error);
    throw new Error('Failed to fetch Douban wishlist');
  }
}

function getRandomMovies(movies: Movie[], count: number): Movie[] {
  const shuffled = [...movies].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

const RANDOM_MOVIE_COUNT = 3;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type') || 'all';

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    const wishlist = await fetchDoubanWishlist(userId, type);
    const randomMovies = getRandomMovies(wishlist, RANDOM_MOVIE_COUNT);
    return NextResponse.json(randomMovies);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch movies' },
      { status: 500 }
    );
  }
}
