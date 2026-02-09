export const environment = {
  production: false,

  // ❌ ANCIEN - Un seul backend sur port 5000
  // apiUrl: 'http://localhost:5000/',

  // ✅ NOUVEAU - 4 backends sur 4 ports différents
  apiUrls: {
    decisionTree: 'http://localhost:5001',
    randomForest: 'http://localhost:5002',
    knn: 'http://localhost:5003',
    naiveBayes: 'http://localhost:5004'
  },

  apiEndpoints: {
    decisionTree: '/decisionTree/predict',
    randomForest: '/randomForest/predict',
    knn: '/knn/predict',
    naiveBayes: '/naiveBayes/predict'
  },

  appName: 'BabyCare Monitor',
  version: '1.0.0'
};
