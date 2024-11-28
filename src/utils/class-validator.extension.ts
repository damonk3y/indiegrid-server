import {
  registerDecorator,
  ValidationOptions
} from "class-validator";

interface IsFileOptions {
  mime: ("image/jpg" | "image/png" | "image/jpeg")[];
}

export function IsFile(
  options: IsFileOptions,
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    return registerDecorator({
      name: "isFile",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: { mimetype: string }) {
          if (
            value?.mimetype &&
            (options?.mime ?? []).includes(
              value?.mimetype as
                | "image/jpg"
                | "image/png"
                | "image/jpeg"
            )
          ) {
            return true;
          }
          return false;
        }
      }
    });
  };
}
