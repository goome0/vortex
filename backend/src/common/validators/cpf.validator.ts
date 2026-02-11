import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'cpfValidator', async: false })
export class CpfValidator implements ValidatorConstraintInterface {
  public validate(cpf: string, _args: ValidationArguments): boolean {
    if (!cpf || typeof cpf !== 'string') return false;

    const cleanCpf = cpf.replace(/\D/g, '');

    if (cleanCpf.length !== 11) return false;

    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

    return this.validateCpfAlgorithm(cleanCpf);
  }

  private validateCpfAlgorithm(cpf: string): boolean {
    const firstDigit = this.calculateDigit(cpf, 10);
    if (firstDigit !== parseInt(cpf.charAt(9))) return false;

    const secondDigit = this.calculateDigit(cpf, 11);
    return secondDigit === parseInt(cpf.charAt(10));
  }

  private calculateDigit(cpf: string, multiplier: number): number {
    const digits = multiplier === 10 ? 9 : 10;

    const sum = Array.from({ length: digits }, (_, index) => {
      const digit = parseInt(cpf.charAt(index));
      const weight = multiplier - index;
      return digit * weight;
    }).reduce((acc, value) => acc + value, 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  public defaultMessage(_args: ValidationArguments): string {
    return 'Invalid CPF';
  }
}
