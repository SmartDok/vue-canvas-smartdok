import vue from 'rollup-plugin-vue';
import rollupTypescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';
export default {
  input: 'src/entry.ts', 
  output: {
    globals: {
      vue: 'Vue',
      'lodash': 'Lodash',
    },

    name: 'VueDrawableCanvas',
    exports: 'named',
  },
  plugins: [
    rollupTypescript({ sourceMap: false }),
    vue({
        css: true,
        compileTemplate: true,
    }),
    commonjs(),
  ],
   external: ['vue', 'lodash'],
};