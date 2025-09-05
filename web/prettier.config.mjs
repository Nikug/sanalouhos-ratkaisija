export default {
  trailingComma: 'all',
  tabWidth: 2,
  printWidth: 100,
  useTabs: false,
  semi: true,
  singleQuote: false,
  quoteProps: 'as-needed',
  bracketSpacing: true,
  arrowParens: 'always',
  jsxBracketSameLine: false,
  tailwindAttributes: ['wrapperClassName', 'wrapClassName', 'rootClassName'],
  tailwindFunctions: ['classNames', 'classnames', 'twMerge', 'clsx'],
  overrides: [
    {
      files: '.prettierrc',
      options: {
        parser: 'json',
      },
    },
  ],
  plugins: ['prettier-plugin-tailwindcss'],
};
