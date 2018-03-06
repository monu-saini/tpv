module.exports = {
  apps : [
      {
        name: "tpv",
        script: "./bin/www",
        node_args: "--max_old_space_size=4096",
        watch: false,
        exec_mode : "cluster",
        log_date_format: "YYYY-MM-DD HH:mm Z",
        env: {
            "PORT": 4000,
            "NODE_ENV": "development"
        },
        env_production: {
            "PORT": 4000,
            "NODE_ENV": "production"
        }
      }
  ]
}