import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'cnpjValidator', async: false })
export class CnpjValidator implements ValidatorConstraintInterface {
  public validate(cnpj: string, _args: ValidationArguments): boolean {
    if (!cnpj || typeof cnpj !== 'string') return false;

    const cleanCnpj = cnpj.replace(/\D/g, '');

    if (cleanCnpj.length !== 14) return false;

    if (/^(\d)\1{13}$/.test(cleanCnpj)) return false;

    return this.validateCnpjAlgorithm(cleanCnpj);
  }

  private validateCnpjAlgorithm(cnpj: string): boolean {
    const firstDigit = this.calculateFirstDigit(cnpj);
    if (firstDigit !== parseInt(cnpj.charAt(12))) return false;

    const secondDigit = this.calculateSecondDigit(cnpj);
    return secondDigit === parseInt(cnpj.charAt(13));
  }

  private calculateFirstDigit(cnpj: string): number {
    const weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const sum = Array.from({ length: 12 }, (_, index) => {
      const digit = parseInt(cnpj.charAt(index));
      return digit * weights[index];
    }).reduce((acc, value) => acc + value, 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  private calculateSecondDigit(cnpj: string): number {
    const weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    const sum = Array.from({ length: 13 }, (_, index) => {
      const digit = parseInt(cnpj.charAt(index));
      return digit * weights[index];
    }).reduce((acc, value) => acc + value, 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  public defaultMessage(_args: ValidationArguments): string {
    return 'CNPJ inválido';
  }
}
