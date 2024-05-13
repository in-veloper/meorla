// const { createProxyMiddleware } = require('http-proxy-middleware');

// module.exports = function(app) {
//   app.use(
//     '/fonts', // 프록시할 경로
//     createProxyMiddleware({
//       target: 'https://fonts.googleapis.com', // 원격 서버 주소
//       changeOrigin: true,
//       pathRewrite: {
//         '^/fonts': '', // 경로 재작성
//       },
//     })
//   );

//   app.use(
//     '/fontawesome', // 프록시할 경로
//     createProxyMiddleware({
//       target: 'https://use.fontawesome.com', // 원격 서버 주소
//       changeOrigin: true,
//       pathRewrite: {
//         '^/fontawesome': '', // 경로 재작성
//       },
//     })
//   );
// };
