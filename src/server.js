const app = require('./app')
const connectDB = require('./config/db');
const env = require('./config/env');

async function start() {
        try {
                await connectDB(env.mongoUri);
                
                app.listen(env.port, () => {
                        console.log(`[Server] Running on port ${env.port}`);
                })
        } catch (err) {
                console.error(`[Server] Running on port ${env.port}`);
                process.exit(1)
        }
}
start()