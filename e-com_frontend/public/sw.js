const CART_URL_PATTERN = /\/api\/v1\/cart$/;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (CART_URL_PATTERN.test(event.request.url) && event.request.method === 'GET') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 404) {
            const mockData = {
              success: true,
              data: {
                cartid: "empty",
                userId: "empty",
                items: [],
                totalAmount: 0
              }
            };
            return new Response(JSON.stringify(mockData), {
              status: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
              }
            });
          }
          return response;
        })
        .catch(() => {
          const mockData = {
            success: true,
            data: {
              cartid: "empty",
              userId: "empty",
              items: [],
              totalAmount: 0
            }
          };
          return new Response(JSON.stringify(mockData), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        })
    );
  }
});
