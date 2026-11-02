import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

/** Serves src/pages/_lab.astro at /lab under `astro dev` only; the route does not exist in a build. */
const labDevOnly = {
  name: "lab-dev-only",
  hooks: {
    "astro:config:setup": ({ command, injectRoute }) => {
      if (command === "dev") injectRoute({ pattern: "/lab", entrypoint: "./src/pages/_lab.astro" });
    },
  },
};

// Served from the root of the user-site repo `alexanderKhvostov.github.io`, so no `base`.
export default defineConfig({
  site: "https://alexanderkhvostov.github.io",
  output: "static",
  integrations: [labDevOnly],
  vite: {
    plugins: [tailwindcss()],
  },
});
