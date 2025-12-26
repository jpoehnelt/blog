interface Foo {
  stringField: string;
  booleanField: boolean;
}

yup.object<Shape<Foo>>({
  stringField: yup.string().default(""),
  booleanField: yup.boolean().default(false),
});
