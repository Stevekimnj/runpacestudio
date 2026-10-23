/* =====================================================================
 * sw.js — 서비스워커 (오프라인 지원 · v2)
 * ---------------------------------------------------------------------
 * 헬스장 지하처럼 인터넷이 약한 곳에서도 앱이 열리도록
 * 필요한 파일을 휴대폰에 저장(캐시)해 둡니다.
 *
 * 전략:
 *  - 우리 파일(같은 출처): 네트워크 우선 → 오프라인이면 캐시
 *  - Tailwind CDN: 캐시된 것을 먼저 보여주고 뒤에서 새 버전 갱신
 *  - 그 외 외부 요청: 서비스워커가 관여하지 않음
 * ===================================================================== */
const CACHE_VERSION = 'rps-v2';
const CDN_ORIGIN = 'https://cdn.tailwindcss.com';

// 설치 시 미리 저장할 파일 목록
const PRECACHE = [
  './',
  './index.html',
  './about.html',
  './privacy.html',
  './contact.html',
  './app.js',
  './tw-config.js',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
];

// 1) 설치: 파일 미리 저장
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// 2) 활성화: 이전 버전 캐시 삭제
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 3) 요청 가로채기
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // 우리 사이트 파일: 네트워크 우선 → 실패하면(오프라인) 캐시
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Tailwind CDN: 캐시 먼저 보여주고, 뒤에서 최신본으로 갱신
  if (url.origin === CDN_ORIGIN) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
