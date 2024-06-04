module.exports = {
    apps : [{
      name: 'meorla',            // 애플리케이션 이름
      script: './server/index.js',   // 실행 스크립트 파일
      args: '',           // 스크립트에 전달할 인자들
      watch: true,                 // 파일 변경 감지 후 자동 재시작
      env: {
        COMMON_ENV_VARIABLE: 'true', // 모든 환경에서 적용될 환경 변수
        // NODE_ENV: 'development',
        // PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production'     // 프로덕션 환경에서 적용될 환경 변수
        // PORT: 8000
      }
    }]
  };
  