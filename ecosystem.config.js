module.exports = {
    apps : [{
      name: 'meorla',            // 애플리케이션 이름
      script: './server/index.js',   // 실행 스크립트 파일
      args: '',           // 스크립트에 전달할 인자들
      watch: true,                 // 파일 변경 감지 후 자동 재시작
      env: {
        NODE_ENV: 'development',
        REACT_APP_BASE_PORT: 8000,
        REACT_APP_BASE_ORIGIN: '*',
        REACT_APP_BASE_URL: 'http://localhost:8000',
        ACCESS_TOKEN_SECRET: 'jsfgfjguwrg8783wgbjs849h2fu3cnsvh8wyr8fhwfvi2g225',
        REFRESH_TOKEN_SECRET: '825y8i3hnfjmsbv7gwajbl7fobqrjfvbs7gbfj2q3bgh8f42',
        REACT_APP_MYSQL_HOST: 'localhost',
        REACT_APP_MYSQL_USER: 'root',
        REACT_APP_MYSQL_PASSWORD: 'yeeh01250412!@',
        REACT_APP_MYSQL_DB: 'teaform_db',
        EMAIL_USER: 'meorla@meorla.com',
        EMAIL_PASS: 'YJjSyAcXveLU'
      },
      env_production: {
        NODE_ENV: 'production',     // 프로덕션 환경에서 적용될 환경 변수
        REACT_APP_BASE_PORT: 8002,
        REACT_APP_BASE_ORIGIN: 'https://www.meorla.com',
        REACT_APP_BASE_URL: 'https://www.meorla.com',
        ACCESS_TOKEN_SECRET: 'jsfgfjguwrg8783wgbjs849h2fu3cnsvh8wyr8fhwfvi2g225',
        REFRESH_TOKEN_SECRET: '825y8i3hnfjmsbv7gwajbl7fobqrjfvbs7gbfj2q3bgh8f42',
        REACT_APP_MYSQL_HOST: '223.130.130.53',
        REACT_APP_MYSQL_USER: 'root',
        REACT_APP_MYSQL_PASSWORD: 'Yeeh01250412!@',
        REACT_APP_MYSQL_DB: 'teaform_db',
        EMAIL_USER: 'meorla@meorla.com',
        EMAIL_PASS: 'YJjSyAcXveLU'
      }
    }]
  };
  