const modeUrl: string = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8080'
  : 'https://stingray-app-ewlud.ondigitalocean.app';

export default modeUrl;
