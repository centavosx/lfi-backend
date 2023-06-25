import * as CryptoJS from 'crypto-js';

export const hashPassword = async (password: string) => {
  return CryptoJS.HmacSHA256(password, process.env.ACCESS_KEY).toString(
    CryptoJS.enc.Hex,
  );
};

export const ifMatched = async (password: string, hashedPassword: string) => {
  return (
    CryptoJS.HmacSHA256(password, process.env.ACCESS_KEY).toString(
      CryptoJS.enc.Hex,
    ) === hashedPassword
  );
};
