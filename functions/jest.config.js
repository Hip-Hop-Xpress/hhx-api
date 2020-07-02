// Had an issue solved with this solution:
// https://github.com/firebase/firebase-admin-node/issues/793#issuecomment-592334797

module.exports = {
  testPathIgnorePatterns: ['lib/', 'node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'node'
};