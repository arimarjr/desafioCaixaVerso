module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],

    files: [
      // carrega tudo normalmente
    ],

    preprocessors: {},

    // 👇 AQUI É O SEGREDO 👇
    webpack: {
      resolve: {
        alias: {
          'chart.js': 'src/__mocks__/chart.ts'
        }
      }
    },

    reporters: ['progress', 'kjhtml'],

    browsers: ['Chrome'],
    restartOnFileChange: true
  });
};
 