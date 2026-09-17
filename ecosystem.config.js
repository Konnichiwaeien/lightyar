module.exports = {
  apps: [{
    name: "lightyar",
    script: "npm",
    args: "start",
    cwd: __dirname,
    interpreter: "none",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      LIGHTYAR_RELEASE: process.env.LIGHTYAR_RELEASE || 'local',
    },
    env_dev: {
      NODE_ENV: "development",
    }
  }]
};
