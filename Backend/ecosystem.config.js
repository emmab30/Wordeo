module.exports = {
    apps : [{
        name      : 'wordeo',
        script    : 'server/server.js',
        autorestart: true,
        //instances : "1",
        //exec_mode : "cluster",
        env: {
            "TZ": "America/Sao_Paulo"
        },
        env_development: {
            NODE_ENV: 'development',
            "TZ": "America/Sao_Paulo"
        },
        env_staging : {
            NODE_ENV: 'staging',
            "TZ": "America/Sao_Paulo"
        },
        env_production : {
            NODE_ENV: 'production',
            "TZ": "America/Sao_Paulo"
        }
    }]
};
