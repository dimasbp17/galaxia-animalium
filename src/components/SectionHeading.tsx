const SectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) => (
  <div className="max-w-2xl">
    <p className="text-sm font-semibold tracking-wider text-clay uppercase">
      {eyebrow}
    </p>
    <h2 className="mt-2 text-3xl font-bold text-forest md:text-4xl">{title}</h2>
    {description && (
      <p className="mt-3 text-muted-foreground">{description}</p>
    )}
  </div>
);

export default SectionHeading;
