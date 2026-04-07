module.exports = {
  apps: [{
    name: "lightyar",
    script: "npm",
    args: "start",
    cwd: "/home/lightyar",
    interpreter: "none",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3003,
    },
    env_dev: {
      NODE_ENV: "development",
    }
  }]
};