---
title: Strongly Typed Yup Schema in TypeScript
description: >-
  A basic pattern for strongly typing Yup schemas in TypeScript using
  conditionals.
pubDate: '2022-10-01'
tags: 'code,yup,typescript,generics'
---

This weekend I have been exploring [conditional types in TypeScript](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) to use with Firestore. These take the basic form of `T extends U ? X : Y` and are used to create a new type based on the type of `T`. I was curious if I could use this to create a strongly typed Yup schema.

The basic idea is to create a generic function that takes a Yup schema and a type. The function will return a Yup schema that is strongly typed to the type. The function will use a conditional type to determine the type of the schema and return the appropriate schema.

```typescript
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
```

With those two generic types, we can create a strongly typed Yup schema. These can obviously be extended to include more types and better handle arrays and objects.

Some example usage that keeps the TypeScript compiler happy:

```typescript
interface Foo {
  stringField: string;
  booleanField: boolean;
}

yup.object<Shape<Foo>>({
  stringField: yup.string().default(""),
  booleanField: yup.boolean().default(false),
});
```

And it works! 🎉

