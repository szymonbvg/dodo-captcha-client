import typescript from "rollup-plugin-typescript2";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "./src/main.ts",
    output: {
      file: "./dist/index.js",
      format: "cjs",
      exports: "named",
    },
    plugins: [
      typescript({
        tsconfig: "tsconfig.json",
        clean: true,
        useTsconfigDeclarationDir: true,
      }),
    ],
  },
  {
    input: "./declarations/types/index.d.ts",
    output: {
      file: "./dist/types/index.d.ts",
      format: "es",
    },
    plugins: [dts()],
  },
];
