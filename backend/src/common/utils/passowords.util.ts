import argon2 from 'argon2';

export interface IHashPassword {
  password: string;
}

export interface ICheckUpPassword {
  password: string;
  hashedPassword: string;
}

export class PasswordValidator {
  /**
   * Checks if the password meets the security requirements
   * @param password - The password to check
   * @returns true if the password meets the security requirements, false otherwise
   */
  public static async checkUpPassword(input: ICheckUpPassword): Promise<boolean> {
    return argon2.verify(input.hashedPassword, input.password).catch(() => false);
  }

  /**
   * Hashes the password
   * @param input - The password to hash
   * @returns the hashed password
   */
  public static async hashPassword(input: IHashPassword): Promise<string> {
    return argon2.hash(input.password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });
  }
}
