// src/pages/AudioBooks.jsx
import { useEffect, useState } from 'react';
import { parseStringPromise } from 'xml2js';

export default function AudioBooks() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('sherlock');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchBooks = async (search) => {
    setLoading(true);
    try {
      const url = `/.netlify/functions/librivox?title=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      const text = await res.text();
      const data = await parseStringPromise(text);
      setBooks(data.feed?.entry || []);
    } catch (e) {
      console.error('LibriVox API 오류:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks(query);
  }, []);

  return (
    <div className="flex h-screen">
      {/* 왼쪽: 책 리스트 */}
      <div className="p-4 border-r border-base-300 w-1/2 overflow-y-auto">
        <div className="mb-4">
          <input
            type="text"
            className="input-bordered w-full input"
            placeholder="책 제목 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchBooks(query)}
          />
        </div>
        {loading ? (
          <div className="text-gray-400 text-sm text-center">검색 중...</div>
        ) : (
          <ul className="space-y-2">
            {books.map((book, idx) => (
              <li
                key={idx}
                className="hover:bg-base-200 p-3 border rounded cursor-pointer"
                onClick={() => setSelected(book)}
              >
                <strong>{book.title?.[0]}</strong>
                <div className="text-gray-500 text-sm">
                  {book.author?.[0]?.name?.[0] || '작자 미상'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 오른쪽: 상세 보기 */}
      <div className="p-6 w-1/2 overflow-y-auto">
        {selected ? (
          <div>
            <h2 className="mb-2 font-bold text-2xl">{selected.title?.[0]}</h2>
            <p className="mb-2 text-gray-600">
              저자: {selected.author?.[0]?.name?.[0] || '작자 미상'}
            </p>
            <a
              href={selected.link?.[0]}
              className="btn btn-sm btn-primary"
              target="_blank"
              rel="noreferrer"
            >
              상세 보기
            </a>
            <p className="mt-4 text-gray-700 text-sm whitespace-pre-wrap">
              {selected.summary?.[0] || '요약 정보 없음'}
            </p>
          </div>
        ) : (
          <div className="text-gray-400">👉 왼쪽에서 책을 선택하세요</div>
        )}
      </div>
    </div>
  );
}
