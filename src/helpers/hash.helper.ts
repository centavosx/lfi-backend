import * as bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
  const saltRounds = 10;

  const salt = bcrypt.genSaltSync(saltRounds);

  return bcrypt.hashSync(password, salt);
};

export const ifMatched = async (password: string, hashedPassword: string) => {
  return bcrypt.compareSync(password, hashedPassword);
};
