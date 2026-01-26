export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com',
  apiEndpoints: {
    decisionTree: '/decision-tree/predict',
    naiveBayes: '/naive-bayes/predict',
    randomForest: '/random-forest/predict',
    knn: '/knn/predict'
  },
  appName: 'BabyCare Monitor',
  version: '1.0.0'
};
