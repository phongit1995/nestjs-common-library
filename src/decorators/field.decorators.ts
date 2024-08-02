import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import {IsEmailOptions} from 'validator';
import {
  ArrayNotEmpty,
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  registerDecorator,
  ValidateNested,
  ValidationOptions,
} from 'class-validator';
import {
  ToArray,
  ToLowerCase,
  ToUpperCase,
  Trim,
} from './transform.decorators';
import { Type } from 'class-transformer';
import { Point } from 'geojson';

interface IStringFieldOptions {
  minLength?: number;
  maxLength?: number;
  toLowerCase?: boolean;
  toUpperCase?: boolean;
  swagger?: boolean;
  regexString?: RegexStringValidation;
}

interface INumberFieldOptions {
  each?: boolean;
  minimum?: number;
  maximum?: number;
  int?: boolean;
  validationOptions?: ValidationOptions;
}
const vietNamePhoneRegex = /([\+84|84|0]+(3|5|7|8|9|1[2|6|8|9]))+([0-9]{8})\b/;

interface RegexStringValidation {
  regex: RegExp;
  message?: string;
}
export function StringField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
): PropertyDecorator {
  const decorators = [IsNotEmpty(), IsString(), Trim()];

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  if (options.minLength) {
    decorators.push(MinLength(options.minLength));
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength));
  }

  if (options.toLowerCase) {
    decorators.push(ToLowerCase());
  }

  if (options.toUpperCase) {
    decorators.push(ToUpperCase());
  }
  if (options.regexString) {
    decorators.push(
      Matches(options.regexString.regex, {
        message: options.regexString?.message,
      }),
    );
  }

  return applyDecorators(...decorators);
}

export function NumberField(
  options: Omit<ApiPropertyOptions, 'type'> & INumberFieldOptions = {},
): PropertyDecorator {
  const decorators = [
    ApiProperty({ example: 1, ...options }),
    IsNumber(),
    Type(() => Number),
  ];
  if (options.int) {
    decorators.push(IsInt());
  }
  if (options.maximum) {
    decorators.push(Max(options.maximum, options.validationOptions));
  }
  if (options.minimum) {
    decorators.push(Min(options.minimum, options.validationOptions));
  }
  return applyDecorators(...decorators);
}

export function NumberFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    INumberFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    NumberField({ required: false, ...options }),
  );
}

export function StringFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IStringFieldOptions = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    StringField({ required: false, ...options }),
  );
}
export function EmailField(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
  emailOptions?: {
    options?: IsEmailOptions;
    validationOptions?: ValidationOptions;
  },
): PropertyDecorator {
  const decorators = [
    IsEmail(emailOptions.options, emailOptions.validationOptions),
    StringField({ toLowerCase: true, ...options }),
  ];

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: String, ...options }));
  }

  return applyDecorators(...decorators);
}
export function EmailFieldOptional(
  options: Omit<ApiPropertyOptions, 'type'> & IStringFieldOptions = {},
  emailOptions?: {
    options?: IsEmailOptions;
    validationOptions?: ValidationOptions;
  },
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    EmailField({ required: false, ...options }, emailOptions),
  );
}

export function UUIDField(
  options: Omit<ApiPropertyOptions, 'type' | 'format'> &
    ValidationOptions &
    Partial<{ each: boolean; swagger: boolean }> = {},
): PropertyDecorator {
  const decorators = [
    ApiProperty(options),
    IsString(),
    IsUUID('4', { ...options }),
  ];

  if (options.each) {
    decorators.push(ArrayNotEmpty(), ToArray());
  }

  return applyDecorators(...decorators);
}

export function UUIDFieldOptional(
  options: Omit<ApiPropertyOptions, 'type' | 'format'> &
    ValidationOptions &
    Partial<{ each: boolean; swagger: boolean }> = {},
): PropertyDecorator {
  return applyDecorators(
    IsOptional(),
    UUIDField({ required: false, ...options }),
  );
}

export function PhoneField(
  options?: Omit<ApiPropertyOptions, 'type'> & {
    region?: any;
    validationOptions?: ValidationOptions;
  },
) {
  const decorators = [ApiProperty({ example: ' 0352146857', ...options })];
  if (options?.region) {
    decorators.push(IsPhoneNumber(options.region, options.validationOptions));
  } else {
    decorators.push(
      Matches(vietNamePhoneRegex, {
        message: 'validation.PHONE_NUMBER_IS_INVALID',
      }),
    );
  }
  return applyDecorators(...decorators);
}

export function PhoneFieldOptional(
  options?: Omit<ApiPropertyOptions, 'type' | 'required'> & {
    region?: any;
    validationOptions?: ValidationOptions;
  },
) {
  return applyDecorators(
    IsOptional(),
    PhoneField({ required: false, ...options }),
  );
}

export function EnumField<TEnum>(
  getEnum: () => TEnum,
  options?: Omit<ApiPropertyOptions, 'type' | 'enum' | 'enumName'> &
    Partial<{ each: boolean; validationOptions?: ValidationOptions }>,
) {
  const enumValue = getEnum() as any;
  const decorators = [
    ApiProperty({ ...options, enum: getEnum(), type: 'enum' }),
    IsEnum(enumValue, { ...options?.validationOptions, each: options?.each }),
  ];
  if (options?.each) {
    decorators.push(ToArray);
  }
  return applyDecorators(...decorators);
}

export function EnumFieldOptional<TEnum>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'enum' | 'enumName' | 'required'> &
    Partial<{ each: boolean; validationOptions?: ValidationOptions }>,
) {
  return applyDecorators(IsOptional, EnumField(getEnum, options));
}

export function DateField(
  options?: Omit<ApiPropertyOptions, 'type'> &
    Partial<{ validationOptions?: ValidationOptions }>,
) {
  const decorators = [
    ApiProperty({ example: new Date(), ...options }),
    Type(() => Date),
    IsDate({
      message: 'validation.DATE_IS_INVALID',
      ...options?.validationOptions,
    }),
  ];
  return applyDecorators(...decorators);
}

export function DateFieldOption(
  options?: Omit<ApiPropertyOptions, 'type' | 'required'> &
    Partial<{ validationOptions?: ValidationOptions }>,
) {
  return applyDecorators(IsOptional, DateField(options));
}

export class IsCoordinate {
  @ApiProperty({ type: String, example: 'Point' })
  @IsString()
  type: string;

  @ApiProperty({ example: [38.8951, -77.0364] })
  @IsNumber({}, { each: true })
  coordinates: number[];
}

export function IsPointField(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsPointField',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: Point) {
          if (!value) {
            return true;
          }
          return (
            value.type == 'Point'
          );
        },
      },
    });
  };
}

export function PointField(
  options?: Omit<ApiPropertyOptions, 'type'> &
    Partial<{ validationOptions?: ValidationOptions }>,
) {
  const decorators = [
    ApiProperty(),
    ValidateNested(),
    Type(() => IsCoordinate),
    IsPointField({
      message: 'validation.DATE_IS_INVALID',
      ...options?.validationOptions,
    }),
  ];
  return applyDecorators(...decorators);
}

export function PointFieldOption(
  options?: Omit<ApiPropertyOptions, 'type' | 'required'> &
    Partial<{ validationOptions?: ValidationOptions }>,
) {
  return applyDecorators(IsOptional, PointField(options));
}