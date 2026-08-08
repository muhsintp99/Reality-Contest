module.exports = {
  apps: [
    {
      name: 'reality-contest-backend',
      script: './dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 10000,
        PM2_USAGE: 'true'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 10000
      },
      max_memory_restart: '1G',
      autorestart: true,
      watch: false,
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log'
    }
  ]
};
