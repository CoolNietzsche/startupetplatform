module.exports = {
  apps: [
    {
      name: "nslp",
      cwd: "/root/nslp",
      script: "pnpm",
      args: "run start",
      env: {
        PORT: "10445",
        NODE_ENV: "production",
      },
    },
  ],
};
