import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { CnpjValidator } from './cnpj.validator';
import { CpfValidator } from './cpf.validator';

@ValidatorConstraint({ name: 'taxIdValidator', async: false })
export class TaxIdValidator implements ValidatorConstraintInterface {
  private readonly cpfValidator = new CpfValidator();
  private readonly cnpjValidator = new CnpjValidator();

  public validate(taxId: string, _args: ValidationArguments): boolean {
    if (!taxId) return true;

    if (typeof taxId !== 'string') return false;

    const cleanTaxId = taxId.replace(/\D/g, '');

    if (cleanTaxId.length === 11) {
      return this.cpfValidator.validate(cleanTaxId, _args);
    }

    if (cleanTaxId.length === 14) {
      return this.cnpjValidator.validate(cleanTaxId, _args);
    }

    return false;
  }

  public defaultMessage(_args: ValidationArguments): string {
    return 'Document must be a valid CPF (11 digits) or CNPJ (14 digits)';
  }
}
