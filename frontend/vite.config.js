import { defineConfig } from "vite";
import { buildSync } from "esbuild";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        {
            apply: "build",
            enforce: "post",
            transformIndexHtml() {
                buildSync({
                    minify: true,
                    bundle: true,
                    entryPoints: ["worker/worker.js"],
                    outfile: "dist/worker.js",
                });
            },
        },
        {
            apply: "serve",
            enforce: "post",
            configureServer(server) {
                server.middlewares.use("/worker.js", (req, res, next) => {
                    res.writeHead(200, {
                        "Content-Type": "application/javascript",
                    });
                    res.end(
                        buildSync({
                            minify: false,
                            bundle: true,
                            entryPoints: ["worker/worker.js"],
                            write: false,
                        }).outputFiles[0].text
                    );
                });
            },
        },
    ],
    build: {
        rollupOptions: {
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
    server: {
        proxy: {
            "/api": "http://localhost:8080",
        },
    },
});
