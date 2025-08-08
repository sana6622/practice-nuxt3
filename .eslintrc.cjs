module.exports = {
  env: {
    browser: true,
    es2023: true
  },
  extends: ['@nuxtjs', 'plugin:vue/vue3-recommended', , 'prettier'],
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: 'module'
  },
  plugins: ['prettier'],
  rules: {
    // use typescript-eslint version instead
    'no-unused-vars': 'off',
    'no-useless-constructor': 'off',
    'no-undef': 'off',

    eqeqeq: ['error', 'smart'],

    'vue/component-tags-order': [
      'error',
      {
        order: ['script', 'template', 'style']
      }
    ],
    'prefer-const': 'error',
    'no-lonely-if': 'error',
    'no-else-return': 'error'

    // 'vue/no-useless-v-bind': 'error'
  },

  overrides: [
    {
      files: ['pages/**/*.vue', 'layouts/**/*.vue'],
      rules: {
        'vue/multi-word-component-names': 'off'
      }
    },
    {
      files: ['*.vue'],
      globals: {
        defineProps: 'readonly',
        defineEmits: 'readonly',
        withDefaults: 'readonly',
        definePageMeta: 'readonly'
      }
    }
  ]
};

