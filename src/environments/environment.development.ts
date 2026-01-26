export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/',
  apiEndpoints: {
    decisionTree: '/decision-tree/predict',
    naiveBayes: '/naive-bayes/predict',
    randomForest: '/random-forest/predict',
    knn: '/knn/predict'
  },
  appName: 'BabyCare Monitor',
  version: '1.0.0'
};
