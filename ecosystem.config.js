module.exports = {
  apps: [{
    name: "lightyar",
    script: "./node_modules/next/dist/bin/next",
    args: "start -H 127.0.0.1 -p 3000",
    cwd: __dirname,
    interpreter: process.execPath,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
    env_dev: {
      NODE_ENV: "development",
    }
  }]
};
