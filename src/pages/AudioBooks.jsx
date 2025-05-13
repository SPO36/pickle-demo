// src/pages/AudioBooks.jsx
import { useEffect, useRef, useState } from 'react';

export default function AudioBooks() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef();
  const [episodes, setEpisodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const parseXML = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    const bookElements = xmlDoc.querySelectorAll('book');

    return Array.from(bookElements).map((book) => ({
      id: [book.querySelector('id')?.textContent || ''],
      title: [book.querySelector('title')?.textContent || ''],
      description: [book.querySelector('description')?.innerHTML || ''],
      url_text_source: [book.querySelector('url_text_source')?.textContent || ''],
      language: [book.querySelector('language')?.textContent || ''],
      copyright_year: [book.querySelector('copyright_year')?.textContent || ''],
      num_sections: [book.querySelector('num_sections')?.textContent || ''],
      url_rss: [book.querySelector('url_rss')?.textContent || ''],
      url_zip_file: [book.querySelector('url_zip_file')?.textContent || ''],
      url_project: [book.querySelector('url_project')?.textContent || ''],
      url_librivox: [book.querySelector('url_librivox')?.textContent || ''],
      totaltime: [book.querySelector('totaltime')?.textContent || ''],
      authors: [
        {
          name: [
            `${book.querySelector('authors author first_name')?.textContent || ''} ${
              book.querySelector('authors author last_name')?.textContent || ''
            }`.trim(),
          ],
        },
      ],
    }));
  };

  const fetchBooks = async (search = '', append = false, offsetVal = 0) => {
    setLoading(true);
    let text = '';

    try {
      const url = `/.netlify/functions/librivox?title=${encodeURIComponent(
        search
      )}&offset=${offsetVal}`;
      const res = await fetch(url);
      text = await res.text();

      if ((!text.includes('<feed') && !text.includes('<books')) || text.includes('<e>')) {
        console.warn('❗ 유효하지 않은 XML 응답');
        setBooks(append ? books : []);
        setHasMore(false);
        return;
      }

      const parsedBooks = parseXML(text);
      setBooks((prev) => (append ? [...prev, ...parsedBooks] : parsedBooks));
      setHasMore(parsedBooks.length >= 50);
    } catch (e) {
      console.error('LibriVox API 오류:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (!loading && hasMore && scrollTop + clientHeight >= scrollHeight - 100) {
      const newOffset = offset + 50;
      setOffset(newOffset);
      fetchBooks(query, true, newOffset);
    }
  };

  const handleSearch = () => {
    setOffset(0);
    setHasMore(true);
    fetchBooks(query, false, 0);
  };

  const stripHtml = (html) => {
    const unescaped = new DOMParser().parseFromString(html, 'text/html').documentElement
      .textContent;
    const doc = new DOMParser().parseFromString(unescaped, 'text/html');
    return doc.body.textContent || '';
  };

  const parseRssFeed = async (rssUrl) => {
    const res = await fetch(`/.netlify/functions/rss?url=${encodeURIComponent(rssUrl)}`);
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    const items = doc.querySelectorAll('item');

    return Array.from(items).map((item) => ({
      title: item.querySelector('title')?.textContent,
      audioUrl: item.querySelector('enclosure')?.getAttribute('url'),
      pubDate: item.querySelector('pubDate')?.textContent,
    }));
  };

  const translateSummary = async () => {
    if (!selected) return;
    setIsTranslating(true);
    const summary = stripHtml(selected.summary?.[0] || selected.description?.[0] || '');
    try {
      const res = await fetch('/.netlify/functions/translate', {
        method: 'POST',
        body: JSON.stringify({ text: summary }),
      });
      const data = await res.json();
      setTranslatedSummary(data.result);
    } catch (err) {
      console.error('번역 실패:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  useEffect(() => {
    fetchBooks('', false, 0);
  }, []);

  useEffect(() => {
    if (selected?.url_rss?.[0]) {
      parseRssFeed(selected.url_rss[0]).then(setEpisodes);
      setCurrentPage(1);
    }
    setTranslatedSummary(''); // 새로운 책 선택 시 번역 리셋
  }, [selected]);

  const archiveId = selected?.url_zip_file?.[0]?.split('/')[4];
  const coverUrl = archiveId ? `https://archive.org/services/img/${archiveId}` : null;

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 책 리스트 */}
      <div className="p-4 w-1/2 overflow-y-auto" onScroll={handleScroll} ref={listRef}>
        {/* <div className="mb-4 form-control">
          <div className="w-full join">
            <input
              type="text"
              className="input-bordered w-full input join-item"
              placeholder="책 제목 입력"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className="btn btn-primary join-item" onClick={handleSearch}>
              검색
            </button>
          </div>
        </div> */}
        {!loading && books.length === 0 && (
          <div className="text-sm text-base-content/50 text-center">검색 결과가 없습니다</div>
        )}
        {loading && books.length === 0 ? (
          <div className="flex justify-center my-4">
            <span className="text-primary loading loading-spinner"></span>
          </div>
        ) : (
          <ul className="gap-1 grid grid-cols-1">
            {books.map((book, idx) => {
              const archiveId = book.url_zip_file?.[0]?.split('/')[4];
              const coverUrl = archiveId ? `https://archive.org/services/img/${archiveId}` : null;

              return (
                <li
                  key={book.id?.[0] || idx}
                  className={`card card-side gap-2 p-2 items-center shadow-sm transition cursor-pointer ${
                    selected && book.id?.[0] === selected.id?.[0] ? 'bg-base-200' : ''
                  }`}
                  onClick={() => setSelected(book)}
                >
                  <figure className="flex-shrink-0 bg-base-300 rounded w-16 h-16 overflow-hidden">
                    {coverUrl ? (
                      <img src={coverUrl} alt="책 커버" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex justify-center items-center w-full h-full text-gray-500 text-xs">
                        No Image
                      </div>
                    )}
                  </figure>
                  <div className="flex flex-col p-2">
                    <h3 className="font-semibold text-md line-clamp-2">{book.title?.[0]}</h3>
                    <p className="text-gray-500">{book.authors?.[0]?.name?.[0] || '작자 미상'}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {loading && books.length > 0 && (
          <div className="flex justify-center mt-4">
            <span className="text-primary loading loading-spinner"></span>
          </div>
        )}
      </div>

      {/* 오른쪽: 상세 보기 - daisyUI로 스타일링 */}
      <div className="bg-base-100 p-4 w-1/2 overflow-y-auto">
        {selected ? (
          <div className="bg-base-200 rounded-lg">
            <div className="p-4 card-body">
              <h2 className="text-2xl card-title">{selected.title?.[0]}</h2>
              <div className="flex flex-row gap-1">
                <div className="rounded-md badge-outline badge-md badge badge-primary">
                  {selected.authors?.[0]?.name?.[0] || '작자 미상'}
                </div>
                <div className="rounded-md badge-outline badge-md badge badge-primary">
                  {selected.language[0]}
                </div>
              </div>
              <div className="divider"></div>
              <div className="text-gray-600 text-sm">
                {stripHtml(selected.summary?.[0] || selected.description?.[0] || '요약 정보 없음')}
              </div>
              <button
                className="mt-3 w-fit btn btn-xs btn-primary"
                onClick={translateSummary}
                disabled={isTranslating}
              >
                {isTranslating ? '번역 중...' : '번역하기'}
              </button>
              {translatedSummary && (
                <p className="mt-2 text-primary-content text-sm whitespace-pre-wrap">
                  {translatedSummary}
                </p>
              )}

              {selected.url_rss?.[0] && (
                <>
                  <div className="divider"></div>
                  <div className="mb-4">
                    {selected.totaltime?.[0] && (
                      <p>
                        <span className="font-bold">총 재생 시간:</span> {selected.totaltime[0]}
                      </p>
                    )}
                    <div>
                      <span className="font-bold">RSS:</span>{' '}
                      <a href={selected.url_rss[0]} className="link link-info" target="_blank">
                        {selected.url_rss[0]}
                      </a>
                    </div>
                  </div>
                  {episodes
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((ep, idx) => (
                      <div key={idx} className="px-3 py-1">
                        <p className="mb-2 font-semibold">{ep.title}</p>
                        <audio controls className="w-full" src={ep.audioUrl} />
                        <p className="text-gray-500 text-sm">{ep.pubDate}</p>
                      </div>
                    ))}
                  <div className="mt-4 join">
                    <button
                      className="join-item btn btn-sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      이전
                    </button>
                    <button
                      className="join-item btn btn-sm"
                      disabled={currentPage * itemsPerPage >= episodes.length}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      다음
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-12 alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="flex-shrink-0 stroke-info mb-4 w-12 h-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span className="text-lg">왼쪽에서 책을 선택하세요</span>
            <span className="mt-2 text-gray-500 text-sm">
              책을 선택하면 여기에 상세 정보가 표시됩니다
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
