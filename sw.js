// Service Worker for Business Empire PWA
const CACHE_NAME = 'business-empire-v2.2';
const urlsToCache = [
  './enhanced-game.html',
  './js/game-constants.js',
  './js/enhanced-game-data.js',
  './js/game-models.js',
  './js/enhanced-employee.js',
  './js/interview-system.js',
  './js/business-game.js',
  './js/enhanced-business-game.js',
  './js/game-ui.js',
  './js/enhanced-ui.js',
  './manifest.json'
];

// Service Worker インストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('キャッシュの追加に失敗しました:', error);
      })
  );
});

// リクエストの傍受
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュにヒットした場合はそれを返す
        if (response) {
          return response;
        }
        
        // キャッシュにない場合はネットワークから取得
        return fetch(event.request)
          .then(response => {
            // 有効なレスポンスかチェック
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // ネットワークエラーの場合、オフライン用のフォールバック
            if (event.request.destination === 'document') {
              return caches.match('./enhanced-game.html');
            }
          });
      })
  );
});

// 古いキャッシュの削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除します:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// バックグラウンド同期（将来の拡張用）
self.addEventListener('sync', event => {
  if (event.tag === 'background-save') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // 将来的にサーバー同期機能を追加する場合の処理
  console.log('バックグラウンド同期実行');
}

// プッシュ通知（将来の拡張用）
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'ゲームの更新があります',
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23667eea" rx="16"/><text x="64" y="80" font-size="48" text-anchor="middle" fill="white">🏢</text></svg>',
    badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="36" fill="%23667eea"/><text x="36" y="45" font-size="24" text-anchor="middle" fill="white">🏢</text></svg>',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'ゲームを開く',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('ビジネスエンパイア', options)
  );
});

// 通知クリック処理
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('./enhanced-game.html')
    );
  }
});