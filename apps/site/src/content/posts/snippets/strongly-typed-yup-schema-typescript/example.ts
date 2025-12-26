import * as yup from "yup";

export type ConditionalSchema<T> = T extends string
  ? yup.StringSchema
  : T extends number
    ? yup.NumberSchema
    : T extends boolean
      ? yup.BooleanSchema
      : T extends Record<any, any>
        ? yup.AnyObjectSchema
        : T extends Array<any>
          ? yup.ArraySchema<any, any>
          : yup.AnySchema;

export type Shape<Fields> = {
  [Key in keyof Fields]: ConditionalSchema<Fields[Key]>;
};
