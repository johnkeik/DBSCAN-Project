export const generateApiKey = () => {
  const timestamp = Date.now().toString();
  const randomNumber = Math.floor(Math.random() * 1000000).toString();
  const apiKey = timestamp + randomNumber;
  return apiKey;
};
