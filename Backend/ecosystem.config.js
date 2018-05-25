module.exports = {
    apps : [{
        name      : 'wordeo',
        script    : 'server/server.js',
        autorestart: true,
        instances : "1",
        exec_mode : "cluster",
        env: {
        },
        env_development: {
            NODE_ENV: 'development'
        },
        env_staging : {
            NODE_ENV: 'staging'
        },
        env_production : {
            NODE_ENV: 'production'
        }
    }]
};
