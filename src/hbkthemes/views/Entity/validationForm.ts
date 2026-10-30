import z from 'zod';
import type { EntityFormFieldInterface, ValidationRuleInterface } from '@/types';

export class ValidationForm {
  fields: EntityFormFieldInterface[];

  constructor(fields: EntityFormFieldInterface[]) {
    this.fields = fields;
  }
  /**
   * On traite les validations Symfony et les convertit en Zod.
   * @returns
   */
  convertSymfonyValidationToZod(): z.ZodObject<Record<string, any>> {
    const schema: Record<string, any> = {};
    for (const field of this.fields) {
      // if (!field.validations || Object.keys(field.validations).length === 0) continue;
      switch (field.type) {
        case 'number':
          schema[field.name] = this.getZodNumber(field);
          break;
        case 'toggle_switch':
        case 'boolean':
          schema[field.name] = this.getZodBoolean(field);
          break;
        case 'email':
          schema[field.name] = this.getZodEmail(field);
          break;
        case 'textarea':
        case 'text':
        case 'password':
        case 'textarea_ckeditor':
        case 'textarea_tinymce':
          schema[field.name] = this.getZodString(field);
          break;
        case 'select':
          schema[field.name] = this.getZodSelect(field);
          break;
        case 'checkboxes':
        case 'multiselect':
          schema[field.name] = this.getZodArray(field);
          break;
        case 'submit':
        case 'entity_select':
        case 'entities_select':
        case 'checkbox':
        case 'file_upload':
          // aucun
          break;
        default:
          console.error('%c le champs <' + field.type + "> n'a pas de validateur ", 'color: red; font-weight: bold');
          break;
      }
    }
    return z.object(schema);
  }

  /**
   *
   * @param field
   * @returns
   */
  private getZodSelect(field: EntityFormFieldInterface) {
    let zodValidators = this.checkTypeValidation(field.validations) ?? z.string();
    for (const type in field.validations) {
      const validation = field.validations[type];
      if (validation)
        switch (validation.type) {
          case 'required':
            field.required = true;
            break;
          case 'positive':
            if (zodValidators instanceof z.ZodNumber) {
              zodValidators = zodValidators.positive({ message: validation.message });
            }
            break;
          case 'positive_or_zero':
            zodValidators = zodValidators.min(0, { message: validation.message });
            break;
          default:
            break;
        }
    }
    if (!field.required) return z.union([zodValidators.optional(), z.null()]);
    return zodValidators;
  }

  /**
   * Champs à choix multiples (checkboxes, multiselect) : la valeur est un tableau.
   * La validation `required` impose au moins une valeur sélectionnée.
   * @param field
   * @returns
   */
  private getZodArray(field: EntityFormFieldInterface) {
    let zodValidators = z.array(z.any());
    for (const type in field.validations) {
      const validation = field.validations[type];
      if (validation)
        switch (validation.type) {
          case 'required':
            field.required = true;
            zodValidators = zodValidators.min(1, { message: validation.message });
            break;
          default:
            break;
        }
    }
    if (!field.required) return z.union([zodValidators.optional(), z.null()]);
    return zodValidators;
  }

  /**
   *
   * @param field
   * @returns
   */
  private getZodNumber(field: EntityFormFieldInterface) {
    let zodValidators = z.number();
    for (const type in field.validations) {
      const validation = field.validations[type];
      if (validation)
        switch (validation.type) {
          case 'required':
            field.required = true;
            break;
          default:
            break;
        }
    }
    if (!field.required) return z.union([zodValidators.optional(), z.null()]);
    return zodValidators;
  }

  /**
   *
   * @param field
   * @returns
   */
  private getZodString(field: EntityFormFieldInterface) {
    let zodValidators = z.string();
    for (const type in field.validations) {
      const validation = field.validations[type];
      if (validation)
        switch (validation.type) {
          case 'regex':
            if (validation.pattern) {
              const pattern = validation.pattern.slice(1, -1);
              zodValidators = zodValidators.regex(new RegExp(pattern), { message: validation.message });
            }
            break;
          case 'length':
            if (validation.min) {
              zodValidators = zodValidators.min(validation.min, { message: validation.minMessage });
            }
            if (validation.max) zodValidators = zodValidators.max(validation.max, { message: validation.maxMessage });
            break;
          case 'required':
            field.required = true;
            // Zod ne supporte pas les definitions multiples d'une meme methode.
            // en gros on ne peut pas avoir ".min" 2 fois.
            if (!field.validations['length']?.min) {
              zodValidators = zodValidators.min(1, { message: validation.message });
            }
            break;
          default:
            break;
        }
    }
    if (!field.required) return z.union([zodValidators.optional(), z.null()]);
    return zodValidators;
  }

  /**
   *
   * @param field
   * @returns
   */
  private getZodBoolean(field: EntityFormFieldInterface) {
    let zodValidators = z.boolean();
    // on va ajuster cela en fonction des besoins.
    for (const type in field.validations) {
      const validation = field.validations[type];
      if (validation) {
        switch (validation.type) {
          case 'required':
            field.required = true;
            break;
          default:
            break;
        }
      }
    }
    if (!field.required) return z.union([zodValidators.optional(), z.null()]);
    return zodValidators;
  }

  /**
   *
   * @param field
   * @returns
   */
  private getZodEmail(field: EntityFormFieldInterface) {
    let zodValidators = z.email();
    for (const type in field.validations) {
      const validation = field.validations[type];
      if (validation) {
        switch (validation.type) {
          case 'required':
            field.required = true;
            break;
          default:
            break;
        }
      }
    }
    if (!field.required) return z.union([zodValidators.optional(), z.null()]);
    return zodValidators;
  }

  /**
   * Permet de terminer si on doit avoir un string, number ou un boolean en fonction des methodes de validations.
   */
  private checkTypeValidation(validations: { [key: string]: ValidationRuleInterface } | undefined) {
    if (validations === undefined) return null;
    for (const index in validations) {
      const validation = validations[index];
      if (validation)
        switch (validation.type) {
          case 'positive':
          case 'positive_or_zero':
          case 'range':
            return z.number();
          case 'email':
            return z.email();
          default:
            return null;
        }
      else {
        return null;
      }
    }
  }
}
